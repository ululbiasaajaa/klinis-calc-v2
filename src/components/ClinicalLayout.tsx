import React, { ReactNode, useState } from 'react';
import PatientContextBar from './PatientContextBar';
import PatientDirectoryModal from './PatientDirectoryModal';

interface Props {
  children?: ReactNode;
  onOpenDirectory?: () => void;
}

export default function ClinicalLayout({ children, onOpenDirectory }: Props) {
  const [isLocalDirOpen, setIsLocalDirOpen] = useState(false);

  // Jika handler dari parent (App.tsx) tidak dikirim, gunakan state lokal
  const handleOpenDir = onOpenDirectory || (() => setIsLocalDirOpen(true));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-600 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Single Source of Truth - Shared Patient Context Bar v3 */}
        <PatientContextBar onOpenDirectory={handleOpenDir} />

        {/* Dynamic Calculator / Content Modules */}
        <main className="space-y-6">
          {children}
        </main>

        {/* Fallback Patient Directory Modal jika layout dipakai Standalone */}
        {!onOpenDirectory && (
          <PatientDirectoryModal
            isOpen={isLocalDirOpen}
            onClose={() => setIsLocalDirOpen(false)}
            onSelectPatient={() => setIsLocalDirOpen(false)}
          />
        )}

      </div>
    </div>
  );
}