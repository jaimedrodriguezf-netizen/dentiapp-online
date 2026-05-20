# E2E — Form 033 Wizard (MSP 12 secciones)

## Setup
```bash
cd /home/jaimepop/dentiapp-online
npm run build && npx next start -p 3000 -H 0.0.0.0
```

Cada test dice qué verificar. Respondé `OK` o `FALLA: [lo que viste]`.

---

## TEST W1 — Navegación 10 pasos

1. Entrá a `http://localhost:3000/[tu-slug]/admission/patients`
2. Click en un paciente → **Nueva Historia** (Formulario 033)
3. **Verificá**: ¿Barra de progreso con 10 íconos? ¿"Paso 1 de 10: Paciente"?
4. Navegá con **Siguiente** por los 10 pasos:
   - Paso 1: Paciente
   - Paso 2: Antecedentes
   - Paso 3: Signos Vitales
   - Paso 4: Estomatognático
   - Paso 5: Odontograma
   - Paso 6: Índices
   - Paso 7: Exámenes
   - Paso 8: Diagnóstico
   - Paso 9: Plan
   - Paso 10: Tratamiento
5. En Paso 10: ¿Botón verde **"Guardar historia"**?
6. Click **Anterior** varias veces → ¿Volviste sin perder datos?
7. **Verificá**: ¿Pasos completados en verde con check? ¿Paso actual en azul?

---

## TEST W2 — Paso 1: Paciente (Secciones A + B + C)

1. Nueva historia clínica → Paso 1
2. **Verificá**: ¿Banner con nombre del paciente e inicial?
3. Completá **Motivo de consulta**: `Dolor molar inferior`
4. Completá **Enfermedad actual**: `Dolor pulsátil de 3 días, aumenta con frío`
5. **Verificá**: ¿Radio buttons "¿Paciente embarazada?" con Sí / No?
6. Seleccioná **Sí** → ¿Queda marcado?
7. Cambiá a **No** → ¿Se actualiza?
8. Avanzá y volvé → ¿Datos persisten?

---

## TEST W3 — Paso 2: Antecedentes (Secciones D + E)

1. Llegá al Paso 2
2. **Verificá**: ¿Título "Antecedentes Patológicos"?
3. **Verificá**: ¿Subtítulo "Antecedentes Personales" con 10 checkboxes?
4. Marcá estos en Personales: **Alergia a antibiótico**, **Diabetes**, **Hipertensión arterial**
5. **Verificá**: ¿Checkboxes se marcan con borde azul y check blanco?
6. Marcá **Otro** en Personales → ¿Aparece input "Especificar..."?
7. Escribí `Hepatitis B` en el input
8. Marcá **Otro** en Familiares → ¿Input "Especificar..."?
9. Escribí `Artritis`
10. Avanzá y volvé → ¿Todos los checkboxes y textos persisten?

---

## TEST W4 — Paso 3: Signos Vitales (Sección F)

1. Paso 3
2. Completá: TA `130/85`, FC `78`, FR `18`, Temp `37.1`, SpO2 `97`
3. Peso `75`, Talla `175`
4. **Verificá**: ¿IMC se calcula automáticamente? (~24.5)
5. Avanzá y volvé → ¿Valores persisten?

---

## TEST W5 — Paso 4: Estomatognático (Sección G)

1. Paso 4
2. **Verificá**: ¿13 regiones numeradas? (1. LABIOS, 2. MEJILLAS, ..., 13. OTROS)
3. Escribí en región 1 (Labios): `Queilitis angular`
4. Escribí en región 11 (A.T.M.): `Chasquido sin dolor`
5. **Verificá**: ¿Inputs aceptan texto libre?
6. Avanzá y volvé → ¿Hallazgos persisten?

---

## TEST W6 — Paso 5: Odontograma (Sección H)

1. Paso 5
2. **Verificá**: ¿Odontograma interactivo visible? (arcos dentales con dientes numerados)
3. Click en el **diente 36** (molar inferior izquierdo)
4. **Verificá**: ¿Panel de edición aparece con estado general y superficies?
5. Seleccioná estado **Caries** para el diente
6. **Verificá**: ¿Diente se pinta de rojo en el odontograma?
7. Seleccioná superficie **O** como **Obturado**
8. Click en **diente 11** (incisivo central superior derecho)
9. Seleccioná estado **Sano**
10. **Verificá**: ¿Leyenda abajo muestra los colores y estados?
11. Avanzá y volvé → ¿Selecciones persisten?

---

## TEST W7 — Paso 6: Índices (Secciones I + J)

1. Paso 6
2. **Higiene oral**: Seleccioná "Buena", Índice de placa `25`
3. **Enfermedad periodontal**: Seleccioná "Leve"
4. **Fluorosis**: Seleccioná "Dudosa"
5. **Maloclusión**: Clase I, Overjet `2.5`, Overbite `3`
6. **CPO-D**: Cariados `2`, Perdidos `1`, Obturados `3`
7. **CEO-D**: Cariados `1`, Extracción `0`, Obturados `2`
8. Avanzá y volvé → ¿Todos los valores persisten?

---

## TEST W8 — Paso 7: Exámenes Complementarios (Sección L)

1. Paso 7
2. **Verificá**: ¿4 textareas etiquetados? (Biometría hemática, Química sanguínea, Rayos X, Otros)
3. Completá **Rayos X**: `Radiografía periapical: lesión apical en 36`
4. Completá **Biometría hemática**: `Hemoglobina 14.2, Leucocitos 7800`
5. Avanzá y volvé → ¿Textos persisten?

---

## TEST W9 — Paso 8: Diagnóstico (Sección N)

1. Paso 8
2. En el buscador CIE-10, tipeá `caries`
3. **Verificá**: ¿Sugerencias aparecen?
4. Seleccioná **K02.9 — Caries dental**
5. **Verificá**: ¿Código y descripción en azul?
6. Seleccioná tipo de diagnóstico: **Definitivo**
7. Completá **Notas clínicas**: `Caries extensa con compromiso pulpar en pieza 36`
8. Avanzá y volvé → ¿Diagnóstico persiste?

---

## TEST W10 — Paso 9: Plan

1. Paso 9
2. Completá **Plan educativo**: `Cepillado 3 veces al día, uso de hilo dental`
3. Completá **Plan diagnóstico**: `Radiografía periapical 36, prueba de vitalidad pulpar`
4. Avanzá y volvé → ¿Textos persisten?

---

## TEST W11 — Paso 10: Tratamiento (Sección P)

1. Paso 10
2. Completá **Plan terapéutico**: `Endodoncia 36, corona metal-porcelana`
3. Completá **Tratamiento realizado**: `Apertura cameral, conductometría`
4. **Verificá**: ¿Sección "Sesiones de tratamiento" con sesión 1?
5. Completá sesión 1: Fecha `2026-05-19`, Firma `Dr. García`
6. Diagnósticos: `Necrosis pulpar 36`
7. Procedimientos: `Endodoncia 36 - sesión 1`
8. Prescripciones: `Ibuprofeno 600mg c/8h, Amoxicilina 500mg c/8h`
9. Click **Agregar sesión**
10. **Verificá**: ¿Sesión 2 aparece?
11. Completá sesión 2: Fecha `2026-05-26`, Firma `Dr. García`
12. Procedimientos: `Endodoncia 36 - sesión 2, obturación de conductos`
13. Click el **tacho de basura** en sesión 2 → ¿Se elimina?
14. Volvé a agregar sesión 2
15. Click **Guardar historia**

---

## TEST W12 — Vista detalle: 12 secciones MSP

1. Después de guardar, estás en `/odontology/form-033/[id]`
2. **Verificá** que se vean estas secciones:
   - [ ] Tarjeta paciente (nombre, cédula, fecha apertura)
   - [ ] 1. Motivo de consulta
   - [ ] 2. Problema actual
   - [ ] 3. Antecedentes: ¿Checkboxes marcados visibles? (solo los que marcaste)
   - [ ] 4. Plan diagnóstico
   - [ ] 5. Diagnóstico CIE-10: ¿Código + tipo (presuntivo/definitivo)?
   - [ ] 6. Signos vitales: ¿Cards con TA, FC, FR, Temp, SpO2, Peso, Talla, IMC?
   - [ ] 7. Examen estomatognático: ¿Regiones con hallazgos?
   - [ ] 8. Salud bucal: ¿Higiene, fluorosis, maloclusión?
   - [ ] 9. Índices CPO-D / CEO-D: ¿Valores?
   - [ ] 10. Exámenes complementarios: ¿Textos ingresados?
   - [ ] 11. Plan terapéutico y tratamiento realizado
   - [ ] 12. Sesiones de tratamiento: ¿Cards con datos de cada sesión?
   - [ ] Odontograma: ¿Preview con dientes coloreados?
   - [ ] Indicador de embarazada: ¿"Embarazada" visible? (si marcaste Sí)

---

## TEST W13 — Editar ficha clínica

1. Desde la vista detalle, click **Editar Ficha**
2. **Verificá**: ¿Todos los campos se cargan con los datos guardados?
3. Cambiá el **Motivo de consulta** a `Control post-endodoncia`
4. Cambiá el tipo de diagnóstico a **Definitivo**
5. Marcá un nuevo antecedente personal: **Hemorragias**
6. Click **GUARDAR TODO**
7. **Verificá**: ¿Redirige a la vista detalle con los cambios?
8. **Verificá**: ¿El nuevo antecedente "Hemorragias" aparece en la vista?

---

## TEST W14 — Mobile responsive (375px)

1. Abrí responsive mode en devtools (375px)
2. Nueva historia clínica
3. **Verificá**: ¿Barra de progreso muestra "Paso X de 10: [Nombre]"? 
4. **Verificá**: ¿Pasos colapsan correctamente? (solo íconos en desktop, texto abajo en mobile)
5. Navegá varios pasos → ¿Botones Anterior/Siguiente son táctiles?
6. Paso Odontograma → ¿Mensaje "Deslizá horizontalmente"?
7. ¿No hay overflow horizontal en otros pasos?

---

## TEST W15 — Datos embarazada en detalle

1. Creá una historia con **Embarazada: Sí**
2. Guardá
3. En la vista detalle → ¿Aparece indicador "Embarazada"?
4. Creá otra con **Embarazada: No** → ¿No aparece el indicador?
5. Creá otra sin seleccionar nada → ¿No aparece el indicador?

---

## TEST W16 — Multi-sesión: persistencia

1. Creá historia con 3 sesiones de tratamiento
2. Guardá
3. En la vista detalle → ¿Las 3 sesiones aparecen en orden?
4. Editá la ficha → ¿Las sesiones se muestran?
5. Agregá una 4ta sesión desde el edit
6. Guardá → ¿Las 4 sesiones persisten?

---

## TEST W17 — Odontograma inline vs página dedicada

1. En el wizard, Paso 5: editá varios dientes
2. Guardá la historia
3. En la vista detalle → ¿Odontograma muestra los colores correctos?
4. Click **EDITAR ODONTOGRAMA** → ¿Va a página dedicada?
5. ¿La página dedicada carga los dientes guardados?
6. Modificá un diente en la página dedicada, guardá
7. Volvé a la vista detalle → ¿Cambios reflejados?

---

## TEST W18 — Navegación entre pasos sin perder datos

1. Nueva historia
2. Paso 1: Completá todo
3. Paso 2: Marcá 5 checkboxes
4. Paso 3: Completá 4 vitales
5. Paso 4: Escribí en 3 regiones
6. Paso 5: Editá 2 dientes
7. Volvé al Paso 1 con **Anterior** (5 clicks)
8. Volvé al Paso 5 con **Siguiente** (5 clicks)
9. **Verificá**: ¿Datos de cada paso persisten?
10. Paso intermedio: ¿Dientes siguen coloreados?

---

## Resumen

| Test | Qué prueba | Resultado |
|------|-----------|-----------|
| W1 | Navegación 10 pasos | ⬜ |
| W2 | Paso 1: Paciente + Embarazada | ⬜ |
| W3 | Paso 2: Antecedentes (checkboxes) | ⬜ |
| W4 | Paso 3: Signos vitales + IMC | ⬜ |
| W5 | Paso 4: 13 regiones estomatognático | ⬜ |
| W6 | Paso 5: Odontograma inline | ⬜ |
| W7 | Paso 6: Índices CPO-D / CEO-D | ⬜ |
| W8 | Paso 7: Exámenes complementarios | ⬜ |
| W9 | Paso 8: Diagnóstico CIE-10 | ⬜ |
| W10 | Paso 9: Plan educativo + diagnóstico | ⬜ |
| W11 | Paso 10: Tratamiento multi-sesión | ⬜ |
| W12 | Vista detalle: 12 secciones MSP | ⬜ |
| W13 | Editar ficha clínica | ⬜ |
| W14 | Mobile responsive | ⬜ |
| W15 | Indicador embarazada | ⬜ |
| W16 | Multi-sesión persistencia | ⬜ |
| W17 | Odontograma inline vs página | ⬜ |
| W18 | Persistencia entre pasos | ⬜ |
