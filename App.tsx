
import React, { useState } from 'react';
import { 
  GraduationCap, Users, UserMinus, BarChart3, ClipboardList, HeartHandshake, Settings, LayoutDashboard,
  Menu, X, ChevronRight, AlertCircle, UserCircle, ShieldCheck, MessageSquareText
} from 'lucide-react';
import GradingModule from './modules/Grading/GradingModule';
import TeacherGradingView from './modules/Grading/components/TeacherGradingView/TeacherGradingView';
import TeacherCommentsView from './modules/Comments/TeacherCommentsView';
import { ActiveStudentsModule } from './modules/Students/ActiveStudentsModule';

type Module = 'dashboard' | 'admissions' | 'active_students' | 'retired_students' | 'history' | 'reports' | 'macubim' | 'grading' | 'comments';
type UserRole = 'admin' | 'teacher';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>('active_students');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('admin');

  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, status: 'development' },
    { id: 'admissions', name: 'Admisiones', icon: ClipboardList, status: 'development' },
    { id: 'active_students', name: 'Estudiantes Activos', icon: Users, status: 'active' },
    { id: 'grading', name: 'Calificaciones', icon: Settings, status: 'active' },
    { id: 'comments', name: 'Comentarios', icon: MessageSquareText, status: 'active' },
    { id: 'reports', name: 'Reportes Académicos', icon: GraduationCap, status: 'development' },
  ];

  const renderContent = () => {
    if (activeModule === 'active_students') {
      return <ActiveStudentsModule />;
    }
    if (activeModule === 'grading') {
      return userRole === 'admin' ? <GradingModule /> : <TeacherGradingView />;
    }
    if (activeModule === 'comments') {
      // El administrador gestiona las plantillas, el docente redacta
      return userRole === 'admin' ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-in fade-in">
           <div className="text-center p-12 bg-white rounded-[3rem] border border-slate-100 shadow-sm max-w-xl">
             <div className="w-20 h-20 bg-primary/5 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Settings size={40} />
             </div>
             <h3 className="text-2xl font-black text-slate-800 tracking-tight">Configuración de Comentarios</h3>
             <p className="mt-4 text-slate-500 font-medium">
               Para configurar el catálogo de frases predefinidas (plantillas) que usarán los docentes, 
               diríjase al <strong>Paso 9</strong> de la configuración del año escolar.
             </p>
             <button 
               onClick={() => setActiveModule('grading')} 
               className="mt-8 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all active:scale-95"
             >
               Abrir Configuración
             </button>
           </div>
        </div>
      ) : <TeacherCommentsView />;
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-in fade-in duration-500">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center max-w-md">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6"><AlertCircle className="w-10 h-10 text-amber-500" /></div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Módulo en Desarrollo</h2>
          <button onClick={() => setActiveModule('active_students')} className="mt-8 px-6 py-3 bg-primary text-white rounded-xl shadow-lg font-medium hover:bg-primary/90 transition-all active:scale-95">Ir a Estudiantes</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden">
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20`}>
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'hidden'}`}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg"><GraduationCap className="text-white w-6 h-6" /></div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight text-black">EduGrade 2026</h1>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">{sidebarOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>

        {sidebarOpen && (
          <div className="px-6 mb-6">
             <div className="bg-slate-50 p-2 rounded-2xl flex items-center gap-1 border border-slate-100">
                <button onClick={() => setUserRole('admin')} className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${userRole === 'admin' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><ShieldCheck size={14} /> Admin</button>
                <button onClick={() => setUserRole('teacher')} className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${userRole === 'teacher' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><UserCircle size={14} /> Docente</button>
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
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shrink-0 justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400"><span>Sistema</span><ChevronRight size={14} /><span className="text-slate-600 font-medium capitalize">{activeModule.replace('_', ' ')}</span></div>
        </header>
        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
