# 📚 Sistema de Gestión Escolar


es una plataforma integral de gestión escolar desarrollada con **React + TypeScript** y **Supabase**, diseñada para administrar estudiantes, calificaciones, reportes académicos y comentarios de desempeño en instituciones educativas.

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Arquitectura](#arquitectura)
- [Módulos Principales](#módulos-principales)
- [Base de Datos](#base-de-datos)
- [Plantillas de Correos](#plantillas-de-correos)
- [Importación de Datos](#importación-de-datos)
- [Guía de Desarrollo](#guía-de-desarrollo)
- [Métricas y Monitoreo](#métricas-y-monitoreo)
- [Deployment](#deployment)
- [Solución de Problemas](#solución-de-problemas)

---

## ✨ Características

- ✅ **Autenticación con Google** - Integración con OAuth 2.0
- 📊 **Dashboard Interactivo** - Visualización de datos en tiempo real
- 👥 **Gestión de Estudiantes** - Crear, actualizar y archivar estudiantes
- 🎓 **Sistema de Calificaciones** - Calificaciones ponderadas y simples
- 📝 **Generación de Reportes** - Exportación de reportes en Word/PDF
- 💬 **Comentarios IA** - Sugerencias de comentarios con Gemini AI
- 👨‍🏫 **Asignaciones de Docentes** - Gestión de roles y permisos
- 📧 **Plantillas de Correos** - Personalización de comunicaciones
- 📈 **Análisis Académicos** - Periodos académicos y estaciones
- 🔒 **Control de Acceso** - Roles: Support, Grower (Docente)

---

## 🛠️ Tecnologías

### Frontend
```json
{
  "React": "19.2.4",
  "TypeScript": "5.8.2",
  "Vite": "6.2.0",
  "Tailwind CSS": "últimas versión",
  "React Router": "7.13.1",
  "Framer Motion": "12.35.0",
  "Lucide Icons": "0.563.0"
}   
```
Backend & Database
JSON
{
  "Supabase": "2.48.1",
  "PostgreSQL": "Via Supabase",
  "Realtime": "PostgreSQL Triggers"
}
Herramientas IA
JSON
{
  "Google Gemini API": "1.39.0",
  "Docxtemplater": "3.41.0",
  "PizzipJS": "3.1.4"
}
Utilidades
JSON
{
  "Date-fns": "4.1.0",
  "Recharts": "3.7.0",
  "File-saver": "2.0.5",
  "Clsx": "2.1.1"
}
📦 Requisitos Previos
Antes de iniciar, asegúrate de tener instalados:

Node.js >= 16.x
npm >= 8.x o yarn >= 1.22.x
Git
Cuenta en Supabase
Cuenta en Google Cloud Console (para OAuth)
Clave API de Google Gemini
🚀 Instalación
1. Clonar el repositorio
bash
git clone https://github.com/BrayanRicoEscole/gestion_escolar.git
cd gestion_escolar
2. Instalar dependencias
bash
npm install
# o
yarn install
3. Crear archivo de variables de entorno
bash
cp .env.example .env.local
4. Configurar variables (ver siguiente sección)
5. Ejecutar en desarrollo
bash
npm run dev
# o
yarn dev
El servidor estará disponible en http://localhost:3000

6. Build para producción
bash
npm run build
# o
yarn build
🔐 Configuración de Variables de Entorno
Crea un archivo .env.local en la raíz del proyecto con las siguientes variables:

## 🔐 Configuración de Variables de Entorno

| Variable                  | Descripción                        | Obtener                             |
| ------------------------- | ---------------------------------- | ----------------------------------- |
| VITE_SUPABASE_URL         | URL del proyecto Supabase          | Dashboard Supabase > Settings > API |
| VITE_SUPABASE_ANON_KEY    | Clave anónima de Supabase          | Dashboard Supabase > Settings > API |
| VITE_GOOGLE_CLIENT_ID     | ID de cliente OAuth de Google      | Google Cloud Console > Credenciales |
| VITE_GOOGLE_CLIENT_SECRET | Secreto OAuth de Google            | Google Cloud Console > Credenciales |
| VITE_GEMINI_API_KEY       | Clave de API de Google Gemini      | Google AI Studio                    |
| GEMINI_API_KEY            | Copia de la clave Gemini para Vite | Mismo valor anterior                |



📂 Estructura del Proyecto
gestion_escolar/
│
├── components/              # Componentes reutilizables
│   ├── FullScreenLoader.tsx
│   ├── LoginScreen.tsx
│   └── NotificationCenter.tsx
│
├── context/                 # Estado global
│   └── AuthContext.tsx
│
├── hooks/                   # Custom hooks
│   └── ...
│
├── modules/
│   ├── Dashboard/
│   ├── Students/
│   ├── Grading/
│   ├── Comments/
│   ├── Reports/
│   ├── Users/
│   └── ...
│
├── services/
│   ├── api.ts
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.api.ts
│   │   ├── grades.api.ts
│   │   ├── comments.api.ts
│   │   └── ...
│   └── mockInitialData.tsx
│
├── assets/
├── App.tsx
├── index.tsx
├── types.ts
├── styles.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── .env.example
├── .env.local
└── README.md
🏗️ Arquitectura
Diagrama General
Code
┌─────────────────────────────────────────────┐
│         🌐 FRONTEND (React + TS)            │
├─────────────────────────────────────────────┤
│  App.tsx (Rutas) → MainLayout               │
│         ↓                                    │
│  ┌──────────────────────────────────────┐   │
│  │  AuthContext (State Management)      │   │
│  │  - Usuario autenticado               │   │
│  │  - Perfil y permisos                 │   │
│  └──────────────────────────────────────┘   │
│         ↓                                    │
│  ┌──────────────────────────────────────┐   │
│  │  Módulos (Dashboard, Estudiantes...)│   │
│  │  - Components locales                │   │
│  │  - Estado local (useState)           │   │
│  └──────────────────────────────────────┘   │
│         ↓                                    │
│  ┌──────────────────────────────────────┐   │
│  │  Services (Lógica de negocio)        │   │
│  │  - API calls                         │   │
│  │  - Transformación de datos           │   │
│  └──────────────────────────────────────┘   │
└──────────────────────┬──────────────────────┘
                       │
                       ↓
        ┌──────────────────────────────┐
        │  🔗 SUPABASE (Backend)      │
        ├──────────────────────────────┤
        │ • PostgreSQL Database        │
        │ • Authentication (OAuth)     │
        │ • Row Level Security (RLS)   │
        │ • Real-time Subscriptions    │
        └──────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ↓                             ↓
   ┌─────────────┐        ┌──────────────────┐
   │ 🤖 GEMINI   │        │ 📧 EMAIL SERVICE │
   │ - Análisis  │        │ - Notificaciones │
   │ - Sugerencias        │ - Reportes       │
   └─────────────┘        └──────────────────┘
Flujo de Autenticación
Code
1. Usuario accede a la aplicación
          ↓
2. LoginScreen muestra botón "Google Login"
          ↓
3. Click → signInWithGoogle() (services/api/auth.api.ts)
          ↓
4. Redirección a Google OAuth
          ↓
5. Usuario autoriza acceso
          ↓
6. Supabase recibe token de Google
          ↓
7. AuthContext actualiza session y profile
          ↓
8. Usuario redirigido a Dashboard
          ↓
9. App valida rol (support/grower) para mostrar menú
Flujo de Calificaciones
Code
Docente accede a módulo Grading
          ↓
TeacherGradingView carga estación
          ↓
Se obtienen: Estudiantes, Asignaturas, Estructura de momentos
          ↓
Docente ingresa calificación en slot
          ↓
grades.api.saveGrade() → Guardar en DB
          ↓
Sistema calcula automáticamente:
  - Peso de sección
  - Promedio ponderado
  - Promedio global
          ↓
Notificación de éxito
📱 Módulos Principales
1️⃣ Dashboard Module
Archivo: modules/Dashboard/DashboardModule.tsx
Descripción: Panel de control con estadísticas y gráficos
Permisos: Support + Grower
Funcionalidades:
Visualización de estudiantes activos
Gráficos de rendimiento
Alertas de estaciones próximas a cerrar
2️⃣ Students Module
Archivos: modules/Students/ActiveStudentsModule.tsx, RetiredStudentsModule.tsx, AcademicRecordsModule.tsx
Descripción: Gestión de estudiantes activos, retirados y registros académicos
Permisos: Support
Funcionalidades:
CRUD de estudiantes
Importación de datos desde CSV/Excel
Historial académico
Gestión de estados (activo/retirado)
3️⃣ Grading Module
Archivos: modules/Grading/GradingModule.tsx, TeacherGradingView.tsx
Descripción: Sistema completo de calificaciones
Permisos: Support + Grower
Funcionalidades:
Ingreso de calificaciones ponderadas y simples
Cálculo automático de promedios
Selección de habilidades por estudiante
Edición y auditoría de cambios
4️⃣ Comments Module
Archivo: modules/Comments/TeacherCommentsView.tsx
Descripción: Generación de comentarios académicos con IA
Permisos: Support + Grower
Funcionalidades:
Plantillas de comentarios reutilizables
Sugerencias de Gemini AI
Aprobación de comentarios
Historial de versiones
5️⃣ Reports Module
Archivos: modules/Reports/ReportsModule.tsx, StationReportsModule.tsx
Descripción: Generación y exportación de reportes académicos
Permisos: Support
Funcionalidades:
Generación de reportes consolidados
Exportación a Word (.docx)
Validación de datos antes de generar
Historial de reportes enviados
6️⃣ Users Module
Archivos: modules/Users/UserManagementModule.tsx, GrowerAssignmentsModule.tsx
Descripción: Administración de usuarios y asignaciones
Permisos: Support
Funcionalidades:
Crear/editar/eliminar usuarios
Asignar docentes a estaciones
Gestionar permisos y roles
🗄️ Base de Datos
Esquema Principal
SQL
-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  avatar_url VARCHAR,
  role VARCHAR(20) DEFAULT 'grower', -- support | grower
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de estudiantes
CREATE TABLE students (
  id UUID PRIMARY KEY,
  full_name VARCHAR NOT NULL,
  document VARCHAR UNIQUE,
  academic_level VARCHAR,
  grade VARCHAR,
  atelier VARCHAR,
  modality VARCHAR,
  [... 20+ campos más ...]
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de años académicos
CREATE TABLE school_years (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de estaciones (periodos)
CREATE TABLE stations (
  id UUID PRIMARY KEY,
  school_year_id UUID REFERENCES school_years(id),
  name VARCHAR NOT NULL,
  weight NUMERIC(5,2),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de momentos de aprendizaje
CREATE TABLE learning_moments (
  id UUID PRIMARY KEY,
  station_id UUID REFERENCES stations(id),
  name VARCHAR NOT NULL,
  weight NUMERIC(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de asignaturas
CREATE TABLE subjects (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  area VARCHAR, -- Steam, ClePe, Onda, MEC, Convivencia
  lab VARCHAR,  -- ClePe, Onda, MEC
  station_id UUID REFERENCES stations(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de calificaciones
CREATE TABLE grades (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  subject_id UUID REFERENCES subjects(id),
  slot_id UUID,
  value NUMERIC(5,2),
  is_manual BOOLEAN DEFAULT FALSE,
  edited_by UUID REFERENCES users(id),
  edited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de comentarios
CREATE TABLE student_comments (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  station_id UUID REFERENCES stations(id),
  academic_cons TEXT,
  academic_non TEXT,
  emotional_skills TEXT,
  talents TEXT,
  social_interaction TEXT,
  challenges TEXT,
  status VARCHAR(20) DEFAULT 'draft', -- draft | analyzed | approved
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de reportes
CREATE TABLE academic_reports (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  station_id UUID REFERENCES stations(id),
  template_id UUID,
  status VARCHAR(20) DEFAULT 'pending', -- pending | generated | sent | failed
  pdf_url VARCHAR,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
Políticas de Seguridad (RLS)
SQL
-- Los usuarios pueden ver solo sus propios datos
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Los docentes (grower) pueden ver estudiantes asignados
CREATE POLICY "Growers can view assigned students"
  ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM grower_assignments ga
      WHERE ga.grower_id = auth.uid()
    )
  );

-- Solo support puede modificar estudiantes
CREATE POLICY "Only support can modify students"
  ON students FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'support'
    )
  );
Relaciones Principales
Code
users (1) ──┬─→ (N) grower_assignments
            ├─→ (N) grades (edited_by)
            └─→ (N) student_comments (created_by)

students (1) ──┬─→ (N) grades
               ├─→ (N) student_comments
               └─→ (N) academic_records

school_years (1) ─→ (N) stations

stations (1) ──┬─→ (N) learning_moments
               ├─→ (N) subjects
               └─→ (N) grower_assignments

subjects (1) ─→ (N) grades
📧 Plantillas de Correos
Ubicación
Ruta: services/api/templates.api.ts
Almacenamiento: Supabase Storage templates/ o Base de datos
Estructura de Plantilla
TypeScript
interface ReportTemplate {
  id: string;
  name: string;
  file_url: string;  // Ruta al archivo .docx
  variables: string[]; // Variables disponibles para reemplazar
  created_at: string;
}
Variables Disponibles
Code
{student_name}          - Nombre del estudiante
{student_document}      - Documento/Cédula
{academic_level}        - Nivel académico
{grade}                 - Grado
{atelier}               - Atelier
{station_name}          - Nombre de la estación
{school_year}           - Año académico
{final_grade}           - Calificación final
{comments}              - Comentarios académicos
{skills}                - Habilidades desarrolladas
{teacher_name}          - Nombre del docente
{school_name}           - Nombre de la institución
{current_date}          - Fecha actual
{period}                - Periodo (trimestre, semestre)
Actualizar Plantilla de Correos
Editar plantilla en Word:

Abrir templates/reporte_academico.docx
Reemplazar contenido manteniendo las variables entre {}
Subir a Supabase Storage:

TypeScript
const { data, error } = await supabase.storage
  .from('templates')
  .update('reporte_academico.docx', file);
Actualizar en base de datos:

TypeScript
const { error } = await supabase
  .from('report_templates')
  .update({ file_url: data.path })
  .eq('id', templateId);
Generar Reporte desde Plantilla
TypeScript
// Usar docxtemplater para reemplazar variables
const { Document, Packer } = require('docxtemplater');
const PizZip = require('pizzip');

async function generateReport(templateFile, variables) {
  const content = await templateFile.arrayBuffer();
  const zip = new PizZip(content);
  const doc = new Document({ zip });
  
  doc.setData(variables);
  doc.render();
  
  const blob = await Packer.toBlob(doc);
  return blob;
}
📥 Importación de Datos
Formatos Soportados
CSV
Excel (.xlsx)
JSON
Estructura de Importación
Importar Estudiantes
Formato CSV/Excel:

CSV
full_name,document,academic_level,grade,atelier,modality,colegio,programa
"Juan Pérez","123456789","Primaria","4","Atelier Alhambra (A)","Presencial","Colegio A","STEAM"
"María López","987654321","Primaria","5","Atelier Casa (C)","Virtual","Colegio B","ClePe"
Código de importación:

TypeScript
async function importStudents(file: File) {
  const data = await parseCSV(file);
  
  const { data: result, error } = await supabase
    .from('students')
    .insert(data);
    
  if (error) throw new Error(error.message);
  return result;
}
Importar Calificaciones
Estructura JSON:

JSON
[
  {
    "student_id": "uuid-1",
    "subject_id": "uuid-2",
    "slot_id": "uuid-3",
    "value": 95,
    "station_id": "uuid-4"
  }
]
Validaciones:

Todos los IDs deben existir
Valores entre 0-100
No permitir duplicados
🔧 Guía de Desarrollo
Crear Nuevo Módulo
Crear estructura:

bash
mkdir -p modules/NewModule/components
touch modules/NewModule/NewModule.tsx
touch modules/NewModule/components/Component.tsx
Crear tipos en types.ts:

TypeScript
export interface NewEntity {
  id: string;
  name: string;
  // ... campos
}
Crear servicio API en services/api/newEntity.api.ts:

TypeScript
import { supabase } from './client';

export const newEntityApi = {
  async fetchAll() {
    const { data, error } = await supabase
      .from('new_entities')
      .select('*');
    if (error) throw error;
    return data;
  },
  
  async create(entity: NewEntity) {
    const { data, error } = await supabase
      .from('new_entities')
      .insert([entity])
      .select();
    if (error) throw error;
    return data[0];
  }
};
Exportar en services/api.ts:

TypeScript
export * from './api/newEntity.api';
Crear componente:

TypeScript
import React, { useState, useEffect } from 'react';
import { newEntityApi } from '../../services/api';
import { NewEntity } from '../../types';

export const NewModule: React.FC = () => {
  const [entities, setEntities] = useState<NewEntity[]>([]);
  
  useEffect(() => {
    newEntityApi.fetchAll().then(setEntities);
  }, []);
  
  return (
    <div>
      {/* UI here */}
    </div>
  );
};
Agregar ruta en App.tsx:

TypeScript
const NewModule = lazy(() => 
  import('./modules/New/NewModule').then(m => ({ default: m.NewModule }))
);

// En rutas:
<Route path="/new-path" element={<NewModule />} />
Comandos Útiles
bash
# Desarrollo
npm run dev              # Iniciar servidor Vite
npm run lint            # Verificar tipos TS
npm run build           # Build para producción

# Debugging
npm run preview         # Previsualizar build

# Actualizar dependencias
npm update              # Actualizar paquetes
npm audit fix           # Corregir vulnerabilidades
Convenciones de Código
TypeScript
// Nombres de archivos: PascalCase para componentes, camelCase para servicios
ComponentName.tsx
serviceName.api.ts

// Imports organizados
import React from 'react';
import { OtherComponent } from '../path';
import { supabase } from '../services/api/client';
import { TypeName } from '../types';
import { utilFunction } from '../utils';

// Componentes funcionales con FC
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  return <div>{prop1}</div>;
};

// Manejo de errores
try {
  const result = await apiCall();
} catch (error) {
  console.error('Error in apiCall:', error);
  showErrorNotification('Error message');
}
📊 Métricas y Monitoreo
Puntos de Monitoreo Clave
1. Autenticación
TypeScript
// Registrar login
console.log('User logged in:', {
  user_id: user.id,
  email: user.email,
  timestamp: new Date()
});
2. Calificaciones
TypeScript
// Registrar cambios de calificaciones
const logGradeChange = {
  student_id: gradeEntry.studentId,
  old_value: previousValue,
  new_value: gradeEntry.value,
  edited_by: currentUser.id,
  edited_at: new Date(),
  is_manual: true
};
3. Reportes Generados
TypeScript
// Tracking de reportes
const reportMetric = {
  report_id: report.id,
  student_id: report.student_id,
  status: 'generated',
  generation_time_ms: Date.now() - startTime,
  page_count: pdfPages
};
4. Errores y Excepciones
TypeScript
const errorLog = {
  error_type: error.name,
  error_message: error.message,
  stack_trace: error.stack,
  user_id: currentUser?.id,
  module: 'GradingModule',
  timestamp: new Date()
};
Dashboard de Métricas
Indicadores principales:

✅ Usuarios activos por módulo
📈 Calificaciones ingresadas (diarias/mensuales)
📊 Reportes generados
⏱️ Tiempo de respuesta de APIs
❌ Tasa de errores
💬 Comentarios generados con IA
🎓 Estudiantes por nivel académico
Integración con Analytics
TypeScript
// Ejemplo con Google Analytics
import { useEffect } from 'react';

export const usePageTracking = (pageName: string) => {
  useEffect(() => {
    window.gtag?.('config', 'GA_MEASUREMENT_ID', {
      page_path: pageName,
      page_title: pageName
    });
  }, [pageName]);
};
🚀 Deployment
Preparación Previa
 Revisar todas las variables de entorno
 Ejecutar linting: npm run lint
 Build exitoso: npm run build
 Pruebas funcionales en staging
Opciones de Deployment
Opción 1: Vercel (Recomendado)
bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
Configurar variables en Vercel Dashboard:

Settings > Environment Variables
Agregar todas las variables de .env.local
Opción 2: Netlify
bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
Opción 3: Docker (Producción)
Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
bash
# Build
docker build -t gestion-escolar .

# Run
docker run -p 3000:3000 \
  -e VITE_SUPABASE_URL=... \
  -e VITE_SUPABASE_ANON_KEY=... \
  gestion-escolar
Checklist de Seguridad
 HTTPS habilitado
 CORS configurado correctamente
 Variables sensibles no en código fuente
 Row Level Security (RLS) activo en Supabase
 Backups automáticos en base de datos
 Rate limiting en APIs
🐛 Solución de Problemas
Errores Comunes
1. "VITE_SUPABASE_URL is not defined"
Solución:

Verificar que .env.local existe
Verificar que Vite puede acceder a variables con VITE_ prefix
Reiniciar servidor: npm run dev
2. "Unauthorized (401)" en llamadas API
Solución:

Verificar sesión activa: useAuth() en contexto
Validar que usuario tiene rol correcto
Verificar RLS policies en Supabase
3. Calificaciones no guardan
Solución:

TypeScript
// Verificar conexión a DB
const { data, error } = await supabase
  .from('grades')
  .select('count')
  .limit(1);
console.log('DB connected:', !error);

// Verificar permisos
console.log('User role:', profile?.role);
4. Gemini API no responde
Solución:

TypeScript
// Verificar clave API
console.log('API Key valid:', !!process.env.VITE_GEMINI_API_KEY);

// Verificar cuota
// Dashboard Google AI Studio > Usage
5. Reportes generados vacíos
Solución:

Verificar que variables existen en datos
Validar sintaxis de template: {variable_name}
Revisar permisos de archivo en Supabase Storage
Logs y Debugging
TypeScript
// Verificar estado de autenticación
localStorage.setItem('debug', 'true');

// En console
const { data: { user } } = await supabase.auth.getUser();
console.log(user);

// Verificar datos de usuario
const { profile } = useAuth();
console.log('Profile:', profile);

// Queries de Supabase
const { data, error } = await supabase
  .from('students')
  .select('*')
  .limit(1);
console.log(data, error);
Comandos de Soporte
bash
# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Diagnosticar conflictos de dependencias
npm audit

# Ver versión actual
npm list

# Actualizar a versión específica
npm install package@version
