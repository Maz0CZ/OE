import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from 'react-simple-maps';
import { MapPin } from 'lucide-react';

interface ConflictLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

interface InteractiveWorldMapProps {
  conflictLocations: ConflictLocation[];
}

// Using a reliable TopoJSON source from Natural Earth
const geoUrl = 'https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json';

const InteractiveWorldMap: React.FC<InteractiveWorldMapProps> = ({
  conflictLocations
}) => {
  const [geographies, setGeographies] = useState<any>(null);

  useEffect(() => {
    fetch(geoUrl)
      .then(response => response.json())
      .then(data => {
        // Extract the countries feature from the TopoJSON
        setGeographies(data.objects.countries);
      })
      .catch(error => {
        console.error('Error loading map data:', error);
      });
  }, []);

  if (!geographies) {
    return (
      <div className="relative w-full h-96 bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-secondary rounded-lg overflow-hidden">
      <ComposableMap
        projectionConfig={{
          scale: 150,
          center: [0, 0]
        }}
      >
        <Geographies geography={geographies}>
          {({ geographies: geoFeatures }) =>
            geoFeatures.map(geo => (
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