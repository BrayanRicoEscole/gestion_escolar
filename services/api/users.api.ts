import { supabase } from './client';
import { UserProfile, UserRole } from 'types';

/**
 * Sincroniza el perfil del usuario de Auth con la tabla de la base de datos.
 * Actualiza 'last_login' en cada entrada exitosa.
 */
export const syncUserProfile = async (user: any): Promise<UserProfile | null> => {
  if (!user) return null;

  try {
    console.log("[Profiles] 📥 Sincronizando perfil para:", user.email);

    // 1. Intentar obtener perfil y actualizar last_login de una vez
    const { data, error } = await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .maybeSingle();

    if (error) {
      // Error code para tabla no encontrada en PostgREST
      if (error.code === 'PGRST204' || error.code === 'PGRST205' || error.message?.includes('profiles')) {
        console.warn("[Profiles] ⚠️ La tabla 'profiles' no existe en el esquema 'api'. Retornando perfil volátil (Default: Grower).");
        return {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
          role: 'grower',
          last_login: new Date().toISOString()
        };
      }
      throw error;
    }

    if (data) {
      console.log("[Profiles] ✅ Perfil recuperado de DB. Rol:", data.role);
      return data;
    }

    // 2. Si no existe, crear perfil inicial
    console.log("[Profiles] ✨ Perfil no encontrado. Creando nuevo registro...");
    const newProfile = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email,
      avatar_url: user.user_metadata?.avatar_url,
      role: 'grower', // Rol por defecto
      last_login: new Date().toISOString()
    };

    const { data: created, error: createError } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .single();

    if (createError) {
      console.error("[Profiles] ❌ No se pudo crear el registro en DB:", createError.message);
      return newProfile as UserProfile;
    }

    console.log("[Profiles] ✅ Nuevo perfil creado. Rol:", created.role);
    return created;
  } catch (err) {
    console.error("[Profiles] 🔥 Error crítico en sincronización:", err);
    return null;
  }
};

/**
 * Lista todos los perfiles registrados (Solo Support)
 */
export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name');

  if (error) {
    console.error("[Profiles] Error al listar usuarios:", error);
    throw error;
  }
  return data || [];
};

/**
 * Cambia el rol institucional de un usuario
 */
export const updateUserRole = async (userId: string, role: UserRole): Promise<void> => {
  console.log(`[Profiles] 🛠️ Cambiando rol de usuario ${userId} a ${role}`);
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) {
    console.error("[Profiles] Error al actualizar rol:", error);
    throw error;
  }
};