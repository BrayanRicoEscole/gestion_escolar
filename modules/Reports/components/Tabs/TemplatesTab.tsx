
import React, { useState, useRef, useEffect } from 'react';
import { FileUp, Variable, FileText, Download, Trash2, CheckCircle2, Loader2, Copy, AlertCircle, Database, Layout, User, MessageSquare, AlertTriangle, X } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { listTemplates, uploadTemplate, deleteTemplate } from '../../../../services/api';
import { ReportTemplate } from '../../../../types';

export const TemplatesTab: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  
  // Estado para confirmación de eliminación (Evita window.confirm que está fallando)
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Diccionario de etiquetas exacto según useDocxGenerator.ts
  const tagCategories = [
    {
      name: 'Datos del Estudiante',
      icon: User,
      tags: ['full_name', 'document', 'academic_level', 'grade', 'atelier', 'rama', 'calendar', 'modality', 'paz_y_salvo', 'codigo_estudiantil']
    },
    {
      name: 'Datos de la Estación',
      icon: Layout,
      tags: ['station_name', 'date', 'average_station', 'convivencia_grade']
    },
    {
      name: 'Secciones Cualitativas',
      icon: MessageSquare,
      tags: ['academic_cons', 'academic_non', 'emotional_skills', 'talents', 'social_interaction', 'challenges', 'piar_desc', 'learning_crop_desc', 'comment']
    },
    {
      name: 'Estructura de Tabla (Bucles)',
      icon: Database,
      tags: ['#labs', '/labs', 'lab_name', '#subjects', '/subjects', 'name', 'skills_summary', 'm1', 'm2', 'm3', 'm4', 'final']
    }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await listTemplates();
      setTemplates(data);
    } catch (err) {
      setError('No se pudieron cargar las plantillas de Supabase');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      alert('Por favor, selecciona un archivo .docx válido.');
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const newTemplate = await uploadTemplate(file);
      setTemplates(prev => [newTemplate, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Error al subir a Supabase Storage');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmDelete = async (template: ReportTemplate) => {
    console.log(`[TemplatesTab] Confirmada eliminación para: ${template.name} (${template.id})`);
    setIsDeleting(true);
    try {
      const response = await deleteTemplate(template.id, template.file_url);
      console.log(`[TemplatesTab] Respuesta API exitosa:`, response);
      
      setTemplates(prev => prev.filter(t => t.id !== template.id));
      setDeletingId(null);
    } catch (err: any) {
      console.error(`[TemplatesTab] Error crítico en confirmDelete:`, err);
      alert(`No se pudo eliminar: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (v: string) => {
    const tag = `<<${v}>>`;
    navigator.clipboard.writeText(tag);
    setCopiedVar(v);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-right-4 duration-500">
      <div className="space-y-8">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept=".docx" 
          className="hidden" 
        />
        
        <Card className={`p-10 border-2 border-dashed transition-all flex flex-col items-center justify-center text-center ${
          isUploading ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50'
        }`}>
          {isUploading ? (
            <div className="space-y-6 w-full max-w-xs">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm mx-auto animate-bounce">
                <Loader2 size={32} className="animate-spin" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Subiendo a Storage...</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Sincronizando metadatos en la base de datos</p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-primary shadow-sm mb-6">
                <FileUp size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Subir Nueva Plantilla .docx</h3>
              <p className="text-slate-500 text-sm font-medium mb-8 max-w-xs">
                Sube tu archivo para que el motor de reportes pueda procesar las etiquetas dinámicas.
              </p>
              <Button 
                variant="outline" 
                icon={FileUp} 
                onClick={() => fileInputRef.current?.click()}
              >
                Cargar en la Nube
              </Button>
            </>
          )}
        </Card>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold uppercase">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <Variable className="text-primary" size={24} />
            <h3 className="text-xl font-black text-slate-800">Diccionario de Etiquetas</h3>
          </div>
          
          <div className="space-y-8">
            {tagCategories.map(cat => (
              <div key={cat.name} className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400 border-b border-slate-50 pb-2">
                  <cat.icon size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {cat.tags.map(v => (
                    <button 
                      key={v} 
                      onClick={() => copyToClipboard(v)}
                      className={`px-4 py-2.5 rounded-xl border flex items-center justify-between group transition-all text-left ${
                        copiedVar === v ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100 hover:border-primary/20 hover:bg-white'
                      }`}
                    >
                      <span className={`text-[10px] font-black tracking-tighter ${copiedVar === v ? 'text-green-600' : 'text-slate-600'}`}>
                        {"<<" + v + ">>"}
                      </span>
                      {copiedVar === v ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={10} className="text-slate-300 opacity-0 group-hover:opacity-100" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Repositorio de Plantillas</h3>
          <span className="text-xs font-bold text-slate-400">{templates.length} archivos</span>
        </div>
        
        <div className="space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 size={32} className="animate-spin mx-auto text-slate-200 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase">Consultando base de datos...</p>
            </div>
          ) : templates.map(template => (
            <Card key={template.id} className="flex items-center justify-between group hover:border-primary/20 transition-all relative overflow-hidden" padding="sm">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center border border-blue-100">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm truncate max-w-[200px]">{template.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {new Date(template.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">•</span>
                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-green-100 text-green-700">
                      Activa
                    </span>
                  </div>
                </div>
              </div>

              {/* Lógica de Confirmación de Eliminación Overlay */}
              {deletingId === template.id ? (
                <div className="absolute inset-0 bg-slate-900 text-white flex items-center justify-between px-6 animate-in slide-in-from-right duration-200">
                   <div className="flex items-center gap-3">
                      <AlertTriangle size={20} className="text-amber-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">¿Confirmar eliminación?</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <button 
                        onClick={() => confirmDelete(template)}
                        disabled={isDeleting}
                        className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2"
                      >
                        {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        {isDeleting ? 'Borrando...' : 'Sí, borrar'}
                      </button>
                      <button 
                        onClick={() => setDeletingId(null)}
                        disabled={isDeleting}
                        className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
                      >
                        Cancelar
                      </button>
                   </div>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <a 
                    href={template.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 text-slate-300 hover:text-primary transition-all"
                    title="Descargar"
                  >
                    <Download size={20} />
                  </a>
                  <button 
                    onClick={() => {
                      console.log("[TemplatesTab] Solicitud eliminación para:", template.id);
                      setDeletingId(template.id);
                    }}
                    className="p-3 text-slate-300 hover:text-rose-500 transition-all"
                    title="Eliminar"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              )}
            </Card>
          ))}

          {!isLoading && templates.length === 0 && (
            <div className="py-24 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
              <FileText size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-black uppercase text-xs">No hay plantillas registradas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
