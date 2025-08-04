import { Link, useLocation } from "react-router-dom";
import { Heart, Stethoscope, Brain, BarChart3, MapPin, Bot, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };
  
  const navItems = [
    { path: "/", label: "Home", icon: Heart },
    { path: "/symptom-checker", label: "Symptoms", icon: Stethoscope },
    { path: "/mood-tracker", label: "Mood", icon: Brain },
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/health-resources", label: "Resources", icon: MapPin },
    { path: "/chat", label: "AI Chat", icon: Bot },
  ];

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-wellness">
              <Heart className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-wellness bg-clip-text text-transparent">
              HealthMate
            </span>
          </Link>
          
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Link to={item.path}>
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <User className="h-4 w-4 mr-2" />
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm" className="ml-2">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;