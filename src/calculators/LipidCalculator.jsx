import React, { useState } from 'react';
import { usePatientStore } from '../store/usePatientStore';

export default function LipidCalculator({ onSaveHistory }) {
  const { patient, setPatientData } = usePatientStore();

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
    let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

    // Evaluasi LDL
    if (tLdl > 0) {
      if (tLdl >= 190) {
        recommendations.push('🚨 LDL Sangat Tinggi (≥ 190 mg/dL): Risiko kardiovaskular sangat tinggi. Indikasi kuat terapi statin intensitas tinggi.');
        riskStatus = 'Sangat Tinggi (High Risk)';
        badgeColor = 'bg-red-500/10 text-red-400 border-red-500/30';
      } else if (tLdl >= 160) {
        recommendations.push('⚠️ LDL Tinggi (160-189 mg/dL): Perlu evaluasi risiko PJK dan modifikasi gaya hidup / farmakoterapi.');
        riskStatus = 'Tinggi';
        badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      } else if (tLdl >= 130) {
        recommendations.push('⚠️ LDL Batas Tinggi (130-159 mg/dL): Anjurkan diet rendah lemak jenuh & olahraga teratur.');
        riskStatus = 'Borderline Tinggi';
        badgeColor = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
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

    if (onSaveHistory) {
      onSaveHistory({
        type: 'Profil Lipid & Kolesterol',
        summary: summaryText
      });
      alert('✅ Berhasil disalin & disimpan ke Riwayat Pasien!');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl text-slate-100 space-y-6">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>❤️</span> Kalkulator Profil Lipid & Risiko Kolesterol
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analisis kadar lipid darah (TC, LDL, HDL, Trigliserida) & estimasi risiko kardiovaskular.
          </p>
        </div>
        <div className="text-right text-[11px] text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20">
          Pasien: <strong>{patient.patientName || 'Umum'}</strong>
        </div>
      </div>

      <form onSubmit={calculateLipid} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Total Kolesterol (mg/dL)
          </label>
          <input
            type="number"
            value={tc}
            onChange={(e) => setTc(e.target.value)}
            placeholder="Contoh: 220"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Trigliserida (mg/dL)
          </label>
          <input
            type="number"
            value={trig}
            onChange={(e) => setTrig(e.target.value)}
            placeholder="Contoh: 150"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            HDL Kolesterol (mg/dL)
          </label>
          <input
            type="number"
            value={hdl}
            onChange={(e) => setHdl(e.target.value)}
            placeholder="Contoh: 45"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            LDL Kolesterol (Opsional, terhitung otomatis jika kosong)
          </label>
          <input
            type="number"
            value={ldl}
            onChange={(e) => setLdl(e.target.value)}
            placeholder="Contoh: 130"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500"
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
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Hasil Analisis Lipid
            </h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${result.badgeColor}`}>
              {result.riskStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block mb-1">Total Kolesterol</span>
              <span className="text-sm font-bold text-white">{result.tc} mg/dL</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block mb-1">LDL (Kalkulasi)</span>
              <span className="text-sm font-bold text-blue-400">{result.ldl} mg/dL</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block mb-1">HDL Kolesterol</span>
              <span className="text-sm font-bold text-emerald-400">{result.hdl} mg/dL</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block mb-1">Trigliserida</span>
              <span className="text-sm font-bold text-amber-400">{result.trig} mg/dL</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Rekomendasi Klinis:</span>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="leading-relaxed">{rec}</li>
              ))}
            </ul>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between text-xs">
            <span className="text-emerald-400">⚡ Data otomatis disinkronkan (Auto-Sync) ke profil pasien aktif.</span>
            <button
              onClick={handleSaveToHistory}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md"
            >
              Salin & Simpan Riwayat 📋
            </button>
          </div>
        </div>
      )}
    </div>
  );
}