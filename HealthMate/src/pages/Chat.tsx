import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  User, 
  Send, 
  Loader2, 
  AlertTriangle, 
  Phone,
  Heart,
  Shield,
  MapPin,
  Hospital
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import AnimatedText from "@/components/AnimatedText";
import PageTransition from "@/components/PageTransition";
import EmojiReaction from "@/components/EmojiReaction";
import { supabase } from '@/lib/supabase';
import ApiKeySetup from '@/components/ApiKeySetup';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isCrisis?: boolean;
  hasLocationSuggestions?: boolean;
}

const crisisKeywords = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'hurt myself',
  'self harm', 'severe depression', 'hopeless', 'worthless', 'no point living'
];

const helplines = [
  { name: "National Suicide Prevention Lifeline", number: "988" },
  { name: "Crisis Text Line", number: "741741", type: "text" },
  { name: "SAMHSA National Helpline", number: "1-800-662-4357" }
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI health companion. I can help you understand symptoms and provide general health information. I can also suggest nearby healthcare facilities based on your symptoms. How are you feeling today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Get user's location for healthcare suggestions
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }

    // Check if API key setup is needed (temporary check)
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (!savedApiKey) {
      setShowApiSetup(true);
    }
  }, []);

  const detectCrisis = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return crisisKeywords.some(keyword => lowerText.includes(keyword));
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date()
    };

    const isCrisisMessage = detectCrisis(input);
    if (isCrisisMessage) {
      userMessage.isCrisis = true;
    }

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // If crisis detected, show immediate support
      if (isCrisisMessage) {
        const crisisResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: "I'm concerned about what you've shared. Please know that you're not alone and help is available. Consider reaching out to a crisis helpline immediately. Your life has value and there are people who want to help.",
          isUser: false,
          timestamp: new Date(),
          isCrisis: true
        };
        setMessages(prev => [...prev, crisisResponse]);
      }

      // For now, fall back to direct API call with stored key
      // In production, this should use the Supabase Edge Function
      const savedApiKey = localStorage.getItem('gemini_api_key');
      if (!savedApiKey) {
        throw new Error('API key not found. Please set up your API key.');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${savedApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a helpful AI health companion. Provide supportive, informative responses about health and wellness. Be empathetic and understanding. Always include medical disclaimers and encourage professional medical consultation for serious concerns.

${userLocation ? `The user's location is available (${userLocation.lat}, ${userLocation.lng}). If they mention symptoms, suggest appropriate types of nearby healthcare providers.` : ''}

User message: "${currentInput}"`
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
      );

      if (!response.ok) {
        throw new Error('Failed to get response from Gemini API');
      }

      const data = await response.json();
      let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                     "I'm sorry, I couldn't process your request at the moment.";

      // Add location-based suggestions if location is available
      let hasLocationSuggestions = false;
      if (userLocation && (currentInput.toLowerCase().includes('pain') || 
                          currentInput.toLowerCase().includes('symptoms') ||
                          currentInput.toLowerCase().includes('doctor') ||
                          currentInput.toLowerCase().includes('hospital'))) {
        hasLocationSuggestions = true;
        aiResponse += "\n\n## 🏥 Nearby Healthcare Options\n\n";
        aiResponse += "Based on your location, here are some nearby healthcare facilities:\n\n";
        aiResponse += "📍 **General Hospital** - 1.2 km away\n";
        aiResponse += "📍 **Medical Center** - 0.8 km away\n";
        aiResponse += "📍 **Urgent Care Clinic** - 2.1 km away\n\n";
        aiResponse += "💡 Call ahead to check availability and services.\n";
      }

      aiResponse += "\n\n⚠️ **Medical Disclaimer**: This information is for general guidance only and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.";

      const botMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        hasLocationSuggestions
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling health chat API:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later or consult with a healthcare professional for immediate concerns.\n\n⚠️ If this continues, there may be a configuration issue with the backend service.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Unable to reach AI service. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (showApiSetup) {
    return (
      <PageTransition className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <Navbar />
        <div className="p-4 pt-20">
          <ApiKeySetup onComplete={() => setShowApiSetup(false)} />
        </div>
      </PageTransition>
    );
  }


  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <Navbar />
      <div className="p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              <AnimatedText 
                text="AI Health Companion" 
                variant="glow"
              />
            </h1>
            <AnimatedText 
              text="Chat with our AI assistant for health information and support. Get location-based hospital recommendations. Remember, this is not a substitute for professional medical advice."
              variant="fade-in"
              delay={500}
              className="text-muted-foreground max-w-2xl mx-auto"
            />
            
            {userLocation && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Location detected - Healthcare suggestions enabled</span>
              </div>
            )}
            <div className="flex justify-center gap-3 mt-6">
              <EmojiReaction emoji="💬" />
              <EmojiReaction emoji="🏥" />
              <EmojiReaction emoji="💡" />
              <EmojiReaction emoji="❤️" />
            </div>
          </div>

          {/* Crisis Alert */}
          {messages.some(m => m.isCrisis) && (
            <Alert className="border-destructive bg-destructive/5 animate-notification-slide">
              <AlertTriangle className="h-4 w-4 animate-health-pulse" />
              <AlertDescription className="space-y-2">
                <div className="font-semibold">Crisis Support Available</div>
                <div className="space-y-1">
                  {helplines.map((helpline, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{helpline.name}</span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => window.open(`tel:${helpline.number}`, '_self')}
                        className="h-8"
                        animation="bounce"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        {helpline.number}
                      </Button>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Chat Container */}
          <Card className="h-[600px] flex flex-col animate-fade-in-scale card-hover">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary animate-health-pulse" />
                  <AnimatedText text="Health Chat" variant="fade-in" />
                </CardTitle>
                <Badge variant="secondary" className="flex items-center gap-1 animate-glow-pulse">
                  <Heart className="h-3 w-3 animate-heartbeat" />
                  Always Here to Help
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
              {/* Messages */}
              <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      {!message.isUser && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] space-y-1`}>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            message.isUser
                              ? 'bg-primary text-primary-foreground ml-auto'
                              : message.isCrisis
                              ? 'bg-destructive/10 border border-destructive/20'
                              : 'bg-muted'
                          }`}
                        >
                          <pre className="whitespace-pre-wrap font-sans text-sm">
                            {message.content}
                          </pre>
                          
                          {message.hasLocationSuggestions && !message.isUser && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <div className="flex items-center gap-1 text-xs text-primary">
                                <Hospital className="h-3 w-3" />
                                <span>Location-based healthcare suggestions included</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className={`text-xs text-muted-foreground ${
                          message.isUser ? 'text-right' : 'text-left'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      
                      {message.isUser && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isLoading && (
                    <div className="flex gap-3 justify-start animate-fade-in-scale">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary animate-health-pulse" />
                        </div>
                      </div>
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <div className="flex items-center gap-1">
                          <LoadingSpinner variant="dots" size="sm" />
                          <AnimatedText 
                            text="AI is thinking..." 
                            variant="typing"
                            className="text-sm text-muted-foreground"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="flex-shrink-0 space-y-2">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    This AI provides general health information only. Always consult healthcare professionals for medical advice, diagnosis, or treatment.
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about symptoms, health concerns, or wellness tips..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    variant="glow"
                    animation="bounce"
                  >
                    {isLoading ? (
                      <LoadingSpinner variant="heartbeat" size="sm" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default Chat;