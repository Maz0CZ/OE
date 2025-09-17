import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import CommentSection from "@/components/CommentSection"; // Import the new CommentSection
import { logActivity } from "@/utils/logger"; // Import the new logger

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  moderation_status: "pending" | "approved" | "rejected";
  author_username: string; // From the view
  author_avatar_url?: string; // From the view
  likes_count: number; // From the view
  dislikes_count: number; // From the view
  comments_count: number; // From the view
  user_reaction_type: 'like' | 'dislike' | null; // User's specific reaction, fetched separately
}

interface PostReaction {
  type: 'like' | 'dislike';
}

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { currentUser, isAuthenticated } = useAuth();

  // Fetch post details from the view
  const { data: post, isLoading: postLoading, error: postError, refetch: refetchPost } = useQuery<Post>({
    queryKey: ['post', postId, currentUser?.id], // Include currentUser.id for user-specific reaction
    queryFn: async () => {
      if (!postId) throw new Error("Post ID is missing.");

      const { data: postData, error: postFetchError } = await supabase
        .from('posts_with_aggregated_data') // Query the new view
        .select('*')
        .eq('id', postId)
        .single();

      if (postFetchError) {
        logActivity(`Error fetching post ${postId}: ${postFetchError.message}`, 'error', currentUser?.id, 'data_fetch_error');
        throw postFetchError;
      }

      let userReactionType: 'like' | 'dislike' | null = null;
      if (currentUser?.id) {
        const { data: userReactionData, error: userReactionError } = await supabase
          .from('post_reactions')
          .select('type')
          .eq('post_id', postId)
          .eq('user_id', currentUser.id)
          .single();
        
        if (userReactionError && userReactionError.code !== 'PGRST116') { // Ignore "no rows found" error
          console.error("Error fetching user reaction:", userReactionError);
          logActivity(`Error fetching user reaction for post ${postId}: ${userReactionError.message}`, 'warning', currentUser?.id, 'data_fetch_error');
        }
        userReactionType = userReactionData?.type || null;
      }
      
      return { ...postData, user_reaction_type: userReactionType } as Post;
    },
    enabled: !!postId,
  });

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to react to posts.");
      logActivity(`Attempted to react to post ${postId} while unauthenticated.`, 'warning', null, 'unauthenticated_action');
      return;
    }
    if (!postId || !currentUser?.id) return;

    const existingReaction = post?.user_reaction_type;

    if (existingReaction === type) {
      // User is un-reacting
      const { error } = await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUser.id);
      if (error) {
        toast.error(`Error removing reaction: ${error.message}`);
        logActivity(`Error removing ${type} reaction from post ${postId}: ${error.message}`, 'error', currentUser?.id, 'post_reaction_failed');
      } else {
        toast.info(`Removed ${type} from post.`);
        logActivity(`User ${currentUser?.username} removed ${type} from post ${postId}.`, 'info', currentUser?.id, 'post_reaction_removed');
      }
    } else {
      // User is changing reaction or adding new reaction
      const { error } = await supabase
        .from('post_reactions')
        .upsert({ post_id: postId, user_id: currentUser.id, type }, { onConflict: 'user_id,post_id' });
      if (error) {
        toast.error(`Error adding reaction: ${error.message}`);
        logActivity(`Error adding ${type} reaction to post ${postId}: ${error.message}`, 'error', currentUser?.id, 'post_reaction_failed');
      } else {
        toast.success(`${type === 'like' ? 'Liked' : 'Disliked'} post!`);
        logActivity(`User ${currentUser?.username} ${type === 'like' ? 'liked' : 'disliked'} post ${postId}.`, 'info', currentUser?.id, 'post_reaction_added');
      }
    }
    refetchPost(); // Refetch the post to update counts and user reaction
  };

  if (postLoading) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-foreground">Loading Post...</h1>
        <p className="text-lg text-muted-foreground">Fetching post details and comments.</p>
      </div>
    );
  }

  if (postError) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-foreground">Error</h1>
        <p className="text-lg text-destructive">Error loading post: {postError.message}</p>
        <Link to="/forum" className="text-highlight hover:underline flex items-center justify-center">
          <ArrowLeft size={16} className="mr-2" /> Back to Forum
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-foreground">Post Not Found</h1>
        <p className="text-lg text-muted-foreground">The post you are looking for does not exist.</p>
        <Link to="/forum" className="text-highlight hover:underline flex items-center justify-center">
          <ArrowLeft size={16} className="mr-2" /> Back to Forum
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link to="/forum" className="text-highlight hover:underline flex items-center gap-2 mb-6 w-fit">
        <ArrowLeft size={16} /> Back to Forum
      </Link>

      <Card className="bg-card border-highlight/20">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-foreground">{post.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            by <span className="font-semibold">{post.author_username || "Unknown"}</span> on {new Date(post.created_at).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground whitespace-pre-wrap">{post.content}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('like')}
              className={`flex items-center gap-1 ${post.user_reaction_type === "like" ? "text-highlight" : "text-muted-foreground hover:text-highlight"}`}
            >
              <ThumbsUp size={16} /> {post.likes_count}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('dislike')}
              className={`flex items-center gap-1 ${post.user_reaction_type === "dislike" ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
            >
              <ThumbsDown size={16} /> {post.dislikes_count}
            </Button>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle size={16} /> {post.comments_count}
            </div>
          </div>
        </CardFooter>
      </Card>

      {postId && <CommentSection postId={postId} />}
    </div>
  );
};

export default PostDetailPage;