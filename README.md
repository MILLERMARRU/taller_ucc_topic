# Sistema de Historial Clínico — UCSS Topic

Aplicación web para la gestión de pacientes, registro de consultas médicas y generación de reportes en PDF/Word. Construida con Next.js (App Router), Tailwind CSS v4 y Supabase (Auth + Postgres).

- Demo local: http://localhost:3000
- Acceso por correo/contraseña (Supabase Auth)

## Tabla de contenidos
- [Stack](#stack)
- [Arquitectura y módulos](#arquitectura-y-módulos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Configuración](#configuración)
  - [Variables de entorno](#variables-de-entorno)
  - [Base de datos (Supabase)](#base-de-datos-supabase)
- [Scripts](#scripts)
- [Flujos clave](#flujos-clave)
- [Exportación de reportes](#exportación-de-reportes)
- [Buenas prácticas y seguridad](#buenas-prácticas-y-seguridad)
- [Problemas comunes](#problemas-comunes)

## Stack
- Frontend: Next.js 15 (App Router) + React 19
- Estilos: Tailwind CSS v4
- UI/Íconos: lucide-react
- Datos y Auth: Supabase (@supabase/supabase-js v2)
- Tablas: @tanstack/react-table
- Exportación: jspdf (PDF), docx + file-saver (Word)
- Linting/TS: ESLint 9 + TypeScript 5

## Arquitectura y módulos
- Autenticación: `app/(auth)/login` con `supabase.auth.signInWithPassword`.
- Panel principal: `app/admin` con navegación a:
  - Pacientes: listado/alta de pacientes y responsables.
  - Consultas: vista agrupada por paciente + estadísticas (hoy/semana/mes).
  - Historiales: resumen por paciente, búsqueda por nombre/DNI y exportación.
- Detalle de historial: `app/admin/historiales/histo/[id]` con antecedentes y consultas, y botón para crear nueva consulta.
- Nueva consulta: `app/admin/consultas/nueva/[id]` con signos vitales, examen físico, diagnóstico, medicamentos e indicaciones.
- Exportadores: `components/export-pdf-button.tsx` y `components/export-word-button.tsx`.
- Cliente de datos: `lib/supabase.ts`.

## Estructura del proyecto
```
app/
  (auth)/login/page.tsx         # Login
  admin/
    layout.tsx                  # Navbar + layout
    page.tsx                    # Dashboard
    pacientes/page.tsx          # Listado y alta (modal)
    consultas/page.tsx          # Consultas agrupadas + stats
    consultas/nueva/[id]/page.tsx
    historiales/page.tsx        # Listado + búsqueda + exportación
    historiales/histo/[id]/page.tsx
components/
  navbar.tsx
  form-consulta.tsx
  detail-historial.tsx
  export-pdf-button.tsx
  export-word-button.tsx
  modals/modal-register-patient.tsx
lib/supabase.ts
public/img/
styles: app/globals.css
configuración: next.config.ts, tsconfig.json, eslint.config.mjs, postcss.config.mjs
```

## Configuración
Requisitos:
- Node.js >= 18 (LTS recomendado)
- NPM (o el gestor que prefieras)
- Cuenta de Supabase con un proyecto activo

Instalación de dependencias:
```bash
npm install
```

Desarrollo local:
```bash
npm run dev
# abre http://localhost:3000
```

### Variables de entorno
Crea `.env.local` en la raíz con tus credenciales de Supabase:
```bash
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```
Nunca publiques estas claves. En producción usa variables seguras del proveedor (Vercel, etc.).

### Base de datos (Supabase)
El código usa tres tablas principales y relaciones:

- pacientes (PK: id_paciente)
- antecedentes (FK: id_paciente → pacientes.id_paciente)
- consultas  (FK: id_paciente → pacientes.id_paciente)

Esquema sugerido (ajústalo si ya tienes uno):
```sql
-- pacientes
create table if not exists public.pacientes (
  id_paciente          bigserial primary key,
  nombre               text not null,
  dni                  varchar(8) not null,
  fecha_nacimiento     date not null,
  edad                 int not null,
  sexo                 text not null,               -- "Masculino" | "Femenino"
  raza                 text,
  telefono             text,
  estado_civil         text,                        -- Soltero/Casado/Divorciado/Viudo
  lugar_nacimiento     text,
  grado_instruccion    text,                        -- Primaria/Secundaria/Tecnico/Superior
  domicilio_actual     text,
  lugar_procedencia    text,
  tiempo_procedencia   text,
  tipo_seguro          text,                        -- SIS/EsSalud/Privado/Ninguno
  persona_responsable  text,
  dni_responsable      text,
  celular_responsable  text,
  direccion_responsable text,
  estado               text
);

-- antecedentes (uno a uno por paciente)
create table if not exists public.antecedentes (
  id_antecedente       bigserial primary key,
  id_paciente          bigint not null references public.pacientes(id_paciente) on delete cascade,
  ocupacion            text,
  religion             text,
  tabaquismo           text,
  alcoholismo          text,
  drogas               text,
  alimentacion         text,
  actividad_fisica     text,
  inmunizaciones       text,
  diagnostico_previo   text,
  enfermedades_infancia text,
  cirugias_previas     text,
  alergias             text,
  medicamentos_actuales text,
  menarca              text,
  ritmo_menstrual      text,
  uso_anticonceptivos  text,
  numero_embarazos     int
);

-- consultas (n a 1 paciente)
create table if not exists public.consultas (
  id_consulta          bigserial primary key,
  id_paciente          bigint not null references public.pacientes(id_paciente) on delete cascade,
  fecha                date not null,
  hora                 time not null,
  motivo_consulta      text,
  presion_arterial     text,
  pulso                int,
  temperatura          numeric,
  saturacion_o2        numeric,
  peso                 numeric,
  talla                numeric,
  examen_fisico        text,
  diagnostico          text,
  medicamentos         text,
  indicaciones         text
);
```
Relaciones usadas desde el frontend:
- `pacientes` ↔ `antecedentes` (select anidado)
- `pacientes` ↔ `consultas` (select anidado y consultas por paciente)

Row Level Security (RLS) recomendado para usuarios autenticados:
```sql
alter table public.pacientes enable row level security;
alter table public.antecedentes enable row level security;
alter table public.consultas enable row level security;

create policy "lectura-escritura-autenticados" on public.pacientes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "lectura-escritura-autenticados" on public.antecedentes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "lectura-escritura-autenticados" on public.consultas
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```
Crea al menos un usuario de prueba en Supabase Auth para iniciar sesión.

## Scripts
- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run start` — servir build
- `npm run lint` — ejecutar ESLint

## Flujos clave
- Iniciar sesión: `/login` → correo/contraseña (Supabase Auth).
- Dashboard `/admin`: enlaces a Pacientes, Consultas e Historiales.
- Pacientes:
  - Modal de alta en `components/modals/modal-register-patient.tsx` crea registro en `pacientes` y su `antecedentes` asociado.
- Consultas:
  - `/admin/consultas` muestra la última consulta por paciente y estadísticas (hoy/7 días/30 días).
  - `/admin/consultas/nueva/[id]` registra consulta con signos vitales, examen físico, diagnóstico, medicamentos e indicaciones.
- Historiales:
  - `/admin/historiales` lista pacientes con totales y última consulta, búsqueda por nombre/DNI.
  - `/admin/historiales/histo/[id]` detalle completo por paciente + botón “Nueva Consulta”.

## Exportación de reportes
- PDF: `components/export-pdf-button.tsx` genera `historial_<dni>.pdf` con jsPDF.
- Word: `components/export-word-button.tsx` genera `Historial_<nombre>.docx` con `docx` + `file-saver`.
- En el detalle del historial se ofrecen ambos botones y también pueden usarse desde listados.

## Buenas prácticas y seguridad
- No subas `.env.local` al repositorio.
- Revisa tus políticas RLS antes de producción.
- Valida entradas críticas (p. ej., DNI) desde el cliente y, si es posible, también en la base de datos.
- Mantén actualizado `@supabase/supabase-js` y Next.js.

## Problemas comunes
- 401/403 en Supabase: verifica que iniciaste sesión y que RLS permite la operación.
- Variables de entorno vacías: asegúrate de tener `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Error al exportar: revisa la consola del navegador; algunos navegadores bloquean popups/descargas.

---
¿Necesitas que agregue capturas, un diagrama de datos o scripts de migración completos? Abre un issue o pídelo y los incluimos.
