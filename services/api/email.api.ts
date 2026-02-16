import { Student } from 'types';
import { supabase } from './client';

interface SendReportParams {
  student: Student;
  pdfBlob: Blob;
  senderEmail?: string;
  stationName: string;
}

/**
 * Despacho oficial vía Supabase Edge Function 'send-email'.
 */
export const sendAcademicReportEmail = async ({
  student,
  pdfBlob,
  senderEmail,
  stationName
}: SendReportParams) => {
  console.group(`[EmailService] Procesando despacho para: ${student.full_name}`);
  
  const recipients = [student.correo_a, student.correo_b, student.correo_financiero]
    .filter(email => email && typeof email === 'string' && email.includes('@'))
    .map(email => email!.trim());
  
  if (recipients.length === 0) {
    console.groupEnd();
    throw new Error("El estudiante no cuenta con correos electrónicos válidos registrados.");
  }

  // Codificación segura para transporte JSON
  const pdfBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Error al codificar el PDF para el transporte."));
    reader.readAsDataURL(pdfBlob);
  });

  try {
    console.log(`[EmailService] Invocando Edge Function con ${recipients.length} destinatarios...`);
    
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: recipients,
        subject: `Reporte Global de Aprendizaje - ${student.full_name} - ${stationName}`,
        studentName: student.full_name,
        stationName: stationName,
        pdfBase64: pdfBase64,
       
      }
    });

    if (error) {
      console.error("[EmailService] La función remota devolvió un error:", error);
      // Intentar extraer el mensaje de error si viene en el body
      let errorMessage = error.message || "Fallo en la ejecución remota";
      throw new Error(errorMessage);
    }

    console.log("[EmailService] ¡Éxito! Reporte enviado correctamente.");
    console.groupEnd();
    return { success: true, data };

  } catch (err: any) {
    console.groupEnd();
    console.error("[EmailService] Error crítico:", err);
    
    if (err.message?.includes('Failed to send a request')) {
      throw new Error("No se pudo establecer conexión con el servidor de correos (Edge Function). Verifica el despliegue en Supabase.");
    }
    throw err;
  }
};