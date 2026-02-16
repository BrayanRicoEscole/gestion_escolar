import { supabase } from './client';
import { UserProfile, UserRole } from 'types';

/**
 * Sincroniza el perfil del usuario de Auth con la tabla de la base de datos.
 */
export const syncUserProfile = async (user: any): Promise<UserProfile | null> => {
  if (!user) {
    console.warn("[DEBUG:Profiles] ❌ No hay usuario para sincronizar.");
    return null;
  }

  console.group("[DEBUG:Profiles] Sincronización de Perfil");
  console.log("ID de Auth:", user.id);
  console.log("Email:", user.email);

  const volatileProfile: UserProfile = {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.email,
    avatar_url: user.user_metadata?.avatar_url,
    role: 'grower',
    last_login: new Date().toISOString()
  };

  try {
    // 1. Intentar actualizar y obtener
    console.log("-> Ejecutando SELECT/UPDATE en 'profiles'...");
    const { data, error } = await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("-> ❌ Error de Supabase:", error.code, error.message);
      console.log("-> Usando Perfil Volátil (Emergencia)");
      console.groupEnd();
      return volatileProfile;
    }

    if (data) {
      console.log("-> ✅ Perfil encontrado en DB:", data);
      console.groupEnd();
      return data;
    }

    // 2. Si no existe, intentar crear
    console.log("-> ℹ️ No existe registro. Intentando INSERT...");
    const { data: created, error: createError } = await supabase
      .from('profiles')
      .insert(volatileProfile)
      .select()
      .single();

    if (createError) {
      console.error("-> ❌ Error al crear perfil (INSERT):", createError.code, createError.message);
      console.log("-> Usando Perfil Volátil");
      console.groupEnd();
      return volatileProfile;
    }

    console.log("-> ✨ Perfil creado exitosamente:", created);
    console.groupEnd();
    return created;
  } catch (err) {
    console.error("-> 🔥 Error crítico en syncUserProfile:", err);
    console.groupEnd();
    return volatileProfile;
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
  console.log(`[DEBUG:Profiles] ✅ ${data?.length || 0} usuarios recuperados.`);
  return data || [];
};

/**
 * Cambia el rol institucional de un usuario
 */
export const updateUserRole = async (userId: string, role: UserRole): Promise<void> => {
  console.log(`[DEBUG:Profiles] 🛠️ Intentando cambiar rol: ${userId} -> ${role}`);
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) {
    console.error("[DEBUG:Profiles] ❌ Error al actualizar rol:", error);
    throw error;
  }
  console.log("[DEBUG:Profiles] ✅ Rol actualizado en DB.");
};