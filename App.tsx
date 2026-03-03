// Test comment
import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Users, Settings, LayoutDashboard,
  Menu, X, ChevronRight, AlertCircle, UserCircle, ShieldCheck, MessageSquareText, FileText,
  LogOut, Loader2, FlaskConical, ClipboardList, UserX, UserCog, ShieldAlert, Terminal,
  Sliders, History
} from 'lucide-react';
import { UserProfile, UserRole } from './types';
import { useAuth } from './context/AuthContext';

// Módulos
import GradingModule from './modules/Grading/GradingModule';
import TeacherGradingView from './modules/Grading/components/TeacherGradingView/TeacherGradingView';
import TeacherCommentsView from './modules/Comments/TeacherCommentsView';
import { ActiveStudentsModule } from './modules/Students/ActiveStudentsModule';
import { RetiredStudentsModule } from './modules/Students/RetiredStudentsModule';
import { ReportsModule } from './modules/Reports/ReportsModule';
import { AcademicRecordsModule } from './modules/Students/AcademicRecordsModule';
import { DashboardModule } from './modules/Dashboard/DashboardModule';
import { UserManagementModule } from './modules/Users/UserManagementModule';
import { FullScreenLoader } from './components/FullScreenLoader'
import { LoginScreen } from './components/LoginScreen'

type Module = 'dashboard' | 'admissions' | 'active_students' | 'retired_students' | 'academic_records' | 'reports' | 'grading' | 'grading_setup' | 'comments' | 'users';

const App: React.FC = () => {
  const {
    isAuthLoading,
    isProfileLoading,
    isAuthenticated,
    profile,
    signIn,
    logout
  } = useAuth();
  const [activeModule, setActiveModule] = useState<Module>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);


  const handleLogout = async () => {
    try {
      console.log("[DEBUG:App] 🚪 Ejecutando SignOut...");
      sessionStorage.removeItem('auth_bypass');
      await logout()
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (isAuthLoading)  {
    return (
      <FullScreenLoader singOut={logout}/>
    );
  }

  if (!isAuthenticated)  {
    return (
      <LoginScreen signIn={signIn}/>
    );
  }

  if (isAuthenticated && (isProfileLoading || !profile)) {
  return <FullScreenLoader  singOut={logout}/>;
}

  const isSupport = profile.role === 'support';
  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, visible: isSupport },
    { id: 'active_students', name: 'Estudiantes', icon: Users, visible: isSupport },
    { id: 'retired_students', name: 'Retirados', icon: UserX, visible: isSupport },
    { id: 'academic_records', name: 'Configuración periodo académico', icon: History, visible: isSupport },
    { id: 'grading', name: 'Calificaciones', icon: ClipboardList, visible: true },
    { id: 'grading_setup', name: 'Configuración', icon: Sliders, visible: isSupport },
    { id: 'comments', name: 'Comentarios', icon: MessageSquareText, visible: true },
    { id: 'reports', name: 'Reportes', icon: FileText, visible: isSupport },
    { id: 'users', name: 'Usuarios', icon: UserCog, visible: isSupport },
  ].filter(m => m.visible);

  const renderContent = () => {
    console.log(`[DEBUG:App] 🧩 Montando componente: ${activeModule}`);
    switch (activeModule) {
      case 'dashboard': return <DashboardModule />;
      case 'active_students': return <ActiveStudentsModule />;
      case 'retired_students': return <RetiredStudentsModule />;
      case 'academic_records': return <AcademicRecordsModule />;
      case 'grading': return <TeacherGradingView userRole={profile.role} />;
      case 'grading_setup': return <GradingModule />;
      case 'comments': return <TeacherCommentsView userRole={profile.role} />;
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
            <h1 className="font-bold text-xl text-slate-800 tracking-tight text-black">Renfort</h1>
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
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200"><UserCircle size={18} className="text-slate-400" /></div>
              {sidebarOpen && <div className="flex-1 truncate"><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{profile.role}</p></div>}
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
            <span>Sistema</span><ChevronRight size={14} /><span className="text-slate-600">{activeModule.replace('_', ' ')}</span>
          </div>
          {isSupport && (
            <div className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-2 animate-in slide-in-from-right-2">
               <ShieldCheck size={14} /> Rol Support
            </div>
          )}
        </header>
        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;