import React, { useState } from "react";
import ForumPostCard from "@/components/ForumPostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  initialLikes: number;
  initialDislikes: number;
  commentsCount: number;
}

const Forum: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([
    {
      id: "1",
      title: "Introduction to OpenEyes",
      content: "Welcome to the OpenEyes forum! This is a place for discussions about global conflicts, human rights, and our platform. Feel free to introduce yourself and share your thoughts.",
      author: "Admin",
      initialLikes: 15,
      initialDislikes: 0,
      commentsCount: 5,
    },
    {
      id: "2",
      title: "Latest Conflict in Region X",
      content: "Discussion about the recent developments in Region X. What are your insights on the current situation and potential resolutions?",
      author: "Analyst1",
      initialLikes: 8,
      initialDislikes: 2,
      commentsCount: 3,
    },
    {
      id: "3",
      title: "Understanding UN Declarations",
      content: "Let's discuss the impact and effectiveness of various UN Declarations on human rights and conflict resolution. Share your knowledge!",
      author: "Researcher",
      initialLikes: 12,
      initialDislikes: 1,
      commentsCount: 7,
    },
  ]);

  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostTitle.trim() && newPostContent.trim()) {
      const newPost: ForumPost = {
        id: String(posts.length + 1),
        title: newPostTitle,
        content: newPostContent,
        author: "Current User", // Placeholder for logged-in user
        initialLikes: 0,
        initialDislikes: 0,
        commentsCount: 0,
      };
      setPosts([newPost, ...posts]);
      setNewPostTitle("");
      setNewPostContent("");
      toast.success("Your post has been created!");
    } else {
      toast.error("Please fill in both title and content for your post.");
    }
  };

  const handleViewPost = (id: string) => {
    toast.info(`Navigating to post: ${id} (This is a placeholder for a detailed post view)`);
    // In a real app, you would navigate to a /forum/:id route
  };

  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-extrabold text-foreground text-center">Community Forum</h1>
      <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
        Engage in discussions, share insights, and connect with others passionate about global monitoring.
      </p>

      <Card className="bg-card border-highlight/20 p-6">
        <CardTitle className="text-2xl font-semibold text-foreground mb-4">Create New Post</CardTitle>
        <form onSubmit={handleCreatePost} className="space-y-4">
          <Input
            type="text"
            placeholder="Post Title"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            className="bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground"
          />
          <Textarea
            placeholder="What's on your mind?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground min-h-[100px]"
          />
          <Button type="submit" className="bg-highlight hover:bg-purple-700 text-primary-foreground">
            Submit Post
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <ForumPostCard
            key={post.id}
            {...post}
            onViewPost={handleViewPost}
          />
        ))}
      </div>
    </div>
  );
};

export default Forum;