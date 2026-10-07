# Feature: Stability & Performance Optimizations

## Context & Objectives
- Optimizar la latencia de carga en páginas y acciones de servidor reduciendo roundtrips redundantes a Supabase.
- Implementar índices en base de datos para todas las claves foráneas y filtros frecuentes de RLS.
- Agregar Error Boundary robusto (`error.tsx`) en el árbol tenant para proteger contra caídas runtime 500.
- Normalizar manejo de fechas para evitar el bug de desfasaje UTC en turnos a partir de las 19:00.
- Optimizar configuración de Next.js (`compress`, `poweredByHeader`, `images`).

## Tasks
- [ ] Task 1: Crear `getCachedTenantId` con React cache y headers para eliminar roundtrips repetitivos a la BD.
- [ ] Task 2: Optimizar `DashboardPage` eliminando llamadas en serie a `getUser()` y cargando datos en paralelo.
- [ ] Task 3: Crear migración `013_performance_indexes.sql` con índices críticos para Postgres y RLS.
- [ ] Task 4: Implementar `src/app/(tenant)/[slug]/error.tsx` como Error Boundary resiliente.
- [ ] Task 5: Crear utilidad de fecha segura (`getLocalDateString`) y resolver desfasajes horarios.
- [ ] Task 6: Optimizar `next.config.ts` con compresión y formatos modernos de imágenes.
