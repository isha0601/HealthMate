
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import HealthResourcesMap from "@/components/HealthResourcesMap";
import { fetchAllHealthResources, geocodeAddress } from "@/services/googlePlacesService";
import { 
  MapPin, 
  Phone, 
  Clock, 
  DollarSign, 
  Search,
  Hospital,
  Pill,
  Heart,
  Brain,
  Navigation,
  Star,
  Map,
  List,
  Loader2
} from "lucide-react";

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

const HealthResources = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [healthResources, setHealthResources] = useState<HealthResource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentLocationName, setCurrentLocationName] = useState<string>("");

  // Get user's current location and fetch nearby resources
  const getUserLocationAndFetchResources = async () => {
    setLocationLoading(true);
    setResourcesLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setLocationLoading(false);
          
          try {
            const resources = await fetchAllHealthResources(location.lat, location.lng);
            setHealthResources(resources);
          } catch (error) {
            console.error('Error fetching health resources:', error);
            // Fallback to sample data if API fails
            setHealthResources([]);
          }
          setResourcesLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationLoading(false);
          setResourcesLoading(false);
          // Default to NYC if location access is denied
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    } else {
      setLocationLoading(false);
      setResourcesLoading(false);
      // Default to NYC if geolocation is not supported
      setUserLocation({ lat: 40.7128, lng: -74.0060 });
    }
  };

  // Search for resources by location
  const searchLocationAndFetchResources = async () => {
    if (!locationSearch.trim()) return;
    
    setSearchLoading(true);
    setResourcesLoading(true);
    
    try {
      const coordinates = await geocodeAddress(locationSearch);
      if (coordinates) {
        setUserLocation(coordinates);
        setCurrentLocationName(locationSearch);
        const resources = await fetchAllHealthResources(coordinates.lat, coordinates.lng);
        setHealthResources(resources);
      } else {
        console.error('Could not find location');
        // Could show toast here
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
    
    setSearchLoading(false);
    setResourcesLoading(false);
  };

  // Load resources on component mount
  useEffect(() => {
    getUserLocationAndFetchResources();
  }, []);

  const categories = [
    { value: "all", label: "All Resources", icon: MapPin },
    { value: "clinic", label: "Clinics", icon: Hospital },
    { value: "pharmacy", label: "Pharmacies", icon: Pill },
    { value: "mental-health", label: "Mental Health", icon: Brain },
    { value: "emergency", label: "Emergency", icon: Heart }
  ];

  const filteredResources = healthResources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || resource.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getResourceIcon = (type: string) => {
    const iconMap: { [key: string]: any } = {
      clinic: Hospital,
      pharmacy: Pill,
      "mental-health": Brain,
      emergency: Heart,
    };
    return iconMap[type] || MapPin;
  };

  const getStatusColor = (isOpen: boolean) => {
    return isOpen ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground";
  };

  const handleCall = (phone: string) => {
    if (phone !== 'N/A') {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <Navbar />
      <div className="p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 rounded-full bg-gradient-wellness">
                <MapPin className="h-8 w-8 text-accent-foreground" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-wellness bg-clip-text text-transparent">
                Health Resources Near You
              </h1>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <p className="text-muted-foreground text-lg max-w-2xl">
                Find nearby healthcare facilities, pharmacies, and support services in your area.
              </p>
              <Button 
                onClick={getUserLocationAndFetchResources} 
                disabled={locationLoading || resourcesLoading}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                {(locationLoading || resourcesLoading) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                <span>
                  {locationLoading ? 'Getting Location...' : 
                   resourcesLoading ? 'Loading Resources...' : 
                   userLocation ? 'Refresh Location' : 'Get My Location'}
                </span>
              </Button>
            </div>
            {userLocation && (
              <p className="text-sm text-muted-foreground">
                📍 Showing results near {currentLocationName || `your location (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`}
              </p>
            )}
          </div>

          {/* Search and Filters */}
          <Card className="shadow-soft animate-fade-in">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Location Search */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">Search by Location</h3>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter city, address, or zip code..."
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchLocationAndFetchResources()}
                        className="pl-10 border-accent/30 focus:border-accent/50"
                      />
                    </div>
                    <Button 
                      onClick={searchLocationAndFetchResources}
                      disabled={!locationSearch.trim() || searchLoading}
                      className="flex items-center space-x-2"
                    >
                      {searchLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      <span>Search</span>
                    </Button>
                  </div>
                </div>

                {/* Resource Search */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">Filter Results</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for healthcare facilities, services, or specialties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-accent/30 focus:border-accent/50"
                    />
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.value}
                        variant={selectedCategory === category.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.value)}
                        className="flex items-center space-x-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{category.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Hotlines */}
          <Card className="border-destructive/30 shadow-wellness animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-destructive">
                <Heart className="h-5 w-5" />
                <span>Emergency Contacts</span>
              </CardTitle>
              <CardDescription>
                Important numbers for immediate help and crisis support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <h4 className="font-semibold text-destructive">Emergency Services</h4>
                  <p className="text-2xl font-bold">911</p>
                  <p className="text-sm text-muted-foreground">Medical emergencies</p>
                </div>
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <h4 className="font-semibold text-warning">Crisis Hotline</h4>
                  <p className="text-lg font-bold">(988) 123-4567</p>
                  <p className="text-sm text-muted-foreground">Mental health crisis</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h4 className="font-semibold text-primary">Poison Control</h4>
                  <p className="text-lg font-bold">(800) 222-1222</p>
                  <p className="text-sm text-muted-foreground">Poisoning emergencies</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {resourcesLoading && (
            <Card className="shadow-soft animate-fade-in">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 text-muted-foreground mx-auto animate-spin" />
                  <div>
                    <h3 className="text-lg font-semibold">Loading health resources...</h3>
                    <p className="text-muted-foreground">
                      Finding healthcare facilities near your location
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {!resourcesLoading && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Found {filteredResources.length} {selectedCategory === "all" ? "resources" : categories.find(c => c.value === selectedCategory)?.label.toLowerCase()}
                </h2>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="flex items-center space-x-2"
                  >
                    <List className="h-4 w-4" />
                    <span>List</span>
                  </Button>
                  <Button 
                    variant={viewMode === 'map' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('map')}
                    className="flex items-center space-x-2"
                  >
                    <Map className="h-4 w-4" />
                    <span>Map</span>
                  </Button>
                </div>
              </div>

              {viewMode === 'map' ? (
                <HealthResourcesMap 
                  resources={filteredResources} 
                  onResourceSelect={(resource) => {
                    console.log('Selected resource:', resource);
                    setViewMode('list');
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredResources.map((resource) => {
                    const Icon = getResourceIcon(resource.type);
                    return (
                      <Card key={resource.id} className="shadow-soft hover:shadow-wellness transition-shadow duration-300">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-full bg-primary/10">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{resource.name}</CardTitle>
                                <CardDescription>{resource.category}</CardDescription>
                              </div>
                            </div>
                            <Badge className={getStatusColor(resource.isOpen)}>
                              {resource.isOpen ? "Open" : "Closed"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Contact Info */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{resource.address}</span>
                              <Badge variant="outline" className="ml-auto">
                                {resource.distance}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{resource.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{resource.hours}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>{resource.cost}</span>
                            </div>
                          </div>

                          {/* Rating */}
                          {resource.rating > 0 && (
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 fill-warning text-warning" />
                                <span className="text-sm font-medium">{resource.rating}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">rating</span>
                            </div>
                          )}

                          {/* Services */}
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Services:</h4>
                            <div className="flex flex-wrap gap-1">
                              {resource.services.map((service, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2 pt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleCall(resource.phone)}
                              disabled={resource.phone === 'N/A'}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              Call
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleDirections(resource.address)}
                            >
                              <Navigation className="h-4 w-4 mr-1" />
                              Directions
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* No Resources */}
          {!resourcesLoading && filteredResources.length === 0 && (
            <Card className="shadow-soft animate-fade-in">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">No health resources found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or location to find healthcare facilities
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthResources;
