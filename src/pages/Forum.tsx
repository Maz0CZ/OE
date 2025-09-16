import React, { useState, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/context/AuthContext" // Added missing import for useAuth
import { toast } from "sonner" // Added missing import for toast
import ForumPostCard from "@/components/ForumPostCard" // Added missing import for ForumPostCard
import { ForumPostSkeleton } from "@/components/ForumPostSkeleton" // Added missing import for ForumPostSkeleton
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Added missing imports for Card components
import { Input } from "@/components/ui/input" // Added missing import for Input
import { Textarea } from "@/components/ui/textarea" // Added missing import for Textarea
import { Button } from "@/components/ui/button" // Added missing import for Button
import { Label } from "@/components/ui/label" // Added missing import for Label


interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  likes: number;
  dislikes: number;
  comments_count: number;
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
          likes: 0, // Initialize likes
          dislikes: 0, // Initialize dislikes
          comments_count: 0, // Initialize comments count
        })
        .select()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      setNewPostTitle("")
      setNewPostContent("")
      refetch()
      toast.success("Post created successfully!")
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
    // Optimistically update UI
    const previousPosts = posts
    const updatedPosts = posts?.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    )
    // This would typically be handled by react-query's `setQueryData`
    // For now, we'll just refetch after mutation
    
    const { error } = await supabase
      .from('posts')
      .update({ likes: (posts?.find(p => p.id === postId)?.likes || 0) + 1 })
      .eq('id', postId)

    if (error) {
      toast.error(`Error liking post: ${error.message}`)
      // Revert optimistic update if error
      // setQueryData(['forumPosts'], previousPosts)
    } else {
      refetch() // Refetch to get actual updated data
    }
  }

  const handleDislike = async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to dislike posts.")
      return
    }
    // Optimistically update UI
    const previousPosts = posts
    const updatedPosts = posts?.map(post => 
      post.id === postId ? { ...post, dislikes: post.dislikes + 1 } : post
    )
    // setQueryData(['forumPosts'], updatedPosts)

    const { error } = await supabase
      .from('posts')
      .update({ dislikes: (posts?.find(p => p.id === postId)?.dislikes || 0) + 1 })
      .eq('id', postId)

    if (error) {
      toast.error(`Error disliking post: ${error.message}`)
      // Revert optimistic update if error
      // setQueryData(['forumPosts'], previousPosts)
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