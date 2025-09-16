import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import UserTable from "@/components/UserTable";
import ModerationList from "@/components/ModerationList";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "banned";
}

interface ModerationPost {
  id: string;
  title: string;
  author: string;
  content: string;
}

const Admin: React.FC = () => {
  const { currentUser, isAdmin, isModerator } = useAuth();

  const [users, setUsers] = useState<User[]>([
    { id: "user1", name: "Alice Smith", email: "alice@example.com", status: "active" },
    { id: "user2", name: "Bob Johnson", email: "bob@example.com", status: "active" },
    { id: "user3", name: "Charlie Brown", email: "charlie@example.com", status: "banned" },
    { id: "user4", name: "Diana Prince", email: "diana@example.com", status: "active" },
    { id: "user5", name: "Eve Adams", email: "eve@example.com", status: "active" },
  ]);

  const [moderationPosts, setModerationPosts] = useState<ModerationPost[]>([
    { id: "postA", title: "Spam Post Detected", author: "Spammer", content: "Buy our products! Best deals ever!" },
    { id: "postB", title: "Questionable Content", author: "Anonymous", content: "Is it true that... [sensitive content]" },
  ]);

  const [systemLogs, setSystemLogs] = useState<string[]>([
    "2023-10-27 10:00:00 - User 'Alice Smith' logged in.",
    "2023-10-27 10:05:15 - New forum post created by 'Bob Johnson'.",
    "2023-10-27 10:10:30 - Admin 'Current Admin' reviewed 'Spam Post Detected'.",
    "2023-10-27 10:15:45 - User 'Charlie Brown' attempted to log in (banned).",
  ]);

  const handleBanUser = (userId: string) => {
    if (!isAdmin) {
      toast.error("Only administrators can ban users.");
      return;
    }
    setUsers(users.map(user => user.id === userId ? { ...user, status: "banned" } : user));
    setSystemLogs([...systemLogs, `2023-10-27 ${new Date().toLocaleTimeString()} - User '${userId}' banned by ${currentUser?.username}.`]);
    toast.success(`User ${userId} has been banned.`);
  };

  const handleUnbanUser = (userId: string) => {
    if (!isAdmin) {
      toast.error("Only administrators can unban users.");
      return;
    }
    setUsers(users.map(user => user.id === userId ? { ...user, status: "active" } : user));
    setSystemLogs([...systemLogs, `2023-10-27 ${new Date().toLocaleTimeString()} - User '${userId}' unbanned by ${currentUser?.username}.`]);
    toast.success(`User ${userId} has been unbanned.`);
  };

  const handleDeletePost = (postId: string) => {
    if (!isAdmin && !isModerator) {
      toast.error("Only administrators or moderators can delete posts.");
      return;
    }
    setModerationPosts(moderationPosts.filter(post => post.id !== postId));
    setSystemLogs([...systemLogs, `2023-10-27 ${new Date().toLocaleTimeString()} - Post '${postId}' deleted by ${currentUser?.username}.`]);
    toast.success(`Post ${postId} has been deleted.`);
  };

  const handleReviewPost = (postId: string) => {
    if (!isAdmin && !isModerator) {
      toast.error("Only administrators or moderators can review posts.");
      return;
    }
    setSystemLogs([...systemLogs, `2023-10-27 ${new Date().toLocaleTimeString()} - ${currentUser?.username} reviewed post '${postId}'.`]);
    toast.info(`Reviewing post ${postId} (placeholder action).`);
    // In a real app, this would open a detailed view for moderation
  };

  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-extrabold text-foreground text-center">Admin Panel</h1>
      <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
        Manage users, moderate content, and monitor system activities.
      </p>

      {(isAdmin || isModerator) && ( // Only show moderation tools to admins and moderators
        <>
          <Card className="bg-card border-highlight/20 p-6">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-foreground">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <UserTable users={users} onBanUser={handleBanUser} onUnbanUser={handleUnbanUser} />
            </CardContent>
          </Card>

          <Card className="bg-card border-highlight/20 p-6">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-foreground">Content Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <ModerationList posts={moderationPosts} onDeletePost={handleDeletePost} onReviewPost={handleReviewPost} />
            </CardContent>
          </Card>
        </>
      )}

      <Card className="bg-card border-highlight/20 p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">System Logs</CardTitle>
        </CardHeader>
        <CardContent className="max-h-60 overflow-y-auto space-y-2 text-sm bg-secondary p-4 rounded-md">
          {systemLogs.map((log, index) => (
            <p key={index} className="text-muted-foreground font-mono">{log}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;