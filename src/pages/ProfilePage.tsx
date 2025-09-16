import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfilePage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={currentUser.avatar_url} />
            <AvatarFallback>
              {currentUser.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle>{currentUser.username}</CardTitle>
          <p className="text-muted-foreground">{currentUser.email}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
              <p className="capitalize">{currentUser.role}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Member Since</h3>
              <p>Recently</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-6 border-destructive text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;