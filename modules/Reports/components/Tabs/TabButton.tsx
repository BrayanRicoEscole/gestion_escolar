
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  children: React.ReactNode;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon: Icon, children }) => (
  <button 
    onClick={onClick}
    className={`px-8 py-3 rounded-xl flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all ${
      active 
        ? 'bg-white text-primary shadow-sm scale-105' 
        : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    <Icon size={16} />
    {children}
  </button>
);
