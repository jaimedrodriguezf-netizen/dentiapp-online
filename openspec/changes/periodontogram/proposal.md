# Propuesta Técnica: Periodontograma Clínico Digital

Esta propuesta detalla el diseño conceptual y arquitectónico para implementar el módulo de **Periodontograma Clínico Digital** interactivo, basado en el estándar clínico de la Universidad de Berna y la Sociedad Española de Periodoncia (SEPA), integrado en la plataforma DentiApp Online.

## 1. Enfoque de Negocio e Interfaz
El periodontograma es una herramienta de especialidad crítica para periodoncistas. El objetivo es proveer una interfaz visual interactiva que minimice la carga cognitiva del profesional durante el examen periodontal del paciente.

### Características Clave:
- **Flujo de Trabajo de Alta Velocidad**: Soporte para entrada rápida de datos (atajos de teclado para navegar entre celdas y alternar marcas de sangrado/placa al instante).
- **Cálculos Automáticos**: Nivel de Inserción Clínica (NIC) en tiempo real por cada punto, y cálculo global del Índice de Placa Simplificado y el Índice de Sangrado.
- **Gráfico de Evolución Periodontal**: Gráfico visual SVG interactivo que renderiza las curvas del margen gingival y el nivel de inserción sobre las siluetas anatómicas de las piezas dentales.

## 2. Arquitectura de Almacenamiento (Base de Datos)
Para evitar la sobrecarga de consultas y filas en bases de datos relacionales (que requerirían hasta 192 registros individuales por cada consulta), utilizaremos un modelo de documento híbrido en Supabase a través de una tabla `periodontograms` con un campo `JSONB` estructurado para almacenar las mediciones de los 32 dientes de manera compacta y de bajo retardo.

### Esquema SQL de Migración (`supabase/migrations/005_periodontograms.sql`):
```sql
CREATE TABLE IF NOT EXISTS periodontograms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dental_record_id UUID REFERENCES dental_records(id) ON DELETE SET NULL,
  examination_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  data JSONB NOT NULL, -- Matriz estructurada de mediciones de piezas dentales
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE periodontograms ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad RLS
CREATE POLICY "Users can view periodontograms for their tenant" 
  ON periodontograms FOR SELECT 
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert periodontograms for their tenant" 
  ON periodontograms FOR INSERT 
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update periodontograms for their tenant" 
  ON periodontograms FOR UPDATE 
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete periodontograms for their tenant" 
  ON periodontograms FOR DELETE 
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
```

## 3. Arquitectura Frontend (Next.js 16)
- **Ruta**: `src/app/(tenant)/[slug]/odontology/periodontogram/page.tsx` será un Server Component que obtendrá la información del paciente, cargará los periodontogramas previos e inyectará los datos en el componente principal de cliente.
- **Componente Cliente Principal**: `PeriodontogramDashboard.tsx` manejará el estado local interactivo del periodontograma (el examen activo), selector de exámenes previos, inputs rápidos y cálculos dinámicos.
- **Seguridad y Control de Tipos**: Compilación TypeScript 100% limpia sin uso de `any`. Definición rigurosa de interfaces clínicas para la estructura JSONB.
