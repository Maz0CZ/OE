import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { logActivity } from "@/utils/logger";
import { useAuth } from "@/context/AuthContext";
import { BookOpen } from "lucide-react";

const WikipediaDataImporter: React.FC = () => {
  const { currentUser } = useAuth();
  const [wikipediaUrl, setWikipediaUrl] = useState("");

  const importDataMutation = useMutation({
    mutationFn: async (url: string) => {
      logActivity(`Attempting to import data from Wikipedia URL: ${url}`, 'info', currentUser?.id, 'data_import_attempt');
      // This is a placeholder for your actual serverless function call.
      // You would replace this with a fetch call to your backend endpoint.
      // Example: await fetch('/api/import-wikipedia-conflicts', { method: 'POST', body: JSON.stringify({ url }) });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success or failure
      if (url.includes("wikipedia.org/wiki/List_of_ongoing_armed_conflicts")) {
        return { success: true, message: "Data import initiated successfully (simulated)." };
      } else if (url.includes("error")) {
        throw new Error("Simulated error during import.");
      } else {
        throw new Error("Invalid Wikipedia URL or unsupported page for import (simulated).");
      }
    },
    onSuccess: (data) => {
      toast.success(data.message);
      logActivity(`Wikipedia data import simulated success.`, 'info', currentUser?.id, 'data_import_success');
      setWikipediaUrl("");
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`);
      logActivity(`Wikipedia data import simulated failure: ${error.message}`, 'error', currentUser?.id, 'data_import_failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wikipediaUrl.trim()) {
      importDataMutation.mutate(wikipediaUrl);
    } else {
      toast.error("Please enter a Wikipedia URL.");
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-extrabold text-foreground text-center">Wikipedia Data Importer</h1>
      <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
        Import conflict data from Wikipedia pages into your Supabase database.
      </p>

      <Card className="w-full max-w-2xl mx-auto bg-card border-highlight/20 p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <BookOpen size={24} className="text-highlight" /> Import from Wikipedia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            **Note:** This feature requires a **serverless function** (e.g., Supabase Edge Function, Vercel Function)
            to handle the actual data fetching and parsing from Wikipedia, and then insert it into your Supabase database.
            The button below will trigger a *hypothetical* API call to such a backend endpoint.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="wikipediaUrl">Wikipedia Page URL</Label>
              <Input
                id="wikipediaUrl"
                type="url"
                placeholder="e.g., https://en.wikipedia.org/wiki/List_of_ongoing_armed_conflicts"
                value={wikipediaUrl}
                onChange={(e) => setWikipediaUrl(e.target.value)}
                className="bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-highlight hover:bg-purple-700 text-primary-foreground" 
              disabled={importDataMutation.isPending}
            >
              {importDataMutation.isPending ? "Importing..." : "Initiate Import"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WikipediaDataImporter;