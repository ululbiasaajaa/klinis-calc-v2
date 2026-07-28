import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PatientState, Patient, Encounter } from '../types/patient';

const createDefaultEncounter = (): Encounter => ({
  encounterId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'ENC-' + Date.now(),
  location: 'Rawat Inap',
  admissionDate: new Date().toISOString().split('T')[0],
  status: 'ACTIVE',
});

const initialPatient: Patient = {
  patientId: '',
  patientName: '',
  age: '',
  gender: '',
  weightKg: '',
  heightCm: '',
  serumCreatinine: '',
};

export const usePatientStore = create<PatientState>()(
  persist(
    (set) => ({
      patient: initialPatient,
      activeEncounter: createDefaultEncounter(),

      setPatientData: (data) => 
        set((state) => ({
          patient: { ...state.patient, ...data }
        })),
      
      setEncounter: (encounter) => set({ activeEncounter: encounter }),

      closeEncounter: () => 
        set((state) => ({
          activeEncounter: state.activeEncounter 
            ? { ...state.activeEncounter, status: 'CLOSED' } 
            : null
        })),

      resetPatient: () => set({
        patient: initialPatient,
        activeEncounter: createDefaultEncounter(),
      }),
    }),
    {
      name: 'clinical_suite_patient_storage_v2',
    }
  )
);