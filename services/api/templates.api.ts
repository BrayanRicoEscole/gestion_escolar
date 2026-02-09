
import { supabase } from './client';
import { ReportTemplate } from 'types';

const BUCKET_NAME = 'templates';

export const listTemplates = async (): Promise<ReportTemplate[]> => {
  const { data, error } = await supabase
    .from('report_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const uploadTemplate = async (file: File): Promise<ReportTemplate> => {
  // 1. Preparar nombre de archivo único
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${fileName}`;

  // 2. Subir el archivo al Storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (storageError) {
    console.error("Storage Error:", storageError);
    throw new Error(`Error en Storage: ${storageError.message}`);
  }

  // 3. Obtener URL pública
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  if (!urlData?.publicUrl) {
    throw new Error("No se pudo obtener la URL pública del archivo.");
  }

  // 4. Registrar en la base de datos
  const newTemplate = {
    id: crypto.randomUUID(),
    name: file.name,
    file_url: urlData.publicUrl,
    variables: [
      'full_name', 'document', 'academic_level', 
      'grade', 'atelier', 'modality', 
      'paz_y_salvo', 'codigo_estudiantil',
      'average_station', 'mentor_comment'
    ],
    created_at: new Date().toISOString()
  };

  const { data: dbData, error: dbError } = await supabase
    .from('report_templates')
    .insert(newTemplate)
    .select()
    .single();

  if (dbError) {
    console.error("Database Error:", dbError);
    // Intentar limpiar el archivo subido si falla el registro en DB
    await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    throw new Error(`Error en Base de Datos: ${dbError.message}`);
  }

  return dbData;
};

export const deleteTemplate = async (templateId: string, fileUrl: string): Promise<any> => {
  console.log("[API_TEMPLATES] >>> Iniciando deleteTemplate <<<");
  console.log("[API_TEMPLATES] ID Recibido:", templateId);
  console.log("[API_TEMPLATES] URL Recibida:", fileUrl);
  
  const results: any = { storage: null, database: null };
  
  try {
    // 1. Extraer el nombre del archivo de la URL de forma robusta
    const urlWithoutQuery = fileUrl.split('?')[0];
    const parts = urlWithoutQuery.split('/');
    const fileName = parts[parts.length - 1];
    
    if (fileName) {
      console.log(`[API_TEMPLATES] Intentando eliminar de Storage bucket '${BUCKET_NAME}': ${fileName}`);
      const { data, error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([fileName]);
      
      results.storage = { data, error: storageError };
      
      if (storageError) {
        console.warn("[API_TEMPLATES] Advertencia en Storage remove:", storageError);
      } else {
        console.log("[API_TEMPLATES] Storage remove completado:", data);
      }
    } else {
      console.error("[API_TEMPLATES] Error: No se pudo parsear el nombre del archivo de la URL");
    }

    // 2. Eliminar de la base de datos
    console.log(`[API_TEMPLATES] Intentando eliminar de DB registro ID: ${templateId}`);
    const { data: dbData, error: dbError } = await supabase
      .from('report_templates')
      .delete()
      .eq('id', templateId)
      .select();

    results.database = { data: dbData, error: dbError };

    if (dbError) {
      console.error("[API_TEMPLATES] Error al eliminar de DB:", dbError);
      throw dbError;
    }

    console.log("[API_TEMPLATES] Registro eliminado de DB con éxito. Respuesta:", dbData);
    console.log("[API_TEMPLATES] >>> Fin de proceso de eliminación <<<");
    return results;
  } catch (error: any) {
    console.error("[API_TEMPLATES] Error crítico capturado en deleteTemplate:", error);
    throw error;
  }
};
