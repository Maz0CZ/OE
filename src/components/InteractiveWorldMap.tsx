import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { MapPin } from "lucide-react";
import { feature } from "topojson-client"; // Import feature from topojson-client

interface ConflictLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

interface InteractiveWorldMapProps {
  conflictLocations: ConflictLocation[];
}

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const InteractiveWorldMap: React.FC<InteractiveWorldMapProps> = ({
  conflictLocations,
}) => {
  const [geographyData, setGeographyData] = useState<any>(null); // State to hold processed geography data

  useEffect(() => {
    fetch(geoUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((topology) => {
        // Use topojson-client to extract the 'countries' feature
        const countries = feature(topology, topology.objects.countries);
        setGeographyData(countries);
      })
      .catch((error) => {
        console.error("Error fetching or processing geography data:", error);
        // In a real app, you might want to show a toast notification here
      });
  }, []); // Empty dependency array means this runs once on mount

  if (!geographyData) {
    return (
      <div className="relative w-full h-96 bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
        <p className="text-muted-foreground">Loading map data...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-secondary rounded-lg overflow-hidden">
      <ComposableMap
        projectionConfig={{
          scale: 150,
          center: [0, 0], // Center the map
        }}
        className="w-full h-full"
      >
        <Geographies geography={geographyData}> {/* Pass processed data directly */}
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="hsl(var(--muted))"
                stroke="hsl(var(--border))"
                strokeWidth={0.5}
              />
            ))
          }
        </Geographies>
        {conflictLocations.map(({ id, name, lat, lon }) => (
          <Marker key={id} coordinates={[lon, lat]}>
            <MapPin
              size={20}
              className="text-highlight drop-shadow-md"
              style={{ transform: "translate(-50%, -100%)" }}
            />
            <title>{name}</title>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
};

export default InteractiveWorldMap;