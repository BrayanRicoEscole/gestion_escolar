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
        {/* Información Básica y Personal */}
        <div className="space-y-4 p-6 bg-white rounded-3xl border border-slate-200">
          <h4 className="text-[10px] font-black uppercase text-primary tracking-widest mb-4">Información Personal</h4>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Nombre Completo</label>
            <input name="full_name" value={formData.full_name || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Tipo ID</label>
              <input name="tipo_id_estudiante" value={formData.tipo_id_estudiante || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Documento</label>
              <input name="document" value={formData.document || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Nacimiento</label>
              <input name="nacimiento" value={formData.nacimiento || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Edad</label>
              <input name="edad" value={formData.edad || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Lugar Nacimiento</label>
            <input name="lugar_nacimiento" value={formData.lugar_nacimiento || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Fecha Exp.</label>
              <input name="fecha_expedicion" value={formData.fecha_expedicion || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Lugar Exp.</label>
              <input name="lugar_expedicion" value={formData.lugar_expedicion || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </div>

        {/* Académico */}
        <div className="space-y-4 p-6 bg-white rounded-3xl border border-slate-200">
          <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-4">Académico</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Nivel</label>
              <input name="academic_level" value={formData.academic_level || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Grado</label>
              <input name="grade" value={formData.grade || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Grupo</label>
              <input name="calendario_grupo" value={formData.calendario_grupo || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Atelier</label>
              <input name="atelier" value={formData.atelier || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Modalidad</label>
              <input name="modality" value={formData.modality || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Calendario</label>
              <input name="calendario" value={formData.calendario || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Rama</label>
              <input name="rama" value={formData.rama || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">TL</label>
              <input name="tl" value={formData.tl || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Periodo</label>
            <input name="periodo" value={formData.periodo || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        {/* Institucional */}
        <div className="space-y-4 p-6 bg-white rounded-3xl border border-slate-200">
          <h4 className="text-[10px] font-black uppercase text-green-500 tracking-widest mb-4">Institucional</h4>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Cuenta Institucional</label>
            <input name="cuenta_institucional" value={formData.cuenta_institucional || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Código Estudiantil</label>
            <input name="codigo_estudiantil" value={formData.codigo_estudiantil || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Colegio</label>
            <input name="colegio" value={formData.colegio || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Programa</label>
              <input name="programa" value={formData.programa || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Raíces</label>
              <input name="programa_raices" value={formData.programa_raices || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">SIMAT</label>
            <input name="categoria_simat" value={formData.categoria_simat || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Inicio</label>
              <input name="inicio" value={formData.inicio || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Fin</label>
              <input name="fin" value={formData.fin || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Proceso</label>
              <input name="proceso" value={formData.proceso || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Dossier</label>
              <input name="dossier" value={formData.dossier || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </div>

        {/* Acudientes */}
        <div className="space-y-4 p-6 bg-white rounded-3xl border border-slate-200">
          <h4 className="text-[10px] font-black uppercase text-rose-500 tracking-widest mb-4">Acudientes</h4>
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <p className="text-[8px] font-black uppercase text-slate-400">Acudiente Académico</p>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Nombre</label>
              <input name="acudiente_academico" value={formData.acudiente_academico || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Cédula</label>
                <input name="cedula_a" value={formData.cedula_a || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Teléfono</label>
                <input name="telefono_a" value={formData.telefono_a || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Correo</label>
              <input name="correo_a" value={formData.correo_a || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[8px] font-black uppercase text-slate-400">Acudiente Secundario</p>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Nombre</label>
              <input name="acudiente_b" value={formData.acudiente_b || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Teléfono</label>
              <input name="telefono_b" value={formData.telefono_b || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Correo</label>
              <input name="correo_b" value={formData.correo_b || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </div>

        {/* Financiero */}
        <div className="space-y-4 p-6 bg-white rounded-3xl border border-slate-200">
          <h4 className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-4">Financiero</h4>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Responsable Financiero</label>
            <input name="acudiente_financiero" value={formData.acudiente_financiero || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Cédula</label>
              <input name="cedula_financiero" value={formData.cedula_financiero || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Teléfono</label>
              <input name="telefono_financiero" value={formData.telefono_financiero || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Correo</label>
            <input name="correo_financiero" value={formData.correo_financiero || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Paz y Salvo</label>
              <input name="paz_y_salvo" value={formData.paz_y_salvo || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Contrato</label>
              <input name="contrato" value={formData.contrato || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </div>

        {/* Salud y DX */}
        <div className="space-y-4 p-6 bg-white rounded-3xl border border-slate-200">
          <h4 className="text-[10px] font-black uppercase text-cyan-500 tracking-widest mb-4">Salud y DX</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">RH</label>
              <input name="rh" value={formData.rh || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Póliza</label>
              <input name="poliza" value={formData.poliza || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Activación</label>
              <input name="fecha_activacion_poliza" value={formData.fecha_activacion_poliza || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Renovación</label>
              <input name="fecha_renovacion_poliza" value={formData.fecha_renovacion_poliza || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">DX1</label>
              <input name="dx1" value={formData.dx1 || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">DX2</label>
              <input name="dx2" value={formData.dx2 || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Complemento Cualitativo</label>
            <textarea name="complemento_cualitativo" value={formData.complemento_cualitativo || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]" />
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
