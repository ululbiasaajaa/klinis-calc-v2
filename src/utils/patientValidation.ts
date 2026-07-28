import { Patient } from '../types/patient';

export interface ValidationError {
  field: keyof Patient;
  message: string;
}

export function validatePatientInput(patient: Partial<Patient>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (patient.age !== undefined && patient.age !== '') {
    if (Number(patient.age) <= 0 || Number(patient.age) > 120) {
      errors.push({ field: 'age', message: 'Usia harus di antara 1 - 120 tahun.' });
    }
  }

  if (patient.weightKg !== undefined && patient.weightKg !== '') {
    if (Number(patient.weightKg) <= 0 || Number(patient.weightKg) > 300) {
      errors.push({ field: 'weightKg', message: 'Berat badan tidak realistis (0 - 300 kg).' });
    }
  }

  if (patient.heightCm !== undefined && patient.heightCm !== '') {
    if (Number(patient.heightCm) <= 0 || Number(patient.heightCm) > 250) {
      errors.push({ field: 'heightCm', message: 'Tinggi badan tidak realistis.' });
    }
  }

  if (patient.serumCreatinine !== undefined && patient.serumCreatinine !== '') {
    if (Number(patient.serumCreatinine) < 0.1 || Number(patient.serumCreatinine) > 25) {
      errors.push({ field: 'serumCreatinine', message: 'Nilai Serum Kreatinin di luar batas fisiologis (0.1 - 25 mg/dL).' });
    }
  }

  return errors;
}