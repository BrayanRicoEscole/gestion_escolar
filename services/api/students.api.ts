
import { supabase } from './client';
import { Student } from 'types';
import { chunkArray } from './utils';

export const getStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('full_name');

  if (error) throw error;

  return (data || []).map(s => ({
    id: s.id,
    full_name: s.full_name,
    document: s.document,
    avatar_url: s.avatar_url,
    academic_level: s.academic_level,
    grade: s.grade,
    atelier: s.atelier,
    modality: s.modality,
    calendario: s.calendario,
    calendario_grupo: s.calendario_grupo,
    colegio: s.colegio,
    rama: s.rama,
    tl: s.tl,
    contrato: s.contrato,
    periodo: s.periodo,
    cuenta_institucional: s.cuenta_institucional,
    nacimiento: s.nacimiento,
    edad: s.edad,
    rh: s.rh,
    programa_raices: s.programa_raices,
    categoria_simat: s.categoria_simat,
    dx1: s.dx1,
    dx2: s.dx2,
    complemento_cualitativo: s.complemento_cualitativo,
    programa: s.programa,
    estado_actual: s.estado_actual,
    inicio: s.inicio,
    fin: s.fin,
    // Nuevos campos mapeados
    tipo_id_estudiante: s.tipo_id_estudiante,
    cedula_a: s.cedula_a,
    acudiente_academico: s.acudiente_academico,
    correo_a: s.correo_a,
    telefono_a: s.telefono_a,
    acudiente_b: s.acudiente_b,
    correo_b: s.correo_b,
    telefono_b: s.telefono_b,
    cedula_financiero: s.cedula_financiero,
    acudiente_financiero: s.acudiente_financiero,
    correo_financiero: s.correo_financiero,
    telefono_financiero: s.telefono_financiero,
    lugar_nacimiento: s.lugar_nacimiento,
    fecha_expedicion: s.fecha_expedicion,
    lugar_expedicion: s.lugar_expedicion,
    genero: s.genero,
    proceso: s.proceso,
    dossier: s.dossier,
    paz_y_salvo: s.paz_y_salvo,
    codigo_estudiantil: s.codigo_estudiantil,
    poliza: s.poliza,
    fecha_activacion_poliza: s.fecha_activacion_poliza,
    fecha_renovacion_poliza: s.fecha_renovacion_poliza
  }));
};

export const syncStudentsFromSpreadsheet = async (
  csvData: any[]
): Promise<{ success: number; errors: number }> => {
  const mapped = csvData
    .map(row => ({
      document: String(row['ID'] || '').trim(),
      full_name: String(row['Seed'] || '').trim(),
      academic_level: String(row['Grupo'] || '').trim(),
      grade: String(row['Grado'] || '').trim(),
      calendario: String(row['Calendario'] || '').trim(),
      calendario_grupo: String(row['Calendario grupo'] || '').trim(),
      modality: String(row['Modalidad'] || '').trim(),
      atelier: String(row['Atelier'] || '').trim(),
      colegio: String(row['Colegio'] || '').trim(),
      rama: String(row['Rama'] || '').trim(),
      tl: String(row['TL'] || '').trim(),
      contrato: String(row['contrato'] || '').trim(),
      periodo: String(row['Periodo'] || '').trim(),
      cuenta_institucional: String(row['Cuenta institucional'] || '').trim(),
      nacimiento: String(row['Nacimiento'] || '').trim(),
      edad: String(row['Edad'] || '').trim(),
      rh: String(row['RH'] || '').trim(),
      programa_raices: String(row['Programa Raices'] || '').trim(),
      categoria_simat: String(row['Categoría Simat'] || '').trim(),
      dx1: String(row['DX1'] || '').trim(), 
      dx2: String(row['DX2'] || '').trim(), 
      complemento_cualitativo: String(row['Complemento Cualitativo'] || '').trim(), 
      programa: String(row['Programa'] || '').trim(), 
      estado_actual: String(row['Estado actual'] || '').trim(), 
      inicio: String(row['Inicio'] || '').trim(), 
      fin: String(row['Fin'] || '').trim(), 
      tipo_id_estudiante: String(row['Tipo ID estudiante'] || '').trim(), 
      cedula_a: String(row['Cédula A'] || '').trim(), 
      acudiente_academico: String(row['Acudiente Académico'] || '').trim(), 
      correo_a: String(row['Correo A'] || '').trim(), 
      telefono_a: String(row['Teléfono A'] || '').trim(), 
      acudiente_b: String(row['Acudiente B'] || '').trim(), 
      correo_b: String(row['Correo B'] || '').trim(), 
      telefono_b: String(row['Teléfono B'] || '').trim(), 
      cedula_financiero: String(row['Cédula financiero'] || '').trim(), 
      acudiente_financiero: String(row['Acudiente financiero'] || '').trim(), 
      correo_financiero: String(row['Correo financiero'] || '').trim(), 
      telefono_financiero: String(row['Teléfono financiero'] || '').trim(), 
      lugar_nacimiento: String(row['Lugar de nacimiento'] || '').trim(), 
      fecha_expedicion: String(row['Fecha de expedición'] || '').trim(), 
      lugar_expedicion: String(row['Lugar de expedición'] || '').trim(), 
      genero: String(row['Genero'] || '').trim(), 
      proceso: String(row['Proceso'] || '').trim(), 
      dossier: String(row['Dossier'] || '').trim(), 
      paz_y_salvo: String(row['Paz y Salvo'] || '').trim(), 
      codigo_estudiantil: String(row['Código Estudiantil'] || '').trim(), 
      poliza: String(row['Poliza'] || '').trim(), 
      fecha_activacion_poliza: String(row['Fecha activación poliza'] || '').trim(), 
      fecha_renovacion_poliza: String(row['Fecha renovación poliza'] || '').trim()
    }))
    .filter(s => s.document && s.full_name);

  let success = 0;
  let errors = 0;

  for (const chunk of chunkArray(mapped, 50)) {
    const { error } = await supabase
      .from('students')
      .upsert(chunk, { onConflict: 'document' });

    if (error) errors += chunk.length;
    else success += chunk.length;
  }

  return { success, errors };
};
