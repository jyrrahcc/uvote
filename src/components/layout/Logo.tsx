
import React from 'react';
import { Vote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  linkTo?: string;
}

const Logo = ({ size = 'medium', className, linkTo = '/dashboard' }: LogoProps) => {
  const sizeClass = 
    size === 'small' ? 'h-6 w-6' :
    size === 'large' ? 'h-10 w-10' : 
    'h-8 w-8';

  const textClass =
    size === 'small' ? 'text-lg' :
    size === 'large' ? 'text-2xl' : 
    'text-xl';

  const content = (
    <>
      <Vote className={cn(sizeClass, "text-primary")} />
      <span className={cn("font-bold ml-2", textClass, {
        "hidden": size === 'small' && window.innerWidth < 350, // Hide text on very small screens
      })}>
        uVote
      </span>
    </>
  );

  return linkTo ? (
    <Link to={linkTo} className={cn("flex items-center", className)}>
      {content}
    </Link>
  ) : (
    <div className={cn("flex items-center", className)}>
      {content}
    </div>
  );
};

export default Logo;
