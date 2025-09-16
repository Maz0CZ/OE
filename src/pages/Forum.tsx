import React, { useState, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
// ... (keep existing imports)

const Forum: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth()
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")

  const { data: posts, isLoading, error, refetch } = useQuery({
    queryKey: ['forumPosts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
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

  // ... rest of the component remains similar but use the new query and mutation
}