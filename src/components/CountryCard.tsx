import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Users, Gavel, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountryCardProps {
  name: string;
  population: number;
  isDemocracy: boolean;
  president: string;
  flagEmoji: string;
}

const CountryCard: React.FC<CountryCardProps> = ({
  name,
  population,
  isDemocracy,
  president,
  flagEmoji,
}) => {
  return (
    <Card className="bg-card border-highlight/20 hover:border-highlight transition-colors flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
          <span className="text-3xl" role="img" aria-label={`Flag of ${name}`}>{flagEmoji}</span> {name}
        </CardTitle>
        <Badge
          className={cn(
            "px-2 py-1 text-xs font-semibold",
            isDemocracy
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          )}
        >
          {isDemocracy ? "Democracy" : "Non-Democracy"}
        </Badge>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <div className="flex items-center text-muted-foreground text-sm">
          <Users size={16} className="mr-2 text-highlight" />
          Population: {population.toLocaleString()}
        </div>
        <div className="flex items-center text-muted-foreground text-sm">
          <Crown size={16} className="mr-2 text-highlight" />
          Leader: {president}
        </div>
      </CardContent>
    </Card>
  );
};

export default CountryCard;