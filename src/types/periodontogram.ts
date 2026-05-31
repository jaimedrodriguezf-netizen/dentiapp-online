export interface PeriodontalPoint {
  margin: number | null; // Margen Gingival (MG): positivo para recesión, negativo para hiperplasia
  depth: number | null;  // Profundidad de Sondaje (PS)
  nic: number | null;    // Nivel de Inserción Clínica (NIC) - Calculado
  bleeding: boolean;     // Sangrado (SS)
  plaque: boolean;       // Placa (PL)
  suppuration: boolean;  // Supuración
}

export interface ToothMeasurement {
  id: string; // FDI ID (e.g. "18", "11", "48")
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
