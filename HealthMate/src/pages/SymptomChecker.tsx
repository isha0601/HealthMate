import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Brain, Heart, Loader2, MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or failed:', error);
        }
      );
    }
  }, []);

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Please describe your symptoms",
        description: "Enter some details about what you're experiencing.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('symptom-analyzer', {
        body: { 
          symptoms,
          userLocation,
          saveToHistory: true
        }
      });

      if (error) {
        throw error;
      }

      setResults(data);
      
      toast({
        title: "Analysis complete",
        description: "Review the AI-powered insights below. Remember, this is not medical advice.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Please try again later or consult with a healthcare professional.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild": return "bg-success text-success-foreground";
      case "moderate": return "bg-warning text-warning-foreground";
      case "severe": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const openInGoogleMaps = (address: string, facilityName: string) => {
    const query = encodeURIComponent(`${facilityName}, ${address}`);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10">
      <Navbar />
      <div className="p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 rounded-full bg-gradient-primary">
              <Brain className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Symptom Checker
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Describe your symptoms in plain language and get AI-powered insights and recommendations. 
            <strong className="text-foreground"> This is not a substitute for professional medical advice.</strong>
          </p>
        </div>

        {/* Symptom Input */}
        <Card className="shadow-soft border-primary/20 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-primary" />
              <span>Tell us about your symptoms</span>
            </CardTitle>
            <CardDescription>
              Be as detailed as possible about what you're experiencing, when it started, and any other relevant information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example: I've been having a headache for 2 days, along with a runny nose and feeling tired. It started after being around someone who was sick..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="min-h-32 resize-none border-primary/30 focus:border-primary/50"
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {symptoms.length}/500 characters
              </p>
              <Button 
                onClick={analyzeSymptoms}
                disabled={isAnalyzing || !symptoms.trim()}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Symptoms"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-6 animate-fade-in">
            {/* Severity Badge */}
            <div className="flex justify-center">
              <Badge className={`px-4 py-2 text-sm font-medium ${getSeverityColor(results.severity)}`}>
                Severity: {results.severity.toUpperCase()}
              </Badge>
            </div>

            {/* AI Health Insights */}
            {results.healthInsights && (
              <Card className="shadow-soft border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-primary">
                    <Brain className="h-5 w-5" />
                    <span>AI Health Insights</span>
                  </CardTitle>
                  <CardDescription>
                    AI-powered analysis of your symptoms and potential health conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">{results.healthInsights}</p>
                </CardContent>
              </Card>
            )}

            {/* Possible Causes */}
            {results.possibleCauses && (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-primary">Possible Causes</CardTitle>
                  <CardDescription>
                    Based on your symptoms, here are some potential causes:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.possibleCauses.map((cause: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommended Actions */}
            {results.recommendedActions && (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-secondary">Recommended Actions</CardTitle>
                  <CardDescription>
                    Steps you can take to address your symptoms:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.recommendedActions.map((action: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Home Remedies */}
            {results.homeRemedies && (
              <Card className="shadow-soft border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-600">
                    <Heart className="h-5 w-5" />
                    <span>Home Remedies & Tips</span>
                  </CardTitle>
                  <CardDescription>
                    Natural and home-based solutions that may help relieve your symptoms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.homeRemedies.map((remedy: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                        <span>{remedy}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Nearby Healthcare Facilities */}
            {results.nearbyFacilities && results.nearbyFacilities.length > 0 && (
              <Card className="shadow-soft border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-600">
                    <MapPin className="h-5 w-5" />
                    <span>Nearby Healthcare Facilities</span>
                  </CardTitle>
                  <CardDescription>
                    Healthcare options near your location based on your symptoms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.nearbyFacilities.map((facility: any, index: number) => (
                      <div key={index} className="p-4 rounded-lg border border-blue-100 bg-blue-50/50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-blue-900">{facility.name}</h4>
                          <Badge variant="outline" className="text-blue-600 border-blue-300">
                            {facility.type}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-blue-700">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <button
                              onClick={() => openInGoogleMaps(facility.address, facility.name)}
                              className="text-blue-600 hover:text-blue-800 underline decoration-dotted hover:decoration-solid transition-all duration-200 flex items-center space-x-1"
                            >
                              <span>{facility.address}</span>
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{facility.distance} away</span>
                          </div>
                          {facility.phoneNumber && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{facility.phoneNumber}</span>
                            </div>
                          )}
                          {facility.specialty && (
                            <div className="mt-2">
                              <span className="font-medium">Specializes in:</span> {facility.specialty}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="text-sm text-blue-600 italic">
                      💡 Tip: Call ahead to check availability and confirm they can address your specific needs.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seek Care Alert */}
            <Card className="border-warning/50 shadow-wellness">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-warning mb-1">When to seek medical care:</h4>
                    <p className="text-sm text-muted-foreground">{results.seekCare}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Disclaimer */}
        <Card className="bg-muted/50 border-muted">
          <CardContent className="pt-6">
            <p className="text-xs text-center text-muted-foreground">
              <strong>Medical Disclaimer:</strong> This tool provides general information and is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
            </p>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;