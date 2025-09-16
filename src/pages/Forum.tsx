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


interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  moderation_status: "pending" | "approved" | "rejected";
  profiles: {
    username: string;
  };
  likes_count: number; // Aggregated count
  dislikes_count: number; // Aggregated count
  comments_count: number; // Aggregated count
  user_reaction_type: 'like' | 'dislike' | null; // User's specific reaction
}

const Forum: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth()
  const queryClient = useQueryClient();
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")

  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['forumPosts', currentUser?.id], // Add currentUser.id to queryKey for user-specific reactions
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          created_at,
          author_id,
          moderation_status,
          profiles(username),
          likes_count:post_reactions(count),
          dislikes_count:post_reactions(count),
          comments_count:comments(count),
          user_reaction_type:post_reactions(type)
        `)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Manually process the data to get correct counts and user reaction
      const processedData = data.map(post => {
        const likes = post.likes_count.filter((r: any) => r.type === 'like').length > 0 ? post.likes_count[0].count : 0;
        const dislikes = post.dislikes_count.filter((r: any) => r.type === 'dislike').length > 0 ? post.dislikes_count[0].count : 0;
        
        // Find the current user's reaction if available
        const userReaction = post.user_reaction_type.find((r: any) => r.user_id === currentUser?.id);
        
        return {
          ...post,
          likes_count: likes,
          dislikes_count: dislikes,
          comments_count: post.comments_count[0]?.count || 0,
          user_reaction_type: userReaction ? userReaction.type : null,
        };
      });

      return processedData as Post[];
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
    },
    onError: (error) => {
      toast.error(`Error creating post: ${error.message}`)
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
    queryClient.invalidateQueries({ queryKey: ['forumPosts'] }); // Refetch to update counts and user reaction
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-5xl font-extrabold text-foreground text-center">Community Forum</h1>
        <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
          Discuss global events, share insights, and connect with others.
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
                  className="bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground"
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
                  className="bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground min-h-[100px]"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts?.length === 0 ? (
          <p className="text-muted-foreground text-center col-span-full">No forum posts yet. Be the first to create one!</p>
        ) : (
          posts?.map((post) => (
            <ForumPostCard
              key={post.id}
              id={post.id}
              title={post.title}
              content={post.content}
              author={post.profiles?.username || "Unknown"}
              likes={post.likes_count}
              dislikes={post.dislikes_count}
              commentsCount={post.comments_count}
              userReaction={post.user_reaction_type}
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