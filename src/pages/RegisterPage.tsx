import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(email, password, username);
    if (success) {
      navigate("/"); // Redirect to dashboard on successful registration
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md bg-card border-highlight/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-foreground">
            Open<span className="text-highlight">Eyes</span> Register
          </CardTitle>
          <p className="text-muted-foreground">
            Create your account to join the community.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Your unique username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-secondary border-secondary-foreground text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary border-secondary-foreground text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary border-secondary-foreground text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-highlight hover:bg-purple-700 text-primary-foreground" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-highlight hover:underline">
              Login here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;