
import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, UserCog, Mail, Calendar, Loader2, Search, 
  CheckCircle2, Users, ShieldAlert, Copy, Database, Filter,
  ArrowRightLeft, AlertCircle
} from 'lucide-react';
import { getAllUserProfiles, updateUserRole } from '../../services/api';
import { UserProfile, UserRole } from '../../types';
import { Card } from '../../components/ui/Card';

export const UserManagementModule: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [showSqlHelp, setShowSqlHelp] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUserProfiles();
      setProfiles(data);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('profiles')) {
        setError('DATABASE_MISSING');
      } else {
        setError('Ocurrió un error al cargar los usuarios.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId);
    try {
      await updateUserRole(userId, newRole);
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p));
    } catch (e) {
      alert("Error al actualizar rol. Verifica permisos de RLS.");
    } finally {
      setUpdatingId(null);
    }
  };

  const sqlSetup = `-- EJECUTAR EN EL SQL EDITOR DE SUPABASE
CREATE TABLE IF NOT EXISTS api.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role text DEFAULT 'grower' CHECK (role IN ('support', 'grower')),
  last_login timestamp with time zone DEFAULT now()
);

-- HABILITAR RLS
ALTER TABLE api.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by all" ON api.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON api.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins full access" ON api.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM api.profiles WHERE id = auth.uid() AND role = 'support')
);`;

  const filtered = profiles.filter(p => {
    const matchesSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: profiles.length,
    support: profiles.filter(p => p.role === 'support').length,
    growers: profiles.filter(p => p.role === 'grower').length
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <UserCog size={16} className="text-primary" />
          </div>
        </div>
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Sincronizando Directorio...</p>
      </div>
    );
  }

  if (error === 'DATABASE_MISSING') {
    return (
      <div className="p-8 max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
        <Card className="border-rose-200 bg-rose-50/30 p-12 text-center">
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Tabla 'profiles' no encontrada</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Para gestionar roles, es necesario crear la tabla de perfiles en el esquema <strong>api</strong> de tu base de datos Supabase.
          </p>
          <div className="bg-slate-900 text-left rounded-3xl p-6 relative group overflow-hidden">
             <div className="flex justify-between items-center mb-4">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">SQL Script de Configuración</span>
                <button 
                  onClick={() => { navigator.clipboard.writeText(sqlSetup); alert("Copiado al portapapeles"); }}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/60 transition-all flex items-center gap-2 text-[10px] font-bold"
                >
                   <Copy size={14} /> Copiar Código
                </button>
             </div>
             <pre className="text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed">
                {sqlSetup}
             </pre>
          </div>
          <button 
            onClick={fetchProfiles}
            className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all"
          >
            Reintentar Conexión
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-20">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         <Card className="bg-slate-900 text-white border-none overflow-hidden relative group" padding="sm">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <Users size={120} />
            </div>
            <div className="relative z-10 flex items-center gap-5">
               <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/5"><Users size={28} /></div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Usuarios</p>
                  <p className="text-3xl font-black tracking-tighter">{stats.total}</p>
               </div>
            </div>
         </Card>
         <Card className="bg-white border-slate-100 hover:border-primary/20 transition-all" padding="sm">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center border border-blue-100"><ShieldCheck size={28} /></div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Administradores</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{stats.support}</p>
               </div>
            </div>
         </Card>
         <Card className="bg-white border-slate-100 hover:border-secondary/20 transition-all" padding="sm">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-orange-50 text-secondary rounded-2xl flex items-center justify-center border border-orange-100"><ArrowRightLeft size={28} /></div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Growers / Docentes</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{stats.growers}</p>
               </div>
            </div>
         </Card>
      </div>

      <header className="mb-8 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
              <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
                 <UserCog size={32} />
              </div>
              Directorio de Accesos
           </h1>
           <p className="text-slate-500 font-medium mt-2">Gestiona el equipo de trabajo y define permisos institucionales</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          {/* Filtro de Rol */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
             {(['all', 'support', 'grower'] as const).map(r => (
               <button 
                 key={r}
                 onClick={() => setRoleFilter(r)}
                 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${roleFilter === r ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {r}
               </button>
             ))}
          </div>

          <div className="relative flex-1 xl:w-80 xl:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <button 
            onClick={() => setShowSqlHelp(!showSqlHelp)}
            className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
            title="Ayuda SQL"
          >
            <Database size={20} />
          </button>
        </div>
      </header>

      {showSqlHelp && (
        <Card className="mb-10 border-amber-200 bg-amber-50/30 p-8 animate-in slide-in-from-top-4">
           <div className="flex items-start gap-4">
              <AlertCircle className="text-amber-500 shrink-0 mt-1" size={24} />
              <div>
                 <h4 className="text-lg font-black text-slate-800 mb-2">Resolución de Problemas de Tabla</h4>
                 <p className="text-sm text-slate-600 mb-6">Si no ves usuarios o recibes errores de "Could not find table", asegúrate de haber ejecutado este script en Supabase:</p>
                 <div className="bg-slate-900 rounded-2xl p-6 relative">
                    <pre className="text-[11px] text-emerald-400 font-mono overflow-x-auto">{sqlSetup}</pre>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(sqlSetup); alert("Copiado"); }}
                      className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase"
                    >
                      Copiar
                    </button>
                 </div>
              </div>
           </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(profile => (
          <Card key={profile.id} className="group hover:border-primary/20 transition-all overflow-hidden" padding="none">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-4 lg:p-6">
              <div className="flex items-center gap-6 flex-1">
                <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center border border-slate-100 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-slate-300 text-2xl">{profile.full_name.charAt(0)}</span>
                  )}
                </div>
                <div>
                   <h4 className="font-black text-slate-800 text-lg leading-tight flex items-center gap-3">
                     {profile.full_name}
                     {profile.role === 'support' && <ShieldCheck size={16} className="text-primary" />}
                   </h4>
                   <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Mail size={12} />
                        <span className="text-xs font-bold">{profile.email}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar size={12} />
                        <span className="text-[10px] font-black uppercase">Visto: {new Date(profile.last_login).toLocaleDateString()}</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="bg-slate-50 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200 shadow-inner">
                   <button 
                     onClick={() => handleRoleChange(profile.id, 'grower')}
                     disabled={updatingId === profile.id}
                     className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${profile.role === 'grower' ? 'bg-white text-secondary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     {updatingId === profile.id && profile.role !== 'grower' ? <Loader2 size={12} className="animate-spin" /> : <ArrowRightLeft size={12} />} Grower
                   </button>
                   <button 
                     onClick={() => handleRoleChange(profile.id, 'support')}
                     disabled={updatingId === profile.id}
                     className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${profile.role === 'support' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     {updatingId === profile.id && profile.role !== 'support' ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />} Support
                   </button>
                </div>
              </div>
            </div>
            {/* Barra de progreso inferior al actualizar */}
            {updatingId === profile.id && (
              <div className="h-1 w-full bg-primary/10 overflow-hidden">
                <div className="h-full bg-primary animate-progress"></div>
              </div>
            )}
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={40} className="text-slate-200" />
             </div>
             <p className="text-slate-400 font-black text-sm uppercase tracking-widest">No hay usuarios que coincidan con tu búsqueda</p>
             <button onClick={() => { setSearchTerm(''); setRoleFilter('all'); }} className="mt-4 text-primary font-black text-[10px] uppercase hover:underline">Limpiar Filtros</button>
          </div>
        )}
      </div>
    </div>
  );
};
