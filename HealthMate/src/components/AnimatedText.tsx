import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTextProps {
  text: string;
  variant?: 'typing' | 'wave' | 'glow' | 'fade-in';
  className?: string;
  delay?: number;
  speed?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ 
  text, 
  variant = 'fade-in',
  className,
  delay = 0,
  speed = 100
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (variant === 'typing') {
      const timer = setTimeout(() => {
        if (currentIndex < text.length) {
          setDisplayText(prev => prev + text[currentIndex]);
          setCurrentIndex(currentIndex + 1);
        }
      }, delay + speed);

      return () => clearTimeout(timer);
    } else {
      setDisplayText(text);
    }
  }, [text, variant, currentIndex, delay, speed]);

  if (variant === 'typing') {
    return (
      <span className={cn('text-typing', className)}>
        {displayText}
      </span>
    );
  }

  if (variant === 'wave') {
    return (
      <span className={className}>
        {text.split('').map((char, index) => (
          <span 
            key={index}
            className={cn('text-wave', `delay-[${index * 100}ms]`)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    );
  }

  if (variant === 'glow') {
    return (
      <span className={cn('text-glow', className)}>
        {text}
      </span>
    );
  }

  return (
    <span 
      className={cn('animate-fade-in-up', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {text}
    </span>
  );
};

export default AnimatedText;