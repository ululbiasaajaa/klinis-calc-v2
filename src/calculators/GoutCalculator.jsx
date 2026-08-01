import React, { useState } from 'react';
import { usePatientStore } from '../store/usePatientStore';

export default function GoutCalculator({ onSaveHistory }) {
  const { patient, setPatientData } = usePatientStore();

  // State input Asam Urat
  const [uricAcid, setUricAcid] = useState('');
  const [gender, setGender] = useState('male'); // 'male' or 'female'
  const [hasSymptoms, setHasSymptoms] = useState(false); // Ada nyeri sendi/tophus akut?
  const [hasCKD, setHasCKD] = useState(false); // Ada riwayat gangguan ginjal?

  // State hasil kalkulasi
  const [result, setResult] = useState(null);

  const calculateGout = (e) => {
    e.preventDefault();
    const ua = parseFloat(uricAcid);
    if (isNaN(ua) || ua <= 0) {
      alert('Masukkan kadar asam urat serum yang valid!');
      return;
    }

    // Tentukan batas normal berdasarkan jenis kelamin (mg/dL)
    // Pria normal: 3.4 - 7.0 mg/dL, Wanita normal: 2.4 - 6.0 mg/dL
    const isMale = gender === 'male';
    const upperLimit = isMale ? 7.0 : 6.0;
    const isHyperuricemia = ua > upperLimit;

    let status = 'Normal (Optimal)';
    let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    let recommendations = [];

    if (isHyperuricemia) {
      status = 'Hiperurisemia (Kadar Asam Urat Tinggi)';
      badgeColor = 'bg-red-500/10 text-red-400 border-red-500/30';

      if (hasSymptoms) {
        recommendations.push('🚨 Indikasi Gout Arthritis Akut / Kronis Tophaceous.');
        recommendations.push('• Terapi Flare Akut: Pertimbangkan NSAID (mis. Kolkisin) atau Kortikosteroid sesuai indikasi medis.');
        recommendations.push('• Inisiasi Terapi Penurun Asam Urat (ULT) seperti Allopurinol setelah fase akut mereda.');
      } else {
        recommendations.push('⚠️ Hiperurisemia Asimptomatik.');
        recommendations.push('• Modifikasi gaya hidup: Diet rendah purin (hindari jeroan, daging merah, seafood, alkohol).');
        recommendations.push('• Peningkatan hidrasi (minum air putih minimal 2 liter/hari).');
        if (ua > 9.0 || hasCKD) {
          recommendations.push('• Pertimbangkan inisiasi farmakoterapi profilaksis berdasarkan evaluasi klinis lanjutan.');
        }
      }
    } else {
      recommendations.push('✅ Kadar asam urat dalam batas normal.');
      recommendations.push('• Pertahankan pola makan sehat dan hidrasi cukup.');
    }

    const calculationResult = {
      uricAcid: ua,
      gender,
      upperLimit,
      isHyperuricemia,
      status,
      recommendations,
      timestamp: new Date().toLocaleTimeString()
    };

    setResult(calculationResult);

    // AUTO-SYNC KE STORE PASIEN AKTIF
    setPatientData({
      serumUricAcid: ua,
      goutStatus: status
    });
  };

  const handleSaveToHistory = () => {
    if (!result) return;
    const summaryText = `[KALKULATOR ASAM URAT / GOUT]
• Kadar Asam Urat: ${result.uricAcid} mg/dL (${result.gender === 'male' ? 'Pria' : 'Wanita'}, Normal < ${result.upperLimit})
• Status: ${result.status}
• Gejala Klinis: ${hasSymptoms ? 'Ada (Simptomatik/Flare)' : 'Tidak Ada (Asimptomatik)'}
• Rekomendasi:
${result.recommendations.join('\n')}`;

    if (onSaveHistory) {
      onSaveHistory({
        type: 'Asam Urat & Gout',
        summary: summaryText
      });
      alert('✅ Berhasil disalin & disimpan ke Riwayat Pasien!');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl text-slate-100 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>🧬</span> Kalkulator Asam Urat & Manajemen Gout
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluasi hiperurisemia, risiko gout, dan rekomendasi tatalaksana klinis.
          </p>
        </div>
        <div className="text-right text-[11px] text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20">
          Pasien: <strong>{patient.patientName || 'Umum'}</strong>
        </div>
      </div>

      {/* Form Input */}
      <form onSubmit={calculateGout} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Kadar Asam Urat Serum (mg/dL)
          </label>
          <input
            type="number"
            step="0.1"
            value={uricAcid}
            onChange={(e) => setUricAcid(e.target.value)}
            placeholder="Contoh: 8.2"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Jenis Kelamin
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="male">Pria (Batas normal &le; 7.0 mg/dL)</option>
            <option value="female">Wanita (Batas normal &le; 6.0 mg/dL)</option>
          </select>
        </div>

        <div className="md:col-span-2 space-y-2 pt-2">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hasSymptoms}
              onChange={(e) => setHasSymptoms(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
            />
            Pasien memiliki keluhan nyeri sendi akut (flare), bengkak, kemerahan, atau tophus teraba.
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hasCKD}
              onChange={(e) => setHasCKD(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
            />
            Pasien memiliki riwayat Penyakit Ginjal Kronis (CKD) / Penurunan Fungsi Ginjal.
          </label>
        </div>

        <div className="md:col-span-2 pt-2">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-blue-600/20"
          >
            Hitung & Evaluasi Risiko Asam Urat ➔
          </button>
        </div>
      </form>

      {/* Hasil Kalkulasi & Auto-Sync Notification */}
      {result && (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Hasil Analisis Klinis
            </h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${result.badgeColor}`}>
              {result.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block mb-1">Nilai Input Pasien</span>
              <span className="text-base font-bold text-white">{result.uricAcid} mg/dL</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block mb-1">Ambang Batas Normal</span>
              <span className="text-base font-bold text-blue-400">&le; {result.upperLimit} mg/dL</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Rekomendasi Tatalaksana:</span>
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