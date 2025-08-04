import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Brain, 
  Pill, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  Activity,
  Target,
  Smile
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Dashboard = () => {
  // Mock data - replace with real data from your state management
  const healthMetrics = {
    moodAverage: 3.8,
    stressAverage: 2.3,
    symptomsChecked: 5,
    medicationCompliance: 85,
    wellnessScore: 82,
  };

  const recentActivity = [
    { type: "mood", action: "Logged mood: Good (4/5)", time: "2 hours ago", icon: Smile },
    { type: "symptom", action: "Checked symptoms: Headache", time: "1 day ago", icon: Brain },
    { type: "medication", action: "Took morning medications", time: "1 day ago", icon: Pill },
    { type: "resources", action: "Found nearby clinic", time: "2 days ago", icon: MapPin },
  ];

  const alerts = [
    {
      type: "warning",
      title: "Stress levels trending up",
      description: "Your stress has increased over the past 3 days",
      action: "View mood tracker"
    },
    {
      type: "info", 
      title: "Medication reminder",
      description: "Don't forget your evening medication",
      action: "Set reminder"
    }
  ];

  const getActivityIcon = (type: string) => {
    const iconMap: { [key: string]: any } = {
      mood: Smile,
      symptom: Brain,
      medication: Pill,
      resources: MapPin,
    };
    return iconMap[type] || Activity;
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-success";
    if (value >= 60) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <Navbar />
      <div className="p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 rounded-full bg-gradient-primary">
              <Activity className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Health Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your personalized health overview and wellness insights at a glance.
          </p>
        </div>

        {/* Wellness Score */}
        <Card className="shadow-glow border-primary/20 animate-fade-in">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Target className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Overall Wellness Score</h2>
              </div>
              <div className="relative">
                <div className="text-6xl font-bold text-primary animate-health-pulse">
                  {healthMetrics.wellnessScore}
                </div>
                <div className="text-muted-foreground">out of 100</div>
              </div>
              <div className="max-w-md mx-auto">
                <Progress 
                  value={healthMetrics.wellnessScore} 
                  className="h-3"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Based on your mood, symptoms, and activity tracking
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Mood</p>
                  <p className="text-2xl font-bold text-secondary">
                    {healthMetrics.moodAverage}/5
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Stress</p>
                  <p className="text-2xl font-bold text-warning">
                    {healthMetrics.stressAverage}/5
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Pill className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Med Compliance</p>
                  <p className="text-2xl font-bold text-primary">
                    {healthMetrics.medicationCompliance}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Symptoms Checked</p>
                  <p className="text-2xl font-bold text-accent">
                    {healthMetrics.symptomsChecked}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Recommendations */}
        {alerts.length > 0 && (
          <Card className="shadow-wellness border-warning/30 animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span>Health Alerts & Recommendations</span>
              </CardTitle>
              <CardDescription>
                Important insights based on your recent activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-start justify-between p-4 rounded-lg bg-muted/50">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      {alert.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Recent Activity */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Your latest health tracking activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Jump to your most-used features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/symptom-checker">
                  <Button variant="outline" className="w-full h-20 flex-col space-y-2 hover:bg-primary/5">
                    <Brain className="h-6 w-6" />
                    <span className="text-xs">Check Symptoms</span>
                  </Button>
                </Link>
                <Link to="/mood-tracker">
                  <Button variant="outline" className="w-full h-20 flex-col space-y-2 hover:bg-secondary/5">
                    <Heart className="h-6 w-6" />
                    <span className="text-xs">Log Mood</span>
                  </Button>
                </Link>
                <Link to="/health-resources">
                  <Button variant="outline" className="w-full h-20 flex-col space-y-2 hover:bg-accent/5">
                    <MapPin className="h-6 w-6" />
                    <span className="text-xs">Find Resources</span>
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full h-20 flex-col space-y-2 hover:bg-warning/5"
                  onClick={() => {
                    // Simple reminder functionality
                    const time = prompt("Set reminder time (e.g., 09:00):");
                    if (time) {
                      alert(`Medication reminder set for ${time}`);
                    }
                  }}
                >
                  <Pill className="h-6 w-6" />
                  <span className="text-xs">Set Reminder</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Tracking */}
        <Card className="shadow-soft animate-fade-in">
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>
              Track your wellness journey over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Mood Stability</span>
                  <span className="text-sm text-muted-foreground">Good</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Stress Management</span>
                  <span className="text-sm text-muted-foreground">Improving</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Health Awareness</span>
                  <span className="text-sm text-muted-foreground">Excellent</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;