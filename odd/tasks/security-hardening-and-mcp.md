# Feature: Security Hardening & Project MCP Setup

## Context & Objectives
- Implementar defensas para las vulnerabilidades detectadas en la auditoría de seguridad.
- Configurar cabeceras de respuesta HTTP seguras (Clickjacking, MIME sniffing, Referrer policy).
- Blindar el middleware contra evasiones de mayúsculas en rutas protegidas.
- Proteger el servidor contra ataques de saturación de memoria en subida de Base64.
- Validar y sanitizar entradas en la Server Action pública de turnos.
- Forzar verificación de sesión en `rescheduleAppointment`.
- Configurar servidor MCP específico para el proyecto en `.pi/mcp.json`.

## Tasks
- [x] Task 1: Configurar cabeceras HTTP de seguridad en `next.config.ts`. (commit: d506914)
- [x] Task 2: Normalizar case-sensitivity en matching de rutas de `src/proxy.ts`. (commit: 9dd2da3)
- [x] Task 3: Limitar tamaño de payload y memoria en subida de capturas base64 (`support/actions.ts`). (commit: 0c1c5d2)
- [x] Task 4: Validar y sanitizar entradas en agendamiento público (`public/actions.ts`). (commit: e7d8bfb)
- [x] Task 5: Agregar `requireAuth` explícito en `rescheduleAppointment` (`settings/actions.ts`). (commit: 368eb47)
- [x] Task 6: Configurar MCP local para el proyecto en `.pi/mcp.json`. (commit: 71b3287)
