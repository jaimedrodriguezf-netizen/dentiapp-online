# Especificación Funcional: Periodontograma Clínico

Este documento detalla los requerimientos y escenarios de aceptación clínicos para el Periodontograma Digital de especialidad.

## 1. Reglas Clínicas de Negocio
- **Estructura Dental**: Se consideran 32 piezas dentales permanentes (del 18 al 48 según la nomenclatura FDI). Cada pieza se divide en 2 zonas principales:
  - **Cara Vestibular**: 3 puntos de medición (Disto-vestibular, Vestibular, Mesio-vestibular).
  - **Cara Lingual/Palatina**: 3 puntos de medición (Disto-lingual, Lingual, Mesio-lingual).
- **Parámetros por punto de medición (6 puntos por diente)**:
  - **Margen Gingival (MG)**: Rango numérico aceptable de -10 a 10 mm.
  - **Profundidad de Sondaje (PS)**: Rango numérico aceptable de 0 a 15 mm.
  - **NIC (Nivel de Inserción Clínica)**: Calculado automáticamente.
    - Fórmula clínica: `NIC = PS - MG`.
    - Ejemplo 1 (Recesión): Si el margen es `+2` (recesión) y la profundidad de sondaje es `5`, el NIC es `5 - (+2) = 3` (pérdida de inserción real).
    - Ejemplo 2 (Hiperplasia/Bolsa falsa): Si el margen es `-2` (crecimiento) y la profundidad de sondaje es `4`, el NIC es `4 - (-2) = 6`.
  - **Sangrado (SS)**: Estado binario (Sí/No).
  - **Placa (PL)**: Estado binario (Sí/No).
- **Parámetros generales de la pieza**:
  - **Movilidad**: Rango de 0 (normal) a 3 (severo).
  - **Afectación de Furcas**: Grados I, II, III o N/A.

- **Cálculo de Índices Globales**:
  - **Índice de Placa (IP)**: `(Total de puntos con placa / Total de puntos evaluados) * 100`.
  - **Índice de Sangrado (IS)**: `(Total de puntos con sangrado / Total de puntos evaluados) * 100`.
  - El total de puntos evaluados para una dentadura completa de 32 dientes es de `192` (32 dientes * 6 puntos). Si hay dientes ausentes, se restan del cálculo.

---

## 2. Escenarios de Aceptación (Gherkin)

### Escenario 1: Entrada rápida de datos por punto
```gherkin
Given que el odontólogo está editando el periodontograma
When ingresa un Margen Gingival (MG) de "2" y una Profundidad de Sondaje (PS) de "5" en la cara Vestibular de la pieza 16
Then el sistema debe calcular el Nivel de Inserción Clínica (NIC) como "3" de forma inmediata
And debe mostrar el resultado en pantalla sin requerir acciones adicionales
```

### Escenario 2: Alternar sangrado y placa con atajos rápidos
```gherkin
Given que el cursor del odontólogo está enfocado en una celda de medición del diente 11
When presiona la tecla "S" en su teclado
Then el sistema debe alternar (activar/desactivar) la marca de Sangrado (SS) para ese punto de medición
And debe recalcular el Índice de Sangrado Global en la interfaz al instante
```

### Escenario 3: Exclusión de dientes ausentes
```gherkin
Given que el odontólogo marca la pieza dental 18 como "Ausente"
Then el sistema debe deshabilitar visualmente todos los campos de sondaje de la pieza 18
And debe restar sus 6 puntos del total de puntos evaluados para el cálculo de los Índices Globales de Placa y Sangrado
```

### Escenario 4: Guardado de Ficha Periodontal
```gherkin
Given que el odontólogo ha registrado múltiples mediciones periodontales para un paciente
When hace clic en el botón "Guardar Periodontograma"
Then el sistema debe validar que los rangos numéricos sean válidos
And debe persistir el registro en Supabase bajo el ID del paciente
And debe mostrar una notificación de éxito con diseño premium
```
