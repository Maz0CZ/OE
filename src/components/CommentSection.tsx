import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { logActivity } from "@/utils/logger"; // Import the new logger

interface Comment {
  id: string;
  created_at: string;
  content: string;
  author_id: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [newCommentContent, setNewCommentContent] = useState("");

  const { data: comments, isLoading, error } = useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(username, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        logActivity(`Error fetching comments for post ${postId}: ${error.message}`, 'error', currentUser?.id, 'data_fetch_error');
        throw error;
      }
      return data as Comment[];
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUser?.id) throw new Error("User not authenticated.");
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content,
          author_id: currentUser.id,
          post_id: postId,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewCommentContent("");
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      toast.success("Comment added successfully!");
      logActivity(`User ${currentUser?.username} added a comment to post ${postId}.`, 'info', currentUser?.id, 'comment_added');
    },
    onError: (error) => {
      toast.error(`Error adding comment: ${error.message}`);
      logActivity(`Error adding comment to post ${postId}: ${error.message}`, 'error', currentUser?.id, 'comment_add_failed');
    }
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentContent.trim()) {
      addCommentMutation.mutate(newCommentContent);
    } else {
      toast.error("Comment cannot be empty.");
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Loading comments...</p>;
  }

  if (error) {
    return <p className="text-destructive">Error loading comments: {error.message}</p>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-foreground">Comments ({comments?.length || 0})</h3>

      {isAuthenticated && (
        <Card className="bg-card border-highlight/20">
          <CardContent className="p-4">
            <form onSubmit={handleAddComment} className="flex items-end space-x-2">
              <Textarea
                placeholder="Write your comment..."
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                className="flex-1 bg-secondary border-secondary-foreground text-foreground placeholder:text-muted-foreground min-h-[40px]"
                rows={1}
                required
              />
              <Button type="submit" disabled={addCommentMutation.isPending} className="bg-highlight hover:bg-purple-700 text-primary-foreground">
                <Send size={16} />
                <span className="sr-only">Add Comment</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {comments?.length === 0 ? (
          <p className="text-muted-foreground text-center">No comments yet. Be the first to comment!</p>
        ) : (
          comments?.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3 p-3 bg-secondary rounded-lg border border-highlight/10">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.profiles?.username}`} alt={comment.profiles?.username} />
                <AvatarFallback>{comment.profiles?.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">{comment.profiles?.username || "Anonymous"}</p>
                  <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;