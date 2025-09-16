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

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  moderation_status: "pending" | "approved" | "rejected";
  author_username: string; // From the view
  author_avatar_url?: string; // From the view
}

interface PostReaction {
  type: 'like' | 'dislike';
}

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { currentUser, isAuthenticated } = useAuth();

  // Fetch post details
  const { data: post, isLoading: postLoading, error: postError, refetch: refetchPost } = useQuery<Post>({
    queryKey: ['post', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts_with_profiles') // Query the new view
        .select('*') // Select all columns from the view
        .eq('id', postId)
        .single();

      if (error) throw error;
      return data as Post;
    },
    enabled: !!postId,
  });

  // Fetch likes count
  const { data: likesCount, isLoading: likesLoading, error: likesError, refetch: refetchLikes } = useQuery<number>({
    queryKey: ['postLikesCount', postId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('post_reactions')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('type', 'like');
      if (error) throw error;
      return count || 0;
    },
    enabled: !!postId,
  });

  // Fetch dislikes count
  const { data: dislikesCount, isLoading: dislikesLoading, error: dislikesError, refetch: refetchDislikes } = useQuery<number>({
    queryKey: ['postDislikesCount', postId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('post_reactions')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('type', 'dislike');
      if (error) throw error;
      return count || 0;
    },
    enabled: !!postId,
  });

  // Fetch user's reaction to this post
  const { data: userReaction, isLoading: userReactionLoading, error: userReactionError, refetch: refetchUserReaction } = useQuery<PostReaction | null>({
    queryKey: ['userPostReaction', postId, currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const { data, error } = await supabase
        .from('post_reactions')
        .select('type')
        .eq('post_id', postId)
        .eq('user_id', currentUser.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows found" error
      return data || null;
    },
    enabled: !!postId && isAuthenticated,
  });

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to react to posts.");
      return;
    }
    if (!postId || !currentUser?.id) return;

    const existingReaction = userReaction?.type;

    if (existingReaction === type) {
      // User is un-reacting
      const { error } = await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUser.id);
      if (error) {
        toast.error(`Error removing reaction: ${error.message}`);
      } else {
        toast.info(`Removed ${type} from post.`);
      }
    } else {
      // User is changing reaction or adding new reaction
      const { error } = await supabase
        .from('post_reactions')
        .upsert({ post_id: postId, user_id: currentUser.id, type }, { onConflict: 'user_id,post_id' });
      if (error) {
        toast.error(`Error adding reaction: ${error.message}`);
      } else {
        toast.success(`${type === 'like' ? 'Liked' : 'Disliked'} post!`);
      }
    }
    refetchLikes();
    refetchDislikes();
    refetchUserReaction();
  };

  if (postLoading || likesLoading || dislikesLoading || userReactionLoading) {
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
              className={`flex items-center gap-1 ${userReaction?.type === "like" ? "text-highlight" : "text-muted-foreground hover:text-highlight"}`}
            >
              <ThumbsUp size={16} /> {likesCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('dislike')}
              className={`flex items-center gap-1 ${userReaction?.type === "dislike" ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
            >
              <ThumbsDown size={16} /> {dislikesCount}
            </Button>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle size={16} /> {/* Comments count will be displayed in CommentSection */}
            </div>
          </div>
        </CardFooter>
      </Card>

      {postId && <CommentSection postId={postId} />}
    </div>
  );
};

export default PostDetailPage;