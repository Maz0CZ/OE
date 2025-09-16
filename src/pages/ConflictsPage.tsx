import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
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

interface Conflict {
  id: string;
  name: string;
  region: string;
  status: "active" | "resolved" | "escalating" | "de-escalating";
  severity: "critical" | "high" | "medium" | "low";
  startDate: string;
  casualties: number;
  involvedParties: string[];
}

const conflictsData: Conflict[] = [
  {
    id: "C001",
    name: "Syrian Civil War",
    region: "Middle East",
    status: "active",
    severity: "critical",
    startDate: "2011-03-15",
    casualties: 500000,
    involvedParties: ["Syrian Government", "Rebel Groups", "ISIS", "International Coalitions"],
  },
  {
    id: "C002",
    name: "War in Ukraine",
    region: "Eastern Europe",
    status: "escalating",
    severity: "critical",
    startDate: "2014-02-20",
    casualties: 300000,
    involvedParties: ["Ukraine", "Russia", "NATO Allies"],
  },
  {
    id: "C003",
    name: "Yemen Civil War",
    region: "Middle East",
    status: "active",
    severity: "high",
    startDate: "2014-09-19",
    casualties: 377000,
    involvedParties: ["Houthi Movement", "Yemeni Government", "Saudi-led Coalition"],
  },
  {
    id: "C004",
    name: "Sahel Conflict",
    region: "West Africa",
    status: "active",
    severity: "high",
    startDate: "2012-01-17",
    casualties: 50000,
    involvedParties: ["Militant Groups", "National Armies", "French Forces"],
  },
  {
    id: "C005",
    name: "Ethiopian Civil War",
    region: "East Africa",
    status: "de-escalating",
    severity: "medium",
    startDate: "2020-11-04",
    casualties: 100000,
    involvedParties: ["Ethiopian Government", "Tigray People's Liberation Front"],
  },
  {
    id: "C006",
    name: "Nagorno-Karabakh Conflict",
    region: "Caucasus",
    status: "resolved",
    severity: "low",
    startDate: "1988-02-20",
    casualties: 30000,
    involvedParties: ["Armenia", "Azerbaijan"],
  },
  {
    id: "C007",
    name: "Myanmar Civil War",
    region: "Southeast Asia",
    status: "escalating",
    severity: "high",
    startDate: "2021-02-01",
    casualties: 50000,
    involvedParties: ["Tatmadaw", "Ethnic Armed Organizations", "People's Defense Force"],
  },
];

const getStatusBadgeVariant = (status: Conflict["status"]) => {
  switch (status) {
    case "active":
      return "default";
    case "resolved":
      return "secondary";
    case "escalating":
      return "destructive";
    case "de-escalating":
      return "outline";
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
  const handleViewDetails = (conflictId: string) => {
    toast.info(`Viewing details for conflict: ${conflictId}`);
    // In a real app, navigate to a detailed conflict page
  };

  const handleReportUpdate = (conflictId: string) => {
    toast.info(`Reporting update for conflict: ${conflictId}`);
    // In a real app, open a form to submit an update
  };

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
          <div className="rounded-md border border-highlight/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary hover:bg-secondary">
                  <TableHead className="text-highlight">ID</TableHead>
                  <TableHead className="text-highlight">
                    <Button variant="ghost" className="p-0 h-auto">
                      Name <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-highlight">Region</TableHead>
                  <TableHead className="text-highlight">Status</TableHead>
                  <TableHead className="text-highlight">Severity</TableHead>
                  <TableHead className="text-highlight">Start Date</TableHead>
                  <TableHead className="text-highlight text-right">Casualties</TableHead>
                  <TableHead className="text-highlight text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conflictsData.map((conflict) => (
                  <TableRow key={conflict.id} className="hover:bg-accent/20">
                    <TableCell className="font-medium text-muted-foreground">{conflict.id}</TableCell>
                    <TableCell className="text-foreground font-semibold">{conflict.name}</TableCell>
                    <TableCell className="text-muted-foreground">{conflict.region}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(conflict.status)}>{conflict.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityBadgeColor(conflict.severity)}>{conflict.severity}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{conflict.startDate}</TableCell>
                    <TableCell className="text-foreground text-right">{conflict.casualties.toLocaleString()}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConflictsPage;