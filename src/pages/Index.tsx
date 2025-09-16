import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center bg-card rounded-lg shadow-lg p-8 text-center">
      <h1 className="text-6xl font-extrabold mb-6 text-foreground">
        Welcome to Open<span className="text-highlight">Eyes</span>
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
        Your gateway to a futuristic community experience. Explore discussions, connect with others, and manage your digital presence.
      </p>
      <div className="flex space-x-4">
        <Link
          to="/forum"
          className="px-6 py-3 bg-highlight text-primary-foreground rounded-md text-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          Go to Forum
        </Link>
        <Link
          to="/admin"
          className="px-6 py-3 border border-highlight text-highlight rounded-md text-lg font-semibold hover:bg-highlight hover:text-primary-foreground transition-colors"
        >
          Admin Panel
        </Link>
      </div>
    </div>
  );
};

export default Index;