import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import CountryCard from "@/components/CountryCard" // Import the new CountryCard component

interface Country {
  name: string;
  population: number;
  isDemocracy: boolean;
  president: string;
  flagEmoji: string;
}

// Mock data for UN-recognized countries
const countriesData: Country[] = [
  { name: "United States", population: 331000000, isDemocracy: true, president: "Joe Biden", flagEmoji: "🇺🇸" },
  { name: "China", population: 1441000000, isDemocracy: false, president: "Xi Jinping", flagEmoji: "🇨🇳" },
  { name: "India", population: 1380000000, isDemocracy: true, president: "Droupadi Murmu", flagEmoji: "🇮🇳" },
  { name: "Russia", population: 146000000, isDemocracy: false, president: "Vladimir Putin", flagEmoji: "🇷🇺" },
  { name: "Germany", population: 83000000, isDemocracy: true, president: "Frank-Walter Steinmeier", flagEmoji: "🇩🇪" },
  { name: "Brazil", population: 212000000, isDemocracy: true, president: "Luiz Inácio Lula da Silva", flagEmoji: "🇧🇷" },
  { name: "Nigeria", population: 206000000, isDemocracy: true, president: "Bola Ahmed Tinubu", flagEmoji: "🇳🇬" },
  { name: "Japan", population: 126000000, isDemocracy: true, president: "Naruhito (Emperor)", flagEmoji: "🇯🇵" },
  { name: "United Kingdom", population: 67000000, isDemocracy: true, president: "King Charles III", flagEmoji: "🇬🇧" },
  { name: "France", population: 65000000, isDemocracy: true, president: "Emmanuel Macron", flagEmoji: "🇫🇷" },
];

const CountriesPage = () => (
  <div className="space-y-8">
    <h1 className="text-5xl font-extrabold text-foreground text-center">UN-Recognized Countries</h1>
    <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
      Explore comprehensive data on countries, their populations, governance, and leadership.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {countriesData.map((country, index) => (
        <CountryCard
          key={index}
          name={country.name}
          population={country.population}
          isDemocracy={country.isDemocracy}
          president={country.president}
          flagEmoji={country.flagEmoji}
        />
      ))}
    </div>
  </div>
)

export default CountriesPage