import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  message: string;
  userLocation?: { lat: number; lng: number };
}

interface HealthResource {
  name: string;
  type: string;
  address: string;
  distance: string;
  specialty?: string;
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

    const { message, userLocation }: ChatRequest = await req.json()

    if (!message) {
      throw new Error('Message is required')
    }

    // Detect health conditions and symptoms for location-based suggestions
    const healthConditions = detectHealthConditions(message)
    
    // Call Gemini API
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
              text: `You are a helpful AI health companion. Provide supportive, informative responses about health and wellness. Be empathetic and understanding. Always include medical disclaimers and encourage professional medical consultation for serious concerns. 

User message: "${message}"

Guidelines:
- Be compassionate and understanding
- Provide general health information only
- Always recommend consulting healthcare professionals
- Include relevant medical disclaimers
- If symptoms are mentioned, suggest appropriate types of healthcare providers`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    )

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    let aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 
                    "I'm sorry, I couldn't process your request at the moment."

    // Add location-based hospital suggestions if location is provided and health conditions detected
    if (userLocation && healthConditions.length > 0) {
      const hospitalSuggestions = await getLocationBasedSuggestions(userLocation, healthConditions)
      if (hospitalSuggestions.length > 0) {
        aiResponse += "\n\n## 🏥 Nearby Healthcare Facilities\n\n"
        aiResponse += "Based on your location and symptoms, here are some nearby healthcare options:\n\n"
        
        hospitalSuggestions.forEach((facility, index) => {
          aiResponse += `**${index + 1}. ${facility.name}**\n`
          aiResponse += `   📍 ${facility.address}\n`
          aiResponse += `   🚗 ${facility.distance}\n`
          if (facility.specialty) {
            aiResponse += `   🏥 Specializes in: ${facility.specialty}\n`
          }
          aiResponse += "\n"
        })
        
        aiResponse += "💡 **Recommendation**: Call ahead to check availability and whether they can address your specific needs.\n"
      }
    }

    // Add medical disclaimer
    aiResponse += "\n\n⚠️ **Medical Disclaimer**: This information is for general guidance only and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment."

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        healthConditions,
        hasLocationSuggestions: userLocation && healthConditions.length > 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error in health-chat function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process your request. Please try again later or consult with a healthcare professional for immediate concerns.',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

function detectHealthConditions(message: string): string[] {
  const conditions: string[] = []
  const lowerMessage = message.toLowerCase()
  
  // Symptoms and conditions mapping
  const conditionKeywords = {
    'cardiology': ['chest pain', 'heart pain', 'palpitations', 'shortness of breath', 'heart attack', 'cardiac'],
    'emergency': ['severe pain', 'emergency', 'urgent', 'accident', 'trauma', 'unconscious', 'bleeding heavily'],
    'orthopedics': ['bone pain', 'fracture', 'joint pain', 'back pain', 'arthritis', 'sprain'],
    'neurology': ['headache', 'migraine', 'seizure', 'numbness', 'dizziness', 'neurological'],
    'gastroenterology': ['stomach pain', 'nausea', 'vomiting', 'diarrhea', 'digestive', 'abdominal'],
    'dermatology': ['skin rash', 'acne', 'eczema', 'skin condition', 'dermatological'],
    'pulmonology': ['breathing problems', 'asthma', 'cough', 'lung', 'respiratory'],
    'mental health': ['depression', 'anxiety', 'stress', 'mental health', 'psychological', 'therapy'],
    'pediatrics': ['child', 'baby', 'infant', 'pediatric', 'kids'],
    'gynecology': ['pregnancy', 'menstrual', 'reproductive', 'gynecological']
  }
  
  for (const [condition, keywords] of Object.entries(conditionKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      conditions.push(condition)
    }
  }
  
  return conditions
}

async function getLocationBasedSuggestions(
  location: { lat: number; lng: number }, 
  healthConditions: string[]
): Promise<HealthResource[]> {
  // This would integrate with your existing Google Places service
  // For now, return sample data based on conditions
  const suggestions: HealthResource[] = []
  
  if (healthConditions.includes('emergency')) {
    suggestions.push({
      name: "City Emergency Hospital",
      type: "Emergency Room",
      address: "123 Emergency Ave",
      distance: "0.8 km",
      specialty: "24/7 Emergency Care"
    })
  }
  
  if (healthConditions.includes('cardiology')) {
    suggestions.push({
      name: "Heart Care Medical Center",
      type: "Cardiology Clinic",
      address: "456 Cardiac St",
      distance: "1.2 km",
      specialty: "Cardiovascular Medicine"
    })
  }
  
  if (healthConditions.includes('mental health')) {
    suggestions.push({
      name: "Wellness Mental Health Center",
      type: "Mental Health Clinic",
      address: "789 Therapy Lane",
      distance: "1.5 km",
      specialty: "Counseling & Therapy"
    })
  }
  
  // Add general hospitals if no specific condition
  if (suggestions.length === 0) {
    suggestions.push({
      name: "General Medical Hospital",
      type: "General Hospital",
      address: "321 Health Blvd",
      distance: "1.0 km",
      specialty: "General Medicine"
    })
  }
  
  return suggestions.slice(0, 3) // Limit to 3 suggestions
}