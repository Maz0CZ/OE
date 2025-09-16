import React, { useState, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
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
  likes: number;
  dislikes: number;
  comments_count: number;
  moderation_status: "pending" | "approved" | "rejected"; // Added moderation_status
  profiles: {
    username: string;
  };
}

const Forum: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth()
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")

  const { data: posts, isLoading, error, refetch } = useQuery<Post[]>({
    queryKey: ['forumPosts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(username)')
        .eq('moderation_status', 'approved') // Only fetch approved posts for public view
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Post[]
    }
  })

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id) throw new Error("User not authenticated")
      
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: newPostTitle,
          content: newPostContent,
          author_id: currentUser.id,
          likes: 0,
          dislikes: 0,
          comments_count: 0,
          moderation_status: 'pending', // New posts start as pending moderation
        })
        .select()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      setNewPostTitle("")
      setNewPostContent("")
      refetch() // Refetch to update the list (though new posts are pending, this will refresh if any were approved)
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

  const handleViewPost = (postId: string) => {
    toast.info(`Viewing post: ${postId}`)
    // In a real app, navigate to a detailed post page
  }

  const handleLike = async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to like posts.")
      return
    }
    
    const currentLikes = posts?.find(p => p.id === postId)?.likes || 0;
    const { error } = await supabase
      .from('posts')
      .update({ likes: currentLikes + 1 })
      .eq('id', postId);

    if (error) {
      toast.error(`Error liking post: ${error.message}`)
    } else {
      refetch() // Refetch to get actual updated data
    }
  }

  const handleDislike = async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to dislike posts.")
      return
    }
    
    const currentDislikes = posts?.find(p => p.id === postId)?.dislikes || 0;
    const { error } = await supabase
      .from('posts')
      .update({ dislikes: currentDislikes + 1 })
      .eq('id', postId);

    if (error) {
      toast.error(`Error disliking post: ${error.message}`)
    } else {
      refetch() // Refetch to get actual updated data
    }
  }

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
              initialLikes={post.likes}
              initialDislikes={post.dislikes}
              commentsCount={post.comments_count}
              onViewPost={handleViewPost}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Forum