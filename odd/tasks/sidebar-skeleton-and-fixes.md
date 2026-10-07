# Feature: Sidebar Skeleton, Layout Optimization, Bug Fixes & Project Audit

## Context & Objectives
- Implementar componente `SidebarSkeleton` para carga progresiva con DaisyUI / Tailwind.
- Resolver el layout shift en `TenantLayoutClient` (persistencia en localStorage).
- Corregir el enrutamiento roto en `/dashboard` redirigiendo al dashboard del tenant activo.
- Normalizar tipos de plan (`free`, `standard`, `business`) en `layout` y componentes.
- Resolver los warnings acumulados en ESLint.
- Realizar una auditoría exhaustiva en la raíz del proyecto para detectar otros bugs potenciales.

## Tasks

- [x] Task 1: Crear e integrar `SidebarSkeleton` en componentes de carga y navegación. (commit: e1a5774)
- [x] Task 2: Optimizar persistencia del menú lateral evitando layout shift en `TenantLayoutClient`. (commit: ba4e0b5)
- [x] Task 3: Corregir redirección de `/dashboard` legacy a `/[slug]/dashboard`. (commit: 3130f0e)
- [x] Task 4: Normalizar tipos del plan (`free` | `standard` | `business`) en layouts y helpers. (commit: 8df3e86)
- [x] Task 5: Resolver warnings de ESLint (variables no usadas, imports muertos, optimización de imágenes). (commit: 5d14a46)
- [x] Task 6: Auditoría y escaneo exhaustivo de bugs desde la raíz del proyecto. (commit: 193bff9)
