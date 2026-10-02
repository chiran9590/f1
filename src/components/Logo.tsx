import React from 'react';
import { Leaf } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm`}>
        <Leaf className="w-1/2 h-1/2 text-white" />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent`}>
          HealthMaps
        </span>
      )}
    </div>
  );
};

export default Logo;
