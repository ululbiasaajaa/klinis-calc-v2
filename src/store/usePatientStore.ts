import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- INITIAL STATES ---
const createDefaultEncounter = () => ({
  encounterId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'ENC-' + Date.now(),
  location: 'Rawat Inap / ICU',
  admissionDate: new Date().toISOString().split('T')[0],
  status: 'ACTIVE',
  attendingPhysician: 'Dr. DPJP Sp.PD',
});

const initialBaseline = {
  patientId: '',
  patientName: '',
  age: '',
  gender: 'Laki-laki',
  weightKg: '',
  heightCm: '',
  serumCreatinine: '',
  bun: '',
  albumin: '',
  primaryDiagnosis: '',
  allergies: [],
};

const initialVitals = {
  bloodPressureSys: '',
  bloodPressureDia: '',
  heartRate: '',
  temperature: '',
  spo2: '',
  gcsScore: '15',
};

const initialVentilator = {
  fio2: '',
  peep: '',
  plateauPressure: '',
  pao2: '',
};

export const usePatientStore = create(
  persist(
    (set, get) => ({
      // 1. MASTER & BASELINE DATA
      patient: initialBaseline,
      activeEncounter: createDefaultEncounter(),
      vitals: initialVitals,
      ventilator: initialVentilator,

      // 2. TIME-SERIES & RELATIONAL ARRAYS (SINGLE SOURCE OF TRUTH)
      labsHistory: [], // Array untuk Outcome Dashboard & Lab Trend [{ id, timestamp, scr, bun, crp, wbc, sodium, potassium, ph, pao2 }]
      medications: [], // Array untuk DDI & Renal Adjustment [{ id, name, dose, unit, frequency, route, status }]
      notes: [],       // Array catatan visite SBAR/SOAP

      // 3. COMPUTED / SHARED CLINICAL CONTEXT (GETTER)
      getClinicalContext: () => {
        const { patient } = get();
        const age = Number(patient.age) || 0;
        const weight = Number(patient.weightKg) || 0;
        const height = Number(patient.heightCm) || 0;
        const scr = Number(patient.serumCreatinine) || 0;
        const isFemale = patient.gender === 'Perempuan';

        // Hitung Cockcroft-Gault (ClCr)
        let clcr = 0;
        if (age > 0 && weight > 0 && scr > 0) {
          clcr = ((140 - age) * weight) / (72 * scr);
          if (isFemale) clcr *= 0.85;
        }

        // Hitung CKD-EPI (eGFR)
        let egfr = 0;
        if (age > 0 && scr > 0) {
          const kappa = isFemale ? 0.7 : 0.9;
          const alpha = isFemale ? -0.241 : -0.302;
          const genderFactor = isFemale ? 1.012 : 1.0;
          egfr = 142 * Math.pow(Math.min(scr / kappa, 1), alpha) *
            Math.pow(Math.max(scr / kappa, 1), -1.2) *
            Math.pow(0.9938, age) * genderFactor;
        }

        // Hitung Antropometri
        const bsa = (height > 0 && weight > 0) ? Math.sqrt((height * weight) / 3600) : 0;
        const bmi = (height > 0 && weight > 0) ? weight / Math.pow(height / 100, 2) : 0;
        
        const hInches = height / 2.54;
        const ibw = hInches > 60 
          ? (isFemale ? 45.5 : 50) + 2.3 * (hInches - 60) 
          : (isFemale ? 45.5 : 50);

        return {
          clcr: Number(clcr.toFixed(1)),
          egfr: Number(egfr.toFixed(1)),
          bsa: Number(bsa.toFixed(2)),
          bmi: Number(bmi.toFixed(1)),
          ibw: Number(ibw.toFixed(1)),
        };
      },

      // 4. ACTIONS / MUTATORS
      setPatientData: (data) =>
        set((state) => ({
          patient: { ...state.patient, ...data },
        })),

      setVitals: (data) =>
        set((state) => ({
          vitals: { ...state.vitals, ...data },
        })),

      setVentilator: (data) =>
        set((state) => ({
          ventilator: { ...state.ventilator, ...data },
        })),

      addLabRecord: (labEntry) =>
        set((state) => ({
          labsHistory: [
            {
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              ...labEntry,
            },
            ...state.labsHistory,
          ],
        })),

      addMedication: (medEntry) =>
        set((state) => ({
          medications: [
            {
              id: Date.now().toString(),
              status: 'ACTIVE',
              ...medEntry,
            },
            ...state.medications,
          ],
        })),

      removeMedication: (medId) =>
        set((state) => ({
          medications: state.medications.filter((m) => m.id !== medId),
        })),

      setEncounter: (encounter) => set({ activeEncounter: encounter }),

      closeEncounter: () =>
        set((state) => ({
          activeEncounter: state.activeEncounter
            ? { ...state.activeEncounter, status: 'CLOSED' }
            : null,
        })),

      resetPatient: () =>
        set({
          patient: initialBaseline,
          vitals: initialVitals,
          ventilator: initialVentilator,
          labsHistory: [],
          medications: [],
          notes: [],
          activeEncounter: createDefaultEncounter(),
        }),
    }),
    {
      name: 'clinical_suite_patient_storage_v3',
    }
  )
);