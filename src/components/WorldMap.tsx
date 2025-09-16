import React from "react";
import { MapPin } from "lucide-react";

interface ConflictLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

interface WorldMapProps {
  conflictLocations: ConflictLocation[];
}

const WorldMap: React.FC<WorldMapProps> = ({ conflictLocations }) => {
  // This is a highly simplified SVG world map for demonstration.
  // In a real application, you would use a more detailed SVG or a mapping library (e.g., Leaflet, Google Maps API).
  // The coordinates (lat, lon) would need to be converted to SVG x, y coordinates based on the map's projection.
  // For this example, I'll use a very basic mapping to illustrate.

  // A very rough scaling/offset for illustrative purposes on a simple SVG
  const scaleX = 2;
  const scaleY = 2;
  const offsetX = 360; // Adjust to center the map roughly
  const offsetY = 180; // Adjust to center the map roughly

  const getSvgCoordinates = (lat: number, lon: number) => {
    // Simple Mercator-like projection for illustrative purposes
    const x = (lon + 180) * scaleX + offsetX;
    const y = (90 - lat) * scaleY + offsetY;
    return { x, y };
  };

  return (
    <div className="relative w-full h-96 bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
      <svg viewBox="0 0 1000 500" className="w-full h-full">
        {/* Placeholder for a world map SVG path data */}
        {/* In a real app, you'd load actual SVG path data for continents/countries */}
        <rect x="0" y="0" width="1000" height="500" fill="hsl(var(--muted))" />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="20">
          World Map Placeholder
        </text>

        {conflictLocations.map((location) => {
          const { x, y } = getSvgCoordinates(location.lat, location.lon);
          return (
            <g key={location.id} transform={`translate(${x}, ${y})`}>
              <circle cx="0" cy="0" r="5" fill="hsl(var(--highlight))" stroke="hsl(var(--highlight-foreground))" strokeWidth="1" />
              <title>{location.name}</title> {/* Tooltip on hover */}
            </g>
          );
        })}
      </svg>
      <p className="absolute bottom-4 text-sm text-muted-foreground">
        (This is a placeholder map. A real map would require a dedicated library.)
      </p>
    </div>
  );
};

export default WorldMap;