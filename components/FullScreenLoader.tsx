import React, { useState } from 'react';
import {Loader2, GraduationCap} from 'lucide-react'

export const FullScreenLoader: React.FC = () =>{
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 text-black">
        <div className="relative">
           <Loader2 className="w-16 h-16 text-primary animate-spin" />
           <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap size={24} className="text-primary" />
           </div>
        </div>
        <div className="text-center">
           <p className="text-slate-900 font-black uppercase tracking-widest text-xs">Gestión de seeds</p>
           <p className="text-slate-400 font-bold text-[10px] mt-2 animate-pulse">Autenticando...</p>
        </div>
      </div>
)}