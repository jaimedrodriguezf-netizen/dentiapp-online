# Plan de Tareas: Periodontograma Clínico

Este documento detalla los pasos atómicos necesarios para implementar de punta a punta el módulo de Periodontograma interactivo.

## 1. Base de Datos y Tipos
- `[ ]` Crear migración local en `supabase/migrations/005_periodontograms.sql` con el esquema de la tabla `periodontograms`, claves foráneas y políticas RLS habilitadas.
- `[ ]` Crear tipos y firmas en `src/types/periodontogram.ts` definiendo las estructuras de datos clínicas de piezas y puntos sin usar `any`.
- `[ ]` Escribir un helper `src/utils/periodontogramHelpers.ts` para inicializar un objeto `PeriodontogramData` vacío de 32 dientes con sus respectivos puntos por defecto y funciones auxiliares para calcular el IP (Índice de Placa), IS (Índice de Sangrado) y NIC.

## 2. Server Actions y Lógica de Negocio
- `[ ]` Implementar Server Actions en `src/app/(tenant)/[slug]/odontology/periodontogram/actions.ts`:
  - `[ ]` `savePeriodontogram`: validación de rangos numéricos clínicos en backend, control de membresía y guardado atómico.
  - `[ ]` `getPeriodontogramsByPatient`: consulta filtrando por paciente ordenando por fecha descendente.
  - `[ ]` `deletePeriodontogram`: eliminación segura de registros.

## 3. UI y Componentes de Cliente
- `[ ]` Crear componente `PeriodontalSummaryCards.tsx` para mostrar los porcentajes globales de placa y sangrado en tarjetas Bento Grid premium con micro-animaciones.
- `[ ]` Crear componente `PeriodontalSVGChart.tsx` para renderizar de manera interactiva el gráfico de curvas de encía (MG) y hueso (NIC) sobre las siluetas dentales.
- `[ ]` Crear componente `PeriodontalMatrixEditor.tsx` y `ToothPeriodontalCard.tsx` para permitir el ingreso rápido de mediciones:
  - `[ ]` Vincular eventos de teclado (Flechas arriba/abajo/izquierda/derecha para navegar entre celdas, tecla "S" para marcar sangrado, tecla "P" para marcar placa).
  - `[ ]` Agregar soporte de exclusión para dientes ausentes (bloqueando celdas).
- `[ ]` Crear componente principal `PeriodontogramDashboard.tsx` para coordinar el estado de los componentes, listado de históricos, guardado rápido y alertas visuales de bolsas periodontales patológicas (valores >= 4mm destacados en rojo).

## 4. Integración y Páginas
- `[ ]` Modificar `src/app/(tenant)/[slug]/odontology/periodontogram/page.tsx` para reemplazar el placeholder actual por la vista activa del Periodontograma. Debe buscar en Supabase la información del paciente, cargar su ficha de expedientes y renderizar el `PeriodontogramDashboard`.
- `[ ]` Agregar botón de acceso al Periodontograma desde la vista detallada de la Ficha Clínica del paciente.

## 5. Pruebas y Validación
- `[ ]` Crear pruebas unitarias en `src/utils/periodontogramHelpers.test.ts` para verificar la matemática de los índices globales de placa/sangrado y el cálculo exacto del NIC en diversos escenarios clínicos.
- `[ ]` Verificar compilación de tipos (`npx tsc --noEmit`).
- `[ ]` Verificar cumplimiento de linter (`npm run lint -- --fix`).
- `[ ]` Confirmar commits convencionales.
