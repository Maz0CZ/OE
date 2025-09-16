import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { logActivity } from "@/utils/logger";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, Users, MapPin, Info } from "lucide-react";
import { cn } from "@/lib/utils";

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
  summary: string | null;
  wikipedia_url: string | null;
  conflict_type: string | null;
  countries_involved: string[] | null;
}

interface ConflictDetailModalProps {
  conflictId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

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

const ConflictDetailModal: React.FC<ConflictDetailModalProps> = ({
  conflictId,
  isOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();

  const {
    data: conflict,
    isLoading,
    error,
  } = useQuery<Conflict>({
    queryKey: ["conflictDetails", conflictId],
    queryFn: async () => {
      if (!conflictId) throw new Error("Conflict ID is missing.");
      const { data, error } = await supabase
        .from("conflicts")
        .select("*")
        .eq("id", conflictId)
        .single();

      if (error) {
        logActivity(
          `Error fetching conflict details for ${conflictId}: ${error.message}`,
          "error",
          currentUser?.id
        );
        throw error;
      }
      return data as Conflict;
    },
    enabled: isOpen && !!conflictId, // Only fetch when modal is open and conflictId is present
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-highlight/20">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-foreground">
            {isLoading ? "Loading..." : conflict?.name || "Conflict Details"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isLoading
              ? "Fetching conflict information."
              : conflict?.region || "No region specified."}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="py-8 text-center text-muted-foreground">
            Loading conflict details...
          </div>
        )}

        {error && (
          <div className="py-8 text-center text-destructive">
            Error loading details: {error.message}
          </div>
        )}

        {conflict && (
          <div className="space-y-4 py-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant={getStatusBadgeVariant(conflict.status)}>
                {conflict.status}
              </Badge>
              <Badge className={getSeverityBadgeColor(conflict.severity)}>
                Severity: {conflict.severity}
              </Badge>
              {conflict.conflict_type && (
                <Badge variant="outline" className="border-highlight text-highlight">
                  Type: {conflict.conflict_type}
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {conflict.summary || "No summary available."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-foreground">
                <Calendar size={16} className="mr-2 text-highlight" />
                <strong>Start Date:</strong>{" "}
                {new Date(conflict.start_date).toLocaleDateString()}
              </div>
              <div className="flex items-center text-foreground">
                <Users size={16} className="mr-2 text-highlight" />
                <strong>Casualties:</strong>{" "}
                {conflict.casualties?.toLocaleString() || "N/A"}
              </div>
              <div className="flex items-center text-foreground">
                <MapPin size={16} className="mr-2 text-highlight" />
                <strong>Location:</strong>{" "}
                {conflict.lat && conflict.lon
                  ? `${conflict.lat.toFixed(2)}, ${conflict.lon.toFixed(2)}`
                  : "N/A"}
              </div>
              <div className="flex items-center text-foreground">
                <Info size={16} className="mr-2 text-highlight" />
                <strong>Involved Parties:</strong>{" "}
                {conflict.involved_parties?.join(", ") || "N/A"}
              </div>
              {conflict.countries_involved && conflict.countries_involved.length > 0 && (
                <div className="flex items-center text-foreground col-span-full">
                  <Globe size={16} className="mr-2 text-highlight" />
                  <strong>Countries Involved:</strong>{" "}
                  {conflict.countries_involved.join(", ")}
                </div>
              )}
            </div>

            {conflict.wikipedia_url && (
              <Button asChild variant="outline" className="w-full mt-4 border-highlight text-highlight hover:bg-highlight hover:text-primary-foreground">
                <a
                  href={conflict.wikipedia_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <ExternalLink size={16} className="mr-2" /> Read on Wikipedia
                </a>
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConflictDetailModal;