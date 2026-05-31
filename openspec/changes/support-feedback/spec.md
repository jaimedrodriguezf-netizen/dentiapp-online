# Especificación Funcional: Módulo de Soporte y Diagnóstico Automatizado

Este documento detalla los requerimientos de comportamiento y criterios de aceptación para el módulo de Reporte de Soporte y Diagnóstico por IA.

## 1. Reglas de Negocio
- **Captura Técnica**: Al abrir el modal de soporte, el sistema debe recopilar de forma transparente en un objeto JSONB:
  - `pathname`: La ruta exacta del navegador donde ocurrió el reporte.
  - `userAgent`: Detalles del navegador y sistema del usuario.
  - `userRole`: Rol del usuario en el tenant.
  - `viewport`: Tamaño de la pantalla del usuario (para bugs visuales).
  - `timestamp`: Hora exacta local del error.
- **Flujo de Carga de Capturas**:
  - El usuario puede pegar o adjuntar una imagen.
  - La imagen se sube a Supabase Storage con un nombre determinista: `tenant_id/patient_id_timestamp.png`.
- **Limpieza del Storage**:
  - Al resolverse un reporte (status pasa a `resolved`), el sistema ejecuta la eliminación de la imagen en Supabase Storage.
  - El reporte de base de datos permanece en estado `resolved` con el campo `screenshot_path = null` (eliminando la URL rota).

---

## 2. Escenarios de Aceptación (Gherkin)

### Escenario 1: Reportar Bug con Contexto Técnico Automático
```gherkin
Given que el usuario está en la vista "/odontology/odontogram/123" con el rol "doctor"
When abre el modal de soporte e ingresa "El botón de guardar no responde" como mensaje
And envía el reporte
Then el sistema debe guardar el registro en la tabla "support_feedbacks"
And debe inyectar en el campo "context" los valores pathname="/odontology/odontogram/123" y userRole="doctor" de forma automática
And debe subir la captura al bucket "support_screenshots" si fue provista
```

### Escenario 2: Diagnóstico Automatizado por IA
```gherkin
Given que existen 3 reportes pendientes en el panel de soporte de un tenant
When el administrador en el chat del asistente solicita "dame los reportes de soporte"
Then la IA debe consultar los reportes en Supabase
And para cada reporte debe analizar el error en el contexto
And debe correlacionar la falla con la base de código del proyecto
And debe responder al administrador con un listado estructurado de causas, sugerencias de código y soluciones
```

### Escenario 3: Borrado Automático de Capturas en Storage al Resolver Bug
```gherkin
Given un reporte de soporte resuelto con un archivo de captura "/tenant_1/img_123.png" en el bucket
When el administrador marca el reporte como "resolved"
Then el sistema debe eliminar físicamente el archivo "/tenant_1/img_123.png" de Supabase Storage
And debe actualizar el registro en la tabla colocando "screenshot_path" en null
```
