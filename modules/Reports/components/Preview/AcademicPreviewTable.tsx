
import React from 'react';
import { Layers, FlaskConical, Target } from 'lucide-react';

const MomentStatusCell = ({ status }: { status: string }) => (
  <td className="px-4 py-6 border-r border-slate-100 text-center">
    <span className={`text-[8px] font-black uppercase tracking-widest ${
      status === 'Consolidado' ? 'text-green-600' : status === 'No Consolidado' ? 'text-rose-600' : 'text-slate-400'
    }`}>
      {status}
    </span>
  </td>
);

export const AcademicPreviewTable: React.FC = () => {
  const moments = ['Momento 1', 'Momento 2', 'Momento 3', 'Momento 4'];

  return (
    <div className="mt-20 space-y-8">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
        <Layers className="text-primary" size={24} />
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Previsualización de Estructura de Tabla</h2>
      </div>

      <div className="bg-white rounded-[3.5rem] border-2 border-slate-100 shadow-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-8 border-r border-slate-100 w-64 text-sm font-black text-slate-800">Área</th>
              <th colSpan={4} className="p-6 border-r border-slate-100 text-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">MOMENTOS DE APRENDIZAJE</th>
              <th className="p-8 text-center text-sm font-black text-slate-800">Valoración</th>
            </tr>
            <tr className="bg-slate-50/50">
              <th className="border-r border-slate-100"></th>
              {moments.map(m => (
                <th key={m} className="p-4 border-r border-slate-100 text-center text-[9px] font-black uppercase text-slate-400">
                  {m} <br/> <span className="text-primary opacity-60">25%</span>
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-primary/5">
              <td colSpan={6} className="px-8 py-5 border-y border-slate-100">
                <div className="flex items-center gap-3">
                  <FlaskConical size={18} className="text-primary" />
                  <span className="text-sm font-black text-primary uppercase tracking-widest">LABORATORIO CLEPE</span>
                </div>
              </td>
            </tr>
            <tr className="bg-slate-50/30">
              <td colSpan={6} className="px-12 py-3 border-b border-slate-100">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CUERPO, LETRAS Y PENSAMIENTO</span>
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="px-14 py-6 border-r border-slate-100">
                <p className="text-xs font-black text-slate-700">Lenguaje Creativo</p>
              </td>
              <MomentStatusCell status="Consolidado" />
              <MomentStatusCell status="Consolidado" />
              <MomentStatusCell status="No Consolidado" />
              <MomentStatusCell status="Pendiente" />
              <td className="px-8 py-6 text-center">
                <span className="text-lg font-black text-primary">3.5</span>
              </td>
            </tr>
            <tr className="bg-slate-50/20">
              <td className="px-14 py-6 border-r border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Habilidades</span>
                </div>
              </td>
              <td colSpan={5} className="px-10 py-6">
                <p className="text-xs font-bold text-slate-600 leading-relaxed max-w-4xl">
                  Habilidades de la seed en Lenguaje Creativo: Reconoce estructuras gramaticales complejas, participa activamente en los talleres de escritura y lidera procesos de retroalimentación entre pares.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
