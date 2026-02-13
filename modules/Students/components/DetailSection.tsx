
// Add missing React import to resolve React.ReactNode namespace errors
import React from 'react';

// Fix: Make children optional in the props type to ensure it is correctly recognized when passed as nested elements in JSX
export const DetailSection = ({ icon, title, color, children }: { icon: React.ReactNode, title: string, color: string, children?: React.ReactNode }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
       <div className={`${color} opacity-80`}>{icon}</div>
       <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest">{title}</h4>
    </div>
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {children}
    </div>
  </div>
);

export const DetailItem = ({ label, value }: { label: string, value?: string }) => (
  <div className="flex flex-col">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <p className="text-xs font-bold text-slate-700 truncate">{value || '—'}</p>
  </div>
);
