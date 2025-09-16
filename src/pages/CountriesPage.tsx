import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import CountryCard from "@/components/CountryCard"
import { Input } from "@/components/ui/input"; // Import Input for search
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
import { logActivity } from "@/utils/logger";
import { useAuth } from "@/context/AuthContext";

interface Country {
  id: string;
  name: string;
  population: number;
  is_democracy: boolean;
  president: string;
  flag_emoji: string;
}

const CountriesPage = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term

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

  // Filter countries based on search term
  const filteredCountries = countriesData?.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <div className="flex justify-center mb-4">
        <Input
          placeholder="Search countries by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md bg-secondary border-secondary-foreground text-primary-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCountries?.length === 0 ? (
          <p className="text-muted-foreground text-center col-span-full">No countries found matching your search. Add some in Supabase!</p>
        ) : (
          filteredCountries?.map((country) => (
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