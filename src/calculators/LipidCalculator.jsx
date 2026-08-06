import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function LipidCalculator({ onSaveHistory }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL DATA PASIEN & DISPATCHERS LANGSUNG DARI STORE V3
  const { patient, setPatientData, addLabRecord, addMedication } = usePatientStore();

  // State input Profil Lipid (mg/dL)
  const [tc, setTc] = useState(''); // Total Cholesterol
  const [trig, setTrig] = useState(''); // Triglycerides
  const [hdl, setHdl] = useState(''); // HDL
  const [ldl, setLdl] = useState(''); // LDL (bisa dihitung otomatis / manual)

  const [result, setResult] = useState(null);

  const calculateLipid = (e) => {
    e.preventDefault();
    const tChol = parseFloat(tc);
    const tTrig = parseFloat(trig);
    const tHdl = parseFloat(hdl);
    let tLdl = parseFloat(ldl);

    if (isNaN(tChol) || isNaN(tTrig) || isNaN(tHdl)) {
      alert('Mohon isi nilai Total Kolesterol, Trigliserida, dan HDL dengan benar!');
      return;
    }

    // Jika LDL kosong, hitung pakai Rumus Friedewald: LDL = TC - HDL - (Trig / 5) [berlaku jika Trig < 400 mg/dL]
    if (isNaN(tLdl) || tLdl <= 0) {
      if (tTrig < 400) {
        tLdl = tChol - tHdl - (tTrig / 5);
      } else {
        tLdl = 0; // Tidak akurat jika trigliserida > 400
      }
    }

    // Evaluasi Risiko / Status Klinis
    let recommendations = [];
    let riskStatus = 'Optimal / Normal';
    let badgeColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';

    // Evaluasi LDL
    if (tLdl > 0) {
      if (tLdl >= 190) {
        recommendations.push('🚨 LDL Sangat Tinggi (≥ 190 mg/dL): Risiko kardiovaskular sangat tinggi. Indikasi kuat terapi statin intensitas tinggi.');
        riskStatus = 'Sangat Tinggi (High Risk)';
        badgeColor = 'bg-red-500/10 text-red-500 border-red-500/30';
      } else if (tLdl >= 160) {
        recommendations.push('⚠️ LDL Tinggi (160-189 mg/dL): Perlu evaluasi risiko PJK dan modifikasi gaya hidup / farmakoterapi.');
        riskStatus = 'Tinggi';
        badgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      } else if (tLdl >= 130) {
        recommendations.push('⚠️ LDL Batas Tinggi (130-159 mg/dL): Anjurkan diet rendah lemak jenuh & olahraga teratur.');
        riskStatus = 'Borderline Tinggi';
        badgeColor = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      } else {
        recommendations.push('✅ LDL Optimal (< 130 mg/dL atau sesuai target risiko pasien).');
      }
    } else {
      recommendations.push('ℹ️ Trigliserida ≥ 400 mg/dL, rumus Friedewald untuk LDL tidak dapat diaplikasikan secara akurat. Perlu Direct LDL.');
    }

    // Evaluasi HDL (Pria < 40, Wanita < 50 adalah faktor risiko rendah)
    if (tHdl < 40) {
      recommendations.push('⚠️ HDL Rendah (< 40 mg/dL): Merupakan faktor risiko independen penyakit jantung koroner.');
    }

    // Evaluasi Trigliserida
    if (tTrig >= 200) {
      recommendations.push('⚠️ Hipertrigliseridemia (≥ 200 mg/dL): Risiko pankreatitis jika ≥ 500 mg/dL. Batasi karbohidrat sederhana & alkohol.');
    }

    const calcResult = {
      tc: tChol,
      trig: tTrig,
      hdl: tHdl,
      ldl: Number(tLdl.toFixed(1)),
      riskStatus,
      badgeColor,
      recommendations
    };

    setResult(calcResult);

    // AUTO-SYNC KE STORE PASIEN
    setPatientData({
      lipidProfile: {
        totalCholesterol: tChol,
        ldl: Number(tLdl.toFixed(1)),
        hdl: tHdl,
        triglycerides: tTrig,
        status: riskStatus
      }
    });
  };

  const handleSaveToHistory = () => {
    if (!result) return;
    const summaryText = `[KALKULATOR PROFIL LIPID]
• Total Kolesterol: ${result.tc} mg/dL
• LDL: ${result.ldl} mg/dL
• HDL: ${result.hdl} mg/dL
• Trigliserida: ${result.trig} mg/dL
• Status Risiko: ${result.riskStatus}
• Rekomendasi:
${result.recommendations.join('\n')}`;

    // Simpan ke Outcome Tracker V3 Store
    addLabRecord({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: 'Profil Lipid Darah',
      value: `TC: ${result.tc} | LDL: ${result.ldl} | HDL: ${result.hdl} | TG: ${result.trig} (${result.riskStatus})`,
      unit: 'mg/dL',
      source: 'Kalkulator Profil Lipid V3'
    });

    if (onSaveHistory) {
      onSaveHistory({
        type: 'Profil Lipid & Kolesterol',
        summary: summaryText
      });
      alert('✅ Berhasil disalin & disimpan ke Riwayat Pasien!');
    } else {
      alert('✅ Berhasil disimpan ke Outcome Tracker Pasien!');
    }
  };

  const handleAddStatinMed = () => {
    if (!result) return;
    addMedication({
      name: 'Atorvastatin 20mg / Simvastatin 20mg',
      dose: '1x1 Tablet Malam Hari (Pencegahan Kardiovaskular)',
      category: 'Dislipidemia / Terapi Statin',
      source: `Profil Lipid: LDL ${result.ldl} mg/dL (${result.riskStatus})`
    });
    alert('✅ Rekomendasi Terapi Statin berhasil ditambahkan ke regimen obat aktif pasien!');
  };

  return (
    <div className={`border p-6 rounded-2xl shadow-xl space-y-6 text-xs ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      <div className={`border-b pb-4 flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <span>❤️</span> Kalkulator Profil Lipid & Risiko Kolesterol
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analisis kadar lipid darah (TC, LDL, HDL, Trigliserida) & estimasi risiko kardiovaskular.
          </p>
        </div>
        <div className="text-right text-[11px] text-blue-500 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20 font-semibold">
          Pasien: <strong>{patient?.patientName || 'Umum'}</strong>
        </div>
      </div>

      <form onSubmit={calculateLipid} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lipid-tc-input" className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Total Kolesterol (mg/dL)
          </label>
          <input
            id="lipid-tc-input"
            type="number"
            value={tc}
            onChange={(e) => setTc(e.target.value)}
            placeholder="Contoh: 220"
            className={`w-full rounded-xl px-3 py-2.5 text-xs font-semibold outline-none border ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-blue-500'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600'
            }`}
            required
          />
        </div>

        <div>
          <label htmlFor="lipid-trig-input" className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Trigliserida (mg/dL)
          </label>
          <input
            id="lipid-trig-input"
            type="number"
            value={trig}
            onChange={(e) => setTrig(e.target.value)}
            placeholder="Contoh: 150"
            className={`w-full rounded-xl px-3 py-2.5 text-xs font-semibold outline-none border ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-blue-500'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600'
            }`}
            required
          />
        </div>

        <div>
          <label htmlFor="lipid-hdl-input" className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            HDL Kolesterol (mg/dL)
          </label>
          <input
            id="lipid-hdl-input"
            type="number"
            value={hdl}
            onChange={(e) => setHdl(e.target.value)}
            placeholder="Contoh: 45"
            className={`w-full rounded-xl px-3 py-2.5 text-xs font-semibold outline-none border ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-blue-500'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600'
            }`}
            required
          />
        </div>

        <div>
          <label htmlFor="lipid-ldl-input" className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            LDL Kolesterol (Opsional, terhitung otomatis jika kosong)
          </label>
          <input
            id="lipid-ldl-input"
            type="number"
            value={ldl}
            onChange={(e) => setLdl(e.target.value)}
            placeholder="Contoh: 130"
            className={`w-full rounded-xl px-3 py-2.5 text-xs font-semibold outline-none border ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-blue-500'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600'
            }`}
          />
        </div>

        <div className="md:col-span-2 pt-2">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-blue-600/20"
          >
            Hitung & Analisis Profil Lipid ➔
          </button>
        </div>
      </form>

      {result && (
        <div className={`border p-5 rounded-2xl space-y-4 animate-fadeIn ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Hasil Analisis Lipid
            </h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${result.badgeColor}`}>
              {result.riskStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-slate-400 block mb-1">Total Kolesterol</span>
              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{result.tc} mg/dL</span>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-slate-400 block mb-1">LDL (Kalkulasi)</span>
              <span className="text-sm font-bold text-blue-500">{result.ldl} mg/dL</span>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-slate-400 block mb-1">HDL Kolesterol</span>
              <span className="text-sm font-bold text-emerald-500">{result.hdl} mg/dL</span>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-slate-400 block mb-1">Trigliserida</span>
              <span className="text-sm font-bold text-amber-500">{result.trig} mg/dL</span>
            </div>
          </div>

          <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Rekomendasi Klinis:</span>
            <ul className={`space-y-1.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {result.recommendations.map((rec, index) => (
                <li key={index} className="leading-relaxed">{rec}</li>
              ))}
            </ul>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <span className="text-emerald-500 font-medium">⚡ Data otomatis disinkronkan (Auto-Sync) ke profil pasien aktif.</span>
            <div className="flex flex-wrap gap-2">
              {result.ldl >= 130 && (
                <button
                  type="button"
                  onClick={handleAddStatinMed}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  + Terapi Statin 💊
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveToHistory}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md"
              >
                Salin & Simpan Riwayat 📋
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}