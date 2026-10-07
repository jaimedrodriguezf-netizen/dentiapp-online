# Feature: Clean Architecture & Zero-Trust Security Hardening

## Context & Objectives
- Purgar el código legacy muerto (`src/app/(dashboard)`) y unificar la tipificación compartida de dominio en `src/types/`.
- Estandarizar el contrato de Server Actions con el patrón `ActionResult<T>` / `ActionResponse`.
- Implementar validación defensiva Zero-Trust de entradas para mutaciones clave (pacientes, turnos, odontología).
- Implementar un interceptor/logger de auditoría médica (`audit_logs`) para rastrear cambios en historias clínicas y citas.

## Tasks
- [x] Task 1: Purgar rutas huérfanas en `src/app/(dashboard)` y centralizar tipos de dominio en `src/types/`. (commit: f6f4aa2)
- [x] Task 2: Implementar contrato estándar `ActionResult<T>` y estandarizar respuestas en Server Actions. (commit: fd379fa)
- [ ] Task 3: Crear capa de validación Zero-Trust de entradas defensivas antes de persistir en base de datos.
- [ ] Task 4: Implementar logger centralizado de auditoría médica (`audit_logs`) para historias clínicas y turnos.
