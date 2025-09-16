import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import UserTable from "@/components/UserTable";
import ModerationList from "@/components/ModerationList";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

interface UserProfile {
  id: string;
  username: string;
  email: string; // Assuming email can be fetched or derived
  role: "admin" | "moderator" | "reporter" | "user" | "guest";
  status: "active" | "banned"; // Added status to profile
}

interface ModerationPost {
  id: string;
  title: string;
  author_id: string;
  content: string;
  moderation_status: "pending" | "approved" | "rejected";
  profiles: {
    username: string;
  };
}

interface SystemLog {
  id: string;
  created_at: string;
  message: string;
  user_id: string | null;
  log_level: string;
}

const Admin: React.FC = () => {
  const { currentUser, isAdmin, isModerator, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading: usersLoading, error: usersError } = useQuery<UserProfile[]>({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, role, status, auth_users:id(email)'); // Join with auth.users to get email

      if (profilesError) throw profilesError;

      // Map to UserProfile, assuming 'status' is now on profiles table
      return profilesData.map(profile => ({
        id: profile.id,
        username: profile.username,
        email: profile.auth_users?.email || 'N/A', // Get email from auth.users
        role: profile.role,
        status: profile.status || 'active', // Default to active if not set
      })) as UserProfile[];
    },
    enabled: isAdmin, // Only fetch if user is admin
  });

  // Fetch moderation posts
  const { data: moderationPosts, isLoading: postsLoading, error: postsError } = useQuery<ModerationPost[]>({
    queryKey: ['moderationPosts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, content, author_id, moderation_status, profiles(username)')
        .eq('moderation_status', 'pending'); // Filter for pending moderation posts

      if (error) throw error;
      return data as ModerationPost[];
    },
    enabled: isAdmin || isModerator, // Only fetch if user is admin or moderator
  });

  // Fetch system logs
  const { data: systemLogs, isLoading: logsLoading, error: logsError } = useQuery<SystemLog[]>({
    queryKey: ['systemLogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SystemLog[];
    },
    enabled: isAdmin, // Only fetch if user is admin
  });

  // Helper to log activity to Supabase
  const logActivity = async (message: string, level: string = 'info') => {
    await supabase.from('logs').insert({
      message,
      user_id: currentUser?.id || null,
      log_level: level,
    });
    queryClient.invalidateQueries({ queryKey: ['systemLogs'] });
  };

  // Mutations for user actions
  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!isAdmin) throw new Error("Only administrators can ban users.");
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'banned' })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      logActivity(`User '${userId}' banned by ${currentUser?.username}.`, 'warning');
      toast.success(`User ${userId} has been banned.`);
    },
    onError: (error) => toast.error(`Error banning user: ${error.message}`),
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!isAdmin) throw new Error("Only administrators can unban users.");
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      logActivity(`User '${userId}' unbanned by ${currentUser?.username}.`, 'info');
      toast.success(`User ${userId} has been unbanned.`);
    },
    onError: (error) => toast.error(`Error unbanning user: ${error.message}`),
  });

  // Mutations for post moderation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!isAdmin && !isModerator) throw new Error("Only administrators or moderators can delete posts.");
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      if (error) throw error;
    },
    onSuccess: (data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['moderationPosts'] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] }); // Also invalidate forum posts
      logActivity(`Post '${postId}' deleted by ${currentUser?.username}.`, 'warning');
      toast.success(`Post ${postId} has been deleted.`);
    },
    onError: (error) => toast.error(`Error deleting post: ${error.message}`),
  });

  const reviewPostMutation = useMutation({
    mutationFn: async ({ postId, status }: { postId: string; status: "approved" | "rejected" }) => {
      if (!isAdmin && !isModerator) throw new Error("Only administrators or moderators can review posts.");
      const { error } = await supabase
        .from('posts')
        .update({ moderation_status: status })
        .eq('id', postId);
      if (error) throw error;
    },
    onSuccess: (data, { postId, status }) => {
      queryClient.invalidateQueries({ queryKey: ['moderationPosts'] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
      logActivity(`${currentUser?.username} set post '${postId}' status to '${status}'.`, 'info');
      toast.info(`Post ${postId} has been marked as ${status}.`);
    },
    onError: (error) => toast.error(`Error reviewing post: ${error.message}`),
  });

  if (authLoading || usersLoading || postsLoading || logsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-xl">Loading admin panel...</p>
      </div>
    );
  }

  if (usersError || postsError || logsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive">
        <p className="text-xl">Error loading data: {usersError?.message || postsError?.message || logsError?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-extrabold text-foreground text-center">Admin Panel</h1>
      <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
        Manage users, moderate content, and monitor system activities.
      </p>

      {(isAdmin || isModerator) ? (
        <>
          <Card className="bg-card border-highlight/20 p-6">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-foreground">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <UserTable
                users={users || []}
                onBanUser={(id) => banUserMutation.mutate(id)}
                onUnbanUser={(id) => unbanUserMutation.mutate(id)}
              />
            </CardContent>
          </Card>

          <Card className="bg-card border-highlight/20 p-6">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-foreground">Content Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <ModerationList
                posts={moderationPosts || []}
                onDeletePost={(id) => deletePostMutation.mutate(id)}
                onReviewPost={(id) => reviewPostMutation.mutate({ postId: id, status: 'approved' })} // Example: approve on review
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-card border-highlight/20 p-6 text-center">
          <CardTitle className="text-2xl font-semibold text-foreground mb-4">Access Denied</CardTitle>
          <p className="text-muted-foreground">You do not have the necessary permissions to access the moderation tools.</p>
        </Card>
      )}

      {isAdmin && ( // Only show system logs to admins
        <Card className="bg-card border-highlight/20 p-6">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-foreground">System Logs</CardTitle>
          </CardHeader>
          <CardContent className="max-h-60 overflow-y-auto space-y-2 text-sm bg-secondary p-4 rounded-md">
            {systemLogs?.length === 0 ? (
              <p className="text-muted-foreground">No system logs available.</p>
            ) : (
              systemLogs?.map((log) => (
                <p key={log.id} className="text-muted-foreground font-mono">
                  [{new Date(log.created_at).toLocaleString()}] [{log.log_level.toUpperCase()}] {log.message}
                </p>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Admin;