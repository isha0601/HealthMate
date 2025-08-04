import React from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  variant?: 'fade' | 'slide-right' | 'slide-left' | 'scale';
  delay?: number;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  variant = 'fade',
  delay = 0,
  className 
}) => {
  const getAnimationClass = () => {
    switch (variant) {
      case 'slide-right':
        return 'animate-slide-in-right';
      case 'slide-left':
        return 'animate-slide-in-left';
      case 'scale':
        return 'animate-scale-in';
      default:
        return 'animate-fade-in-scale';
    }
  };

  return (
    <div 
      className={cn(
        'page-transition',
        getAnimationClass(),
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default PageTransition;