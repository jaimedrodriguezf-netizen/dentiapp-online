# Plan de Tareas: Módulo de Soporte y Diagnóstico Automatizado

Este plan detalla los pasos para implementar el sistema de feedbacks y reportes con capturas y diagnóstico por IA.

## 1. Base de Datos y Tipos
- `[x]` Crear migración local en `supabase/migrations/006_support_feedbacks.sql` con el esquema de la tabla `support_feedbacks`, inicialización del bucket `support_screenshots` y políticas RLS habilitadas.
- `[x]` Crear tipos e interfaces TypeScript en `src/types/support.ts` para mapear los feedbacks y su contexto.

## 2. Server Actions
- `[x]` Crear el archivo de Server Actions en `src/app/(tenant)/[slug]/settings/support/actions.ts`:
  - `[x]` `createSupportFeedback`: valida sesión, sube imagen de captura a Supabase Storage y persiste reporte.
  - `[x]` `resolveSupportFeedback`: remueve imagen física de Supabase Storage de inmediato para liberar espacio, pone `screenshot_path = null` y actualiza estado a `resolved`.
  - `[x]` `getFeedbacksForAI`: consulta para retornar feedbacks pendientes.
  - `[x]` `saveAIDiagnosis`: guarda el diagnóstico de la IA en la tabla.

## 3. UI y Componentes de Cliente
- `[x]` Crear el componente de modal flotante `SupportFeedbackModal.tsx` para clientes:
  - `[x]` Capturar de forma automática ruta actual, agente de usuario, rol y dimensiones de pantalla.
  - `[x]` Permitir arrastrar/pegar captura de pantalla.
  - `[x]` Vincular al botón enviar con estados de carga.
- `[x]` Crear el botón de soporte flotante en el layout del panel del tenant para dar acceso al modal.
- `[x]` Crear vista de administración e historial de soporte en `src/app/(tenant)/[slug]/settings/support/page.tsx` para gestionar tickets de clientes.

## 4. Pruebas y Validación
- `[x]` Agregar pruebas de integración en `src/app/(tenant)/[slug]/settings/support/support.test.ts` para validar el guardado de feedback, el parsing de contexto y el flujo de eliminación de la captura del storage al resolverse.
- `[x]` Verificar compilación de tipos (`npx tsc --noEmit`).
- `[x]` Verificar cumplimiento de linter (`npm run lint -- --fix`).
- `[x]` Confirmar commits convencionales.
