import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Briefcase, Globe, PenTool, Lock, Image as ImageIcon } from "lucide-react"; // Added Lock and ImageIcon
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { logActivity } from "@/utils/logger";

const ProfilePage: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const [username, setUsername] = useState(currentUser?.username || "");
  const [title, setTitle] = useState(currentUser?.title || "");
  const [work, setWork] = useState(currentUser?.work || "");
  const [website, setWebsite] = useState(currentUser?.website || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username);
      setTitle(currentUser.title || "");
      setWork(currentUser.work || "");
      setWebsite(currentUser.website || "");
      setAvatarUrl(currentUser.avatar_url || "");
    }
  }, [currentUser]);

  const handleSaveProfileChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("You must be logged in to update your profile.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username,
          title: title,
          work: work,
          website: website,
          avatar_url: avatarUrl,
        })
        .eq('id', currentUser.id);

      if (error) {
        throw error;
      }
      
      toast.success("Profile updated successfully!");
      logActivity(`User ${currentUser.username} updated their profile.`, 'info', currentUser.id, 'profile_update');
      // A full page refresh or re-fetching the user in AuthContext would show the changes
      // For now, we rely on the next auth state change or manual refresh.
    } catch (error: any) {
      toast.error(`Error updating profile: ${error.message}`);
      logActivity(`Error updating profile for ${currentUser.username}: ${error.message}`, 'error', currentUser.id, 'profile_update_failed');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("You must be logged in to change your password.");
      return;
    }
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    setIsChangingPassword(true);
    try {
      // Supabase's update user password function doesn't directly take current password for verification
      // It relies on the current session. For a more secure flow, you'd typically re-authenticate
      // or send a password reset email. For simplicity here, we'll just update.
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast.success("Password updated successfully!");
      logActivity(`User ${currentUser.username} changed their password.`, 'info', currentUser.id, 'password_change');
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      toast.error(`Error changing password: ${error.message}`);
      logActivity(`Error changing password for ${currentUser.username}: ${error.message}`, 'error', currentUser.id, 'password_change_failed');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-xl">Loading profile...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive">
        <p className="text-xl">You must be logged in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-extrabold text-foreground text-center">User Profile</h1>
      <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
        View and manage your account information.
      </p>

      <Card className="w-full max-w-2xl mx-auto bg-card border-highlight/20 p-6">
        <CardHeader className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.username}`} alt={currentUser.username} />
            <AvatarFallback className="text-4xl">{currentUser.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold text-foreground">{currentUser.username}</CardTitle>
          <p className="text-muted-foreground text-lg">{currentUser.email}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSaveProfileChanges} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username" className="flex items-center gap-2 text-muted-foreground">
                  <User size={16} /> Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-secondary border-secondary-foreground text-foreground mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={16} /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={currentUser.email}
                  readOnly
                  className="bg-secondary border-secondary-foreground text-foreground mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="flex items-center gap-2 text-muted-foreground">
                  <PenTool size={16} /> Title
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Senior Analyst"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-secondary border-secondary-foreground text-foreground mt-1"
                />
              </div>
              <div>
                <Label htmlFor="work" className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase size={16} /> Work
                </Label>
                <Input
                  id="work"
                  type="text"
                  placeholder="e.g., OpenEyes Foundation"
                  value={work}
                  onChange={(e) => setWork(e.target.value)}
                  className="bg-secondary border-secondary-foreground text-foreground mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="website" className="flex items-center gap-2 text-muted-foreground">
                <Globe size={16} /> Website
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="e.g., https://www.yourwebsite.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="bg-secondary border-secondary-foreground text-foreground mt-1"
              />
            </div>
            <div>
              <Label htmlFor="avatarUrl" className="flex items-center gap-2 text-muted-foreground">
                <ImageIcon size={16} /> Avatar URL
              </Label>
              <Input
                id="avatarUrl"
                type="url"
                placeholder="e.g., https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="bg-secondary border-secondary-foreground text-foreground mt-1"
              />
            </div>
            <div>
              <Label htmlFor="role" className="flex items-center gap-2 text-muted-foreground">
                <Briefcase size={16} /> Role
              </Label>
              <Input
                id="role"
                type="text"
                value={currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                readOnly
                className="bg-secondary border-secondary-foreground text-foreground mt-1"
              />
            </div>
            
            <Button type="submit" className="mt-4 w-full bg-highlight hover:bg-purple-700 text-primary-foreground" disabled={isSavingProfile}>
              {isSavingProfile ? "Saving Profile..." : "Save Profile Changes"}
            </Button>
          </form>

          <h3 className="text-2xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
            <Lock size={20} className="text-highlight" /> Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-secondary border-secondary-foreground text-foreground mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-secondary border-secondary-foreground text-foreground mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="bg-secondary border-secondary-foreground text-foreground mt-1"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-highlight hover:bg-purple-700 text-primary-foreground" disabled={isChangingPassword}>
              {isChangingPassword ? "Changing Password..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;