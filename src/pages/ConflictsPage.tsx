import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, MoreHorizontal } from "lucide-react"; // Removed ExternalLink icon as wikipedia_url is removed
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { logActivity } from "@/utils/logger";
import { useAuth } from "@/context/AuthContext";

interface Conflict {
  id: string;
  name: string;
  region: string;
  status: "active" | "resolved" | "escalating" | "de-escalating";
  severity: "critical" | "high" | "medium" | "low";
  start_date: string;
  casualties: number;
  involved_parties: string[];
  lat: number | null;
  lon: number | null;
  // Removed: summary, wikipedia_url, conflict_type, countries_involved
}

const getStatusBadgeVariant = (status: Conflict["status"]) => {
  switch (status) {
    case "active":
      return "default";
    case "resolved":
    case "de-escalating": // Group de-escalating with resolved for now
      return "secondary";
    case "escalating":
      return "destructive";
    default:
      return "default";
  }
};

const getSeverityBadgeColor = (severity: Conflict["severity"]) => {
  switch (severity) {
    case "critical":
      return "bg-red-500/20 text-red-400";
    case "high":
      return "bg-orange-500/20 text-orange-400";
    case "medium":
      return "bg-yellow-500/20 text-yellow-400";
    case "low":
      return "bg-green-500/20 text-green-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
};

const ConflictsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { data: conflictsData, isLoading, error } = useQuery<Conflict[]>({
    queryKey: ['conflicts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conflicts')
        .select('id, name, region, status, severity, start_date, casualties, involved_parties, lat, lon') // Removed non-existent columns
        .order('start_date', { ascending: false });

      if (error) {
        logActivity(`Error fetching conflicts: ${error.message}`, 'error', currentUser?.id);
        throw error;
      }
      return data as Conflict[];
    }
  });

  const handleViewDetails = (conflictId: string) => {
    toast.info(`Viewing details for conflict: ${conflictId}`);
    logActivity(`User viewed details for conflict: ${conflictId}`, 'info', currentUser?.id);
    // In a real app, navigate to a detailed conflict page or open a modal
  };

  const handleReportUpdate = (conflictId: string) => {
    toast.info(`Reporting update for conflict: ${conflictId}`);
    logActivity(`User reported update for conflict: ${conflictId}`, 'info', currentUser?.id);
    // In a real app, open a form to submit an update
  };

  if (isLoading) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-foreground">Global Conflicts</h1>
        <p className="text-lg text-muted-foreground">Loading conflicts data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-foreground">Global Conflicts</h1>
        <p className="text-lg text-destructive">Error loading conflicts: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-extrabold text-foreground text-center">Global Conflicts</h1>
      <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
        Overview of ongoing and historical conflicts worldwide.
      </p>

      <Card className="bg-card border-highlight/20 p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">Conflict List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-highlight/20 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary hover:bg-secondary">
                  <TableHead className="text-highlight min-w-[80px]">ID</TableHead>
                  <TableHead className="text-highlight min-w-[150px]">
                    <Button variant="ghost" className="p-0 h-auto">
                      Name <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  {/* Removed Type column */}
                  <TableHead className="text-highlight min-w-[120px]">Region</TableHead>
                  <TableHead className="text-highlight min-w-[120px]">Status</TableHead>
                  <TableHead className="text-highlight min-w-[120px]">Severity</TableHead>
                  <TableHead className="text-highlight min-w-[120px]">Start Date</TableHead>
                  <TableHead className="text-highlight text-right min-w-[120px]">Casualties</TableHead>
                  <TableHead className="text-highlight text-right min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conflictsData?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">No conflicts found. Add some in Supabase!</TableCell>
                  </TableRow>
                ) : (
                  conflictsData?.map((conflict) => (
                    <TableRow key={conflict.id} className="hover:bg-accent/20">
                      <TableCell className="font-medium text-muted-foreground">{conflict.id}</TableCell>
                      <TableCell className="text-foreground font-semibold">{conflict.name}</TableCell>
                      {/* Removed Type cell */}
                      <TableCell className="text-muted-foreground">{conflict.region}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(conflict.status)}>{conflict.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityBadgeColor(conflict.severity)}>{conflict.severity}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{conflict.start_date}</TableCell>
                      <TableCell className="text-foreground text-right">{conflict.casualties?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-highlight/20">
                            <DropdownMenuLabel className="text-foreground">Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(conflict.id)} className="hover:bg-accent hover:text-accent-foreground">
                              View Details
                            </DropdownMenuItem>
                            {/* Removed Wikipedia link */}
                            <DropdownMenuItem onClick={() => handleReportUpdate(conflict.id)} className="hover:bg-accent hover:text-accent-foreground">
                              Report Update
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-highlight/20" />
                            <DropdownMenuItem className="text-red-500 hover:bg-red-500/20 hover:text-red-400">
                              Delete Conflict (Admin Only)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConflictsPage;