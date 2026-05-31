# Plan de Tareas: Módulo de Soporte y Diagnóstico Automatizado

Este plan detalla los pasos para implementar el sistema de feedbacks y reportes con capturas y diagnóstico por IA.

## 1. Base de Datos y Tipos
- `[ ]` Crear migración local en `supabase/migrations/006_support_feedbacks.sql` con el esquema de la tabla `support_feedbacks`, inicialización del bucket `support_screenshots` y políticas RLS habilitadas.
- `[ ]` Crear tipos e interfaces TypeScript en `src/types/support.ts` para mapear los feedbacks y su contexto.

## 2. Server Actions
- `[ ]` Crear el archivo de Server Actions en `src/app/(tenant)/[slug]/settings/support/actions.ts`:
  - `[ ]` `createSupportFeedback`: valida sesión, sube imagen de captura a Supabase Storage y persiste reporte.
  - `[ ]` `resolveSupportFeedback`: remueve imagen física de Supabase Storage de inmediato para liberar espacio, pone `screenshot_path = null` y actualiza estado a `resolved`.
  - `[ ]` `getFeedbacksForAI`: consulta para retornar feedbacks pendientes.
  - `[ ]` `saveAIDiagnosis`: guarda el diagnóstico de la IA en la tabla.

## 3. UI y Componentes de Cliente
- `[ ]` Crear el componente de modal flotante `SupportFeedbackModal.tsx` para clientes:
  - `[ ]` Capturar de forma automática ruta actual, agente de usuario, rol y dimensiones de pantalla.
  - `[ ]` Permitir arrastrar/pegar captura de pantalla.
  - `[ ]` Vincular al botón enviar con estados de carga.
- `[ ]` Crear el botón de soporte flotante en el layout del panel del tenant para dar acceso al modal.
- `[ ]` Crear vista de administración e historial de soporte en `src/app/(tenant)/[slug]/settings/support/page.tsx` para gestionar tickets de clientes.

## 4. Pruebas y Validación
- `[ ]` Agregar pruebas de integración en `src/app/(tenant)/[slug]/settings/support/support.test.ts` para validar el guardado de feedback, el parsing de contexto y el flujo de eliminación de la captura del storage al resolverse.
- `[ ]` Verificar compilación de tipos (`npx tsc --noEmit`).
- `[ ]` Verificar cumplimiento de linter (`npm run lint -- --fix`).
- `[ ]` Confirmar commits convencionales.
