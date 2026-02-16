import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Users, Settings, LayoutDashboard,
  Menu, X, ChevronRight, AlertCircle, UserCircle, ShieldCheck, MessageSquareText, FileText,
  LogOut, Loader2, FlaskConical, ClipboardList, UserX, UserCog, ShieldAlert, Terminal
} from 'lucide-react';
import { supabase } from './services/api/client';
import { signInWithGoogle, signOut, syncUserProfile } from './services/api';
import { UserProfile, UserRole } from './types';

// Módulos
import GradingModule from './modules/Grading/GradingModule';
import TeacherGradingView from './modules/Grading/components/TeacherGradingView/TeacherGradingView';
import TeacherCommentsView from './modules/Comments/TeacherCommentsView';
import { ActiveStudentsModule } from './modules/Students/ActiveStudentsModule';
import { RetiredStudentsModule } from './modules/Students/RetiredStudentsModule';
import { ReportsModule } from './modules/Reports/ReportsModule';
import { DashboardModule } from './modules/Dashboard/DashboardModule';
import { UserManagementModule } from './modules/Users/UserManagementModule';

type Module = 'dashboard' | 'admissions' | 'active_students' | 'retired_students' | 'reports' | 'grading' | 'comments' | 'users';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<Module>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    console.log("[DEBUG:App] 🚀 Inicializando aplicación...");

    const savedBypass = sessionStorage.getItem('auth_bypass');
    if (savedBypass) {
      const bypassData = JSON.parse(savedBypass);
      setSession(bypassData.session);
      setProfile(bypassData.profile);
      console.log("[DEBUG:App] ⚡ Modo BYPASS activo:", bypassData.profile.role);
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("[DEBUG:App] 🔑 Sesión de Supabase:", session ? "Presente" : "Nula");
      setSession(session);
      if (session?.user) {
        const up = await syncUserProfile(session.user);
        console.log("[DEBUG:App] 👤 Perfil obtenido:", up?.role);
        setProfile(up);
        
        if (up?.role === 'grower') {
          console.log("[DEBUG:App] -> Redirigiendo a Calificaciones (Rol Grower)");
          setActiveModule('grading');
        }
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log(`[DEBUG:App] 🔄 Evento Auth: ${_event}`);
      if (sessionStorage.getItem('auth_bypass')) return;

      setSession(session);
      if (session?.user) {
        const up = await syncUserProfile(session.user);
        setProfile(up);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      console.log("[DEBUG:App] 🚪 Cerrando sesión...");
      sessionStorage.removeItem('auth_bypass');
      await signOut();
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-black">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Sincronizando Entorno...</p>
      </div>
    );
  }

  if (!session || !profile) {
    console.log("[DEBUG:App] 🛑 No hay sesión/perfil. Renderizando Login.");
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-black">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-slate-100">
          <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
            <GraduationCap className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">EduGrade Pro</h1>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Inicia sesión para acceder al sistema.
          </p>
          <button onClick={signInWithGoogle} className="w-full flex items-center justify-center gap-4 py-5 bg-white border-2 border-slate-100 rounded-3xl font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm mb-4">
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
    );
  }

  const isSupport = profile.role === 'support';
  console.log(`[DEBUG:App] 🏠 Renderizando Main UI. Módulo: ${activeModule}, Rol: ${profile.role}`);

  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, visible: isSupport },
    { id: 'active_students', name: 'Estudiantes', icon: Users, visible: isSupport },
    { id: 'grading', name: 'Calificaciones', icon: Settings, visible: true },
    { id: 'comments', name: 'Comentarios', icon: MessageSquareText, visible: true },
    { id: 'reports', name: 'Reportes', icon: FileText, visible: isSupport },
    { id: 'users', name: 'Usuarios', icon: UserCog, visible: isSupport },
  ].filter(m => m.visible);

  const renderContent = () => {
    console.log(`[DEBUG:App] 🧩 Montando componente de módulo: ${activeModule}`);
    switch (activeModule) {
      case 'dashboard': return <DashboardModule />;
      case 'active_students': return <ActiveStudentsModule />;
      case 'grading': return isSupport ? <GradingModule /> : <TeacherGradingView userRole={profile.role} />;
      case 'comments': return <TeacherCommentsView />;
      case 'reports': return <ReportsModule />;
      case 'users': return <UserManagementModule />;
      default: return <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Módulo no disponible</div>;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden text-black">
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20`}>
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'hidden'}`}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg"><GraduationCap className="text-white w-6 h-6" /></div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">EduGrade</h1>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">{sidebarOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id as Module)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeModule === mod.id ? 'bg-primary/5 text-primary shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
            >
              <mod.icon className={`w-5 h-5 ${activeModule === mod.id ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {sidebarOpen && <span className="font-medium text-sm">{mod.name}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
           <div className={`flex items-center gap-3 px-4 py-3 ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><UserCircle size={18} className="text-slate-400" /></div>
              {sidebarOpen && <div className="flex-1 truncate"><p className="text-[10px] font-black uppercase text-slate-400">{profile.role}</p></div>}
           </div>
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all group`}>
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium text-sm">Salir</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shrink-0 justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400 uppercase font-black tracking-tighter">
            <span>EduGrade</span><ChevronRight size={14} /><span className="text-slate-600">{activeModule}</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;