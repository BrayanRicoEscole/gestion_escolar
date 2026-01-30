
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ children, className = '', padding = 'md' }) => {
  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6 lg:p-8",
    lg: "p-10 lg:p-12"
  };

  return (
    <div className={`bg-white rounded-5xl border border-slate-100 card-shadow ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
};
