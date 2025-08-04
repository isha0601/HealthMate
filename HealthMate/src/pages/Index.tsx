import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Brain, 
  Pill, 
  MapPin, 
  Shield, 
  Users, 
  TrendingUp,
  Stethoscope,
  Activity,
  ArrowRight,
  CheckCircle2,
  Star,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import AnimatedText from "@/components/AnimatedText";
import EmojiReaction from "@/components/EmojiReaction";
import AnimationShowcase from "@/components/AnimationShowcase";

const Index = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Symptom Checker",
      description: "Describe symptoms in plain language and get AI-powered insights and recommendations",
      link: "/symptom-checker",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Heart,
      title: "Mood & Stress Tracker",
      description: "Daily emotional wellness tracking with sentiment analysis and burnout detection",
      link: "/mood-tracker", 
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      icon: TrendingUp,
      title: "Health Dashboard",
      description: "Comprehensive overview of your wellness trends and health insights",
      link: "/dashboard",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      icon: MapPin,
      title: "Local Health Resources",
      description: "Find nearby clinics, pharmacies, and support services in your area",
      link: "/health-resources",
      color: "text-warning",
      bgColor: "bg-warning/10"
    }
  ];

  const benefits = [
    "AI-powered symptom analysis and health insights",
    "Daily mood and stress level tracking",
    "Medication reminders and adherence tracking",
    "Local healthcare resource finder",
    "Anonymous peer support community",
    "Health reports for sharing with doctors"
  ];

  const stats = [
    { number: "10K+", label: "Active Users", icon: Users },
    { number: "50K+", label: "Symptoms Analyzed", icon: Brain },
    { number: "95%", label: "User Satisfaction", icon: Star },
    { number: "24/7", label: "Support Available", icon: Shield }
  ];

  return (
    <PageTransition className="min-h-screen">
      <Navbar />
      {/* Hero Section */}
      <section className="relative bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <div className="text-center space-y-8">
            {/* Logo/Icon */}
            <div className="flex items-center justify-center space-x-4 animate-fade-in-scale">
              <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm glassmorphism animate-glow-pulse">
                <Stethoscope className="h-12 w-12 text-white animate-health-pulse" />
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-white">
                <AnimatedText text="HealthMate" variant="glow" delay={300} />
              </h1>
            </div>
            
            {/* Tagline */}
            <h2 className="text-2xl lg:text-4xl font-semibold text-white/90 max-w-4xl mx-auto">
              <AnimatedText 
                text="Your Virtual Health & Wellbeing Companion" 
                variant="wave" 
                delay={600}
              />
            </h2>
            
            {/* Description */}
            <div className="animate-fade-in-up" style={{ animationDelay: '900ms' }}>
              <p className="text-lg lg:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                AI-powered health insights, mood tracking, symptom checking, and local resource discovery - 
                all in one comprehensive wellness platform designed to keep you healthy and informed.
              </p>
            </div>

            {/* Emoji Reactions */}
            <div className="flex justify-center gap-4 animate-fade-in-scale" style={{ animationDelay: '1200ms' }}>
              <EmojiReaction emoji="🏥" size="lg" />
              <EmojiReaction emoji="💚" size="lg" />
              <EmojiReaction emoji="🤖" size="lg" />
              <EmojiReaction emoji="📊" size="lg" />
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link to="/dashboard">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-glow px-8 py-3 text-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/symptom-checker">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg backdrop-blur-sm">
                  Try Symptom Checker
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-8 pt-8 text-white/70">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm">AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span className="text-sm">Trusted by 10K+ Users</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center shadow-soft hover:shadow-wellness transition-shadow duration-300">
                  <CardContent className="pt-6 pb-4">
                    <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <div className="text-3xl font-bold text-primary mb-1">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Comprehensive Health Tools
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to monitor, understand, and improve your health and wellbeing in one intuitive platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={index} to={feature.link}>
                  <Card className="h-full shadow-soft hover:shadow-wellness transition-all duration-300 hover:scale-105 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${feature.bgColor} group-hover:animate-health-pulse`}>
                          <Icon className={`h-8 w-8 ${feature.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {feature.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                      <div className="flex items-center mt-4 text-primary group-hover:translate-x-2 transition-transform">
                        <span className="text-sm font-medium">Learn more</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                  Why Choose HealthMate
                </Badge>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  Your Health, 
                  <span className="bg-gradient-primary bg-clip-text text-transparent"> Simplified</span>
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  HealthMate combines AI-powered insights with human-centered design to make healthcare more accessible, 
                  understandable, and proactive for everyone.
                </p>
              </div>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-4 pt-4">
                <Link to="/dashboard">
                  <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                    Start Your Journey
                  </Button>
                </Link>
                <Link to="/health-resources">
                  <Button size="lg" variant="outline">
                    Find Resources
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <Card className="shadow-soft">
                  <CardContent className="p-6 text-center">
                    <Activity className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Real-time Monitoring</h4>
                    <p className="text-sm text-muted-foreground">Track your health metrics continuously</p>
                  </CardContent>
                </Card>
                <Card className="shadow-soft mt-8">
                  <CardContent className="p-6 text-center">
                    <Brain className="h-8 w-8 text-secondary mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">AI Insights</h4>
                    <p className="text-sm text-muted-foreground">Get personalized health recommendations</p>
                  </CardContent>
                </Card>
                <Card className="shadow-soft -mt-4">
                  <CardContent className="p-6 text-center">
                    <Shield className="h-8 w-8 text-accent mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Privacy First</h4>
                    <p className="text-sm text-muted-foreground">Your health data stays secure and private</p>
                  </CardContent>
                </Card>
                <Card className="shadow-soft mt-4">
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-warning mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Community Support</h4>
                    <p className="text-sm text-muted-foreground">Connect with others on similar journeys</p>
                  </CardContent>
                </Card>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="max-w-4xl mx-auto px-4 text-center animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-white/80 mb-8 leading-relaxed">
            Join thousands of users who are already using HealthMate to improve their wellbeing 
            and stay on top of their health.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-glow px-8 py-3 text-lg">
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/symptom-checker">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg backdrop-blur-sm">
                Try Symptom Checker
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">HealthMate</span>
              </div>
              <p className="text-muted-foreground">
                Your trusted virtual health companion for better wellbeing.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/symptom-checker" className="hover:text-primary transition-colors">Symptom Checker</Link></li>
                <li><Link to="/mood-tracker" className="hover:text-primary transition-colors">Mood Tracker</Link></li>
                <li><Link to="/dashboard" className="hover:text-primary transition-colors">Health Dashboard</Link></li>
                <li><Link to="/health-resources" className="hover:text-primary transition-colors">Find Resources</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Emergency</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Emergency: <strong>911</strong></li>
                <li>Crisis Line: <strong>988</strong></li>
                <li>Poison Control: <strong>(800) 222-1222</strong></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-muted mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 HealthMate. All rights reserved. This is not a substitute for professional medical advice.</p>
          </div>
        </div>
      </footer>
    </PageTransition>
  );
};

export default Index;
