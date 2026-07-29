import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { usePatientStore } from '../store/usePatientStore';

export default function ArdsCalculator() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';

  // Ambil data pasien global dari store atas
  const { patient } = usePatientStore();

  const [inputs, setInputs] = useState({ pao2: '80', fio2: '40' }); // FiO2 dalam persen, misal 40% (0.4)

  const ratio = (() => {
    const p = parseFloat(inputs.pao2);
    const f = parseFloat(inputs.fio2);
    if (!p || !f || f <= 0) return 0;
    // FiO2 input dalam bentuk persen (misal 40), dikonversi ke desimal (0.4) atau langsung jika desimal
    const fio2Decimal = f > 1 ? f / 100 : f;
    return Number((p / fio2Decimal).toFixed(1));
  })();

  const getArdsSeverity = () => {
    if (ratio === 0) return { label: 'Belum terhitung', color: 'text-slate-400', desc: 'Masukkan parameter AGD dan FiO2.' };
    if (ratio <= 100) return { label: '🚨 ARDS BERAT (Severe)', color: 'text-red-500', desc: 'Mortalitas tinggi. Pertimbangkan ventilator posisi prone, neuromuskular blokade, atau ECMO.' };
    if (ratio <= 200) return { label: '⚠️ ARDS SEDANG (Moderate)', color: 'text-amber-500', desc: 'Butuh ventilasi mekanik dengan PEEP tingkat lanjut.' };
    if (ratio <= 300) return { label: '⚠️ ARDS RINGAN (Mild)', color: 'text-yellow-500', desc: 'Memerlukan dukungan Ventilasi Non-Invasif (NIV) atau CPAP/BiPAP.' };
    return { label: '✅ Normal / Di Atas Batas ARDS', color: 'text-emerald-500', desc: 'Rasio PaO2/FiO2 > 300 tidak memenuhi kriteria diagnostik ARDS Berlin.' };
  };

  const severity = getArdsSeverity();

  return (
    <div className="space-y-6">
      
      {patient.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between text-xs">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Evaluasi gagal napas & ARDS Berlin Definition.</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">Active</span>
        </div>
      )}

      <div className={`p-4 rounded-xl border text-xs ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-blue-50 border-blue-200 text-slate-700'
      }`}>
        <p className="font-bold mb-1">🫁 Modul Penilaian Gagal Napas & ARDS (Berlin Definition PaO2/FiO2 Ratio):</p>
        <p>
          Digunakan di IGD dan ICU untuk mengukur tingkat keparahan hipoksemia dan sindrom gawat napas akut pada pasien kritis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            PaO2 dari Analisis Gas Darah (mmHg):
          </label>
          <input
            type="number"
            value={inputs.pao2}
            onChange={(e) => setInputs({ ...inputs, pao2: e.target.value })}
            placeholder="e.g. 75"
            className={`w-full p-3 rounded-xl border outline-none text-xs ${
              isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />
        </div>
        <div>
          <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            FiO2 (Fraksi Oksigen Inspirasi, % atau Desimal):
          </label>
          <input
            type="number"
            value={inputs.fio2}
            onChange={(e) => setInputs({ ...inputs, fio2: e.target.value })}
            placeholder="e.g. 50 (untuk 50%) atau 0.5"
            className={`w-full p-3 rounded-xl border outline-none text-xs ${
              isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />
        </div>
      </div>

      <div className={`p-5 rounded-2xl border ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <span className="text-xs text-blue-500 font-bold block mb-1">HASIL KALKULASI RASIO PaO2 / FiO2</span>
        <div className={`text-3xl font-extrabold my-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {ratio} <span className="text-sm font-normal text-slate-400">mmHg</span>
        </div>
        <div className={`p-3 rounded-xl border mt-3 text-xs ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className={`font-bold block mb-1 ${severity.color}`}>{severity.label}</span>
          <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>{severity.desc}</p>
        </div>
      </div>
    </div>
  );
}