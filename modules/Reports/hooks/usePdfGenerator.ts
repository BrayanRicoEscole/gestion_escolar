
import { useState } from 'react';

export const usePdfGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdfBlob = async (elementId: string, filename: string): Promise<Blob> => {
    setIsGenerating(true);
    const element = document.getElementById(elementId);
    
    if (!element) {
      setIsGenerating(false);
      throw new Error("Elemento de reporte no encontrado en el DOM");
    }

    // Acceso a la instancia global cargada vía script tag en index.html
    const html2pdf = (window as any).html2pdf;
    
    if (!html2pdf) {
      setIsGenerating(false);
      throw new Error("La librería html2pdf no se ha cargado correctamente en el entorno global.");
    }

    // Pequeño delay para asegurar que el DOM esté listo
    await new Promise(resolve => setTimeout(resolve, 500));

    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        margin:       0,
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        scrollY: 0,
        windowWidth: 1100
      },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    try {
      // Generar el PDF usando la API de Promesas de html2pdf
      const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
      return pdfBlob;
    } catch (error) {
      console.error("[PdfGenerator] Error crítico:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generatePdfBlob, isGenerating };
};
