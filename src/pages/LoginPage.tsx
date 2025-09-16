import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate("/"); // Redirect to dashboard on successful login
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md bg-card border-highlight/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-foreground">
            Open<span className="text-highlight">Eyes</span> Login
          </CardTitle>
          <p className="text-muted-foreground">
            Enter your credentials to access the dashboard.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin, moderator, reporter, or user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="admin (for admin), password (for others)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-highlight hover:bg-purple-700 text-primary-foreground">
              Login
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Try: admin/admin, moderator/password, reporter/password, user/password
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;