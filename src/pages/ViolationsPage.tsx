import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { logActivity } from "@/utils/logger"; // Import the new logger
import { useAuth } from "@/context/AuthContext"; // Import useAuth to get currentUser

interface Violation {
  id: string;
  type: string;
  location: string;
  date: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
}

const ViolationsPage = () => {
  const { currentUser } = useAuth(); // Get currentUser for logging
  const { data: violations, isLoading, error } = useQuery<Violation[]>({
    queryKey: ['violations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('violations')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        logActivity(`Error fetching violations: ${error.message}`, 'error', currentUser?.id);
        throw error;
      }
      return data as Violation[];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-foreground text-center">Violations</h1>
        <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
          Loading violations data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-foreground text-center">Violations</h1>
        <p className="text-lg text-destructive">Error loading violations: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-extrabold text-foreground text-center">Violations</h1>
      <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
        Detailed reports and statistics on human rights violations worldwide.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {violations?.length === 0 ? (
          <p className="text-muted-foreground text-center col-span-full">No violations found. Add some in Supabase!</p>
        ) : (
          violations?.map((violation) => (
            <Card key={vi.id} className="bg-card border-highlight/20 hover:border-highlight transition-colors flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">{violation.type}</CardTitle>
                <p className="text-sm text-muted-foreground">{violation.location} - {new Date(violation.date).toLocaleDateString()}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-3">{violation.description}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                  violation.severity === "critical" ? "bg-red-500/20 text-red-400" :
                  violation.severity === "high" ? "bg-orange-500/20 text-orange-400" :
                  violation.severity === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-green-500/20 text-green-400"
                }`}>
                  Severity: {violation.severity}
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ViolationsPage