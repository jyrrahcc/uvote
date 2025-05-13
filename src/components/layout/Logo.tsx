
import React from 'react';
import { Vote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Logo = ({ size = 'medium', className }: LogoProps) => {
  const sizeClass = 
    size === 'small' ? 'h-6 w-6' :
    size === 'large' ? 'h-10 w-10' : 
    'h-8 w-8';

  const textClass =
    size === 'small' ? 'text-lg' :
    size === 'large' ? 'text-2xl' : 
    'text-xl';

  return (
    <div className={cn("flex items-center", className)}>
      <Vote className={cn(sizeClass, "text-[#008f50]")} />
      {size !== 'small' && (
        <span className={cn("font-bold ml-2", textClass)}>
          uVote
        </span>
      )}
    </div>
  );
};

export default Logo;
