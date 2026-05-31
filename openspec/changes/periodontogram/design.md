# Diseño Técnico: Módulo de Periodontograma

Este documento describe la arquitectura técnica, modelo de datos TypeScript y el diseño de componentes React para la implementación del Periodontograma.

## 1. Tipos de Datos Clínicos (TypeScript)
Definiremos los tipos estrictamente en `src/types/periodontogram.ts` para evitar el uso de `any` de acuerdo con las políticas globales del proyecto:

```typescript
export interface PeriodontalPoint {
  margin: number | null; // Margen Gingival (MG)
  depth: number | null;  // Profundidad de Sondaje (PS)
  nic: number | null;    // Nivel de Inserción Clínica (NIC) - Calculado
  bleeding: boolean;     // Sangrado (SS)
  plaque: boolean;       // Placa (PL)
  suppuration: boolean;  // Supuración
}

export interface ToothMeasurement {
  id: string; // FDI id (e.g. "18", "11", "48")
  isMissing: boolean;
  mobility: number | null; // 0, 1, 2, 3
  furcation: number | null; // 1, 2, 3 o null
  vestibular: {
    distal: PeriodontalPoint;
    middle: PeriodontalPoint;
    mesial: PeriodontalPoint;
  };
  lingual: {
    distal: PeriodontalPoint;
    middle: PeriodontalPoint;
    mesial: PeriodontalPoint;
  };
}

export interface PeriodontogramData {
  teeth: Record<string, ToothMeasurement>;
  generalNotes?: string;
}

export interface PeriodontogramRecord {
  id: string;
  tenant_id: string;
  patient_id: string;
  dental_record_id: string | null;
  examination_date: string;
  notes: string | null;
  data: PeriodontogramData;
  created_at: string;
  updated_at: string;
}
```

---

## 2. Estructura de Componentes React (Arquitectura Híbrida)

El diseño del Periodontograma se estructurará con componentes modulares altamente estilizados usando CSS Vanilla/Tailwind:

```
[page.tsx] (Server Component)
    │
    └── [PeriodontogramContainer.tsx] (Client Component - State Owner)
            ├── [PeriodontalSummaryCards.tsx] (Bento Grid con IP, IS y Estadísticas)
            ├── [PeriodontalSVGChart.tsx] (Gráfico SVG interactivo de curvas periodontales)
            └── [PeriodontalMatrixEditor.tsx] (Grilla Bento interactiva para rellenar las celdas)
                    └── [ToothPeriodontalCard.tsx] (Ficha por pieza dental con inputs individuales)
```

### Detalle de Componentes:
- **`PeriodontogramContainer`**: Maneja el estado local del examen activo (`PeriodontogramData`), la pieza dental seleccionada para edición detallada, y orquesta el guardado/carga mediante Server Actions.
- **`PeriodontalSVGChart`**: Un gráfico interactivo SVG que dibuja de forma dinámica:
  - Siluetas anatómicas estilizadas de coronas y raíces de las piezas dentales en escala.
  - La curva de la encía (Margen Gingival) en **azul** uniendo las mediciones de los puntos.
  - La curva del hueso alveolar (Nivel de Inserción Clínica - NIC) en **rojo** uniendo los puntos calculados de NIC.
  - Sombreado de bolsas periodontales patológicas (donde la profundidad de sondaje `PS >= 4mm`).
- **`PeriodontalMatrixEditor`**: Grilla interactiva organizada en arcada superior e inferior, donde las piezas dentales muestran celdas para ingresar MG y PS de forma ultra rápida, con soporte de navegación de teclas (Flechas, Enter, Tab) para agilizar el trabajo.

---

## 3. Acciones de Servidor (Server Actions)
Las transacciones con Supabase se implementarán en `src/app/(tenant)/[slug]/odontology/periodontogram/actions.ts`:

- `getPeriodontogramsByPatient(patientId)`: Recupera el listado histórico de periodontogramas del paciente.
- `savePeriodontogram(slug, recordId, data)`: Valida los rangos numéricos clínicos en el servidor, realiza el guardado/actualización atómica en la tabla `periodontograms` de Supabase y refresca la ruta del cliente.
- `deletePeriodontogram(id)`: Elimina un registro de periodontograma del historial.
