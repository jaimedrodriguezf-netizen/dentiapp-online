# Diseño Técnico: Soporte Clínico y Diagnóstico Automatizado

Este documento describe la arquitectura, tipos de datos y diseño del Módulo de Soporte.

## 1. Tipos de Datos (TypeScript)
Definiremos los tipos en `src/types/support.ts` para evitar `any`:

```typescript
export type FeedbackType = 'bug' | 'feature' | 'feedback';
export type FeedbackStatus = 'pending' | 'diagnosed' | 'resolved';

export interface FeedbackContext {
  pathname: string;
  userAgent: string;
  userRole: string;
  viewportWidth: number;
  viewportHeight: number;
  timestamp: string;
}

export interface SupportFeedback {
  id: string;
  tenant_id: string;
  user_id: string | null;
  user_email: string;
  type: FeedbackType;
  message: string;
  context: FeedbackContext;
  screenshot_path: string | null;
  status: FeedbackStatus;
  ai_diagnosis: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## 2. Componentes de UI
- **`SupportFeedbackModal.tsx` (RCC - `'use client'`)**:
  - Modal flotante accesible desde el Dashboard principal o un botón de soporte en el Sidebar.
  - Al abrirse, calcula el tamaño de pantalla del usuario (`window.innerWidth`, `window.innerHeight`) y captura `window.location.pathname` y `navigator.userAgent`.
  - Campo de entrada para adjuntar un archivo de imagen (arrastrar y soltar o pegar).
  - Al presionar enviar:
    1. Si hay una imagen, llama a una Server Action de carga para guardarla en el bucket `support_screenshots` y obtener su path.
    2. Envía los metadatos e información del reporte a la Server Action de persistencia.
- **`SupportFeedbacksAdminList.tsx` (RCC - `'use client'`)**:
  - Panel administrativo de soporte para visualizar todos los reportes, capturas y diagnósticos recomendados por la IA.

---

## 3. Acciones de Servidor (Server Actions)
Las implementaremos en `src/app/(tenant)/[slug]/settings/support/actions.ts`:

- `createSupportFeedback(slug, type, message, context, screenshotBase64)`:
  - Recupera la sesión del usuario.
  - Si viene `screenshotBase64`, lo decodifica en un ArrayBuffer y lo sube al bucket de Supabase Storage.
  - Guarda la fila en `support_feedbacks` con estado `pending`.
- `resolveSupportFeedback(slug, feedbackId)`:
  - Busca el reporte por `feedbackId`.
  - Si tiene un `screenshot_path`, llama a `supabase.storage.from('support_screenshots').remove(...)` para liberar espacio de inmediato.
  - Actualiza el estado del reporte a `resolved` y pone `screenshot_path = null`.
- `getFeedbacksForAI(slug)`:
  - Utilizado por la interfaz de IA para diagnosticar reportes. Devuelve los reportes en estado `pending` y `diagnosed` del tenant (excluyendo datos pesados binarios).
- `saveAIDiagnosis(feedbackId, diagnosisText)`:
  - Guarda el diagnóstico elaborado por la IA en la columna `ai_diagnosis` del ticket en Supabase.
