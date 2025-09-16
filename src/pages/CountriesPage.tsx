import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import CountryCard from "@/components/CountryCard"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
import { logActivity } from "@/utils/logger"; // Import the new logger
import { useAuth } from "@/context/AuthContext"; // Import useAuth to get currentUser

interface Country {
  id: string;
  name: string;
  population: number;
  is_democracy: boolean; // Changed to is_democracy to match Supabase column
  president: string;
  flag_emoji: string; // Changed to flag_emoji to match Supabase column
}

const CountriesPage = () => {
  const { currentUser } = useAuth(); // Get currentUser for logging
  const { data: countriesData, isLoading, error } = useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        logActivity(`Error fetching countries: ${error.message}`, 'error', currentUser?.id);
        throw error;
      }
      return data as Country[];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-foreground">UN-Recognized Countries</h1>
        <p className="text-lg text-muted-foreground">Loading countries data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-foreground">UN-Recognized Countries</h1>
        <p className="text-lg text-destructive">Error loading countries: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-extrabold text-foreground text-center">UN-Recognized Countries</h1>
      <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
        Explore comprehensive data on countries, their populations, governance, and leadership.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countriesData?.length === 0 ? (
          <p className="text-muted-foreground text-center col-span-full">No countries found. Add some in Supabase!</p>
        ) : (
          countriesData?.map((country) => (
            <CountryCard
              key={country.id}
              name={country.name}
              population={country.population}
              isDemocracy={country.is_democracy}
              president={country.president}
              flagEmoji={country.flag_emoji}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CountriesPage