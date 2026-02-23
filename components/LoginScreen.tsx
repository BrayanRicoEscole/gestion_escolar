import React from 'react';
import { GraduationCap } from 'lucide-react'

interface LoginScreenProps {
  signIn: ()=> void
}

export const LoginScreen: React.FC<LoginScreenProps> = ({signIn}) => {
  return(
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-black">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-slate-100">
          <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
            <GraduationCap className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Gestión de seeds</h1>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Inicia sesión para acceder al ecosistema de gestión escolar.
          </p>
          <button onClick={signIn} className="w-full flex items-center justify-center gap-4 py-5 bg-white border-2 border-slate-100 rounded-3xl font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm mb-4">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" /> Entrar con Google
          </button>
          
          <button 
            onClick={() => {
              const mockUser = { id: '00000', email: 'admin@renfort.edu.co' };
              const mockProfile = { id: '00000', email: 'admin@renfort.edu.co', full_name: 'Dev Admin', role: 'support', last_login: '' };
              sessionStorage.setItem('auth_bypass', JSON.stringify({ session: { user: mockUser }, profile: mockProfile }));
              window.location.reload();
            }} 
            className="w-full py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl font-black text-slate-400 hover:text-primary transition-all text-xs"
          >
            Acceso Desarrollador (Bypass)
          </button>
        </div>
      </div>
  )
}