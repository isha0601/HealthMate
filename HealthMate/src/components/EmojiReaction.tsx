import React from 'react';
import { cn } from '@/lib/utils';

interface EmojiReactionProps {
  emoji: string;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const EmojiReaction: React.FC<EmojiReactionProps> = ({ 
  emoji, 
  onClick, 
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'emoji-interactive select-none transform transition-all duration-200',
        'hover:scale-125 active:scale-110',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
        'rounded-full p-2',
        sizeClasses[size],
        className
      )}
      aria-label={`React with ${emoji}`}
    >
      {emoji}
    </button>
  );
};

export default EmojiReaction;