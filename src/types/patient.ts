export type EncounterStatus = 'ACTIVE' | 'CLOSED';
export type CareLocation = 'ICU' | 'IGD' | 'Rawat Inap' | 'Rawat Jalan';

export interface Encounter {
  encounterId: string;
  location: CareLocation;
  admissionDate: string;
  status: EncounterStatus;
  notes?: string;
}

export interface Patient {
  patientId: string;
  patientName: string;
  age: number | '';
  gender: 'Laki-laki' | 'Perempuan' | '';
  weightKg: number | '';
  heightCm: number | '';
  serumCreatinine: number | '';
}

export interface PatientState {
  patient: Patient;
  activeEncounter: Encounter | null;
  setPatientData: (data: Partial<Patient>) => void;
  setEncounter: (encounter: Encounter) => void;
  closeEncounter: () => void;
  resetPatient: () => void;
}