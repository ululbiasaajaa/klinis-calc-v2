import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function GoutCalculator({ onSaveHistory }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL DATA PASIEN & DISPATCHERS LANGSUNG DARI STORE V3
  const { patient, setPatientData, addLabRecord } = usePatientStore();

  // State input Asam Urat
  const [uricAcid, setUricAcid] = useState('');
  const [gender, setGender] = useState('male'); // 'male' or 'female'
  const [hasSymptoms, setHasSymptoms] = useState(false); // Ada nyeri sendi/tophus akut?
  const [hasCKD, setHasCKD] = useState(false); // Ada riwayat gangguan ginjal?

  // State hasil kalkulasi
  const [result, setResult] = useState(null);

  // Auto-sync data jenis kelamin dari Patient Context Bar jika tersedia
  useEffect(() => {
    if (patient && patient.gender !== undefined && patient.gender !== '') {
      const isFemale = patient.gender === 'Perempuan';
      setGender(isFemale ? 'female' : 'male');
    }
  }, [patient]);

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
    let badgeColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
    let recommendations = [];

    if (isHyperuricemia) {
      status = 'Hiperurisemia (Kadar Asam Urat Tinggi)';
      badgeColor = 'bg-red-500/10 text-red-500 border-red-500/30';

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
      badgeColor, // Menyertakan badgeColor yang sebelumnya terlewat
      recommendations,
      timestamp: new Date().toLocaleTimeString('id-ID')
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
• Kadar Asam Urat: ${result.uricAcid} mg/dL (${result.gender === 'male' ? 'Pria' : 'Wanita'}, Normal <= ${result.upperLimit})
• Status: ${result.status}
• Gejala Klinis: ${hasSymptoms ? 'Ada (Simptomatik/Flare)' : 'Tidak Ada (Asimptomatik)'}
• Rekomendasi:
${result.recommendations.join('\n')}`;

    // Simpan ke Outcome Tracker V3 Store
    addLabRecord({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: 'Asam Urat Serum & Gout',
      value: `${result.uricAcid} mg/dL (${result.status})`,
      unit: 'mg/dL',
      source: `Evaluation (${hasSymptoms ? 'Simptomatik' : 'Asimptomatik'})`
    });

    if (onSaveHistory) {
      onSaveHistory({
        type: 'Asam Urat & Gout',
        summary: summaryText
      });
      alert('✅ Berhasil disalin & disimpan ke Riwayat Pasien!');
    } else {
      alert('✅ Berhasil disimpan ke Outcome Tracker Pasien!');
    }
  };

  return (
    <div className={`border p-6 rounded-2xl shadow-xl space-y-6 text-xs ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* Header */}
      <div className={`border-b pb-4 flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <span>🧬</span> Kalkulator Asam Urat & Manajemen Gout
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluasi hiperurisemia, risiko gout, dan rekomendasi tatalaksana klinis.
          </p>
        </div>
        <div className="text-right text-[11px] text-blue-500 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20 font-semibold">
          Pasien: <strong>{patient?.patientName || 'Umum'}</strong>
        </div>
      </div>

      {/* Form Input */}
      <form onSubmit={calculateGout} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="uric-acid-input" className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Kadar Asam Urat Serum (mg/dL)
          </label>
          <input
            id="uric-acid-input"
            type="number"
            step="0.1"
            value={uricAcid}
            onChange={(e) => setUricAcid(e.target.value)}
            placeholder="Contoh: 8.2"
            className={`w-full rounded-xl px-3 py-2.5 text-xs font-semibold outline-none border ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-blue-500'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600'
            }`}
            required
          />
        </div>

        <div>
          <label htmlFor="gout-gender-select" className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Jenis Kelamin
          </label>
          <select
            id="gout-gender-select"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className={`w-full rounded-xl px-3 py-2.5 text-xs font-semibold outline-none border cursor-pointer ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          >
            <option value="male">Pria (Batas normal &le; 7.0 mg/dL)</option>
            <option value="female">Wanita (Batas normal &le; 6.0 mg/dL)</option>
          </select>
        </div>

        <div className="md:col-span-2 space-y-2 pt-2">
          <label className={`flex items-center gap-2 text-xs cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <input
              type="checkbox"
              checked={hasSymptoms}
              onChange={(e) => setHasSymptoms(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
            />
            Pasien memiliki keluhan nyeri sendi akut (flare), bengkak, kemerahan, atau tophus teraba.
          </label>

          <label className={`flex items-center gap-2 text-xs cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <input
              type="checkbox"
              checked={hasCKD}
              onChange={(e) => setHasCKD(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
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
        <div className={`border p-5 rounded-2xl space-y-4 animate-fadeIn ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Hasil Analisis Klinis
            </h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${result.badgeColor}`}>
              {result.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-slate-400 block mb-1">Nilai Input Pasien</span>
              <span className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{result.uricAcid} mg/dL</span>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-slate-400 block mb-1">Ambang Batas Normal</span>
              <span className="text-base font-bold text-blue-500">&le; {result.upperLimit} mg/dL</span>
            </div>
          </div>

          <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Rekomendasi Tatalaksana:</span>
            <ul className={`space-y-1.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {result.recommendations.map((rec, index) => (
                <li key={index} className="leading-relaxed">{rec}</li>
              ))}
            </ul>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <span className="text-emerald-500 font-medium">⚡ Data otomatis disinkronkan (Auto-Sync) ke profil pasien aktif.</span>
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