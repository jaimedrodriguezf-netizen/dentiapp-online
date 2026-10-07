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
- [ ] Task 1: Configurar cabeceras HTTP de seguridad en `next.config.ts`.
- [ ] Task 2: Normalizar case-sensitivity en matching de rutas de `src/proxy.ts`.
- [ ] Task 3: Limitar tamaño de payload y memoria en subida de capturas base64 (`support/actions.ts`).
- [ ] Task 4: Validar y sanitizar entradas en agendamiento público (`public/actions.ts`).
- [ ] Task 5: Agregar `requireAuth` explícito en `rescheduleAppointment` (`settings/actions.ts`).
- [ ] Task 6: Configurar MCP local para el proyecto en `.pi/mcp.json`.
