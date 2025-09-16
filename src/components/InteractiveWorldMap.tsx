import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { MapPin } from "lucide-react";
import { feature } from "topojson-client";
import ConflictDetailModal from "./ConflictDetailModal";
import CountryDetailModal from "./CountryDetailModal";
import { cn } from "@/lib/utils"; // Import cn for conditional class names

interface ConflictLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

interface InteractiveWorldMapProps {
  conflictLocations: ConflictLocation[];
}

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const InteractiveWorldMap: React.FC<InteractiveWorldMapProps> = ({
  conflictLocations,
}) => {
  const [geographyData, setGeographyData] = useState<any>(null);
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

  useEffect(() => {
    fetch(geoUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((topology) => {
        const countries = feature(topology, topology.objects.countries);
        setGeographyData(countries);
      })
      .catch((error) => {
        console.error("Error fetching or processing geography data:", error);
      });
  }, []);

  const handleZoomableGroupMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
    setPosition(position);
  };

  const handleMarkerClick = (conflictId: string) => {
    setSelectedConflictId(conflictId);
    setIsConflictModalOpen(true);
  };

  const handleConflictModalClose = () => {
    setIsConflictModalOpen(false);
    setSelectedConflictId(null);
  };

  const handleCountryClick = (geo: any) => {
    setSelectedCountryName(geo.properties.name);
    setIsCountryModalOpen(true);
  };

  const handleCountryModalClose = () => {
    setIsCountryModalOpen(false);
    setSelectedCountryName(null);
  };

  if (!geographyData) {
    return (
      <div className="relative w-full h-96 bg-secondary rounded-lg overflow-hidden flex items-center justify-center shadow-lg border border-highlight/20">
        <p className="text-muted-foreground">Loading map data...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-secondary rounded-lg overflow-hidden shadow-lg border border-highlight/20">
      {conflictLocations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-secondary/80 text-muted-foreground">
          No conflict locations available to display on the map.
        </div>
      )}
      <ComposableMap
        projectionConfig={{
          scale: 150,
          center: [0, 0],
        }}
        className="w-full h-full"
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleZoomableGroupMoveEnd}
          minZoom={1}
          maxZoom={8}
          translateExtent={[
            [-50, -50],
            [1050, 550],
          ]}
        >
          <Geographies geography={geographyData}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={0.5}
                  className="transition-all duration-200 ease-in-out hover:fill-highlight/30 cursor-pointer"
                  onClick={() => handleCountryClick(geo)}
                />
              ))
            }
          </Geographies>
          {conflictLocations.map(({ id, name, lat, lon }) => (
            <Marker key={id} coordinates={[lon, lat]} onClick={() => handleMarkerClick(id)}>
              <g className="z-20"> {/* Added z-20 to the group */}
                <MapPin
                  size={30}
                  className="text-highlight drop-shadow-md cursor-pointer hover:scale-125 transition-transform duration-200"
                  style={{ transform: "translate(-50%, -100%)" }}
                />
                <title>{name}</title>
              </g>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      <ConflictDetailModal
        conflictId={selectedConflictId}
        isOpen={isConflictModalOpen}
        onClose={handleConflictModalClose}
      />

      <CountryDetailModal
        countryName={selectedCountryName}
        isOpen={isCountryModalOpen}
        onClose={handleCountryModalClose}
      />
    </div>
  );
};

export default InteractiveWorldMap;