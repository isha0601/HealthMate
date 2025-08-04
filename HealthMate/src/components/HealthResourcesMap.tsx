
import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Navigation, MapPin, Star, Clock, ExternalLink } from 'lucide-react';

interface HealthResource {
  id: string;
  name: string;
  type: 'clinic' | 'pharmacy' | 'mental-health' | 'emergency';
  category: string;
  address: string;
  phone: string;
  hours: string;
  cost: string;
  rating: number;
  isOpen: boolean;
  distance: string;
  services: string[];
  lat: number;
  lng: number;
}

interface HealthResourcesMapProps {
  resources: HealthResource[];
  onResourceSelect?: (resource: HealthResource) => void;
}

const HealthResourcesMap: React.FC<HealthResourcesMapProps> = ({ 
  resources, 
  onResourceSelect 
}) => {
  const mapRef = useRef<HTMLIFrameElement>(null);

  const handleCall = (phone: string) => {
    if (phone !== 'N/A') {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const handleOpenInMaps = () => {
    if (resources.length === 0) return;
    
    // Create a Google Maps URL with all locations
    const firstLocation = resources[0];
    const mapsUrl = `https://www.google.com/maps/@${firstLocation.lat},${firstLocation.lng},12z`;
    
    window.open(mapsUrl, '_blank');
  };

  const getMarkerColors = () => ({
    clinic: '#10b981', // emerald
    pharmacy: '#3b82f6', // blue
    'mental-health': '#8b5cf6', // violet
    emergency: '#ef4444', // red
  });

  if (resources.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardContent className="p-8 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Resources to Display</h3>
          <p className="text-muted-foreground">Switch to list view to see available options or try adjusting your filters.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate center for Google Maps
  const calculateCenter = () => {
    const totalLat = resources.reduce((sum, resource) => sum + resource.lat, 0);
    const totalLng = resources.reduce((sum, resource) => sum + resource.lng, 0);
    return {
      lat: totalLat / resources.length,
      lng: totalLng / resources.length
    };
  };

  const center = calculateCenter();
  
  // Create Google Maps embed URL with markers
  const createGoogleMapsUrl = () => {
    const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY';
    const zoom = 13;
    
    // Create markers string for multiple locations
    const markers = resources.slice(0, 10).map(resource => 
      `markers=color:${getMarkerColors()[resource.type].replace('#', '')}%7C${resource.lat},${resource.lng}`
    ).join('&');
    
    return `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${center.lat},${center.lng}&zoom=${zoom}&${markers}`;
  };

  return (
    <Card className="shadow-soft overflow-hidden">
      <CardContent className="p-0">
        <div className="relative h-[400px] w-full">
          {/* Google Maps Embed */}
          <iframe
            ref={mapRef}
            src={createGoogleMapsUrl()}
            className="w-full h-full border-0"
            loading="lazy"
            title="Health Resources Map"
            referrerPolicy="no-referrer-when-downgrade"
          />
          
          {/* Legend */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-md z-[1000]">
            <h4 className="text-xs font-semibold mb-2">Legend</h4>
            <div className="space-y-1">
              {Object.entries(getMarkerColors()).map(([type, color]) => (
                <div key={type} className="flex items-center space-x-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="capitalize">
                    {type.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-gray-200">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs h-6"
                onClick={handleOpenInMaps}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open in Maps
              </Button>
            </div>
          </div>
        </div>
        
        {/* Resource Cards Below Map */}
        <div className="p-4 max-h-48 overflow-y-auto bg-muted/20">
          <h4 className="text-sm font-semibold mb-3">Resources on Map</h4>
          <div className="space-y-2">
            {resources.slice(0, 5).map((resource) => (
              <div key={resource.id} className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: getMarkerColors()[resource.type] }}
                  />
                  <div>
                    <h5 className="text-sm font-medium">{resource.name}</h5>
                    <p className="text-xs text-muted-foreground">{resource.distance}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleCall(resource.phone)}
                    disabled={resource.phone === 'N/A'}
                  >
                    <Phone className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleDirections(resource.address)}
                  >
                    <Navigation className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {resources.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                And {resources.length - 5} more resources...
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthResourcesMap;
