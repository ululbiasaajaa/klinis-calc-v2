import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

// Daftar seluruh kalkulator klinis (ID disinkronkan 1:1 dengan App.jsx & Sidebar)
const CALCULATORS_LIST = [
  { id: 'dashboard', name: 'Dashboard Analitik', category: 'Utama', icon: '📊' },
  { id: 'pk', name: 'Dosis PK (Farmakokinetik)', category: 'Dosis & Obat', icon: '💊' },
  { id: 'drip', name: 'Dosis Drip / Syringe Pump', category: 'Dosis & Obat', icon: '💉' },
  { id: 'abx_dose', name: 'Dosis Antibiotik (Adjusted ClCr)', category: 'Dosis & Obat', icon: '🦠' },
  { id: 'peds_geri', name: 'Pediatrik & Geriatri', category: 'Dosis & Obat', icon: '👶' },
  { id: 'stopp_start', name: 'Screening Geriatri (STOPP/START)', category: 'Dosis & Obat', icon: '📋' },
  { id: 'crrt', name: 'Dosis ICU & CRRT', category: 'Dosis & Obat', icon: '🌡️' },
  { id: 'gout', name: 'Kalkulator Asam Urat & Gout', category: 'Organ & Fungsi', icon: '🧬' },
  { id: 'lipid', name: 'Profil Lipid & Risiko Kolesterol', category: 'Organ & Fungsi', icon: '❤️' },
  { id: 'toxicology', name: 'Toksikologi Klinis & Keracunan', category: 'Fisiologi & Cairan', icon: '🧪' },
  { id: 'framingham', name: 'Risiko Jantung (Framingham 10-Yr)', category: 'Organ & Fungsi', icon: '❤️' },
  { id: 'gcs', name: 'Neurologi IGD (GCS & Kesadaran)', category: 'Fisiologi & Cairan', icon: '🧠' },
  { id: 'triage', name: 'Triase IGD (Australasian Triage Scale)', category: 'Fisiologi & Cairan', icon: '🚑' },
  { id: 'fluid', name: 'Terapi Cairan & Luka Bakar (Parkland)', category: 'Fisiologi & Cairan', icon: '💧' },
  { id: 'electro', name: 'Koreksi Elektrolit Darurat (IGD)', category: 'Fisiologi & Cairan', icon: '🩸' },
  { id: 'ards', name: 'Evaluasi ARDS & AGD (ICU)', category: 'Fisiologi & Cairan', icon: '🫁' },
  { id: 'pregnancy', name: 'Usia Kehamilan & HPL (Obgin)', category: 'Organ & Fungsi', icon: '🤰' },
  { id: 'renal_dose', name: 'Auto-Checker Dosis Ginjal', category: 'Organ & Fungsi', icon: '🧪' },
  { id: 'label_print', name: 'Cetak Etiket & Resep Obat', category: 'Dosis & Obat', icon: '🖨️' },
  { id: 'hd_dose', name: 'Dosis Pasien Cuci Darah (HD)', category: 'Organ & Fungsi', icon: '🧪' },
  { id: 'hepar', name: 'Evaluasi Hepar (Child-Pugh & MELD)', category: 'Organ & Fungsi', icon: '🫀' },
  { id: 'diabetes', name: 'Manajemen Diabetes & Insulin', category: 'Nutrisi & Energi', icon: '🩸' },
  { id: 'steroid', name: 'Konversi Dosis Steroid', category: 'Dosis & Obat', icon: '🧬' },
  { id: 'nti', name: 'Obat Terapi Sempit (NTI / TDM)', category: 'Dosis & Obat', icon: '⚡' },
  { id: 'tdm_chart', name: 'Grafik Trend Monitoring TDM', category: 'Dosis & Obat', icon: '📊' },
  { id: 'ddi', name: 'Cek Interaksi Obat (DDI High-Risk)', category: 'Dosis & Obat', icon: '⚠️' },
  { id: 'renal', name: 'Fungsi Ginjal (ClCr & eGFR)', category: 'Organ & Fungsi', icon: '🫘' },
  { id: 'anthro', name: 'Body (BSA, BMI, Parkland)', category: 'Fisiologi & Cairan', icon: '📐' },
  { id: 'kalori', name: 'Kalori Harian & Diet Plan', category: 'Nutrisi & Energi', icon: '🔥' },
];

export default function CommandPaletteModal({ isOpen, onClose, onSelectCalculator }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Ambil profil pasien aktif dari Store v3
  const { patient } = usePatientStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter kalkulator berdasarkan ketikan user
  const filteredCalculators = CALCULATORS_LIST.filter((calc) =>
    calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    calc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset selected index pas query berubah
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Keyboard navigation (Arrow keys, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredCalculators.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCalculators.length - 1));
      } else if (e.key === 'Enter' && filteredCalculators.length > 0) {
        e.preventDefault();
        onSelectCalculator(filteredCalculators[selectedIndex].id);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCalculators, selectedIndex, onSelectCalculator, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose} // Klik area luar modal untuk menutup di HP
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian Cepat Kalkulator"
    >
      <div 
        onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam kotak ikut menutup modal
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden text-xs transition-all relative ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* INPUT PENCARIAN & TOMBOL TUTUP NYATA */}
        <div className={`p-4 border-b flex items-center justify-between gap-3 ${
          isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3 flex-1">
            <span className="text-base">🔍</span>
            <input
              autoFocus
              id="command-palette-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cepat cari kalkulator (e.g. toksikologi, keracunan, alkohol, antidot)..."
              className="w-full bg-transparent outline-none text-sm font-semibold placeholder:text-slate-500"
              aria-label="Cari kalkulator"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono px-2 py-1 rounded border hidden sm:inline-block ${
              isDark ? 'border-slate-800 text-slate-400 bg-slate-900' : 'border-slate-300 text-slate-600 bg-slate-100'
            }`}>
              ESC
            </span>
            <button 
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm border ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              ✕ Tutup
            </button>
          </div>
        </div>

        {/* DAFTAR HASIL PENCARIAN */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCalculators.length === 0 ? (
            <div className={`p-8 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Tidak ada kalkulator yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
            </div>
          ) : (
            filteredCalculators.map((calc, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={calc.id}
                  onClick={() => {
                    onSelectCalculator(calc.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : isDark ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{calc.icon}</span>
                    <div>
                      <span className="font-bold block">{calc.name}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-blue-200' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {calc.category}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-1 rounded ${
                    isSelected 
                      ? 'bg-blue-700 text-white' 
                      : isDark ? 'bg-slate-900 border border-slate-800 text-slate-400' : 'bg-slate-100 border border-slate-300 text-slate-600'
                  }`}>
                    Jump ↵
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER PANDUAN & PASIEN AKTIF */}
        <div className={`p-3 border-t flex justify-between items-center text-[10px] ${
          isDark ? 'border-slate-800 bg-slate-900/30 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          <span>
            👤 Pasien: <strong>{patient?.patientName || 'Umum'}</strong> ({patient?.patientId ? `RM: ${patient.patientId}` : 'RM: -'})
          </span>
          <span>Gunakan <strong>↑↓</strong> lalu <strong>Enter</strong></span>
        </div>
      </div>
    </div>
  );
}