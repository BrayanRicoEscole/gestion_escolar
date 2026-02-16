import { supabase } from './client';
import { UserProfile, UserRole } from 'types';

/**
 * Sincroniza el perfil del usuario de Auth con la tabla de la base de datos.
 * Utiliza un patrón SELECT -> INSERT/UPDATE separado para evitar errores de RLS.
 */
export const syncUserProfile = async (user: any): Promise<UserProfile | null> => {
  if (!user) {
    console.warn("[DEBUG:Profiles] ❌ syncUserProfile: Usuario nulo. Cancelando sincronización.");
    return null;
  }

  console.group(`[DEBUG:Profiles] Sincronización Identidad (${user.email})`);
  
  const fallback: UserProfile = {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.email,
    avatar_url: user.user_metadata?.avatar_url,
    role: 'grower',
    last_login: new Date().toISOString()
  };

  try {
    // 1. SELECT simple primero
    console.log("-> Paso 1: Consultando existencia en DB...");
    const { data: profile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (selectError) {
      console.error("-> ❌ Error en SELECT (Posible RLS Recursion):", selectError.code, selectError.message);
      console.groupEnd();
      return fallback; 
    }

    if (profile) {
      console.log("-> ✅ Perfil recuperado. Rol:", profile.role);
      
      // 2. Update de login en segundo plano (no bloqueante)
      supabase.from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id)
        .then(({ error }) => error && console.warn("-> ⚠️ No se pudo actualizar last_login:", error.message));

      console.groupEnd();
      return profile;
    }

    // 3. Crear perfil si no existe
    console.log("-> ℹ️ Registro no encontrado. Creando perfil inicial...");
    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .insert(fallback)
      .select()
      .single();

    if (insertError) {
      console.error("-> ❌ Error en INSERT (Permisos?):", insertError.code, insertError.message);
      console.groupEnd();
      return fallback;
    }

    console.log("-> ✨ Perfil creado con éxito.");
    console.groupEnd();
    return created;

  } catch (err) {
    console.error("-> 🔥 Error crítico en syncUserProfile:", err);
    console.groupEnd();
    return fallback;
  }
};

/**
 * Lista todos los perfiles registrados (Solo Support)
 */
export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
  console.log("[DEBUG:Profiles] 📥 Listando todos los usuarios...");
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name');

  if (error) {
    console.error("[DEBUG:Profiles] ❌ Error al listar usuarios:", error);
    throw error;
  }
  return data || [];
};

/**
 * Cambia el rol institucional de un usuario
 */
export const updateUserRole = async (userId: string, role: UserRole): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) {
    console.error("[DEBUG:Profiles] ❌ Error al actualizar rol:", error);
    throw error;
  }
};