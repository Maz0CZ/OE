import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface ModerationPost {
  id: string;
  title: string;
  author: string;
  content: string;
}

interface ModerationListProps {
  posts: ModerationPost[];
  onDeletePost: (postId: string) => void;
  onReviewPost: (postId: string) => void;
}

const ModerationList: React.FC<ModerationListProps> = ({ posts, onDeletePost, onReviewPost }) => {
  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <p className="text-muted-foreground text-center">No posts awaiting moderation.</p>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="bg-secondary border-highlight/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">{post.title}</CardTitle>
              <p className="text-sm text-muted-foreground">by {post.author}</p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-2">{post.content}</p>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => onReviewPost(post.id)} className="border-highlight text-highlight hover:bg-highlight hover:text-primary-foreground">
                <Eye size={16} className="mr-2" /> Review
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDeletePost(post.id)}>
                <Trash2 size={16} className="mr-2" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
};

export default ModerationList;