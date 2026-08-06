import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function RoleGateModal({ onAccessGranted }) {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';

  const [selectedRole, setSelectedRole] = useState('Farmasis');
  const [agreed, setAgreed] = useState(false);

  const roles = [
    { id: 'Dokter', icon: '👨‍⚕️', label: lang === 'id' ? 'Dokter DPJP / Klinisi' : 'Attending Physician' },
    { id: 'Farmasis', icon: '💊', label: lang === 'id' ? 'Farmasis Klinis / Apoteker' : 'Clinical Pharmacist' },
    { id: 'Perawat', icon: '👩‍⚕️', label: lang === 'id' ? 'Perawat IGD / ICU' : 'ICU / ER Nurse' },
    { id: 'Ahli Gizi', icon: '🥗', label: lang === 'id' ? 'Nutrisionis / Dietisien' : 'Clinical Nutritionist' },
    { id: 'Mahasiswa', icon: '🎓', label: lang === 'id' ? 'Mahasiswa Medis / Farmasi' : 'Medical / Pharmacy Student' },
  ];

  const handleEnter = () => {
    if (!agreed) return;
    // Simpan status sesi ke sessionStorage agar audit trail v3 dapat membacanya
    sessionStorage.setItem('clinical_suite_auth_role', selectedRole);
    if (onAccessGranted) {
      onAccessGranted(selectedRole);
    }
  };

  // Keyboard shortcut: Tekan Enter untuk masuk jika persetujuan sudah dicentang
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && agreed) {
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [agreed, selectedRole]);

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rolegate-modal-title"
    >
      <div 
        className={`border p-6 md:p-8 rounded-3xl max-w-lg w-full shadow-2xl relative space-y-6 transition-all ${
          isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        
        {/* HEADER BRAND */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600/10 text-blue-500 text-3xl mb-1">
            🩺
          </div>
          <h2 id="rolegate-modal-title" className="text-xl font-extrabold tracking-tight">
            Clinical Suite Enterprise v3
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {lang === 'id' 
              ? 'Sistem Pendukung Keputusan Klinis & Single Source Patient Context' 
              : 'Clinical Decision Support & Integrated Shared Patient Context'}
          </p>
        </div>

        {/* ROLE SELECTOR */}
        <div className="space-y-2">
          <label className={`block text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'id' ? '1. Pilih Peran Profesional Anda:' : '1. Select Your Professional Role:'}
          </label>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
            {roles.map((r) => {
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  className={`w-full p-3 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between border cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-900/30'
                      : isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{r.icon}</span>
                    <span>{r.label}</span>
                  </div>
                  {isSelected && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">Active</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* LEGAL DISCLAIMER */}
        <div className={`p-3.5 rounded-2xl border text-[11px] space-y-1.5 ${
          isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <p className="font-bold text-amber-500 flex items-center gap-1">
            <span>⚠️</span> {lang === 'id' ? 'Peringatan & Batasan Hukum (Disclaimer):' : 'Legal & Clinical Disclaimer:'}
          </p>
          <p className="leading-relaxed">
            {lang === 'id'
              ? 'Aplikasi ini ditujukan khusus sebagai alat bantu klinis bagi tenaga kesehatan profesional. Seluruh hasil kalkulasi wajib diverifikasi kembali dan keputusan terapi akhir sepenuhnya berada di tangan DPJP/Klinisi yang berwenang.'
              : 'This application is intended strictly as a clinical decision support tool for healthcare professionals. All calculations must be verified, and final therapeutic decisions rest solely with the attending clinician.'}
          </p>
        </div>

        {/* CHECKBOX AGREEMENT */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            id="agreeCheck"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
          />
          <label htmlFor="agreeCheck" className={`text-xs font-medium cursor-pointer select-none ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {lang === 'id'
              ? 'Saya menyatakan bahwa saya adalah tenaga profesional / praktisi medis dan menyetujui ketentuan penggunaan klinis.'
              : 'I confirm that I am a healthcare professional/practitioner and agree to the clinical terms of use.'}
          </label>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="button"
          onClick={handleEnter}
          disabled={!agreed}
          className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs transition-all shadow-lg ${
            agreed
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 cursor-pointer'
              : isDark 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
          }`}
        >
          {lang === 'id' ? '🚀 Masuk ke Sesi Klinis Enterprise v3' : '🚀 Enter Clinical Session v3'}
        </button>

      </div>
    </div>
  );
}