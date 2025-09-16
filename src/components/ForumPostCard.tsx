import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom"; // Import Link for navigation

interface ForumPostCardProps {
  id: string;
  title: string;
  content: string;
  author: string;
  likes: number; // Now directly passed as prop
  dislikes: number; // Now directly passed as prop
  commentsCount: number; // Now directly passed as prop
  userReaction: "liked" | "disliked" | null; // User's reaction for styling
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({
  id,
  title,
  content,
  author,
  likes,
  dislikes,
  commentsCount,
  userReaction,
  onLike,
  onDislike,
}) => {
  return (
    <Card className="bg-card border-highlight/20 hover:border-highlight transition-colors flex flex-col">
      <CardHeader className="flex-grow">
        <CardTitle className="text-2xl font-semibold text-foreground">
          <Link to={`/forum/${id}`} className="hover:underline">
            {title}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground">by {author}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3">{content}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center mt-auto">
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(id)}
            className={`flex items-center gap-1 ${userReaction === "liked" ? "text-highlight" : "text-muted-foreground hover:text-highlight"}`}
          >
            <ThumbsUp size={16} /> {likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDislike(id)}
            className={`flex items-center gap-1 ${userReaction === "disliked" ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
          >
            <ThumbsDown size={16} /> {dislikes}
          </Button>
          <Link to={`/forum/${id}`} className="flex items-center gap-1 text-muted-foreground hover:text-highlight">
            <MessageCircle size={16} /> {commentsCount}
          </Link>
        </div>
        <Button asChild variant="outline" className="border-highlight text-highlight hover:bg-highlight hover:text-primary-foreground">
          <Link to={`/forum/${id}`}>Read More</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ForumPostCard;