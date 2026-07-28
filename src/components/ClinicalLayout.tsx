import React, { ReactNode } from 'react';
import PatientContextBar from './PatientContextBar';

interface Props {
  children?: ReactNode;
}

export default function ClinicalLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Panel Pasien Global Kita */}
        <PatientContextBar />

        {/* Tempat nampilin kalkulator lama lu */}
        <div className="space-y-6">
          {children}
        </div>

      </div>
    </div>
  );
}