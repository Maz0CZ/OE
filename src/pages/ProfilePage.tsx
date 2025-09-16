import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Briefcase } from "lucide-react";

const ProfilePage: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username" className="flex items-center gap-2 text-muted-foreground">
                <User size={16} /> Username
              </Label>
              <Input
                id="username"
                type="text"
                value={currentUser.username}
                readOnly
                className="bg-secondary border-secondary-foreground text-primary-foreground mt-1"
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
          
          {/* Placeholder for future profile update functionality */}
          <div className="pt-4 border-t border-highlight/10 mt-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Update Profile (Coming Soon)</h3>
            <p className="text-muted-foreground text-sm">
              Future updates will allow you to change your username, avatar, and other profile details here.
            </p>
            <Button disabled className="mt-4 w-full bg-highlight text-primary-foreground">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;