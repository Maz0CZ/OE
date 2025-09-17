import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { logActivity } from "@/utils/logger";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import { Input } from "@/components/ui/input"; // Import Input for search

interface Violation {
  id: string;
  type: string;
  location: string;
  date: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
}

const ViolationsPage = () => {
  const { currentUser } = useAuth();
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all"); // New state for severity filter
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term

  const { data: violations, isLoading, error } = useQuery<Violation[]>({
    queryKey: ['violations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('violations')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        logActivity(`Error fetching violations: ${error.message}`, 'error', currentUser?.id, 'data_fetch_error');
        throw error;
      }
      return data as Violation[];
    }
  });

  // Filter violations based on selected severity and search term
  const filteredViolations = violations?.filter(violation =>
    (selectedSeverity === "all" || violation.severity === selectedSeverity) &&
    (searchTerm === "" || violation.type.toLowerCase().includes(searchTerm.toLowerCase()) || violation.location.toLowerCase().includes(searchTerm.toLowerCase()) || violation.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <Input
          placeholder="Search violations by type, location, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-secondary border-secondary-foreground text-foreground placeholder:text-muted-foreground"
        />
        <Select onValueChange={setSelectedSeverity} value={selectedSeverity}>
          <SelectTrigger className="w-full md:w-[180px] bg-secondary border-secondary-foreground text-foreground">
            <SelectValue placeholder="Filter by Severity" />
          </SelectTrigger>
          <SelectContent className="bg-card border-highlight/20">
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredViolations?.length === 0 ? (
          <p className="text-muted-foreground text-center col-span-full">No violations found matching your criteria.</p>
        ) : (
          filteredViolations?.map((violation) => (
            <Card key={violation.id} className="bg-card border-highlight/20 hover:border-highlight transition-colors flex flex-col">
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