import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup, // Import ZoomableGroup
} from "react-simple-maps";
import { MapPin, Globe } from "lucide-react"; // Added Globe icon for modal
import { feature } from "topojson-client";
import ConflictDetailModal from "./ConflictDetailModal"; // Import the new modal component

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
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 }); // State for zoom and center
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedConflictId(null);
  };

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
          center: [0, 0],
        }}
        className="w-full h-full"
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleZoomableGroupMoveEnd}
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
                />
              ))
            }
          </Geographies>
          {conflictLocations.map(({ id, name, lat, lon }) => (
            <Marker key={id} coordinates={[lon, lat]} onClick={() => handleMarkerClick(id)}>
              <MapPin
                size={20}
                className="text-highlight drop-shadow-md cursor-pointer"
                style={{ transform: "translate(-50%, -100%)" }}
              />
              <title>{name}</title>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      <ConflictDetailModal
        conflictId={selectedConflictId}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default InteractiveWorldMap;