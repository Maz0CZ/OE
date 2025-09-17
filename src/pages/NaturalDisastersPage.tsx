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
import { Activity, CloudRain, Tornado, Flame, MapPin, CalendarDays, Scale, Waves, Mountain, Sun } from "lucide-react"; // Updated imports: Fire -> Flame
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NaturalDisaster {
  id: string;
  created_at: string;
  name: string;
  type: string;
  date: string;
  location: string;
  description?: string;
  casualties?: number;
  magnitude?: number;
  lat?: number;
  lon?: number;
}

const NaturalDisastersPage: React.FC = () => {
  const { currentUser, isReporter, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCasualties, setNewCasualties] = useState<number | string>("");
  const [newMagnitude, setNewMagnitude] = useState<number | string>("");
  const [newLat, setNewLat] = useState<number | string>("");
  const [newLon, setNewLon] = useState<number | string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: disasters, isLoading, error } = useQuery<NaturalDisaster[]>({
    queryKey: ['naturalDisasters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('natural_disasters')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        logActivity(`Error fetching natural disasters: ${error.message}`, 'error', currentUser?.id);
        throw error;
      }
      return data as NaturalDisaster[];
    }
  });

  const addDisasterMutation = useMutation({
    mutationFn: async (newDisaster: Omit<NaturalDisaster, 'id' | 'created_at'>) => {
      if (!currentUser?.id) throw new Error("User not authenticated.");
      const { data, error } = await supabase
        .from('natural_disasters')
        .insert(newDisaster)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewName("");
      setNewType("");
      setNewDate("");
      setNewLocation("");
      setNewDescription("");
      setNewCasualties("");
      setNewMagnitude("");
      setNewLat("");
      setNewLon("");
      queryClient.invalidateQueries({ queryKey: ['naturalDisasters'] });
      toast.success("Natural disaster added successfully!");
      logActivity(`Reporter ${currentUser?.username} added a new natural disaster: ${newName}.`, 'info', currentUser?.id, 'disaster_added');
    },
    onError: (error) => {
      toast.error(`Error adding disaster: ${error.message}`);
      logActivity(`Error adding natural disaster: ${error.message}`, 'error', currentUser?.id, 'disaster_add_failed');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newType.trim() || !newDate.trim() || !newLocation.trim()) {
      toast.error("Please fill in all required fields (Name, Type, Date, Location).");
      return;
    }

    addDisasterMutation.mutate({
      name: newName,
      type: newType,
      date: newDate,
      location: newLocation,
      description: newDescription.trim() || undefined,
      casualties: newCasualties ? Number(newCasualties) : undefined,
      magnitude: newMagnitude ? Number(newMagnitude) : undefined,
      lat: newLat ? Number(newLat) : undefined,
      lon: newLon ? Number(newLon) : undefined,
    });
  };

  const getDisasterIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "earthquake": return <Activity size={20} className="text-highlight" />;
      case "flood": return <CloudRain size={20} className="text-highlight" />;
      case "hurricane":
      case "typhoon":
      case "cyclone": return <Tornado size={20} className="text-highlight" />;
      case "wildfire": return <Flame size={20} className="text-highlight" />; {/* Changed Fire to Flame */}
      case "tsunami": return <Waves size={20} className="text-highlight" />;
      case "volcanic eruption": return <Mountain size={20} className="text-highlight" />;
      case "drought": return <Sun size={20} className="text-highlight" />;
      case "landslide": return <Mountain size={20} className="text-highlight" />;
      default: return <MapPin size={20} className="text-highlight" />;
    }
  };

  const filteredDisasters = disasters?.filter(disaster =>
    (searchTerm === "" || disaster.name.toLowerCase().includes(searchTerm.toLowerCase()) || disaster.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (typeFilter === "all" || disaster.type.toLowerCase() === typeFilter.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-foreground">Natural Disasters</h1>
        <p className="text-lg text-muted-foreground">Loading natural disaster data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-foreground">Natural Disasters</h1>
        <p className="text-lg text-destructive">Error loading disasters: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-extrabold text-foreground text-center">Natural Disasters</h1>
      <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
        Track and report natural disaster events worldwide.
      </p>

      {isReporter && (
        <Card className="bg-card border-highlight/20 p-6">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-foreground">Report New Disaster</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Disaster Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Japan Earthquake"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select onValueChange={setNewType} value={newType} required>
                    <SelectTrigger className="w-full bg-secondary border-secondary-foreground text-primary-foreground">
                      <SelectValue placeholder="Select disaster type" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-highlight/20">
                      <SelectItem value="Earthquake">Earthquake</SelectItem>
                      <SelectItem value="Flood">Flood</SelectItem>
                      <SelectItem value="Hurricane">Hurricane/Typhoon</SelectItem>
                      <SelectItem value="Wildfire">Wildfire</SelectItem>
                      <SelectItem value="Tsunami">Tsunami</SelectItem>
                      <SelectItem value="Volcanic Eruption">Volcanic Eruption</SelectItem>
                      <SelectItem value="Drought">Drought</SelectItem>
                      <SelectItem value="Landslide">Landslide</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g., Tokyo, Japan"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the disaster..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="casualties">Casualties</Label>
                  <Input
                    id="casualties"
                    type="number"
                    placeholder="Number of casualties"
                    value={newCasualties}
                    onChange={(e) => setNewCasualties(e.target.value)}
                    className="bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="magnitude">Magnitude</Label>
                  <Input
                    id="magnitude"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 7.0 (Richter)"
                    value={newMagnitude}
                    onChange={(e) => setNewMagnitude(e.target.value)}
                    className="bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="lat">Latitude</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="0.000001"
                      placeholder="e.g., 35.68"
                      value={newLat}
                      onChange={(e) => setNewLat(e.target.value)}
                      className="bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lon">Longitude</Label>
                    <Input
                      id="lon"
                      type="number"
                      step="0.000001"
                      placeholder="e.g., 139.69"
                      value={newLon}
                      onChange={(e) => setNewLon(e.target.value)}
                      className="bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full bg-highlight hover:bg-purple-700 text-primary-foreground" disabled={addDisasterMutation.isPending}>
                {addDisasterMutation.isPending ? "Reporting..." : "Report Disaster"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <Input
          placeholder="Search disasters by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground"
        />
        <Select onValueChange={setTypeFilter} value={typeFilter}>
          <SelectTrigger className="w-full md:w-[200px] bg-secondary border-secondary-foreground text-primary-foreground">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent className="bg-card border-highlight/20">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Earthquake">Earthquake</SelectItem>
            <SelectItem value="Flood">Flood</SelectItem>
            <SelectItem value="Hurricane">Hurricane/Typhoon</SelectItem>
            <SelectItem value="Wildfire">Wildfire</SelectItem>
            <SelectItem value="Tsunami">Tsunami</SelectItem>
            <SelectItem value="Volcanic Eruption">Volcanic Eruption</SelectItem>
            <SelectItem value="Drought">Drought</SelectItem>
            <SelectItem value="Landslide">Landslide</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDisasters?.length === 0 ? (
          <p className="text-muted-foreground text-center col-span-full">No natural disasters found matching your criteria.</p>
        ) : (
          filteredDisasters?.map((disaster) => (
            <Card key={disaster.id} className="bg-card border-highlight/20 hover:border-highlight transition-colors flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                  {getDisasterIcon(disaster.type)}
                  {disaster.name}
                </CardTitle>
                <span className="text-sm text-muted-foreground">{new Date(disaster.date).toLocaleDateString()}</span>
              </CardHeader>
              <CardContent className="flex-grow space-y-2 text-sm">
                <p className="text-muted-foreground line-clamp-3">{disaster.description || "No description provided."}</p>
                <div className="flex items-center text-foreground">
                  <MapPin size={16} className="mr-2 text-highlight" />
                  Location: {disaster.location}
                </div>
                {disaster.casualties !== undefined && (
                  <div className="flex items-center text-foreground">
                    <Users size={16} className="mr-2 text-highlight" />
                    Casualties: {disaster.casualties.toLocaleString()}
                  </div>
                )}
                {disaster.magnitude !== undefined && (
                  <div className="flex items-center text-foreground">
                    <Scale size={16} className="mr-2 text-highlight" />
                    Magnitude: {disaster.magnitude}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NaturalDisastersPage;