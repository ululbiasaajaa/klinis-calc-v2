import React, { createContext, useContext, useState, useEffect } from 'react';

const PatientContext = createContext();

export function PatientProvider({ children }) {
  const [patientName, setPatientName] = useState(() => {
    return localStorage.getItem('clinical_suite_active_patient_name') || '';
  });
  
  const [patientId, setPatientId] = useState(() => {
    return localStorage.getItem('clinical_suite_active_patient_id') || '';
  });

  const [patientVitals, setPatientVitals] = useState(() => {
    const saved = localStorage.getItem('clinical_suite_active_patient_vitals');
    return saved ? JSON.parse(saved) : { weight: '', height: '', age: '', gender: 'male', scr: '' };
  });

  useEffect(() => {
    localStorage.setItem('clinical_suite_active_patient_name', patientName);
  }, [patientName]);

  useEffect(() => {
    localStorage.setItem('clinical_suite_active_patient_id', patientId);
  }, [patientId]);

  useEffect(() => {
    localStorage.setItem('clinical_suite_active_patient_vitals', JSON.stringify(patientVitals));
  }, [patientVitals]);

  const clearActivePatient = () => {
    setPatientName('');
    setPatientId('');
    setPatientVitals({ weight: '', height: '', age: '', gender: 'male', scr: '' });
  };

  return (
    <PatientContext.Provider value={{
      patientName,
      setPatientName,
      patientId,
      setPatientId,
      patientVitals,
      setPatientVitals,
      clearActivePatient
    }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  return useContext(PatientContext);
}