import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link, Outlet 
} from 'react-router-dom';
import { 
  GraduationCap, Users, Settings, LayoutDashboard,
  Menu, X, ChevronRight, UserCircle, ShieldCheck, MessageSquareText, FileText,
  LogOut, FlaskConical, ClipboardList, UserX, UserCog, ShieldAlert,
  Sliders, History
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { FullScreenLoader } from './components/FullScreenLoader';
import { LoginScreen } from './components/LoginScreen';
import { NotificationCenter } from './components/NotificationCenter';
import { notificationTriggerApi } from './services/api/notificationTrigger.api';

// Lazy loaded modules
const DashboardModule = lazy(() => import('./modules/Dashboard/DashboardModule').then(m => ({ default: m.DashboardModule })));
const ActiveStudentsModule = lazy(() => import('./modules/Students/ActiveStudentsModule').then(m => ({ default: m.ActiveStudentsModule })));
const RetiredStudentsModule = lazy(() => import('./modules/Students/RetiredStudentsModule').then(m => ({ default: m.RetiredStudentsModule })));
const AcademicRecordsModule = lazy(() => import('./modules/Students/AcademicRecordsModule').then(m => ({ default: m.AcademicRecordsModule })));
const TeacherGradingView = lazy(() => import('./modules/Grading/components/TeacherGradingView/TeacherGradingView'));
const GradingModule = lazy(() => import('./modules/Grading/GradingModule'));
const TeacherCommentsView = lazy(() => import('./modules/Comments/TeacherCommentsView'));
const ReportsModule = lazy(() => import('./modules/Reports/ReportsModule').then(m => ({ default: m.ReportsModule })));
const StationReportsModule = lazy(() => import('./modules/Reports/StationReportsModule').then(m => ({ default: m.StationReportsModule })));
const UserManagementModule = lazy(() => import('./modules/Users/UserManagementModule').then(m => ({ default: m.UserManagementModule })));
const GrowerAssignmentsModule = lazy(() => import('./modules/Users/GrowerAssignmentsModule').then(m => ({ default: m.GrowerAssignmentsModule })));

const MainLayout: React.FC = () => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const isSupport = profile?.role === 'support';
  const activePath = location.pathname.substring(1) || 'dashboard';

  const menuGroups = [
    {
      id: 'seeds',
      name: 'Seeds',
      icon: FlaskConical,
      visible: true,
      items: [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, visible: true },
        { id: 'active_students', name: 'Estudiantes Activos', icon: Users, visible: isSupport },
        { id: 'retired_students', name: 'Retirados', icon: UserX, visible: isSupport },
      ]
    },
    {
      id: 'grading_group',
      name: 'Calificaciones',
      icon: ClipboardList,
      visible: true,
      items: [
        { id: 'grading', name: 'Notas', icon: ClipboardList, visible: true },
        { id: 'comments', name: 'Comentarios', icon: MessageSquareText, visible: true },
        { id: 'station_reports', name: 'Consolidado Estación', icon: ShieldCheck, visible: isSupport },
        { id: 'reports', name: 'Reportes', icon: FileText, visible: isSupport },
        { id: 'academic_records', name: 'Periodos académicos', icon: History, visible: isSupport },
      ]
    },
    {
      id: 'admin',
      name: 'Administración',
      icon: Settings,
      visible: isSupport,
      items: [
        { id: 'users', name: 'Usuarios', icon: UserCog, visible: isSupport },
        { id: 'grower_assignments', name: 'Asignaciones', icon: Sliders, visible: isSupport },
        { id: 'grading_setup', name: 'Configuración Sistema', icon: Sliders, visible: isSupport },
      ]
    }
  ];

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('auth_bypass');
      await logout();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden text-black">
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20`}>
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'hidden'}`}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg"><GraduationCap className="text-white w-6 h-6" /></div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">Renfort</h1>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4">
          {menuGroups.filter(g => g.visible).map((group) => (
            <div key={group.id} className="space-y-1">
              <button
                onClick={() => {
                  if (!sidebarOpen) setSidebarOpen(true);
                  setOpenSubmenu(openSubmenu === group.id ? null : group.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${openSubmenu === group.id ? 'bg-slate-50 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <group.icon className={`w-5 h-5 ${openSubmenu === group.id ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {sidebarOpen && (
                  <>
                    <span className="font-bold text-sm flex-1 text-left">{group.name}</span>
                    <ChevronRight size={16} className={`transition-transform duration-200 ${openSubmenu === group.id ? 'rotate-90' : ''}`} />
                  </>
                )}
              </button>
              
              {sidebarOpen && openSubmenu === group.id && (
                <div className="ml-4 pl-4 border-l border-slate-100 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {group.items.filter(i => i.visible).map((item) => (
                    <Link
                      key={item.id}
                      to={`/${item.id}`}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${activePath === item.id ? 'bg-primary/5 text-primary shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                    >
                      <item.icon size={16} className={activePath === item.id ? 'text-primary' : 'text-slate-400'} />
                      <span className="font-medium text-xs">{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
           <div className={`flex items-center gap-3 px-4 py-3 ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200"><UserCircle size={18} className="text-slate-400" /></div>
              {sidebarOpen && <div className="flex-1 truncate"><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{profile?.role}</p></div>}
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
            <span>Sistema</span><ChevronRight size={14} /><span className="text-slate-600">{activePath.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            {isSupport && (
              <div className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-2 animate-in slide-in-from-right-2">
                <ShieldCheck size={14} /> Rol Support
              </div>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={<div className="flex items-center justify-center h-full"><FullScreenLoader singOut={logout} /></div>}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const {
    isAuthLoading,
    isProfileLoading,
    isAuthenticated,
    profile,
    signIn,
    logout
  } = useAuth();

  useEffect(() => {
    if (profile && profile.role === 'support') {
      notificationTriggerApi.checkAndNotifyPendingGrades();
    }
  }, [profile]);

  if (isAuthLoading) return <FullScreenLoader singOut={logout}/>;
  if (!isAuthenticated) return <LoginScreen signIn={signIn}/>;
  if (!profile) return <FullScreenLoader singOut={logout}/>;

  const isSupport = profile?.role === 'support';

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Shared Routes */}
          <Route path="/dashboard" element={<DashboardModule />} />
          
          {/* Support Routes */}
          {isSupport && (
            <>
              <Route path="/active_students" element={<ActiveStudentsModule />} />
              <Route path="/retired_students" element={<RetiredStudentsModule />} />
              <Route path="/academic_records" element={<AcademicRecordsModule />} />
              <Route path="/station_reports" element={<StationReportsModule />} />
              <Route path="/reports" element={<ReportsModule />} />
              <Route path="/users" element={<UserManagementModule />} />
              <Route path="/grower_assignments" element={<GrowerAssignmentsModule />} />
              <Route path="/grading_setup" element={<GradingModule />} />
            </>
          )}

          {/* Shared/Teacher Routes */}
          <Route path="/grading" element={<TeacherGradingView userRole={profile?.role || 'grower'} />} />
          <Route path="/comments" element={<TeacherCommentsView userRole={profile?.role || 'grower'} />} />

          {/* Fallback */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-full gap-6 p-10">
              <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-rose-100/50">
                <ShieldAlert size={48} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Módulo no encontrado</h3>
                <p className="text-slate-500 font-medium max-w-xs mx-auto">La página que buscas no existe o no tienes permisos para verla.</p>
              </div>
              <Link to="/" className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
                Volver al inicio
              </Link>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
