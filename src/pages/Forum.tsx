import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import ForumPostCard from "@/components/ForumPostCard"
import { ForumPostSkeleton } from "@/components/ForumPostSkeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { logActivity } from "@/utils/logger";


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

const Forum: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth()
  const queryClient = useQueryClient();
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term

  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['forumPosts', currentUser?.id], // Add currentUser.id to queryKey for user-specific reactions
    queryFn: async () => {
      const { data: postsData, error: postsError } = await supabase
        .from('posts_with_aggregated_data') // Query the new view
        .select('*')
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false });
      
      if (postsError) {
        logActivity(`Error fetching forum posts: ${postsError.message}`, 'error', currentUser?.id, 'data_fetch_error');
        throw postsError;
      }

      // For each post, fetch the current user's reaction separately
      const postsWithReactions = await Promise.all(postsData.map(async (post) => {
        let userReactionType: 'like' | 'dislike' | null = null;
        if (currentUser?.id) {
          const { data: userReactionData, error: userReactionError } = await supabase
            .from('post_reactions')
            .select('type')
            .eq('post_id', post.id)
            .eq('user_id', currentUser.id)
            .single();
          
          if (userReactionError && userReactionError.code !== 'PGRST116') { // Ignore "no rows found" error
            console.error("Error fetching user reaction:", userReactionError);
            logActivity(`Error fetching user reaction for post ${post.id}: ${userReactionError.message}`, 'warning', currentUser?.id, 'data_fetch_error');
          }
          userReactionType = userReactionData?.type || null;
        }
        return { ...post, user_reaction_type: userReactionType };
      }));

      return postsWithReactions as Post[];
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id) throw new Error("User not authenticated")
      
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: newPostTitle,
          content: newPostContent,
          author_id: currentUser.id,
          moderation_status: 'pending',
        })
        .select()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      setNewPostTitle("")
      setNewPostContent("")
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] }); // Invalidate to refetch posts
      toast.success("Post created successfully! It will be visible after moderation.")
      logActivity(`User ${currentUser?.username} created a new post.`, 'info', currentUser?.id, 'post_created');
    },
    onError: (error) => {
      toast.error(`Error creating post: ${error.message}`)
      logActivity(`Error creating post: ${error.message}`, 'error', currentUser?.id, 'post_creation_failed');
    }
  })

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPostTitle.trim() && newPostContent.trim()) {
      createPostMutation.mutate()
    } else {
      toast.error("Title and content cannot be empty.")
    }
  }

  const handleReaction = async (postId: string, type: 'like' | 'dislike') => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to react to posts.");
      logActivity(`Attempted to react to post ${postId} while unauthenticated.`, 'warning', null, 'unauthenticated_action');
      return;
    }
    if (!currentUser?.id) return;

    const currentPost = posts?.find(p => p.id === postId);
    const existingReaction = currentPost?.user_reaction_type;

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
    queryClient.invalidateQueries({ queryKey: ['forumPosts'] }); // Refetch to update counts and user reaction
  };

  // Filter posts based on search term
  const filteredPosts = posts?.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-5xl font-extrabold text-foreground text-center">Community Forum</h1>
        <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
          Loading posts data...
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ForumPostSkeleton />
          <ForumPostSkeleton />
          <ForumPostSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-foreground">Community Forum</h1>
        <p className="text-lg text-destructive">Error loading posts: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-extrabold text-foreground text-center">Community Forum</h1>
      <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
        Discuss global events, share insights, and connect with others.
      </p>

      {isAuthenticated && (
        <Card className="bg-card border-highlight/20 p-6">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-foreground">Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <Label htmlFor="postTitle">Title</Label>
                <Input
                  id="postTitle"
                  type="text"
                  placeholder="Enter post title"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="bg-secondary border-secondary-foreground text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
              <div>
                <Label htmlFor="postContent">Content</Label>
                <Textarea
                  id="postContent"
                  placeholder="Write your post content here..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="bg-secondary border-secondary-foreground text-foreground placeholder:text-muted-foreground min-h-[100px]"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-highlight hover:bg-purple-700 text-primary-foreground" disabled={createPostMutation.isPending}>
                {createPostMutation.isPending ? "Posting..." : "Create Post"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center mb-4">
        <Input
          placeholder="Search forum posts by title or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md bg-secondary border-secondary-foreground text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts?.length === 0 ? (
          <p className="text-muted-foreground text-center col-span-full">No forum posts found matching your search.</p>
        ) : (
          filteredPosts?.map((post) => (
            <ForumPostCard
              key={post.id}
              id={post.id}
              title={post.title}
              content={post.content}
              author={post.author_username || "Unknown"}
              likes={post.likes_count}
              dislikes={post.dislikes_count}
              commentsCount={post.comments_count}
              userReaction={post.user_reaction_type === 'like' ? 'liked' : (post.user_reaction_type === 'dislike' ? 'disliked' : null)}
              onLike={(id) => handleReaction(id, 'like')}
              onDislike={(id) => handleReaction(id, 'dislike')}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Forum