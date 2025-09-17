import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, MoreHorizontal, ChevronLeft, ChevronRight, PlusCircle } from "lucide-react"; // Added PlusCircle
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { logActivity } from "@/utils/logger";
import { useAuth } from "@/context/AuthContext";
import ConflictDetailModal from "@/components/ConflictDetailModal";
import AddConflictModal from "@/components/AddConflictModal"; // Import new modal
import { cn } from "@/lib/utils"; // Import cn for conditional class names

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
}

type SortKey = keyof Conflict | 'actions'; // 'actions' is a dummy key for non-sortable column
type SortDirection = "asc" | "desc";

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const getStatusBadgeVariant = (status: Conflict["status"]) => {
  switch (status) {
    case "active":
      return "default";
    case "resolved":
    case "de-escalating":
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
  const { currentUser, isAdmin, isReporter } = useAuth();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddConflictModalOpen, setIsAddConflictModalOpen] = useState(false); // New state for add modal
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "start_date", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: conflictsData, isLoading, error } = useQuery<Conflict[]>({
    queryKey: ['conflicts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conflicts')
        .select('id, name, region, status, severity, start_date, casualties, involved_parties, lat, lon')
        .order('start_date', { ascending: false });

      if (error) {
        logActivity(`Error fetching conflicts: ${error.message}`, 'error', currentUser?.id, 'data_fetch_error');
        throw error;
      }
      return data as Conflict[];
    }
  });

  const handleViewDetails = (conflictId: string) => {
    setSelectedConflictId(conflictId);
    setIsDetailModalOpen(true);
    logActivity(`User opened details for conflict: ${conflictId}`, 'info', currentUser?.id, 'conflict_viewed');
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedConflictId(null);
  };

  const handleAddConflictClick = () => {
    setIsAddConflictModalOpen(true);
  };

  const handleAddConflictModalClose = () => {
    setIsAddConflictModalOpen(false);
  };

  const handleReportUpdate = (conflictId: string) => {
    toast.info(`Reporting update for conflict: ${conflictId}`);
    logActivity(`User reported update for conflict: ${conflictId}`, 'info', currentUser?.id, 'conflict_update_reported');
    // In a real app, open a form to submit an update
  };

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredConflicts = useMemo(() => {
    let sortableItems = [...(conflictsData || [])];

    // 1. Filter by search term
    sortableItems = sortableItems.filter(conflict =>
      conflict.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conflict.region.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Filter by status
    if (statusFilter !== "all") {
      sortableItems = sortableItems.filter(conflict => conflict.status === statusFilter);
    }

    // 3. Filter by severity
    if (severityFilter !== "all") {
      sortableItems = sortableItems.filter(conflict => conflict.severity === severityFilter);
    }

    // 4. Sort
    if (sortConfig.key !== 'actions') { // Exclude 'actions' from sorting
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Conflict];
        const bValue = b[sortConfig.key as keyof Conflict];

        if (aValue === null || aValue === undefined) return sortConfig.direction === "asc" ? 1 : -1;
        if (bValue === null || bValue === undefined) return sortConfig.direction === "asc" ? -1 : 1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }
        // Fallback for other types or if comparison fails
        return 0;
      });
    }

    return sortableItems;
  }, [conflictsData, searchTerm, statusFilter, severityFilter, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedAndFilteredConflicts.length / itemsPerPage);
  const currentConflicts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedAndFilteredConflicts.slice(startIndex, endIndex);
  }, [sortedAndFilteredConflicts, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
      <div className="flex justify-between items-center">
        <h1 className="text-5xl font-extrabold text-foreground">Global Conflicts</h1>
        {(isAdmin || isReporter) && (
          <Button onClick={handleAddConflictClick} className="bg-highlight hover:bg-purple-700 text-primary-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Conflict
          </Button>
        )}
      </div>
      <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
        Overview of ongoing and historical conflicts worldwide.
      </p>

      <Card className="bg-card border-highlight/20 p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">Conflict List</CardTitle>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <Input
              placeholder="Search by name or region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground"
            />
            <Select onValueChange={setStatusFilter} value={statusFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-secondary border-secondary-foreground text-primary-foreground">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-highlight/20">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="escalating">Escalating</SelectItem>
                <SelectItem value="de-escalating">De-escalating</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setSeverityFilter} value={severityFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-secondary border-secondary-foreground text-primary-foreground">
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
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-highlight/20 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary hover:bg-secondary">
                  <TableHead className="text-highlight min-w-[80px]">ID</TableHead>
                  <TableHead className="text-highlight min-w-[150px]">
                    <Button variant="ghost" className="p-0 h-auto" onClick={() => requestSort("name")}>
                      Name {sortConfig.key === "name" && <ArrowUpDown className={cn("ml-2 h-4 w-4", sortConfig.direction === "desc" ? "rotate-180" : "")} />}
                    </Button>
                  </TableHead>
                  <TableHead className="text-highlight min-w-[120px]">
                    <Button variant="ghost" className="p-0 h-auto" onClick={() => requestSort("region")}>
                      Region {sortConfig.key === "region" && <ArrowUpDown className={cn("ml-2 h-4 w-4", sortConfig.direction === "desc" ? "rotate-180" : "")} />}
                    </Button>
                  </TableHead>
                  <TableHead className="text-highlight min-w-[120px]">
                    <Button variant="ghost" className="p-0 h-auto" onClick={() => requestSort("status")}>
                      Status {sortConfig.key === "status" && <ArrowUpDown className={cn("ml-2 h-4 w-4", sortConfig.direction === "desc" ? "rotate-180" : "")} />}
                    </Button>
                  </TableHead>
                  <TableHead className="text-highlight min-w-[120px]">
                    <Button variant="ghost" className="p-0 h-auto" onClick={() => requestSort("severity")}>
                      Severity {sortConfig.key === "severity" && <ArrowUpDown className={cn("ml-2 h-4 w-4", sortConfig.direction === "desc" ? "rotate-180" : "")} />}
                    </Button>
                  </TableHead>
                  <TableHead className="text-highlight min-w-[120px]">
                    <Button variant="ghost" className="p-0 h-auto" onClick={() => requestSort("start_date")}>
                      Start Date {sortConfig.key === "start_date" && <ArrowUpDown className={cn("ml-2 h-4 w-4", sortConfig.direction === "desc" ? "rotate-180" : "")} />}
                    </Button>
                  </TableHead>
                  <TableHead className="text-highlight text-right min-w-[120px]">
                    <Button variant="ghost" className="p-0 h-auto" onClick={() => requestSort("casualties")}>
                      Casualties {sortConfig.key === "casualties" && <ArrowUpDown className={cn("ml-2 h-4 w-4", sortConfig.direction === "desc" ? "rotate-180" : "")} />}
                    </Button>
                  </TableHead>
                  <TableHead className="text-highlight text-right min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentConflicts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No conflicts found matching your criteria.</TableCell>
                  </TableRow>
                ) : (
                  currentConflicts.map((conflict) => (
                    <TableRow key={conflict.id} className="hover:bg-accent/20">
                      <TableCell className="font-medium text-muted-foreground">{conflict.id.substring(0, 8)}...</TableCell>
                      <TableCell className="text-foreground font-semibold">{conflict.name}</TableCell>
                      <TableCell className="text-muted-foreground">{conflict.region}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(conflict.status)}>{conflict.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityBadgeColor(conflict.severity)}>{conflict.severity}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{new Date(conflict.start_date).toLocaleDateString()}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleReportUpdate(conflict.id)} className="hover:bg-accent hover:text-accent-foreground">
                              Report Update
                            </DropdownMenuItem>
                            {(isAdmin || isReporter) && ( // Only show edit/delete to authorized roles
                              <>
                                <DropdownMenuSeparator className="bg-highlight/20" />
                                <DropdownMenuItem className="hover:bg-accent hover:text-accent-foreground">
                                  Edit Conflict
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500 hover:bg-red-500/20 hover:text-red-400">
                                  Delete Conflict
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-highlight text-highlight hover:bg-highlight hover:text-primary-foreground"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-highlight text-highlight hover:bg-highlight hover:text-primary-foreground"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ConflictDetailModal
        conflictId={selectedConflictId}
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
      />

      {(isAdmin || isReporter) && (
        <AddConflictModal
          isOpen={isAddConflictModalOpen}
          onClose={handleAddConflictModalClose}
        />
      )}
    </div>
  );
};

export default ConflictsPage;