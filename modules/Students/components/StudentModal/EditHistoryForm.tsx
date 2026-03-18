import React, { useState } from 'react';
import { Save, X, Loader2 } from 'lucide-react';
import { AcademicRecord } from 'types';
import { updateAcademicRecord } from '../../../../services/api';

interface Props {
  record: AcademicRecord;
  onClose: () => void;
  onSuccess: (updatedRecord: AcademicRecord) => void;
}

export const EditHistoryForm: React.FC<Props> = ({ record, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<AcademicRecord>>({ ...record });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAcademicRecord(record.id, formData);
      onSuccess({ ...record, ...formData });
    } catch (error) {
      alert("Error al actualizar el registro.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Editar Registro Histórico</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Grado</label>
              <input name="grade" value={formData.grade || ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm text-black focus:ring-4 focus:ring-primary/10 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Nivel Académico</label>
              <input name="academic_level" value={formData.academic_level || ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm text-black focus:ring-4 focus:ring-primary/10 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Atelier</label>
              <input name="atelier" value={formData.atelier || ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm text-black focus:ring-4 focus:ring-primary/10 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Modalidad</label>
              <input name="modality" value={formData.modality || ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm text-black focus:ring-4 focus:ring-primary/10 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Estado Final</label>
              <input name="status" value={formData.status || ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm text-black focus:ring-4 focus:ring-primary/10 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Fecha de Registro</label>
              <input name="created_at" type="datetime-local" value={formData.created_at ? new Date(formData.created_at).toISOString().slice(0, 16) : ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm text-black focus:ring-4 focus:ring-primary/10 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Fecha Inicio</label>
              <input name="start_date" type="date" value={formData.start_date || ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm text-black focus:ring-4 focus:ring-primary/10 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Fecha Fin</label>
              <input name="end_date" type="date" value={formData.end_date || ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm text-black focus:ring-4 focus:ring-primary/10 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 py-4 border-y border-slate-100">
            {[
              { key: 'spring_sent', label: 'Spring' },
              { key: 'winter_sent', label: 'Winter' },
              { key: 'autumn_sent', label: 'Autumn' },
              { key: 'summer_sent', label: 'Summer' },
              { key: 'final_report_sent', label: 'Final' }
            ].map(report => (
              <label key={report.key} className="flex flex-col items-center gap-2 cursor-pointer group">
                <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-primary transition-colors">{report.label}</span>
                <input 
                  type="checkbox" 
                  checked={!!(formData as any)[report.key]} 
                  onChange={(e) => setFormData(prev => ({ ...prev, [report.key]: e.target.checked }))}
                  className="w-6 h-6 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                />
              </label>
            ))}
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Observaciones</label>
            <textarea name="observations" value={formData.observations || ''} onChange={handleChange} className="w-full p-5 bg-slate-50 border-none rounded-2xl font-medium text-sm text-black focus:ring-4 focus:ring-primary/10 resize-none h-32 outline-none" />
          </div>

          <div className="flex gap-4 mt-10">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
              {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
