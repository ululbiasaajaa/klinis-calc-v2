import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import PatientSummaryCard from './PatientSummaryCard';
import PatientFormModal from './PatientFormModal'; // ✅ Pakai ./ karena satu folder

export default function PatientContextBar() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className={`mb-6 p-4 rounded-2xl border shadow-xl transition-colors ${
      isDark 
        ? 'bg-slate-900 border-slate-800 text-slate-100' 
        : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
    }`}>
      <PatientSummaryCard onToggleEdit={() => setIsEditing(!isEditing)} isEditing={isEditing} />
      {isEditing && <PatientFormModal onClose={() => setIsEditing(false)} />}
    </div>
  );
}