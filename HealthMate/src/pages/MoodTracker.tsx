import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Smile, Frown, Meh, Heart, TrendingUp, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const moodOptions = [
  { value: 1, label: "Very Low", icon: Frown, color: "bg-destructive text-destructive-foreground", emoji: "😢" },
  { value: 2, label: "Low", icon: Frown, color: "bg-warning text-warning-foreground", emoji: "😔" },
  { value: 3, label: "Neutral", icon: Meh, color: "bg-muted text-muted-foreground", emoji: "😐" },
  { value: 4, label: "Good", icon: Smile, color: "bg-primary text-primary-foreground", emoji: "😊" },
  { value: 5, label: "Excellent", icon: Smile, color: "bg-success text-success-foreground", emoji: "😄" },
];

const stressOptions = [
  { value: 1, label: "Very Low", color: "bg-success" },
  { value: 2, label: "Low", color: "bg-primary" },
  { value: 3, label: "Moderate", color: "bg-warning" },
  { value: 4, label: "High", color: "bg-destructive" },
  { value: 5, label: "Very High", color: "bg-destructive" },
];

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedStress, setSelectedStress] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [recentEntries, setRecentEntries] = useState([
    { date: "2024-01-19", mood: 4, stress: 2, notes: "Good day at work, felt productive" },
    { date: "2024-01-18", mood: 3, stress: 3, notes: "Average day, some stress from deadlines" },
    { date: "2024-01-17", mood: 5, stress: 1, notes: "Amazing day! Went for a hike and felt great" },
  ]);

  const saveMoodEntry = () => {
    if (selectedMood === null || selectedStress === null) {
      toast({
        title: "Please select both mood and stress levels",
        description: "Both ratings are required to save your entry.",
        variant: "destructive",
      });
      return;
    }

    const newEntry = {
      date: new Date().toISOString().split('T')[0],
      mood: selectedMood,
      stress: selectedStress,
      notes: notes.trim(),
    };

    setRecentEntries([newEntry, ...recentEntries.slice(0, 6)]);
    
    // Reset form
    setSelectedMood(null);
    setSelectedStress(null);
    setNotes("");

    toast({
      title: "Mood entry saved!",
      description: "Your daily mood and stress levels have been recorded.",
    });
  };

  const getMoodOption = (value: number) => moodOptions.find(option => option.value === value);
  const getStressOption = (value: number) => stressOptions.find(option => option.value === value);

  const averageMood = recentEntries.length > 0 
    ? (recentEntries.reduce((sum, entry) => sum + entry.mood, 0) / recentEntries.length).toFixed(1)
    : "0";

  const averageStress = recentEntries.length > 0 
    ? (recentEntries.reduce((sum, entry) => sum + entry.stress, 0) / recentEntries.length).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <Navbar />
      <div className="p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 rounded-full bg-gradient-wellness">
              <Heart className="h-8 w-8 text-accent-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-wellness bg-clip-text text-transparent">
              Daily Mood Tracker
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Track your daily mood and stress levels to identify patterns and improve your mental wellbeing.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Mood (7 days)</p>
                  <p className="text-2xl font-bold text-primary">{averageMood}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Stress (7 days)</p>
                  <p className="text-2xl font-bold text-warning">{averageStress}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">Entries Logged</p>
                  <p className="text-2xl font-bold text-secondary">{recentEntries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Entry */}
        <Card className="shadow-wellness border-accent/20 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-accent" />
              <span>How are you feeling today?</span>
            </CardTitle>
            <CardDescription>
              Rate your mood and stress level, and add any notes about your day.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mood Selection */}
            <div>
              <h3 className="font-semibold mb-3">Mood Level</h3>
              <div className="grid grid-cols-5 gap-3">
                {moodOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSelectedMood(option.value)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                        selectedMood === option.value
                          ? "border-primary shadow-glow"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <div className="text-center space-y-2">
                        <div className="text-2xl">{option.emoji}</div>
                        <Icon className="h-4 w-4 mx-auto text-muted-foreground" />
                        <p className="text-xs font-medium">{option.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stress Selection */}
            <div>
              <h3 className="font-semibold mb-3">Stress Level</h3>
              <div className="grid grid-cols-5 gap-3">
                {stressOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStress(option.value)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      selectedStress === option.value
                        ? "border-primary shadow-glow"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <div className="text-center space-y-2">
                      <div className={`w-6 h-6 rounded-full mx-auto ${option.color}`} />
                      <p className="text-xs font-medium">{option.label}</p>
                      <p className="text-lg font-bold">{option.value}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="font-semibold mb-3">Notes (Optional)</h3>
              <Textarea
                placeholder="How was your day? What contributed to your mood and stress levels?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-20 border-accent/30 focus:border-accent/50"
              />
            </div>

            {/* Save Button */}
            <Button 
              onClick={saveMoodEntry}
              className="w-full bg-gradient-wellness hover:shadow-wellness transition-all duration-300"
              disabled={selectedMood === null || selectedStress === null}
            >
              Save Today's Entry
            </Button>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <Card className="shadow-soft animate-fade-in">
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>
              Your mood and stress patterns over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEntries.map((entry, index) => {
                const moodOption = getMoodOption(entry.mood);
                const stressOption = getStressOption(entry.stress);
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-muted-foreground w-20">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{moodOption?.emoji}</span>
                        <Badge className={moodOption?.color}>
                          Mood: {entry.mood}/5
                        </Badge>
                      </div>
                      <Badge className={stressOption?.color + " text-white"}>
                        Stress: {entry.stress}/5
                      </Badge>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground max-w-xs truncate">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;