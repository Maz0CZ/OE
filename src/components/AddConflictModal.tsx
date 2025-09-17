import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { logActivity } from "@/utils/logger";
import { useAuth } from "@/context/AuthContext";

interface AddConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddConflictModal: React.FC<AddConflictModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState<"active" | "resolved" | "escalating" | "de-escalating">("active");
  const [severity, setSeverity] = useState<"critical" | "high" | "medium" | "low">("medium");
  const [startDate, setStartDate] = useState("");
  const [casualties, setCasualties] = useState<number | string>("");
  const [involvedParties, setInvolvedParties] = useState("");
  const [lat, setLat] = useState<number | string>("");
  const [lon, setLon] = useState<number | string>("");

  const addConflictMutation = useMutation({
    mutationFn: async (newConflict: {
      name: string;
      region: string;
      status: string;
      severity: string;
      start_date: string;
      casualties?: number;
      involved_parties?: string[];
      lat?: number;
      lon?: number;
    }) => {
      if (!currentUser?.id) throw new Error("User not authenticated.");
      const { data, error } = await supabase
        .from('conflicts')
        .insert(newConflict)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conflicts'] });
      queryClient.invalidateQueries({ queryKey: ['allConflictsSummary'] }); // Invalidate dashboard data
      toast.success("Conflict added successfully!");
      logActivity(`User ${currentUser?.username} added a new conflict: ${name}.`, 'info', currentUser?.id, 'conflict_added');
      onClose(); // Close modal on success
      // Reset form fields
      setName("");
      setRegion("");
      setStatus("active");
      setSeverity("medium");
      setStartDate("");
      setCasualties("");
      setInvolvedParties("");
      setLat("");
      setLon("");
    },
    onError: (error) => {
      toast.error(`Error adding conflict: ${error.message}`);
      logActivity(`Error adding conflict: ${error.message}`, 'error', currentUser?.id, 'conflict_add_failed');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !region.trim() || !startDate.trim()) {
      toast.error("Please fill in all required fields (Name, Region, Start Date).");
      return;
    }

    addConflictMutation.mutate({
      name,
      region,
      status,
      severity,
      start_date: startDate,
      casualties: casualties ? Number(casualties) : undefined,
      involved_parties: involvedParties.trim() ? involvedParties.split(',').map(p => p.trim()) : undefined,
      lat: lat ? Number(lat) : undefined,
      lon: lon ? Number(lon) : undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-highlight/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Add New Conflict</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the details to add a new global conflict.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3 bg-secondary border-secondary-foreground text-foreground"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="region" className="text-right">
              Region
            </Label>
            <Input
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="col-span-3 bg-secondary border-secondary-foreground text-foreground"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select onValueChange={(value) => setStatus(value as typeof status)} value={status}>
              <SelectTrigger className="col-span-3 bg-secondary border-secondary-foreground text-foreground">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-highlight/20">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="escalating">Escalating</SelectItem>
                <SelectItem value="de-escalating">De-escalating</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="severity" className="text-right">
              Severity
            </Label>
            <Select onValueChange={(value) => setSeverity(value as typeof severity)} value={severity}>
              <SelectTrigger className="col-span-3 bg-secondary border-secondary-foreground text-foreground">
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent className="bg-card border-highlight/20">
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="col-span-3 bg-secondary border-secondary-foreground text-foreground"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="casualties" className="text-right">
              Casualties
            </Label>
            <Input
              id="casualties"
              type="number"
              value={casualties}
              onChange={(e) => setCasualties(e.target.value)}
              className="col-span-3 bg-secondary border-secondary-foreground text-foreground"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="involvedParties" className="text-right">
              Involved Parties
            </Label>
            <Textarea
              id="involvedParties"
              placeholder="Comma-separated list (e.g., Group A, Group B)"
              value={involvedParties}
              onChange={(e) => setInvolvedParties(e.target.value)}
              className="col-span-3 bg-secondary border-secondary-foreground text-foreground min-h-[60px]"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lat" className="text-right">
              Latitude
            </Label>
            <Input
              id="lat"
              type="number"
              step="0.000001"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="col-span-3 bg-secondary border-secondary-foreground text-foreground"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lon" className="text-right">
              Longitude
            </Label>
            <Input
              id="lon"
              type="number"
              step="0.000001"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              className="col-span-3 bg-secondary border-secondary-foreground text-foreground"
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-highlight hover:bg-purple-700 text-primary-foreground" disabled={addConflictMutation.isPending}>
              {addConflictMutation.isPending ? "Adding Conflict..." : "Add Conflict"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddConflictModal;