import React from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'heartbeat';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'spinner',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  if (variant === 'spinner') {
    return (
      <Loader2 
        className={cn(
          'animate-spinner text-primary',
          sizeClasses[size],
          className
        )} 
      />
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('loading-dots', className)}>
        <div />
        <div />
        <div />
      </div>
    );
  }

  if (variant === 'heartbeat') {
    return (
      <Heart 
        className={cn(
          'loading-heartbeat fill-current',
          sizeClasses[size],
          className
        )} 
      />
    );
  }

  return null;
};

export default LoadingSpinner;