import { createClient } from '@supabase/supabase-js';
import * as localConfig from './supabase-config';

/**
 * Lógica de obtención de variables:
 * 1. Intenta obtener desde supabase-config.ts
 * 2. Si no están presentes, intenta obtener desde process.env (vía .env)
 */
const getVar = (key: 'SUPABASE_URL' | 'SUPABASE_KEY'): string => {
  // Intentar desde el archivo de configuración local
  const fromConfig = localConfig[key];
  if (fromConfig && fromConfig.trim() !== '') {
    return fromConfig;
  }

  // Fallback a variables de entorno (.env)
  const fromEnv = typeof process !== 'undefined' ? process.env[key] : undefined;
  if (fromEnv) {
    return fromEnv;
  }

  return '';
};

const URL =
  localConfig.SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL;

const KEY =
  localConfig.SUPABASE_KEY ||
  import.meta.env.VITE_SUPABASE_KEY;


if (!URL || !KEY) {
  console.warn("[Supabase] ⚠️ No se encontraron las credenciales de conexión. Verifica services/api/supabase-config.ts o tu archivo .env");
}

export const supabase = createClient(URL, KEY, {
  db: {
    schema: 'api'
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
