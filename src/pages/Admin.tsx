import React from "react";

const Admin: React.FC = () => {
  return (
    <div className="p-6 bg-card rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-6 text-highlight">Admin Panel</h1>
      <p className="text-lg text-muted-foreground">
        This is a placeholder for the admin panel. Here, administrators can manage users, content, and settings.
      </p>
      <div className="mt-8 space-y-4">
        <div className="bg-secondary p-4 rounded-md">
          <h2 className="text-xl font-semibold text-primary-foreground">User Management</h2>
          <p className="text-muted-foreground">View, edit, and ban users.</p>
        </div>
        <div className="bg-secondary p-4 rounded-md">
          <h2 className="text-xl font-semibold text-primary-foreground">Content Moderation</h2>
          <p className="text-muted-foreground">Review and manage forum posts.</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;