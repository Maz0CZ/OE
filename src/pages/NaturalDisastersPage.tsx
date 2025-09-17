import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { logActivity } from "@/utils/logger";
import { useAuth } from "@/context/AuthContext";
import { Activity, CloudRain, Tornado, Flame, MapPin, CalendarDays, Scale, Waves, Mountain, Sun, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NaturalDisaster {
  id: string;
  name: string;
  type: string;
  location: string;
  date: string;
  magnitude: number;
  casualties: number;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
}

const NaturalDisastersPage: React.FC = () => {
  const { currentUser, isAdmin, isReporter } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDisaster, setNewDisaster] = useState({
    name: "",
    type: "",
    location: "",
    date: "",
    magnitude: 0,
    casualties: 0,
    description: "",
    severity: "medium" as const,
  });

  const { data: disasters, isLoading, error } = useQuery<NaturalDisaster[]>({
    queryKey: ['naturalDisasters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('natural_disasters')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        logActivity(`Error fetching natural disasters: ${error.message}`, 'error', currentUser?.id, 'data_fetch_error');
        throw error;
      }
      return data as NaturalDisaster[];
    }
  });

  const queryClient = useQueryClient();

  const addDisasterMutation = useMutation({
    mutationFn: async (disaster: Omit<NaturalDisaster, 'id'>) => {
      if (!currentUser?.id) throw new Error("User not authenticated.");
      const { data, error } = await supabase
        .from('natural_disasters')
        .insert(disaster)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['naturalDisasters'] });
      toast.success("Natural disaster added successfully!");
      logActivity(`User ${currentUser?.username} added a new natural disaster: ${newDisaster.name}.`, 'info', currentUser?.id, 'disaster_added');
      setIsAddModalOpen(false);
      setNewDisaster({
        name: "",
        type: "",
        location: "",
        date: "",
        magnitude: 0,
        casualties: 0,
        description: "",
        severity: "medium",
      });
    },
    onError: (error) => {
      toast.error(`Error adding natural disaster: ${error.message}`);
      logActivity(`Error adding natural disaster: ${error.message}`, 'error', currentUser?.id, 'disaster_add_failed');
    }
  });

  const filteredDisasters = disasters?.filter(disaster =>
    (selectedType === "all" || disaster.type === selectedType) &&
    (selectedSeverity === "all" || disaster.severity === selectedSeverity) &&
    (disaster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     disaster.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddDisaster = (e: React.FormEvent) => {
    e.preventDefault();
    addDisasterMutation.mutate(newDisaster);
  };

  const getDisasterIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'earthquake': return <Activity className="h-5 w-5" />;
      case 'flood': return <CloudRain className="h-5 w-5" />;
      case 'hurricane': return <Tornado className="h-5 w-5" />;
      case 'wildfire': return <Flame className="h-5 w-5" />;
      case 'tsunami': return <Waves className="h-5 w-5" />;
      case 'volcano': return <Mountain className="h-5 w-5" />;
      case 'drought': return <Sun className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-400";
      case "high": return "bg-orange-500/20 text-orange-400";
      case "medium": return "bg-yellow-500/20 text-yellow-400";
      case "low": return "bg-green-500/20 text-green-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-foreground">Natural Disasters</h1>
        <p className="text-lg text-muted-foreground">Loading natural disasters data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-foreground">Natural Disasters</h1>
        <p className="text-lg text-destructive">Error loading natural disasters: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-5xl font-extrabold text-foreground">Natural Disasters</h1>
        {(isAdmin || isReporter) && (
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-highlight hover:bg-purple-700 text-primary-foreground">
            Add New Disaster
          </Button>
        )}
      </div>
      <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
        Track and monitor natural disasters occurring around the world.
      </p>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Search by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-secondary border-secondary-foreground text-foreground placeholder:text-muted-foreground"
        />
        <Select onValueChange={setSelectedType} value={selectedType}>
          <SelectTrigger className="w-full md:w-[180px] bg-secondary border-secondary-foreground text-foreground">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent className="bg-card border-highlight/20">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="earthquake">Earthquake</SelectItem>
            <SelectItem value="flood">Flood</SelectItem>
            <SelectItem value="hurricane">Hurricane</SelectItem>
            <SelectItem value="wildfire">Wildfire</SelectItem>
            <SelectItem value="tsunami">Tsunami</SelectItem>
            <SelectItem value="volcano">Volcano</SelectItem>
            <SelectItem value="drought">Drought</SelectItem>
          </SelectContent>
        </Select>
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
        {filteredDisasters?.length === 0 ? (
          <p className="text-muted-foreground text-center col-span-full">No natural disasters found matching your criteria.</p>
        ) : (
          filteredDisasters?.map((disaster) => (
            <Card key={disaster.id} className="bg-card border-highlight/20 hover:border-highlight transition-colors">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                  {getDisasterIcon(disaster.type)}
                  {disaster.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{disaster.type}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-foreground">
                  <MapPin size={16} className="mr-2 text-highlight" />
                  Location: {disaster.location}
                </div>
                <div className="flex items-center text-foreground">
                  <CalendarDays size={16} className="mr-2 text-highlight" />
                  Date: {new Date(disaster.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-foreground">
                  <Scale size={16} className="mr-2 text-highlight" />
                  Magnitude: {disaster.magnitude}
                </div>
                <div className="flex items-center text-foreground">
                  <Users size={16} className="mr-2 text-highlight" />
                  Casualties: {disaster.casualties.toLocaleString()}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(disaster.severity)}`}>
                    Severity: {disaster.severity}
                  </span>
                </div>
                {disaster.description && (
                  <p className="text-sm text-muted-foreground mt-2">{disaster.description}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Disaster Modal would go here */}
    </div>
  );
};

export default NaturalDisastersPage; // Added default export