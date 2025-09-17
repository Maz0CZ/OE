import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Briefcase, Globe, PenTool } from "lucide-react"; // Added PenTool for title
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { logActivity } from "@/utils/logger";

const ProfilePage: React.FC = () => {
  const { currentUser, isLoading, fetchUserProfile } = useAuth(); // Assuming fetchUserProfile is available in context
  const [username, setUsername] = useState(currentUser?.username || "");
  const [title, setTitle] = useState(currentUser?.title || "");
  const [work, setWork] = useState(currentUser?.work || "");
  const [website, setWebsite] = useState(currentUser?.website || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username);
      setTitle(currentUser.title || "");
      setWork(currentUser.work || "");
      setWebsite(currentUser.website || "");
    }
  }, [currentUser]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("You must be logged in to update your profile.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username,
          title: title,
          work: work,
          website: website,
        })
        .eq('id', currentUser.id);

      if (error) {
        throw error;
      }

      // Manually update the currentUser in AuthContext or refetch
      // For simplicity, we'll just refetch the user profile
      // A more robust solution would be to update the context state directly
      if (currentUser) {
        const { data: updatedUser, error: fetchError } = await supabase
          .from("profiles")
          .select("username, role, avatar_url, status, title, work, website")
          .eq("id", currentUser.id)
          .single();

        if (fetchError) {
          console.error("Error refetching user profile after update:", fetchError.message);
          logActivity(`Error refetching user profile after update for ${currentUser.id}: ${fetchError.message}`, 'error', currentUser.id);
        } else if (updatedUser) {
          // This part needs to update the AuthContext's currentUser state.
          // Since fetchUserProfile is not directly exposed to update state,
          // we'll rely on the next auth state change or a manual context update.
          // For now, a page refresh would show the changes.
          // A better approach would be to pass a `updateCurrentUser` function via AuthContext.
          // For this iteration, we'll assume the AuthContext will eventually pick up the change
          // or the user refreshes.
        }
      }
      
      toast.success("Profile updated successfully!");
      logActivity(`User ${currentUser.username} updated their profile.`, 'info', currentUser.id, 'profile_update');
    } catch (error: any) {
      toast.error(`Error updating profile: ${error.message}`);
      logActivity(`Error updating profile for ${currentUser.username}: ${error.message}`, 'error', currentUser.id, 'profile_update_failed');
    } finally {
      setIsSaving(false);
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
            <AvatarImage src={currentUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.username}`} alt={currentUser.username} />
            <AvatarFallback className="text-4xl">{currentUser.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold text-foreground">{currentUser.username}</CardTitle>
          <p className="text-muted-foreground text-lg">{currentUser.email}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSaveChanges} className="space-y-6">
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
                  className="bg-secondary border-secondary-foreground text-primary-foreground mt-1"
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
                  className="bg-secondary border-secondary-foreground text-primary-foreground mt-1"
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
                  className="bg-secondary border-secondary-foreground text-primary-foreground mt-1"
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
                  className="bg-secondary border-secondary-foreground text-primary-foreground mt-1"
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
                className="bg-secondary border-secondary-foreground text-primary-foreground mt-1"
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
                className="bg-secondary border-secondary-foreground text-primary-foreground mt-1"
              />
            </div>
            
            <Button type="submit" className="mt-4 w-full bg-highlight hover:bg-purple-700 text-primary-foreground" disabled={isSaving}>
              {isSaving ? "Saving Changes..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;