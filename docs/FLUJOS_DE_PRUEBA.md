# Flujos de Prueba — DentiApp Online v1.0.2

## 🧪 Tests Automatizados

```bash
# Correr todos los tests
npm test

# Correr un archivo específico
npx vitest run src/app/\(tenant\)/\[slug\]/settings/settingsHelpers.test.ts

# Correr en modo watch
npm run test:watch
```

**Estado actual**: 80 tests pasando, 1 falla preexistente (sidebar permissions — no relacionado con cambios nuevos).

---

## 🔴 FLUJO 1 — Registrar paciente con estado y observaciones

### Prerrequisitos
- Iniciar sesión como admin/doctor
- Base de datos migrada (`npm run db:migrate`)

### Pasos
| # | Acción | Verificación |
|---|--------|-------------|
| 1 | Ir a **Pacientes** → **Nuevo Paciente** | Formulario con campos: datos, contacto, estado, notas |
| 2 | Completar: Nombre `Ana`, Apellido `Test`, Cédula `1234567890` | |
| 3 | Seleccionar **Estado**: "En Tratamiento" | Dropdown muestra 4 opciones |
| 4 | Escribir en **Observaciones**: `Alérgica a penicilina. Control cada 6 meses.` | |
| 5 | Click en **REGISTRAR PACIENTE** | Redirige a lista de pacientes |
| 6 | Buscar "Ana Test" y click para ver detalle | ✅ Badge "En Tratamiento" visible en azul |
| 7 | Verificar sección de observaciones | ✅ Texto "Alérgica a penicilina..." visible |
| 8 | Click en **Editar** | Campos de estado y observaciones precargados |
| 9 | Cambiar estado a **Alta**, guardar | ✅ Badge cambia a "Alta" en morado |

### ✅ Criterios de éxito
- [x] Status badge visible en detalle de paciente
- [x] Observaciones visibles en detalle
- [x] Formulario de edición mantiene los valores
- [x] 4 estados funcionan (Activo, En Tratamiento, Inactivo, Alta)

---

## 🟠 FLUJO 2 — Reprogramar un turno

### Prerrequisitos
- Tener al menos un turno en estado "Pendiente" o "Confirmado"

### Pasos
| # | Acción | Verificación |
|---|--------|-------------|
| 1 | Ir a **Agenda** | Lista de turnos del día |
| 2 | Ubicar un turno con botón **Reprogramar** | Botón visible solo en Pendiente/Confirmado |
| 3 | Click en **Reprogramar** | Modal se abre con fecha actual y slots horarios |
| 4 | Seleccionar nueva fecha (ej: mañana) | |
| 5 | Seleccionar nuevo horario (ej: 10:00) | Slot se resalta en azul |
| 6 | Click en **CONFIRMAR CAMBIO** | Modal se cierra, turno actualizado |
| 7 | Verificar que el turno cambió de fecha/hora | ✅ Aparece en la nueva fecha seleccionada |

### ✅ Criterios de éxito
- [x] Modal de reprogramación abre correctamente
- [x] Slots horarios se muestran (16 slots: 8 mañana + 8 tarde)
- [x] Fecha y hora se actualizan en DB
- [x] Turno vuelve a estado "Pendiente" después de reprogramar

---

## 🟡 FLUJO 3 — Vista semanal de agenda

### Pasos
| # | Acción | Verificación |
|---|--------|-------------|
| 1 | Ir a **Agenda** | Vista diaria por defecto (botón "Hoy" activo) |
| 2 | Click en **Semana** | Grid de 7 días se muestra |
| 3 | Verificar navegación: click en `<` `>` | Semana anterior/siguiente |
| 4 | Verificar día actual resaltado | Círculo azul en el día de hoy |
| 5 | Verificar nombres de días | Dom, Lun, Mar, Mié, Jue, Vie, Sáb |

### ✅ Criterios de éxito
- [x] Toggle Hoy/Semana funciona
- [x] Grid muestra 7 columnas
- [x] Navegación entre semanas funciona
- [x] Fecha actual resaltada

---

## 🟢 FLUJO 4 — Reserva online con consentimiento

### Prerrequisitos
- Acceder a la landing page pública: `http://localhost:3000/[slug]`

### Pasos
| # | Acción | Verificación |
|---|--------|-------------|
| 1 | Abrir landing page | Hero, stats, servicios, QR visibles |
| 2 | Scroll hasta "Tomá tu turno ahora" | BookingForm visible |
| 3 | Completar: Nombre, WhatsApp, Fecha, Horario, Motivo | |
| 4 | Verificar **checkbox de consentimiento** | ✅ Visible con link a Política de Privacidad |
| 5 | Click en link "Política de Privacidad" | ✅ Abre `/[slug]/privacy` en nueva pestaña |
| 6 | Marcar checkbox, click en **CONFIRMAR MI TURNO** | ✅ "¡Turno Agendado!" con datos |
| 7 | Verificar en DB que se registró consentimiento | Tabla `consents` tiene nuevo registro |

### ✅ Criterios de éxito
- [x] Checkbox de consentimiento visible y required
- [x] Link a política de privacidad funciona
- [x] Página de privacidad carga con datos de la clínica
- [x] Consentimiento se guarda en tabla `consents`

---

## 🔵 FLUJO 5 — Botón de WhatsApp en landing page

### Prerrequisitos
- Configurar WhatsApp en **Configuración → Perfil** (campo "WhatsApp para landing page")
- Ej: `+593 99 123 4567`

### Pasos
| # | Acción | Verificación |
|---|--------|-------------|
| 1 | Ir a Configuración → Perfil | Campo WhatsApp visible |
| 2 | Ingresar número: `+593 99 123 4567` | |
| 3 | Guardar cambios | |
| 4 | Abrir landing page pública | ✅ Botón verde flotante abajo a la derecha |
| 5 | Click en botón WhatsApp | ✅ Abre `wa.me/593991234567` con mensaje pre-armado |
| 6 | Si no hay número configurado | ❌ Botón NO debe aparecer |

### ✅ Criterios de éxito
- [x] Botón WhatsApp visible cuando hay número configurado
- [x] Link de WhatsApp formado correctamente (limpia espacios, +, etc.)
- [x] Mensaje pre-armado incluye URL de la clínica
- [x] Botón oculto si no hay WhatsApp configurado

---

## 🟣 FLUJO 6 — Horarios de atención

### Pasos
| # | Acción | Verificación |
|---|--------|-------------|
| 1 | Ir a Configuración → **Horarios** | Grid de 7 días con toggles |
| 2 | Verificar defaults: Lun-Vie abierto, Sab-Dom cerrado | ✅ |
| 3 | Activar Sábado (toggle ON) | Toggle verde, inputs de hora habilitados |
| 4 | Setear Sábado: 09:00 — 13:00 | |
| 5 | Desactivar Miércoles (toggle OFF) | Inputs deshabilitados, label "Cerrado" |
| 6 | Click en **GUARDAR HORARIOS** | ✅ Confirmación, datos persisten |
| 7 | Recargar página | ✅ Cambios persisten |

### ✅ Criterios de éxito
- [x] 7 días con toggles funcionan
- [x] Horas se habilitan/deshabilitan según toggle
- [x] Guardado persiste en DB (`operating_hours`)

---

## ⚪ FLUJO 7 — Página de Política de Privacidad

### Pasos
| # | Acción | Verificación |
|---|--------|-------------|
| 1 | Navegar a `/[slug]/privacy` | Página carga con nombre de la clínica |
| 2 | Verificar 10 secciones | Identificación, Datos, Finalidad, Base Legal, Conservación, Seguridad, Derechos, Transferencia, Modificaciones, Consentimiento |
| 3 | Verificar datos dinámicos | Nombre, dirección, email, teléfono de la clínica |
| 4 | Click en "Volver a [clínica]" | ✅ Redirige a landing page |

### ✅ Criterios de éxito
- [x] Página carga sin errores (200 OK)
- [x] Datos de la clínica se muestran dinámicamente
- [x] Todas las secciones legales presentes
- [x] Link de retorno funciona

---

## 📊 Resumen de Ejecución

```bash
# 1. Verificar TypeScript
npx tsc --noEmit
# Esperado: 0 errores ✅

# 2. Correr tests unitarios
npx vitest run
# Esperado: 80+ tests pasando ✅

# 3. Construir para producción
npm run build
# Esperado: Build exitoso

# 4. Iniciar servidor
npm run dev
# o para producción:
npm run build && npx next start -p 3000 -H 0.0.0.0

# 5. Probar flujos manuales 1-7
# Usar browser en http://localhost:3000
```

---

## 🐛 Reporte de Bugs

Si encontrás un error, registralo con este formato:

```
Flujo: [número]
Paso: [número]
Comportamiento esperado: [qué debería pasar]
Comportamiento real: [qué pasó]
Captura/Screenshot: [opcional]
```
