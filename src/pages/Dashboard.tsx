import React, { useState } from "react";
import MetricCard from "@/components/MetricCard";
import { Swords, TriangleAlert, Building, CircleDot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import InteractiveWorldMap from "@/components/InteractiveWorldMap";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { logActivity } from "@/utils/logger";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input"; // Import Input for search

interface ConflictSummary {
  id: string;
  name: string;
  status: string;
  severity: string;
  lat: number | null;
  lon: number | null;
}

interface ConflictLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activitySearchTerm, setActivitySearchTerm] = useState(""); // New state for activity search

  // Fetch all conflicts for metrics, pie chart, and map
  const { data: allConflicts, isLoading: conflictsLoading, error: conflictsError } = useQuery<ConflictSummary[]>({
    queryKey: ['allConflictsSummary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conflicts')
        .select('id, name, status, severity, lat, lon');

      if (error) {
        logActivity(`Error fetching all conflicts summary: ${error.message}`, 'error', currentUser?.id);
        throw error;
      }
      console.log("Fetched allConflicts:", data); // DEBUG LOG
      return data as ConflictSummary[];
    }
  });

  // Filter conflict locations for the map
  const conflictLocations: ConflictLocation[] = (allConflicts || [])
    .filter(c => c.lat !== null && c.lon !== null && c.id && c.name)
    .map(c => ({
      id: c.id,
      name: c.name,
      lat: c.lat!,
      lon: c.lon!,
    }));

  // Fetch count of violations
  const { data: violationsCount, isLoading: violationsLoading, error: violationsError } = useQuery<number>({
    queryKey: ['violationsCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('violations')
        .select('*', { count: 'exact', head: true });

      if (error) {
        logActivity(`Error fetching violations count: ${error.message}`, 'error', currentUser?.id);
        throw error;
      }
      console.log("Fetched violationsCount:", count); // DEBUG LOG
      return count || 0;
    }
  });

  // Fetch count of UN declarations
  const { data: unDeclarationsCount, isLoading: unDeclarationsLoading, error: unDeclarationsError } = useQuery<number>({
    queryKey: ['unDeclarationsCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('un_declarations')
        .select('*', { count: 'exact', head: true });

      if (error) {
        logActivity(`Error fetching UN declarations count: ${error.message}`, 'error', currentUser?.id);
        throw error;
      }
      console.log("Fetched unDeclarationsCount:", count); // DEBUG LOG
      return count || 0;
    }
  });

  // Calculate metrics
  const activeConflicts = allConflicts?.filter(c => c.status === 'active').length || 0;
  const criticalSeverityConflicts = allConflicts?.filter(c => c.severity === 'critical').length || 0;

  // Prepare data for Pie Chart
  const severityCounts = allConflicts?.reduce((acc, conflict) => {
    acc[conflict.severity] = (acc[conflict.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = [
    { name: "Critical", value: severityCounts?.critical || 0, color: "#ef4444" }, // Red
    { name: "High", value: severityCounts?.high || 0, color: "#f97316" }, // Orange
    { name: "Medium", value: severityCounts?.medium || 0, color: "#6b7280" }, // Gray
    { name: "Low", value: severityCounts?.low || 0, color: "#4b5563" }, // Darker Gray
  ];

  // Fetch recent logs for Recent Activity
  const { data: recentLogs, isLoading: logsLoading, error: logsError } = useQuery<{ id: string; message: string; created_at: string }[]>({
    queryKey: ['recentLogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('logs')
        .select('id, message, created_at')
        .order('created_at', { ascending: false })
        .limit(10); // Increased limit to make search more useful

      if (error) {
        logActivity(`Error fetching recent logs: ${error.message}`, 'error', currentUser?.id);
        throw error;
      }
      console.log("Fetched recentLogs:", data); // DEBUG LOG
      return data;
    }
  });

  // Filtered logs based on search term
  const filteredLogs = recentLogs?.filter(log =>
    log.message.toLowerCase().includes(activitySearchTerm.toLowerCase())
  );

  if (conflictsLoading || violationsLoading || unDeclarationsLoading || logsLoading) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-foreground">Global Overview</h1>
        <p className="text-lg text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }

  if (conflictsError || violationsError || unDeclarationsError || logsError) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-foreground">Global Overview</h1>
        <p className="text-lg text-destructive">Error loading dashboard: {conflictsError?.message || violationsError?.message || unDeclarationsError?.message || logsError?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-5xl font-extrabold text-foreground">Global Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={<Swords size={48} />} value={activeConflicts} label="Active Conflicts" />
        <MetricCard icon={<TriangleAlert size={48} />} value={violationsCount} label="Violations Reported" />
        <MetricCard icon={<Building size={48} />} value={unDeclarationsCount} label="UN Declarations" />
        <MetricCard icon={<CircleDot size={48} className="text-red-500" />} value={criticalSeverityConflicts} label="Critical Severity" />
      </div>

      <Card className="bg-card border-highlight/20 p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">Global Conflict Map</CardTitle>
        </CardHeader>
        <CardContent>
          <InteractiveWorldMap conflictLocations={conflictLocations} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-highlight/20">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-foreground">Conflict Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-highlight/20">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-foreground">Recent Activity</CardTitle>
            <Input
              placeholder="Search activity..."
              value={activitySearchTerm}
              onChange={(e) => setActivitySearchTerm(e.target.value)}
              className="mt-2 bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredLogs?.length === 0 ? (
              <p className="text-muted-foreground">No recent activity logs found.</p>
            ) : (
              filteredLogs?.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-secondary rounded-md text-muted-foreground hover:bg-highlight/20 hover:text-highlight transition-colors cursor-pointer"
                >
                  [{new Date(log.created_at).toLocaleTimeString()}] {log.message}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;