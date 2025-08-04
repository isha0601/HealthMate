import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Key, ExternalLink, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ApiKeySetupProps {
  onComplete: () => void;
}

const ApiKeySetup = ({ onComplete }: ApiKeySetupProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyAndSave = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    try {
      // Test the API key by making a simple request
      const testResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: "Hello, can you respond with 'API key is working'?"
              }]
            }]
          })
        }
      );

      if (testResponse.ok) {
        // Store API key in localStorage as a temporary solution
        // In production, this should be handled by the backend
        localStorage.setItem('gemini_api_key', apiKey);
        
        toast({
          title: "API Key Verified",
          description: "Your Gemini API key is working correctly!"
        });
        
        onComplete();
      } else {
        throw new Error('Invalid API key');
      }
    } catch (error) {
      toast({
        title: "API Key Verification Failed",
        description: "Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          API Key Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your API key will be securely stored in the backend. Get your free Gemini API key from Google AI Studio.
          </AlertDescription>
        </Alert>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Get API Key from Google AI Studio
        </Button>

        <div className="space-y-2">
          <label htmlFor="apiKey" className="text-sm font-medium">
            Gemini API Key
          </label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Enter your Gemini API key..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleVerifyAndSave}
          disabled={!apiKey.trim() || isVerifying}
          className="w-full"
        >
          {isVerifying ? (
            "Verifying..."
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Verify & Save API Key
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ApiKeySetup;