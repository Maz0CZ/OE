import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";

interface ForumPostCardProps {
  id: string;
  title: string;
  content: string;
  author: string;
  initialLikes: number;
  initialDislikes: number;
  commentsCount: number;
  onViewPost: (id: string) => void;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({
  id,
  title,
  content,
  author,
  initialLikes,
  initialDislikes,
  commentsCount,
  onViewPost,
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userReaction, setUserReaction] = useState<"liked" | "disliked" | null>(null);

  const handleLike = () => {
    if (userReaction === "liked") {
      setLikes(likes - 1);
      setUserReaction(null);
    } else {
      setLikes(likes + 1);
      if (userReaction === "disliked") {
        setDislikes(dislikes - 1);
      }
      setUserReaction("liked");
    }
  };

  const handleDislike = () => {
    if (userReaction === "disliked") {
      setDislikes(dislikes - 1);
      setUserReaction(null);
    } else {
      setDislikes(dislikes + 1);
      if (userReaction === "liked") {
        setLikes(likes - 1);
      }
      setUserReaction("disliked");
    }
  };

  return (
    <Card className="bg-card border-highlight/20 hover:border-highlight transition-colors">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">by {author}</p>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{content}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center gap-1 ${userReaction === "liked" ? "text-highlight" : "text-muted-foreground hover:text-highlight"}`}
          >
            <ThumbsUp size={16} /> {likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDislike}
            className={`flex items-center gap-1 ${userReaction === "disliked" ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
          >
            <ThumbsDown size={16} /> {dislikes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-muted-foreground hover:text-highlight"
            onClick={() => onViewPost(id)}
          >
            <MessageCircle size={16} /> {commentsCount}
          </Button>
        </div>
        <Button variant="outline" onClick={() => onViewPost(id)} className="border-highlight text-highlight hover:bg-highlight hover:text-primary-foreground">
          Read More
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ForumPostCard;