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
import { Users, Crown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface Country {
  id: string;
  name: string;
  population: number;
  is_democracy: boolean;
  president: string;
  flag_emoji: string;
}

interface CountryDetailModalProps {
  countryName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const CountryDetailModal: React.FC<CountryDetailModalProps> = ({
  countryName,
  isOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();

  const {
    data: country,
    isLoading,
    error,
  } = useQuery<Country>({
    queryKey: ["countryDetails", countryName],
    queryFn: async () => {
      if (!countryName) throw new Error("Country name is missing.");
      const { data, error } = await supabase
        .from("countries")
        .select("*")
        .eq("name", countryName)
        .single();

      if (error) {
        logActivity(
          `Error fetching country details for ${countryName}: ${error.message}`,
          "error",
          currentUser?.id
        );
        throw error;
      }
      return data as Country;
    },
    enabled: isOpen && !!countryName, // Only fetch when modal is open and countryName is present
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-highlight/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            {isLoading ? "Loading..." : (country?.flag_emoji ? <span className="text-3xl flag-emoji" key={country.id}>{country.flag_emoji}</span> : <Globe size={24} className="text-highlight" />)}
            {isLoading ? "Country Details" : country?.name || "Country Details"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isLoading ? "Fetching country information." : "Detailed information about this country."}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="py-4 text-center text-muted-foreground">
            Loading country details...
          </div>
        )}

        {error && (
          <div className="py-4 text-center text-destructive">
            Error loading details: {error.message}
          </div>
        )}

        {country && (
          <div className="space-y-4 py-4">
            <div className="flex flex-wrap gap-2">
              <Badge
                className={cn(
                  "px-2 py-1 text-xs font-semibold",
                  country.is_democracy
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                )}
              >
                {country.is_democracy ? "Democracy" : "Non-Democracy"}
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center text-foreground">
                <Users size={16} className="mr-2 text-highlight" />
                <strong>Population:</strong>{" "}
                {country.population?.toLocaleString() || "N/A"}
              </div>
              <div className="flex items-center text-foreground">
                <Crown size={16} className="mr-2 text-highlight" />
                <strong>Leader:</strong>{" "}
                {country.president || "N/A"}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CountryDetailModal;