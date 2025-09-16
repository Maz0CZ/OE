import React from "react";

const Forum: React.FC = () => {
  return (
    <div className="p-6 bg-card rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-6 text-highlight">Forum</h1>
      <p className="text-lg text-muted-foreground">
        This is a placeholder for the forum page. Here you will find discussions and community interactions.
      </p>
      <div className="mt-8 space-y-4">
        <div className="bg-secondary p-4 rounded-md">
          <h2 className="text-xl font-semibold text-primary-foreground">Welcome to the Forum!</h2>
          <p className="text-muted-foreground">Start a new discussion or browse existing topics.</p>
        </div>
        <div className="bg-secondary p-4 rounded-md">
          <h2 className="text-xl font-semibold text-primary-foreground">General Discussion</h2>
          <p className="text-muted-foreground">Talk about anything here.</p>
        </div>
      </div>
    </div>
  );
};

export default Forum;