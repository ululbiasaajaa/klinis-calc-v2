import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

// Daftar seluruh kalkulator klinis di aplikasi lu
const CALCULATORS_LIST = [
  { id: 'antibiotic', name: 'Penyesuaian Dosis Antibiotik (ClCr)', category: 'Farmasi & Infeksi', icon: '🦠' },
  { id: 'ards', name: 'Kalkulator ARDS (PaO2/FiO2 Ratio)', category: 'Pulmonologi / ICU', icon: '🫁' },
  { id: 'childpugh', name: 'Skor Sirosis Hepatis Child-Pugh & MELD', category: 'Gastrohepatologi', icon: '🟡' },
  { id: 'crrt', name: 'Dosis & Parameter Terapi CRRT', category: 'ICU / Nefrologi', icon: '⚡' },
  { id: 'ddi', name: 'Drug-Drug Interaction (Interaksi Obat)', category: 'Farmasi Klinis', icon: '⚠️' },
  { id: 'diabetes', name: 'Kalkulator Diabetes & Koreksi Gula Darah',category: 'Endokrin', icon: '🩸' },
  { id: 'electrolyte', name: 'Koreksi Elektrolit (Na, K, Ca, Mg)', category: 'Kritis / Elektrolit', icon: '🧪' },
  { id: 'fluid', name: 'Cairan Rumatan (Holliday-Segar) & Parkland Luka Bakar', category: 'Bedah / IGD', icon: '💧' },
  { id: 'framingham', name: 'Framingham Risk Score (Risiko PJK 10 Tahun)', category: 'Kardiovaskular', icon: '❤️' },
  { id: 'gcs', name: 'Glasgow Coma Scale (GCS) & Kesadaran', category: 'Neurologi / IGD', icon: '🧠' },
  { id: 'hemodialysis', name: 'Evaluasi & Dosis Hemodialisis', category: 'Nefrologi', icon: '🩺' },
  { id: 'nti', name: 'NTI Drugs, TDM, Phenytoin, & Vancomycin AUC', category: 'Farmasi Klinis', icon: '📈' },
  { id: 'pedsgeri', name: 'Dosis Khusus Pediatri & Geriatri', category: 'Farmasi Khusus', icon: '👶' },
  { id: 'pregnancy', name: 'Usia Kehamilan & Hari Perkiraan Lahir (HPL)', category: 'Obstetri / KIA', icon: '🤰' },
  { id: 'prescription', name: 'Cetak Etiket Resep Apotek (Putih/Biru)', category: 'Farmasi / Poliklinik', icon: '🏷️' },
  { id: 'renaldosing', name: 'Auto-Checker Penyesuaian Dosis Ginjal', category: 'Nefrologi / Farmasi', icon: '💊' },
  { id: 'steroid', name: 'Konversi Dosis Kortikosteroid Ekivalen', category: 'Farmakologi', icon: '🔄' },
  { id: 'stoppstart', name: 'Skrining Geriatri STOPP / START v2', category: 'Geriatri', icon: '👴' },
  { id: 'tdmchart', name: 'Kurva Time-Series TDM Kadar Obat', category: 'Farmasi Klinis', icon: '📊' },
  { id: 'triage', name: 'Asisten Triase IGD (ATS)', category: 'Kegawatdaruratan', icon: '🚑' },
];

export default function CommandPaletteModal({ isOpen, onClose, onSelectCalculator }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div 
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden text-xs transition-all ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* INPUT PENCARIAN */}
        <div className={`p-4 border-b flex items-center gap-3 ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
          <span className="text-base">🔍</span>
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cepat cari kalkulator (e.g. vanco, gfr, tdm, triase)..."
            className="w-full bg-transparent outline-none text-sm font-semibold placeholder:text-slate-500"
          />
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border opacity-60">ESC</span>
        </div>

        {/* DAFTAR HASIL PENCARIAN */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCalculators.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
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
                      <span className={`text-[10px] ${isSelected ? 'text-blue-200' : 'opacity-60'}`}>{calc.category}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-1 rounded ${isSelected ? 'bg-blue-700 text-white' : 'opacity-40 border'}`}>
                    Jump ↵
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER PANDUAN */}
        <div className={`p-3 border-t flex justify-between items-center text-[10px] opacity-60 ${isDark ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50'}`}>
          <span>Gunakan <strong>↑↓</strong> untuk navigasi, <strong>Enter</strong> untuk memilih</span>
          <span>Quick Search (Ctrl + K)</span>
        </div>
      </div>
    </div>
  );
}