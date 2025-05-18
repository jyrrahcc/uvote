
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showText?: boolean;
}

const Logo = ({ size = 'medium', className, showText = true }: LogoProps) => {
  const sizeClass = 
    size === 'small' ? 'h-6' :
    size === 'large' ? 'h-10' : 
    'h-8';

  const textClass =
    size === 'small' ? 'text-lg' :
    size === 'large' ? 'text-2xl' : 
    'text-xl';

  return (
    <div className={cn("flex items-center", className)}>
      <img 
        src="/lovable-uploads/a2e96022-2a31-42ae-b0d8-8c7551ada70e.png" 
        alt="uVote Logo" 
        className={cn(sizeClass, "mr-2")}
      />
      {showText && (
        <span className={cn("font-bold", textClass)}>
          uVote
        </span>
      )}
    </div>
  );
};

export default Logo;
