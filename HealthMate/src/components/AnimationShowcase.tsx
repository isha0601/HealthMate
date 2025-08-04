import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, Sparkles, Zap, Activity } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import AnimatedText from './AnimatedText';
import EmojiReaction from './EmojiReaction';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const AnimationShowcase: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const demos = [
    {
      id: 'buttons',
      title: '2️⃣ Button Animations',
      description: 'Hover, glow, and bounce effects',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <Button variant="default" animation="bounce">Bounce Effect</Button>
          <Button variant="glow" animation="glow">Glow Pulse</Button>
          <Button variant="wellness" animation="pulse">Wellness Style</Button>
          <Button variant="animated">Animated Ripple</Button>
        </div>
      )
    },
    {
      id: 'loading',
      title: '1️⃣ Loading Animations',
      description: 'Different loading states',
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <LoadingSpinner variant="spinner" />
            <span>Spinner Loading</span>
          </div>
          <div className="flex items-center gap-4">
            <LoadingSpinner variant="dots" />
            <span>Pulse Dots</span>
          </div>
          <div className="flex items-center gap-4">
            <LoadingSpinner variant="heartbeat" />
            <span>Heartbeat Health</span>
          </div>
        </div>
      )
    },
    {
      id: 'text',
      title: '4️⃣ Text Animations',
      description: 'Dynamic text effects',
      content: (
        <div className="space-y-4">
          <AnimatedText text="Typing Effect Animation" variant="typing" />
          <AnimatedText text="Glowing Health Text" variant="glow" className="text-lg font-semibold" />
          <div className="text-lg">
            <AnimatedText text="Wave Animation Text" variant="wave" />
          </div>
        </div>
      )
    },
    {
      id: 'emojis',
      title: '6️⃣ Micro-interactions',
      description: 'Interactive emoji reactions',
      content: (
        <div className="flex flex-wrap gap-4 justify-center">
          <EmojiReaction 
            emoji="😊" 
            onClick={() => toast({ title: "Happy clicked!" })}
          />
          <EmojiReaction 
            emoji="❤️" 
            onClick={() => toast({ title: "Love clicked!" })}
            size="lg"
          />
          <EmojiReaction 
            emoji="🎉" 
            onClick={() => toast({ title: "Party clicked!" })}
          />
          <EmojiReaction 
            emoji="🚀" 
            onClick={() => toast({ title: "Rocket clicked!" })}
            size="sm"
          />
        </div>
      )
    },
    {
      id: 'cards',
      title: '🎨 Card Animations',
      description: 'Hover and scale effects',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500 animate-heartbeat" />
                Health Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Hover to see the animation effect!</p>
            </CardContent>
          </Card>
          <Card className="glassmorphism animate-fade-in-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-health-pulse" />
                Glassmorphism
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Beautiful glass effect with blur</p>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
          <AnimatedText text="✨ Animation Showcase" variant="glow" />
        </h2>
        <p className="text-muted-foreground">
          Experience all the beautiful animations in HealthMate
        </p>
      </div>

      <div className="grid gap-6">
        {demos.map((demo, index) => (
          <Card 
            key={demo.id} 
            className={cn(
              "transition-all duration-500 animate-fade-in-up card-hover",
              activeDemo === demo.id && "ring-2 ring-primary shadow-glow"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Badge variant="secondary" className="animate-glow-pulse">
                    {demo.title}
                  </Badge>
                </CardTitle>
                <Button
                  size="sm"
                  variant={activeDemo === demo.id ? "default" : "outline"}
                  onClick={() => setActiveDemo(activeDemo === demo.id ? null : demo.id)}
                  animation="bounce"
                >
                  {activeDemo === demo.id ? "Hide" : "Show"} Demo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{demo.description}</p>
            </CardHeader>
            {activeDemo === demo.id && (
              <CardContent className="animate-fade-in-scale">
                {demo.content}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Animation Status Bar */}
      <Card className="bg-gradient-primary text-primary-foreground animate-fade-in-scale">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 animate-health-pulse" />
              <span className="font-semibold">Animation System Status</span>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white">
              ✅ All Systems Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimationShowcase;