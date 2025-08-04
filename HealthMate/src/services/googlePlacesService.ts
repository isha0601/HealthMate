
// Declare global google types
declare global {
  interface Window {
    google: typeof google;
  }
  const google: {
    maps: {
      Map: new (element: HTMLElement, options: any) => any;
      LatLng: new (lat: number, lng: number) => any;
      Geocoder: new () => {
        geocode: (request: any, callback: (results: any[], status: any) => void) => void;
      };
      GeocoderStatus: {
        OK: string;
      };
      places: {
        PlacesService: new (map: any) => {
          nearbySearch: (request: any, callback: (results: any[], status: any) => void) => void;
        };
        PlacesServiceStatus: {
          OK: string;
        };
      };
    };
  };
}

interface PlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  opening_hours?: {
    open_now: boolean;
  };
  formatted_phone_number?: string;
  types: string[];
}

interface PlacesResponse {
  results: PlaceResult[];
  status: string;
}

const GOOGLE_PLACES_API_KEY = '';

// Load Google Maps JavaScript API
export const loadGoogleMapsAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));
    
    document.head.appendChild(script);
  });
};

export const fetchNearbyHealthResources = async (
  lat: number,
  lng: number,
  type: string = 'hospital'
): Promise<any[]> => {
  try {
    // Ensure Google Maps API is loaded
    await loadGoogleMapsAPI();
    
    return new Promise((resolve) => {
      const location = new google.maps.LatLng(lat, lng);
      const mapDiv = document.createElement('div');
      const map = new google.maps.Map(mapDiv, {
        center: location,
        zoom: 15
      });

      const service = new google.maps.places.PlacesService(map);
      
      // Map our types to Google Places types
      const placeTypes = {
        'hospital': ['hospital', 'doctor'],
        'pharmacy': ['pharmacy'],
        'dentist': ['dentist'],
        'physiotherapist': ['physiotherapist', 'health']
      };

      const request = {
        location: location,
        radius: 5000, // 5km radius
        types: placeTypes[type] || ['hospital']
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const resources = results.slice(0, 10).map(place => ({
            id: place.place_id || Math.random().toString(),
            name: place.name || 'Unknown',
            type: determineResourceType(place.types || []),
            category: getCategoryFromTypes(place.types || []),
            address: place.vicinity || 'Address not available',
            phone: 'Contact for phone',
            hours: place.opening_hours?.open_now ? 'Open now' : 'Check hours',
            cost: type === 'hospital' ? 'Insurance accepted' : type === 'pharmacy' ? '₹50-500' : 'Contact for pricing',
            rating: place.rating || 0,
            isOpen: place.opening_hours?.open_now || false,
            distance: calculateDistance(lat, lng, place.geometry?.location?.lat() || lat, place.geometry?.location?.lng() || lng).toFixed(1) + ' km',
            services: getServicesFromTypes(place.types || []),
            lat: place.geometry?.location?.lat() || lat,
            lng: place.geometry?.location?.lng() || lng
          }));
          resolve(resources);
        } else {
          console.log('No results found or error:', status);
          // Fallback to sample data if API fails
          resolve(generateSampleHealthResources(lat, lng, type));
        }
      });
    });
  } catch (error) {
    console.error('Error fetching places:', error);
    // Fallback to sample data if API loading fails
    return generateSampleHealthResources(lat, lng, type);
  }
};

const generateSampleHealthResources = (lat: number, lng: number, type: string): any[] => {
  const sampleData = {
    hospital: [
      { name: 'City General Hospital', services: ['General Medicine', 'Emergency Care'], rating: 4.2 },
      { name: 'Memorial Medical Center', services: ['Specialist Care', 'Surgery'], rating: 4.5 },
      { name: 'Regional Health Center', services: ['Outpatient Care', 'Diagnostics'], rating: 4.1 }
    ],
    pharmacy: [
      { name: 'HealthPlus Pharmacy', services: ['Prescription Filling', 'Medical Supplies'], rating: 4.3 },
      { name: 'MediCare Drug Store', services: ['24/7 Service', 'Home Delivery'], rating: 4.0 },
      { name: 'Wellness Pharmacy', services: ['Consultation', 'Health Screening'], rating: 4.4 }
    ],
    dentist: [
      { name: 'Bright Smile Dental Clinic', services: ['General Dentistry', 'Cosmetic Procedures'], rating: 4.6 },
      { name: 'Family Dental Care', services: ['Pediatric Dentistry', 'Orthodontics'], rating: 4.3 },
      { name: 'Advanced Dental Center', services: ['Oral Surgery', 'Implants'], rating: 4.5 }
    ],
    physiotherapist: [
      { name: 'Recovery Plus Physiotherapy', services: ['Sports Therapy', 'Rehabilitation'], rating: 4.4 },
      { name: 'Mobility Health Center', services: ['Pain Management', 'Exercise Therapy'], rating: 4.2 },
      { name: 'Active Life Physio', services: ['Post-Surgery Recovery', 'Wellness Programs'], rating: 4.3 }
    ]
  };

  const resources = sampleData[type] || sampleData.hospital;
  
  return resources.map((resource, index) => {
    // Generate nearby coordinates (within ~2km radius)
    const offsetLat = (Math.random() - 0.5) * 0.02;
    const offsetLng = (Math.random() - 0.5) * 0.02;
    const resourceLat = lat + offsetLat;
    const resourceLng = lng + offsetLng;
    
    return {
      id: `${type}_${index}_${Date.now()}`,
      name: resource.name,
      type: determineResourceType([type]),
      category: getCategoryFromTypes([type]),
      address: `${Math.floor(Math.random() * 999) + 1} Healthcare St, Near ${Math.floor(lat * 1000) % 100} Area`,
      phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      hours: Math.random() > 0.3 ? 'Open now' : 'Closed',
      cost: type === 'hospital' ? 'Insurance accepted' : type === 'pharmacy' ? '₹50-500' : 'Contact for pricing',
      rating: resource.rating,
      isOpen: Math.random() > 0.3,
      distance: calculateDistance(lat, lng, resourceLat, resourceLng).toFixed(1) + ' km',
      services: resource.services,
      lat: resourceLat,
      lng: resourceLng
    };
  });
};

const determineResourceType = (types: string[]): 'clinic' | 'pharmacy' | 'mental-health' | 'emergency' => {
  if (types.includes('pharmacy')) return 'pharmacy';
  if (types.includes('hospital') || types.includes('emergency_room')) return 'emergency';
  if (types.includes('physiotherapist') || types.includes('psychologist')) return 'mental-health';
  return 'clinic';
};

const getCategoryFromTypes = (types: string[]): string => {
  if (types.includes('pharmacy')) return 'Pharmacy';
  if (types.includes('hospital')) return 'Hospital';
  if (types.includes('emergency_room')) return 'Emergency Room';
  if (types.includes('physiotherapist')) return 'Physiotherapy';
  if (types.includes('psychologist')) return 'Mental Health';
  if (types.includes('dentist')) return 'Dental Care';
  return 'Healthcare Facility';
};

const getServicesFromTypes = (types: string[]): string[] => {
  const services: string[] = [];
  if (types.includes('hospital')) services.push('General Medicine', 'Emergency Care');
  if (types.includes('pharmacy')) services.push('Prescription Filling', 'Medical Supplies');
  if (types.includes('dentist')) services.push('Dental Care', 'Oral Health');
  if (types.includes('physiotherapist')) services.push('Physical Therapy', 'Rehabilitation');
  if (types.includes('psychologist')) services.push('Mental Health Counseling', 'Therapy');
  return services.length > 0 ? services : ['Healthcare Services'];
};

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const fetchAllHealthResources = async (lat: number, lng: number) => {
  try {
    await loadGoogleMapsAPI();
    
    const types = ['hospital', 'pharmacy', 'dentist', 'physiotherapist'];
    const allResources = [];
    
    for (const type of types) {
      const resources = await fetchNearbyHealthResources(lat, lng, type);
      allResources.push(...resources);
    }
    
    return allResources;
  } catch (error) {
    console.error('Error fetching all health resources:', error);
    // Return sample data as fallback
    const types = ['hospital', 'pharmacy', 'dentist', 'physiotherapist'];
    const allResources = [];
    
    for (const type of types) {
      const resources = generateSampleHealthResources(lat, lng, type);
      allResources.push(...resources);
    }
    
    return allResources;
  }
};

// Geocoding service to convert address to coordinates
export const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
  try {
    await loadGoogleMapsAPI();
    
    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          console.error('Geocoding failed:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};
