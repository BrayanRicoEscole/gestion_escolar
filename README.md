# 📚  Sistema de Gestión Escolar

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
- React 19.2.4
- TypeScript 5.8.2
- Vite 6.2.0
- Tailwind CSS
- React Router 7.13.1
- Framer Motion 12.35.0
- Lucide Icons 0.563.0

### Backend & Database
- Supabase 2.48.1
- PostgreSQL (vía Supabase)
- Real-time PostgreSQL Triggers

### Herramientas IA
- Google Gemini API 1.39.0
- Docxtemplater 3.41.0
- PizzipJS 3.1.4

### Utilidades
- Date-fns 4.1.0
- Recharts 3.7.0
- File-saver 2.0.5
- Clsx 2.1.1

---

## 📦 Requisitos Previos

Antes de iniciar, asegúrate de tener instalados:

- **Node.js** >= 16.x
- **npm** >= 8.x o **yarn** >= 1.22.x
- **Git**
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Google Cloud Console](https://console.cloud.google.com) (para OAuth)
- Clave API de [Google Gemini](https://ai.google.dev)

---
📝 Descripción de Variables

| Variable                  | Descripción                        | Obtener                             |
| ------------------------- | ---------------------------------- | ----------------------------------- |
| VITE_SUPABASE_URL         | URL del proyecto Supabase          | Dashboard Supabase > Settings > API |
| VITE_SUPABASE_ANON_KEY    | Clave anónima de Supabase          | Dashboard Supabase > Settings > API |
| VITE_GOOGLE_CLIENT_ID     | ID de cliente OAuth de Google      | Google Cloud Console > Credenciales |
| VITE_GOOGLE_CLIENT_SECRET | Secreto OAuth de Google            | Google Cloud Console > Credenciales |
| VITE_GEMINI_API_KEY       | Clave de API de Google Gemini      | Google AI Studio                    |
| GEMINI_API_KEY            | Copia de la clave Gemini para Vite | Mismo valor anterior                |


📂 Estructura del Proyecto
```
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
```

🏗️ Arquitectura

```
┌─────────────────────────────────────────────┐
│         🌐 FRONTEND (React + TS)            │
├─────────────────────────────────────────────┤
│  App.tsx (Rutas) → MainLayout               │
│         ↓                                    │
│  AuthContext (State Management)             │
│         ↓                                    │
│  Modules (Dashboard, Estudiantes, etc.)     │
│         ↓                                    │
│  Services (Lógica de negocio)               │
└──────────────────────┬──────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  🔗 SUPABASE (Backend)      │
        ├─────────────────────────────┤
        │ • PostgreSQL Database       │
        │ • Authentication (OAuth)    │
        │ • Row Level Security (RLS)  │
        │ • Real-time Subscriptions   │
        └──────────────┬──────────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
   🤖 GEMINI API          📧 EMAIL SERVICE

   ```
---

## 📱 Módulos Principales
## 1️⃣ Dashboard Module
Archivo: modules/Dashboard/DashboardModule.tsx
Descripción: Panel de control con estadísticas y gráficos
Permisos: Support + Grower

Funcionalidades:

Visualización de estudiantes activos
Gráficos de rendimiento
Alertas de estaciones próximas a cerrar
## 2️⃣ Students Module
Archivos:
modules/Students/ActiveStudentsModule.tsx
modules/Students/RetiredStudentsModule.tsx
modules/Students/AcademicRecordsModule.tsx
Descripción: Gestión de estudiantes activos, retirados y registros académicos
Permisos: Support

Funcionalidades:

CRUD de estudiantes
Importación de datos desde CSV/Excel
Historial académico
Gestión de estados (activo/retirado)
## 3️⃣ Grading Module
Archivos:
modules/Grading/GradingModule.tsx
modules/Grading/TeacherGradingView.tsx
Descripción: Sistema completo de calificaciones
Permisos: Support + Grower

Funcionalidades:

Ingreso de calificaciones ponderadas y simples
Cálculo automático de promedios
Selección de habilidades por estudiante
Edición y auditoría de cambios
## 4️⃣ Comments Module
Archivo: modules/Comments/TeacherCommentsView.tsx
Descripción: Generación de comentarios académicos con IA
Permisos: Support + Grower

Funcionalidades:

Plantillas de comentarios reutilizables
Sugerencias de Gemini AI
Aprobación de comentarios
Historial de versiones
## 5️⃣ Reports Module
Archivos:
modules/Reports/ReportsModule.tsx
modules/Reports/StationReportsModule.tsx
Descripción: Generación y exportación de reportes académicos
Permisos: Support

Funcionalidades:

Generación de reportes consolidados
Exportación a Word (.docx)
Validación de datos antes de generar
Historial de reportes enviados
6️⃣ Users Module
Archivos:
modules/Users/UserManagementModule.tsx
modules/Users/GrowerAssignmentsModule.tsx
Descripción: Administración de usuarios y asignaciones
Permisos: Support

Funcionalidades:

Crear/editar/eliminar usuarios
Asignar docentes a estaciones
Gestionar permisos y roles


---

## 🗄️ Base de Datos

## Esquema Principal

```SQL
-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  avatar_url VARCHAR,
  role VARCHAR(20) DEFAULT 'grower',
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
  status VARCHAR(20) DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de reportes
CREATE TABLE academic_reports (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  station_id UUID REFERENCES stations(id),
  template_id UUID,
  status VARCHAR(20) DEFAULT 'pending',
  pdf_url VARCHAR,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📧 Plantillas de Correos

**Ubicación**
  - Ruta: services/api/templates.api.ts
  - Almacenamiento: Supabase Storage templates/ o Base de datos

Variables Disponibles

```code
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
```

## Actualizar Plantilla de Correos

1. Editar plantilla en Word:
  - Abrir templates/reporte_academico.docx
  - Reemplazar contenido manteniendo las variables entre {}
2. Subir a Supabase Storage:

```typescript
const { data, error } = await supabase.storage
  .from('templates')
  .update('reporte_academico.docx', file);
```

3. Actualizar en base de datos:
```typescript
const { error } = await supabase
  .from('report_templates')
  .update({ file_url: data.path })
  .eq('id', templateId);
```
Generar Reporte desde Plantilla

```typescript
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
```
---

## 📥 Importación de Datos

## Formatos Soportados

  - CSV
  - Excel (.xlsx)
  - JSON

## Importar Estudiantes
Formato CSV/Excel:

```csv
full_name,document,academic_level,grade,atelier,modality,colegio
"Juan Pérez","123456789","Primaria","4","Atelier Alhambra (A)","Presencial","Colegio A"
"María López","987654321","Primaria","5","Atelier Casa (C)","Virtual","Colegio B"
```

Código de importación:

```typescript
async function importStudents(file: File) {
  const data = await parseCSV(file);
  
  const { data: result, error } = await supabase
    .from('students')
    .insert(data);
    
  if (error) throw new Error(error.message);
  return result;
}
```

##Importar Calificaciones

Estructura JSON:

```json
[
  {
    "student_id": "uuid-1",
    "subject_id": "uuid-2",
    "slot_id": "uuid-3",
    "value": 95,
    "station_id": "uuid-4"
  }
]
```

Validaciones:
 - Todos los IDs deben existir
 - Valores entre 0-100
 - No permitir duplicados

---

## 🔧 Guía de Desarrollo

Crear Nuevo Módulo

1. Crear estructura:

```bash
mkdir -p modules/NewModule/components
touch modules/NewModule/NewModule.tsx
```

2. Crear tipos en types.ts:
```typescript
export interface NewEntity {
  id: string;
  name: string;
}
```
3. Crear servicio API en services/api/newEntity.api.ts:
```typescript
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
```
4. Exportar en services/api.ts:
```typescript
export * from './api/newEntity.api';
```
5. Agregar ruta en App.tsx:
```typescript
const NewModule = lazy(() => 
  import('./modules/New/NewModule').then(m => ({ default: m.NewModule }))
);
<Route path="/new-path" element={<NewModule />} />
```

## Comandos Útiles

```bash
npm run dev              # Iniciar servidor Vite
npm run lint            # Verificar tipos TS
npm run build           # Build para producción
npm run preview         # Previsualizar build
npm update              # Actualizar paquetes
npm audit fix           # Corregir vulnerabilidades
```

## Convenciones de Código

```typescript
// Nombres de archivos: PascalCase para componentes
ComponentName.tsx
serviceName.api.ts

// Imports organizados
import React from 'react';
import { OtherComponent } from '../path';
import { supabase } from '../services/api/client';
import { TypeName } from '../types';

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
```

---

## 📊 Métricas y Monitoreo

Puntos de Monitoreo Clave

Autenticación

```typescript
console.log('User logged in:', {
  user_id: user.id,
  email: user.email,
  timestamp: new Date()
});
```

Calificaciones

```typescript
const logGradeChange = {
  student_id: gradeEntry.studentId,
  old_value: previousValue,
  new_value: gradeEntry.value,
  edited_by: currentUser.id,
  edited_at: new Date(),
  is_manual: true
};

```

Reportes Generados

```typescript
const reportMetric = {
  report_id: report.id,
  student_id: report.student_id,
  status: 'generated',
  generation_time_ms: Date.now() - startTime,
  page_count: pdfPages
};
```

Errores y Excepciones

```typescript
const errorLog = {
  error_type: error.name,
  error_message: error.message,
  stack_trace: error.stack,
  user_id: currentUser?.id,
  module: 'GradingModule',
  timestamp: new Date()
};
```
---

## Dashboard de Métricas

Indicadores principales:

- ✅ Usuarios activos por módulo
- 📈 Calificaciones ingresadas (diarias/mensuales)
- 📊 Reportes generados
- ⏱️ Tiempo de respuesta de APIs
- ❌ Tasa de errores
- 💬 Comentarios generados con IA
- 🎓 Estudiantes por nivel académico
--
## Errores Comunes

1. "VITE_SUPABASE_URL is not defined"
    - Verificar que .env.local existe
    - Verificar que Vite puede acceder a variables con VITE_ prefix
    - Reiniciar servidor: npm run dev
2. "Unauthorized (401)" en llamadas API
    - Verificar sesión activa con useAuth() en contexto
    - Validar que usuario tiene rol correcto
    - Verificar RLS policies en Supabase
3. Gemini API no responde
    - Verificar clave API: console.log('API Key valid:', !!process.env.VITE_GEMINI_API_KEY);
    - Verificar cuota en Dashboard Google AI Studio > Usage
4. Reportes generados vacíos
    - Verificar que variables existen en datos
    - Validar sintaxis de template: {variable_name}
    - Revisar permisos de archivo en Supabase Storage

## Logs y Debugging

```typescript
// Verificar estado de autenticación
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
```

## Comandos de Soporte

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm audit
npm list
npm install package@version
```
