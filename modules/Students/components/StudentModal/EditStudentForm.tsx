import React, { useState } from 'react';
import { Save, X, Loader2 } from 'lucide-react';
import { Student } from 'types';
import { updateStudent } from '../../../../services/api';

interface Props {
  student: Student;
  onClose: () => void;
  onSuccess: (updatedStudent: Student) => void;
}

export const EditStudentForm: React.FC<Props> = ({ student, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<Student>>({ ...student });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student.id) return;
    
    setSaving(true);
    try {
      await updateStudent(student.id, formData);
      onSuccess({ ...student, ...formData });
    } catch (error) {
      alert("Error al actualizar los datos.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Información Básica */}
        <div className="space-y-4 p-6 bg-white rounded-3xl border border-slate-200">
          <h4 className="text-[10px] font-black uppercase text-primary tracking-widest mb-4">Información Básica</h4>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Nombre Completo</label>
            <input name="full_name" value={formData.full_name || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Documento</label>
            <input name="document" value={formData.document || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Género</label>
            <select name="genero" value={formData.genero || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">Seleccionar...</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        {/* Datos de Nacimiento */}
        <div className="space-y-4 p-6 bg-white rounded-3xl border border-slate-200">
          <h4 className="text-[10px] font-black uppercase text-purple-500 tracking-widest mb-4">Nacimiento y Salud</h4>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Fecha de Nacimiento</label>
            <input name="nacimiento" type="text" placeholder="DD/MM/AAAA" value={formData.nacimiento || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">RH</label>
            <input name="rh" value={formData.rh || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Póliza</label>
            <input name="poliza" value={formData.poliza || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        {/* Contacto */}
        <div className="space-y-4 p-6 bg-white rounded-3xl border border-slate-200">
          <h4 className="text-[10px] font-black uppercase text-rose-500 tracking-widest mb-4">Contacto Acudiente</h4>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Nombre Acudiente</label>
            <input name="acudiente_academico" value={formData.acudiente_academico || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Teléfono</label>
            <input name="telefono_a" value={formData.telefono_a || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Correo</label>
            <input name="correo_a" value={formData.correo_a || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        {/* Institucional */}
        <div className="space-y-4 p-6 bg-white rounded-3xl border border-slate-200">
          <h4 className="text-[10px] font-black uppercase text-green-500 tracking-widest mb-4">Datos Institucionales</h4>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Cuenta Institucional</label>
            <input name="cuenta_institucional" value={formData.cuenta_institucional || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Fecha de Inicio</label>
            <input name="inicio" value={formData.inicio || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        {/* Financiero */}
        <div className="space-y-4 p-6 bg-white rounded-3xl border border-slate-200">
          <h4 className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-4">Financiero</h4>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Responsable Financiero</label>
            <input name="acudiente_financiero" value={formData.acudiente_financiero || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Teléfono Financiero</label>
            <input name="telefono_financiero" value={formData.telefono_financiero || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
        <button type="button" onClick={onClose} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50">
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Guardar Cambios
        </button>
      </div>
    </form>
  );
};
