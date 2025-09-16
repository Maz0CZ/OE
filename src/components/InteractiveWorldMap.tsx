import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { MapPin } from "lucide-react";

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
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"; // Updated URL

const InteractiveWorldMap: React.FC<InteractiveWorldMapProps> = ({
  conflictLocations,
}) => {
  return (
    <div className="relative w-full h-96 bg-secondary rounded-lg overflow-hidden">
      <ComposableMap
        projectionConfig={{
          scale: 150,
          center: [0, 0], // Center the map
        }}
        className="w-full h-full"
      >
        <Geographies geography={geoUrl}>
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