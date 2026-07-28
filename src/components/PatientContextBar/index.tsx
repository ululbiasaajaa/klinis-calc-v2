import React, { useState } from 'react';
import PatientSummaryCard from './PatientSummaryCard';
import PatientFormModal from './PatientFormModal'; // ✅ Pakai ./ karena satu folder

export default function PatientContextBar() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="mb-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl text-slate-100">
      <PatientSummaryCard onToggleEdit={() => setIsEditing(!isEditing)} isEditing={isEditing} />
      {isEditing && <PatientFormModal onClose={() => setIsEditing(false)} />}
    </div>
  );
}