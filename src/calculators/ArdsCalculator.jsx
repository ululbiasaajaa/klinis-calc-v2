import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function ArdsCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL PASIEN & COMPUTED CLINICAL CONTEXT LANGSUNG DARI STORE V3
  const { patient, getClinicalContext, addLabRecord } = usePatientStore();
  const { ibw } = getClinicalContext();

  const [inputs, setInputs] = useState({ pao2: '80', fio2: '40' }); // FiO2 dalam persen (misal 40%) atau desimal (misal 0.4)

  // Kalkulasi Rasio PaO2 / FiO2
  const p = parseFloat(inputs.pao2);
  const f = parseFloat(inputs.fio2);

  let ratio = 0;
  if (!isNaN(p) && !isNaN(f) && f > 0 && p > 0) {
    // Jika input FiO2 > 1 (misal 40), anggap persentase dan bagi 100.
    // Jika input <= 1 (misal 0.4 atau 1), anggap sudah berbentuk desimal.
    const fio2Decimal = f > 1 ? f / 100 : f;
    if (fio2Decimal > 0) {
      ratio = Number((p / fio2Decimal).toFixed(1));
    }
  }

  // Evaluasi Keparahan ARDS berdasarkan Berlin Definition
  const getArdsSeverity = (val) => {
    if (val === 0) return { level: 'none', label: 'Belum terhitung', color: 'text-slate-400', desc: 'Masukkan parameter AGD (PaO2) dan FiO2.' };
    if (val <= 100) return { level: 'severe', label: '🚨 ARDS BERAT (Severe)', color: 'text-red-500', desc: 'Mortalitas tinggi. Pertimbangkan ventilator posisi prone, neuromuskular blokade (NMB), PEEP tinggi, dan penyesuaian Tidal Volume 4-8 mL/kg PBW.' };
    if (val <= 200) return { level: 'moderate', label: '⚠️ ARDS SEDANG (Moderate)', color: 'text-amber-500', desc: 'Memerlukan ventilasi mekanik invasif dengan PEEP moderat-tinggi dan strategi lung-protective.' };
    if (val <= 300) return { level: 'mild', label: '⚠️ ARDS RINGAN (Mild)', color: 'text-yellow-500', desc: 'Dapat dipertimbangkan dukungan Ventilasi Non-Invasif (NIV) atau HFNC / CPAP jika kriteria terpenuhi.' };
    return { level: 'normal', label: '✅ Normal / Di Atas Batas ARDS', color: 'text-emerald-500', desc: 'Rasio PaO2/FiO2 > 300 mmHg tidak memenuhi kriteria diagnostik ARDS Berlin.' };
  };

  const severity = getArdsSeverity(ratio);

  // Simpan hasil evaluasi PaO2/FiO2 ke Outcome Tracker Pasien
  const handleSaveToRecord = () => {
    if (ratio === 0) return;
    addLabRecord({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: 'PaO2/FiO2 Ratio',
      value: ratio.toString(),
      unit: 'mmHg',
      source: `ARDS Evaluation (${severity.label})`
    });
    alert(`✅ Rasio PaO2/FiO2 (${ratio} mmHg) berhasil disimpan ke Outcome Tracker Pasien!`);
  };

  // Estimasi Target Tidal Volume berdasarkan PBW (4-8 mL/kg)
  const pbwVal = ibw > 0 ? ibw : 0;
  const tv4ml = pbwVal > 0 ? (pbwVal * 4).toFixed(0) : 0;
  const tv8ml = pbwVal > 0 ? (pbwVal * 8).toFixed(0) : 0;

  return (
    <div className="space-y-6 text-xs">
      
      {patient?.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Evaluasi gagal napas & ARDS Berlin Definition.</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">STORE V3 SYNCED</span>
        </div>
      )}

      {/* HEADER INFORMASI MODUL */}
      <div className={`p-4 rounded-xl border ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-blue-50 border-blue-200 text-slate-700'
      }`}>
        <p className="font-bold mb-1 text-blue-400">🫁 Modul Penilaian Gagal Napas & ARDS (Berlin Definition v3):</p>
        <p className="text-[11px] leading-relaxed">
          Digunakan di IGD dan ICU untuk mengukur tingkat keparahan hipoksemia dan sindrom gawat napas akut (ARDS) pada pasien kritis.
        </p>
      </div>

      {/* INPUT PARAMETER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pao2-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            PaO2 dari Analisis Gas Darah (mmHg):
          </label>
          <input
            id="pao2-input"
            type="number"
            value={inputs.pao2}
            onChange={(e) => setInputs({ ...inputs, pao2: e.target.value })}
            placeholder="e.g. 75"
            className={`w-full p-3 rounded-xl border outline-none font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />
        </div>

        <div>
          <label htmlFor="fio2-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            FiO2 (Fraksi Oksigen Inspirasi, % atau Desimal):
          </label>
          <input
            id="fio2-input"
            type="number"
            value={inputs.fio2}
            onChange={(e) => setInputs({ ...inputs, fio2: e.target.value })}
            placeholder="e.g. 50 (untuk 50%) atau 0.5"
            className={`w-full p-3 rounded-xl border outline-none font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />
        </div>
      </div>

      {/* HASIL KALKULASI RASIO & REKOMENDASI */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <span className="text-xs text-blue-500 font-bold block">HASIL KALKULASI RASIO PaO2 / FiO2</span>
          <span className="text-[10px] text-slate-400 font-mono">PEEP ≥ 5 cmH2O (Kriteria Berlin)</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {ratio} <span className="text-sm font-normal text-slate-400">mmHg</span>
            </div>
            <span className={`font-bold block mt-1 text-sm ${severity.color}`}>{severity.label}</span>
          </div>

          {/* TARGET TIDAL VOLUME DENGAN PBW STORE */}
          {pbwVal > 0 && (
            <div className={`p-3 rounded-xl border text-right ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 block font-bold">LUNG-PROTECTIVE TIDAL VOLUME (4-8 mL/kg PBW):</span>
              <strong className="text-emerald-400 text-sm block mt-0.5">
                {tv4ml} - {tv8ml} mL
              </strong>
              <span className="text-[9px] text-slate-500 block">Berdasarkan PBW Pasien: {pbwVal} kg</span>
            </div>
          )}
        </div>

        <div className={`p-3.5 rounded-xl border text-xs ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="font-bold block mb-1 text-amber-500">📋 Protokol Ventilasi & Tata Laksana ARDS:</span>
          <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>{severity.desc}</p>
        </div>

        {/* SIMPAN HASIL KE STORE V3 */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSaveToRecord}
            disabled={ratio === 0}
            className={`py-2.5 px-4 rounded-xl font-bold transition-all text-xs cursor-pointer flex items-center gap-2 ${
              ratio > 0 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            💾 Simpan Hasil PaO2/FiO2 ke Outcome Tracker
          </button>
        </div>
      </div>

    </div>
  );
}