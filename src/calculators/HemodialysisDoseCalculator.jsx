import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function HemodialysisDoseCalculator() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';

  // Database Sampel Obat Umum di HD
  const hdDrugDatabase = [
    { id: 'custom', name: 'Custom Input (Manual)', mw: 0, vd: 0, pb: 0, dialyzable: 'Unknown' },
    { id: 'vancomycin', name: 'Vancomycin (High Flux HD)', mw: 1449, vd: 0.7, pb: 55, dialyzable: 'Low to Moderate (10-20%)', rec: 'Berikan dosis suplemen 500-1000 mg post-HD jika menggunakan High-Flux Dialyzer.' },
    { id: 'gentamicin', name: 'Gentamicin / Amikacin', mw: 477, vd: 0.25, pb: 10, dialyzable: 'Highly Dialyzable (50%)', rec: 'Berikan 50% dari dosis harian normal SEGERA setelah proses Hemodialisis selesai.' },
    { id: 'meropenem', name: 'Meropenem', mw: 383, vd: 0.35, pb: 2, dialyzable: 'Highly Dialyzable (50%)', rec: 'Berikan dosis tambahan 500 mg - 1000 mg post-HD.' },
    { id: 'metformin', name: 'Metformin', mw: 129, vd: 3.1, pb: 0, dialyzable: 'Dialyzable (Vd Besar)', rec: 'CONTRAINDICATED pada HD / ESRD! Risiko fatal Lactic Acidosis!' },
    { id: 'fluconazole', name: 'Fluconazole', mw: 306, vd: 0.7, pb: 11, dialyzable: 'Highly Dialyzable (50%)', rec: 'Berikan 100% dosis normal harian segera setelah HD.' },
  ];

  const [selectedDrug, setSelectedDrug] = useState('vancomycin');
  const [customInputs, setCustomInputs] = useState({
    preHdDoseMg: '1000',
    hdDurationHours: '4',
    filterType: 'high_flux', // 'high_flux' or 'low_flux'
  });

  const drugInfo = hdDrugDatabase.find((d) => d.id === selectedDrug) || hdDrugDatabase[0];

  const handleInputChange = (e) => {
    setCustomInputs({ ...customInputs, [e.target.name]: e.target.value });
  };

  // Estimasi Dosis Tambahan Post-HD (Supplemental Dose Calculation)
  const calcSupplement = () => {
    const baseDose = parseFloat(customInputs.preHdDoseMg) || 0;
    if (baseDose <= 0) return { percentLost: 0, suppDoseMg: 0, status: 'Masukkan dosis awal' };

    let lossFactor = 0;
    if (drugInfo.id === 'gentamicin' || drugInfo.id === 'meropenem' || drugInfo.id === 'fluconazole') {
      lossFactor = customInputs.filterType === 'high_flux' ? 0.50 : 0.35;
    } else if (drugInfo.id === 'vancomycin') {
      lossFactor = customInputs.filterType === 'high_flux' ? 0.25 : 0.05;
    } else if (drugInfo.id === 'metformin') {
      return { percentLost: 100, suppDoseMg: 0, status: '🚨 KONTRAINDIKASI KETAT! Hentikan Metformin pada pasien HD!' };
    } else {
      lossFactor = 0.30; // Default estimasi manual
    }

    const suppDose = baseDose * lossFactor;
    return {
      percentLost: (lossFactor * 100).toFixed(0),
      suppDoseMg: suppDose.toFixed(0),
      status: `Dosis Suplemen Post-HD yang direkomendasikan: ~${suppDose.toFixed(0)} mg.`
    };
  };

  const evalResult = calcSupplement();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PILIH OBAT DARI DATABASE */}
        <div>
          <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Pilih Obat Pasien HD:' : 'Select Medication:'}
          </label>
          <select
            value={selectedDrug}
            onChange={(e) => setSelectedDrug(e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none text-xs font-bold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          >
            {hdDrugDatabase.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* TIPE DIALYZER / FILTER HD */}
        <div>
          <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Tipe Membran Dialiser (Filter HD):' : 'Dialyzer Membrane Type:'}
          </label>
          <select
            name="filterType"
            value={customInputs.filterType}
            onChange={handleInputChange}
            className={`w-full p-3 rounded-xl border outline-none text-xs font-bold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          >
            <option value="high_flux">⚡ High-Flux Dialyzer (Paling Umum / Klirens Tinggi)</option>
            <option value="low_flux">Standard / Low-Flux Dialyzer</option>
          </select>
        </div>

        {/* DOSIS NORMAL SEBELUM HD */}
        <div>
          <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Dosis Rutin Seharusnya (mg):' : 'Standard Dose (mg):'}
          </label>
          <input
            type="number"
            name="preHdDoseMg"
            value={customInputs.preHdDoseMg}
            onChange={handleInputChange}
            placeholder="e.g. 1000"
            className={`w-full p-3 rounded-xl border outline-none text-xs ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        {/* DURASI PROSES CUCI DARAH */}
        <div>
          <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Durasi HD (Jam):' : 'HD Session Duration (Hours):'}
          </label>
          <input
            type="number"
            name="hdDurationHours"
            value={customInputs.hdDurationHours}
            onChange={handleInputChange}
            placeholder="e.g. 4"
            className={`w-full p-3 rounded-xl border outline-none text-xs ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>
      </div>

      {/* RESULT CARD */}
      <div className={`p-4 rounded-2xl border ${
        isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
          <div>
            <span className="text-xs text-blue-500 font-bold block mb-1">Estimasi Obat Terbuang Saat HD</span>
            <span className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ~{evalResult.percentLost}%
            </span>
          </div>
          <div>
            <span className="text-xs text-blue-500 font-bold block mb-1">Rekomendasi Dosis Suplemen Post-HD</span>
            <span className="text-2xl font-extrabold text-emerald-500">
              +{evalResult.suppDoseMg} mg
            </span>
          </div>
        </div>
      </div>

      {/* KLINIK & GUIDELINE PANDUAN HD */}
      <div className={`p-4 rounded-xl border text-xs space-y-2 ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <p className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
          💡 Panduan Dosis Pasien Cuci Darah (Hemodialysis Guidelines):
        </p>
        {selectedDrug !== 'custom' && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 font-medium">
            <strong>Rekomendasi Khusus {drugInfo.name}:</strong><br />
            {drugInfo.rec}
          </div>
        )}
        <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          • <strong>Prinsip Utama:</strong> Waktu pemberian obat idealnya diberikan **SETELAH (Post-HD)** sesi cuci darah selesai, agar obat tidak tereliminasi sia-sia oleh mesin dialiser.<br />
          • <strong>Faktor Dialyzability:</strong> Obat yang mudah terbuang lewat HD umumnya berukuran molekul kecil (&lt;500 Da), *Protein Binding* rendah (&lt;80%), dan *Volume Distribution* kecil (&lt;1 L/kg).
        </p>
      </div>
    </div>
  );
}