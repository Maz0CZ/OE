import React, { useState, useEffect } from "react";
import ForumPostCard from "@/components/ForumPostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  profiles: { username: string } | null; // Supabase join for author username
  likes: number;
  dislikes: number;
  comments_count: number;
  created_at: string;
}

const Forum: React.FC = () => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
    const channel = supabase
      .channel("forum_posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        (payload) => {
          // For simplicity, refetch all posts on any change.
          // In a real app, you'd handle specific events (INSERT, UPDATE, DELETE)
          // to update state more efficiently.
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles(username)") // Join with profiles to get author username
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load forum posts: " + error.message);
    } else {
      setPosts(data.map(post => ({
        ...post,
        comments_count: post.comments_count || 0, // Ensure comments_count exists
        likes: post.likes || 0,
        dislikes: post.dislikes || 0,
      })));
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !currentUser) {
      toast.error("You must be logged in to create a post.");
      return;
    }
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error("Please fill in both title and content for your post.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("posts").insert({
      title: newPostTitle,
      content: newPostContent,
      author_id: currentUser.id,
      likes: 0,
      dislikes: 0,
      comments_count: 0,
    });
    setIsSubmitting(false);

    if (error) {
      toast.error("Failed to create post: " + error.message);
    } else {
      setNewPostTitle("");
      setNewPostContent("");
      toast.success("Your post has been created!");
      fetchPosts(); // Re-fetch posts to show the new one
    }
  };

  const handleViewPost = (id: string) => {
    toast.info(`Navigating to post: ${id} (This is a placeholder for a detailed post view)`);
    // In a real app, you would navigate to a /forum/:id route
  };

  // Placeholder for like/dislike functionality (would update Supabase)
  const handleLikeDislike = async (postId: string, type: "like" | "dislike") => {
    if (!isAuthenticated || !currentUser) {
      toast.error("You must be logged in to react to posts.");
      return;
    }
    toast.info(`Simulating ${type} for post ${postId}. (Would update Supabase)`);
    // In a real app, you'd update the 'likes' or 'dislikes' count in Supabase
    // and potentially record the user's reaction in a separate 'reactions' table
    // to prevent multiple reactions from the same user.
    fetchPosts(); // Re-fetch to reflect changes (simulated)
  };

  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-extrabold text-foreground text-center">Community Forum</h1>
      <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
        Engage in discussions, share insights, and connect with others passionate about global monitoring.
      </p>

      {isAuthenticated ? (
        <Card className="bg-card border-highlight/20 p-6">
          <CardTitle className="text-2xl font-semibold text-foreground mb-4">Create New Post</CardTitle>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <Input
              type="text"
              placeholder="Post Title"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground"
              disabled={isSubmitting}
            />
            <Textarea
              placeholder="What's on your mind?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground min-h-[100px]"
              disabled={isSubmitting}
            />
            <Button type="submit" className="bg-highlight hover:bg-purple-700 text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Post"}
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="bg-card border-highlight/20 p-6 text-center">
          <CardTitle className="text-2xl font-semibold text-foreground mb-4">Join the Discussion</CardTitle>
          <p className="text-muted-foreground mb-4">
            You need to be logged in to create new posts and interact with the forum.
          </p>
          <Link to="/login">
            <Button className="bg-highlight hover:bg-purple-700 text-primary-foreground">
              Login or Register
            </Button>
          </Link>
        </Card>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length === 0 && !isLoading ? (
          <p className="text-muted-foreground text-center col-span-full">No posts yet. Be the first to create one!</p>
        ) : (
          posts.map((post) => (
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
              onLike={() => handleLikeDislike(post.id, "like")}
              onDislike={() => handleLikeDislike(post.id, "dislike")}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Forum;