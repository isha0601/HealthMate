import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalysisRequest {
  symptoms: string;
  userLocation?: { lat: number; lng: number };
  saveToHistory?: boolean;
}

interface HealthFacility {
  name: string;
  type: string;
  address: string;
  distance: string;
  specialty?: string;
  phoneNumber?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the Gemini API key from Supabase secrets
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured')
    }

    const { symptoms, userLocation, saveToHistory }: AnalysisRequest = await req.json()

    if (!symptoms) {
      throw new Error('Symptoms description is required')
    }

    console.log('Analyzing symptoms:', symptoms)

    // Detect severity and categories for location-based suggestions
    const conditionAnalysis = analyzeConditions(symptoms)
    
    // Call Gemini API for comprehensive analysis
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI health assistant providing symptom analysis. Analyze the following symptoms and provide a structured response:

Symptoms: "${symptoms}"

Please provide your response in the following JSON format:
{
  "severity": "mild|moderate|severe",
  "healthInsights": "Brief explanation of possible health conditions related to the symptoms",
  "possibleCauses": ["cause 1", "cause 2", "cause 3"],
  "recommendedActions": ["action 1", "action 2", "action 3"],
  "homeRemedies": ["remedy 1", "remedy 2", "remedy 3"],
  "seekCare": "When to seek medical care description",
  "urgencyLevel": "low|medium|high"
}

Guidelines:
- Be medically accurate but general in nature
- Focus on common conditions for the described symptoms  
- Provide practical, safe home remedies for minor conditions
- Be clear about when professional medical care is needed
- Include appropriate medical disclaimers in your recommendations
- Severity should be based on symptom description and potential conditions`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      }
    )

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    let aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""
    
    console.log('Raw Gemini response:', aiResponse)

    // Parse the JSON response from Gemini
    let analysisResult
    try {
      // Extract JSON from response if it's wrapped in markdown
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[1] || jsonMatch[0])
      } else {
        analysisResult = JSON.parse(aiResponse)
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError)
      // Fallback to structured response
      analysisResult = {
        severity: conditionAnalysis.severity,
        healthInsights: "I'm experiencing some difficulty analyzing your symptoms right now. Please consult with a healthcare professional for proper evaluation.",
        possibleCauses: ["Unable to determine at this time"],
        recommendedActions: ["Consult with a healthcare provider", "Monitor your symptoms", "Rest and stay hydrated"],
        homeRemedies: ["Ensure adequate rest", "Stay well hydrated", "Maintain a healthy diet"],
        seekCare: "Consult a healthcare provider if symptoms persist or worsen",
        urgencyLevel: "medium"
      }
    }

    // Add location-based healthcare facility suggestions
    let nearbyFacilities: HealthFacility[] = []
    if (userLocation && conditionAnalysis.categories.length > 0) {
      nearbyFacilities = await getLocationBasedFacilities(userLocation, conditionAnalysis.categories, analysisResult.urgencyLevel)
    }

    // Save to history if requested and user is authenticated
    if (saveToHistory) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('symptom_analyses')
            .insert({
              user_id: user.id,
              symptoms,
              analysis_result: analysisResult,
              location_data: userLocation ? { 
                coordinates: userLocation, 
                facilities: nearbyFacilities 
              } : null
            })
        }
      } catch (historyError) {
        console.error('Failed to save to history:', historyError)
        // Don't fail the request if history saving fails
      }
    }

    const response = {
      ...analysisResult,
      nearbyFacilities,
      hasLocationSuggestions: nearbyFacilities.length > 0,
      timestamp: new Date().toISOString()
    }

    console.log('Final response:', response)

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error in symptom-analyzer function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze symptoms. Please try again later or consult with a healthcare professional for immediate concerns.',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

function analyzeConditions(symptoms: string): { severity: string; categories: string[] } {
  const lowerSymptoms = symptoms.toLowerCase()
  const categories: string[] = []
  let severity = 'mild'
  
  // Emergency symptoms - highest priority
  const emergencyKeywords = [
    'severe chest pain', 'heart attack', 'can\'t breathe', 'difficulty breathing', 
    'severe bleeding', 'unconscious', 'stroke', 'severe head injury', 'poisoning',
    'severe allergic reaction', 'anaphylaxis', 'severe burns', 'seizure'
  ]
  
  // Severe symptoms
  const severeKeywords = [
    'severe pain', 'high fever', 'vomiting blood', 'severe headache',
    'severe abdominal pain', 'severe dizziness', 'fainting', 'severe nausea'
  ]
  
  // Moderate symptoms  
  const moderateKeywords = [
    'persistent pain', 'fever', 'persistent cough', 'moderate pain',
    'swelling', 'rash', 'persistent nausea', 'headache'
  ]

  // Check for emergency conditions
  if (emergencyKeywords.some(keyword => lowerSymptoms.includes(keyword))) {
    severity = 'severe'
    categories.push('emergency')
  }
  // Check for severe conditions
  else if (severeKeywords.some(keyword => lowerSymptoms.includes(keyword))) {
    severity = 'severe'
  }
  // Check for moderate conditions
  else if (moderateKeywords.some(keyword => lowerSymptoms.includes(keyword))) {
    severity = 'moderate'
  }

  // Categorize by specialty
  const specialtyKeywords = {
    'cardiology': ['chest pain', 'heart', 'palpitations', 'shortness of breath', 'cardiac'],
    'neurology': ['headache', 'migraine', 'dizziness', 'numbness', 'neurological', 'seizure'],
    'orthopedics': ['joint pain', 'back pain', 'bone pain', 'arthritis', 'sprain', 'fracture'],
    'gastroenterology': ['stomach pain', 'nausea', 'vomiting', 'diarrhea', 'abdominal', 'digestive'],
    'dermatology': ['skin', 'rash', 'acne', 'eczema', 'itching', 'dermatological'],
    'pulmonology': ['cough', 'breathing', 'asthma', 'lung', 'respiratory', 'wheezing'],
    'mental health': ['anxiety', 'depression', 'stress', 'panic', 'mental health', 'mood'],
    'pediatrics': ['child', 'baby', 'infant', 'kids', 'pediatric'],
    'gynecology': ['pregnancy', 'menstrual', 'reproductive', 'gynecological']
  }

  for (const [specialty, keywords] of Object.entries(specialtyKeywords)) {
    if (keywords.some(keyword => lowerSymptoms.includes(keyword))) {
      categories.push(specialty)
    }
  }

  return { severity, categories }
}

async function getLocationBasedFacilities(
  location: { lat: number; lng: number }, 
  categories: string[],
  urgencyLevel: string
): Promise<HealthFacility[]> {
  try {
    // Use Google Places API to find real nearby hospitals
    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')
    
    if (!GOOGLE_PLACES_API_KEY) {
      console.log('Google Places API key not configured, using location-aware mock data')
      return getLocationAwareMockData(location, categories, urgencyLevel)
    }

    const facilities: HealthFacility[] = []
    
    // Search for different types of healthcare facilities based on urgency and categories
    const searchTypes = []
    
    if (urgencyLevel === 'high' || categories.includes('emergency')) {
      searchTypes.push('hospital')
    }
    
    if (categories.includes('cardiology')) {
      searchTypes.push('hospital', 'doctor')
    } else if (categories.includes('mental health')) {
      searchTypes.push('hospital', 'doctor')
    } else if (categories.includes('dermatology')) {
      searchTypes.push('doctor', 'hospital')
    } else {
      searchTypes.push('hospital', 'doctor')
    }

    // Search for nearby healthcare facilities
    for (const type of searchTypes.slice(0, 2)) { // Limit to 2 searches
      const radius = urgencyLevel === 'high' ? 5000 : 10000 // 5km for high urgency, 10km otherwise
      const keyword = type === 'hospital' ? 'hospital emergency' : 'clinic doctor'
      
      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=${type}&keyword=${keyword}&key=${GOOGLE_PLACES_API_KEY}`
      
      try {
        const placesResponse = await fetch(placesUrl)
        const placesData = await placesResponse.json()
        
        if (placesData.status === 'OK' && placesData.results) {
          for (const place of placesData.results.slice(0, 3)) { // Take top 3 results
            // Calculate distance (rough estimate)
            const distance = calculateDistance(location.lat, location.lng, 
              place.geometry.location.lat, place.geometry.location.lng)
            
            facilities.push({
              name: place.name,
              type: place.types.includes('hospital') ? 'Hospital' : 'Medical Clinic',
              address: place.vicinity || place.formatted_address || 'Address not available',
              distance: `${distance.toFixed(1)} km`,
              specialty: getSpecialtyFromCategories(categories),
              phoneNumber: place.formatted_phone_number || 'Call for information'
            })
          }
        }
      } catch (searchError) {
        console.error(`Error searching for ${type}:`, searchError)
      }
    }
    
    // If we got real results, return them
    if (facilities.length > 0) {
      return facilities.slice(0, 4) // Limit to 4 facilities
    }
    
    // Fallback to location-aware mock data
    return getLocationAwareMockData(location, categories, urgencyLevel)
    
  } catch (error) {
    console.error('Error fetching location-based facilities:', error)
    return getLocationAwareMockData(location, categories, urgencyLevel)
  }
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Helper function to get specialty based on detected categories
function getSpecialtyFromCategories(categories: string[]): string {
  if (categories.includes('cardiology')) return 'Cardiovascular Medicine'
  if (categories.includes('emergency')) return '24/7 Emergency Care'
  if (categories.includes('mental health')) return 'Mental Health & Counseling'
  if (categories.includes('dermatology')) return 'Dermatological Care'
  if (categories.includes('orthopedics')) return 'Orthopedic Medicine'
  return 'General Medicine'
}

// Fallback function with location-aware mock data
function getLocationAwareMockData(
  location: { lat: number; lng: number },
  categories: string[],
  urgencyLevel: string
): HealthFacility[] {
  const facilities: HealthFacility[] = []
  
  // Detect country/region based on coordinates to provide relevant mock data
  const isIndia = location.lat >= 8 && location.lat <= 37 && location.lng >= 68 && location.lng <= 97
  const isUSA = location.lat >= 25 && location.lat <= 49 && location.lng >= -125 && location.lng <= -66
  
  if (urgencyLevel === 'high' || categories.includes('emergency')) {
    facilities.push({
      name: isIndia ? "City Emergency Hospital" : "Emergency Medical Center",
      type: "Emergency Room",
      address: isIndia ? "Main Road, City Center" : "123 Emergency Ave",
      distance: "0.8 km",
      specialty: "24/7 Emergency Care",
      phoneNumber: isIndia ? "102" : "911"
    })
  }
  
  if (categories.includes('cardiology')) {
    facilities.push({
      name: isIndia ? "Heart Care Specialty Hospital" : "Cardiovascular Institute",
      type: "Cardiology Hospital",
      address: isIndia ? "Medical District, Near Railway Station" : "456 Cardiac St",
      distance: "1.2 km",
      specialty: "Cardiovascular Medicine",
      phoneNumber: isIndia ? "+91-xxx-xxx-xxxx" : "(555) 123-4567"
    })
  }
  
  // Add a general hospital
  facilities.push({
    name: isIndia ? "General District Hospital" : "Community Medical Center", 
    type: "General Hospital",
    address: isIndia ? "Hospital Road, Medical Complex" : "321 Health Blvd",
    distance: "1.5 km",
    specialty: "General Medicine",
    phoneNumber: isIndia ? "+91-xxx-xxx-xxxx" : "(555) 567-8901"
  })
  
  return facilities.slice(0, 3)
}