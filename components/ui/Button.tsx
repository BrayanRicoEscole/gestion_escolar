
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  loading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "btn-transition inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-[#0a3570] shadow-lg shadow-blue-900/10",
    secondary: "bg-secondary text-white hover:bg-[#d9861a] shadow-lg shadow-orange-900/10",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-primary hover:text-primary",
    ghost: "text-slate-500 hover:bg-slate-100",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : Icon && <Icon size={size === 'sm' ? 16 : 20} />}
      {children}
    </button>
  );
};
