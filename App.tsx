import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Users, Settings, LayoutDashboard,
  Menu, X, ChevronRight, AlertCircle, UserCircle, ShieldCheck, MessageSquareText, FileText,
  LogOut, Loader2, FlaskConical, ClipboardList, UserX, UserCog
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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const up = await syncUserProfile(session.user);
        setProfile(up);
        console.log(`[AUTH] 👤 Sesión iniciada. Rol: ${up?.role?.toUpperCase()}`);
        
        // Grower solo tiene acceso a Calificaciones por defecto
        if (up?.role === 'grower') {
          setActiveModule('grading');
        }
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const up = await syncUserProfile(session.user);
        setProfile(up);
        console.log(`[AUTH] 🔄 Cambio de estado. Rol detectado: ${up?.role?.toUpperCase()}`);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Autenticando...</p>
      </div>
    );
  }

  if (!session || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-slate-100 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
            <GraduationCap className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">EduGrade Pro</h1>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Gestión Académica RENFORT. Inicia sesión para continuar.
          </p>
          <div className="space-y-4">
            <button onClick={handleLogin} className="w-full flex items-center justify-center gap-4 py-5 bg-white border-2 border-slate-100 rounded-3xl font-black text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 shadow-sm">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" /> Entrar con Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isSupport = profile.role === 'support';

  // Configuración de módulos según ROL
  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, visible: isSupport },
    { id: 'active_students', name: 'Estudiantes', icon: Users, visible: isSupport },
    { id: 'grading', name: 'Calificaciones', icon: Settings, visible: true },
    { id: 'comments', name: 'Comentarios', icon: MessageSquareText, visible: true },
    { id: 'reports', name: 'Reportes', icon: FileText, visible: isSupport },
    { id: 'users', name: 'Usuarios', icon: UserCog, visible: isSupport },
  ].filter(m => m.visible);

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard': return isSupport ? <DashboardModule /> : null;
      case 'active_students': return isSupport ? <ActiveStudentsModule /> : null;
      case 'grading': return isSupport ? <GradingModule /> : <TeacherGradingView />;
      case 'comments': return <TeacherCommentsView />;
      case 'reports': return isSupport ? <ReportsModule /> : null;
      case 'users': return isSupport ? <UserManagementModule /> : null;
      default: return <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Módulo no disponible</div>;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden">
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20`}>
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'hidden'}`}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg"><GraduationCap className="text-white w-6 h-6" /></div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">EduGrade</h1>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">{sidebarOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>

        {sidebarOpen && (
          <div className="px-6 mb-4">
            <div className="bg-slate-900 text-white p-4 rounded-[1.5rem] flex items-center gap-4 shadow-xl border border-white/10">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-white/10">
                {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" /> : <UserCircle size={24} />}
              </div>
              <div className="flex-1 truncate">
                <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">{profile.role}</p>
                <p className="text-xs font-bold truncate">{profile.full_name}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
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
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all group`}>
            <LogOut size={20} className="text-slate-400 group-hover:text-rose-500" />
            {sidebarOpen && <span className="font-medium text-sm">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shrink-0 justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Sistema</span><ChevronRight size={14} /><span className="text-slate-600 font-medium capitalize">{activeModule.replace('_', ' ')}</span>
          </div>
          {isSupport && (
            <div className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-2">
               <ShieldCheck size={14} /> Modo Support
            </div>
          )}
        </header>
        <div className="flex-1 overflow-y-auto bg-slate-50">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;