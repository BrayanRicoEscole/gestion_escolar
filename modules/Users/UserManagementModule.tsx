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
      // El error 42P17 es el código de PostgreSQL para recursión infinita
      if (e.code === '42P17' || e.message?.includes('recursion') || e.message?.includes('profiles')) {
        setError('DATABASE_ERROR');
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

  const sqlSetup = `-- 1. RESET DE TABLA
CREATE TABLE IF NOT EXISTS api.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role text DEFAULT 'grower' CHECK (role IN ('support', 'grower')),
  last_login timestamp with time zone DEFAULT now()
);

-- 2. RESET TOTAL DE POLÍTICAS
ALTER TABLE api.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are visible to everyone" ON api.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON api.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON api.profiles;
DROP POLICY IF EXISTS "Admins have full access" ON api.profiles;

-- 3. POLÍTICA DE LECTURA (CLAVE: Sin filtros complejos para evitar recursión)
-- Permitimos que cualquier usuario autenticado lea la tabla. 
-- Esto es seguro en un sistema interno y rompe el ciclo infinito.
CREATE POLICY "Public profiles are visible to everyone" 
ON api.profiles FOR SELECT 
USING (auth.role() = 'authenticated');

-- 4. POLÍTICA DE INSERCIÓN (Permite registro inicial)
CREATE POLICY "Users can insert their own profile" 
ON api.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 5. POLÍTICA DE ACTUALIZACIÓN PROPIA
CREATE POLICY "Users can update their own profile" 
ON api.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 6. POLÍTICA DE ADMIN (Usa un EXISTS que ahora funciona porque SELECT es abierto)
CREATE POLICY "Admins have full access" 
ON api.profiles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM api.profiles 
    WHERE id = auth.uid() AND role = 'support'
  )
);`;

  const filtered = profiles.filter(p => {
    const matchesSearch = (p.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                         (p.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
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
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Analizando permisos de seguridad...</p>
      </div>
    );
  }

  if (error === 'DATABASE_ERROR') {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Card className="border-rose-200 bg-rose-50/30 p-12 text-center">
          <ShieldAlert size={64} className="text-rose-600 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Error de Recursión Detectado</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto font-medium">
            Tus políticas de seguridad en Supabase están chocando entre sí (Infinite Recursion). 
            Esto bloquea cualquier visualización de datos. Ejecuta este script corregido en el editor SQL.
          </p>
          <div className="bg-slate-900 text-left rounded-3xl p-8 relative overflow-hidden group">
             <div className="flex justify-between items-center mb-4">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">SQL FIX SCRIPT</span>
                <button 
                  onClick={() => { navigator.clipboard.writeText(sqlSetup); alert("Copiado al portapapeles"); }}
                  className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase hover:text-emerald-300 transition-all"
                >
                   <Copy size={14} /> Copiar Código
                </button>
             </div>
             <pre className="text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-[300px] custom-scrollbar">
                {sqlSetup}
             </pre>
          </div>
          <button 
            onClick={fetchProfiles} 
            className="mt-8 px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-2xl"
          >
            Reintentar Conexión
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-20">
      <header className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 text-black">
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
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
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
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-primary/20 outline-none text-black"
            />
          </div>

          <button onClick={() => setShowSqlHelp(!showSqlHelp)} className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 shadow-lg">
            <Database size={20} />
          </button>
        </div>
      </header>

      {showSqlHelp && (
        <Card className="mb-10 border-amber-200 bg-amber-50/30 p-8 animate-in slide-in-from-top-4">
           <div className="flex items-start gap-4">
              <AlertCircle className="text-amber-500 shrink-0 mt-1" size={24} />
              <div className="flex-1">
                 <h4 className="text-lg font-black text-slate-800 mb-2">Corrección de Políticas RLS</h4>
                 <div className="bg-slate-900 rounded-2xl p-6 relative">
                    <pre className="text-[11px] text-emerald-400 font-mono overflow-x-auto">{sqlSetup}</pre>
                    <button onClick={() => { navigator.clipboard.writeText(sqlSetup); alert("Copiado"); }} className="absolute top-4 right-4 bg-white/10 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase">Copiar</button>
                 </div>
              </div>
           </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(profile => (
          <Card key={profile.id} className="group hover:border-primary/20 transition-all overflow-hidden" padding="none">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-4 lg:p-6 text-black">
              <div className="flex items-center gap-6 flex-1">
                <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center border border-slate-100 overflow-hidden shadow-inner">
                  {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" /> : <span className="font-black text-slate-300 text-2xl">{(profile.full_name || 'U').charAt(0)}</span>}
                </div>
                <div>
                   <h4 className="font-black text-slate-800 text-lg leading-tight flex items-center gap-3">
                     {profile.full_name || 'Usuario sin nombre'}
                     {profile.role === 'support' && <ShieldCheck size={16} className="text-primary" />}
                   </h4>
                   <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Mail size={12} />
                        <span className="text-xs font-bold">{profile.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 border-l pl-4">
                        <Calendar size={12} />
                        <span className="text-[10px] font-black uppercase">Último acceso: {profile.last_login ? new Date(profile.last_login).toLocaleDateString() : '—'}</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="bg-slate-50 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200">
                   <button onClick={() => handleRoleChange(profile.id, 'grower')} disabled={updatingId === profile.id} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${profile.role === 'grower' ? 'bg-white text-secondary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                     {updatingId === profile.id && profile.role !== 'grower' ? <Loader2 size={12} className="animate-spin" /> : <ArrowRightLeft size={12} />} Grower
                   </button>
                   <button onClick={() => handleRoleChange(profile.id, 'support')} disabled={updatingId === profile.id} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${profile.role === 'support' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                     {updatingId === profile.id && profile.role !== 'support' ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />} Support
                   </button>
                </div>
              </div>
            </div>
            {updatingId === profile.id && <div className="h-1 w-full bg-primary/10 overflow-hidden"><div className="h-full bg-primary animate-pulse w-full"></div></div>}
          </Card>
        ))}
      </div>
    </div>
  );
};