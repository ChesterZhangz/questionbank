import React, { forwardRef } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  className = '',
  padding = 'md',
  onClick,
  style,
}, ref) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div 
      ref={ref}
      className={`card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/20 ${paddingClasses[padding]} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card; 