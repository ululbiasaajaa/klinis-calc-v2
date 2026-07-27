import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function GcsCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State untuk komponen GCS
  const [eye, setEye] = useState('4');         // 1 - 4
  const [motor, setMotor] = useState('6');     // 1 - 6
  const [verbal, setVerbal] = useState('5');   // 1 - 5

  // Hitung Total Skor GCS
  const totalGcs = parseInt(eye) + parseInt(motor) + parseInt(verbal);

  // Penentuan Tingkat Kesadaran Berdasarkan Total GCS
  let consciousnessLevel = 'Compos Mentis (Sadar Penuh / Normal)';
  let clinicalStatus = 'Pasien sadar penuh, orientasi baik terhadap orang, waktu, dan tempat.';
  let badgeColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';

  if (totalGcs >= 13 && totalGcs <= 14) {
    consciousnessLevel = 'Apatis / Somnolen Ringan (Penurunan Kesadaran Ringan)';
    clinicalStatus = 'Pasien tampak mengantuk, namun bisa dibangunkan dengan rangsangan ringan dan kooperatif.';
    badgeColor = 'text-blue-500 bg-blue-500/10 border-blue-500/30';
  } else if (totalGcs >= 9 && totalGcs <= 12) {
    consciousnessLevel = 'Sopor / Stupor (Penurunan Kesadaran Sedang)';
    clinicalStatus = 'Pasien tidur lelap, hanya berespons terhadap rangsangan nyeri kuat (menghindar/menepis).';
    badgeColor = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
  } else if (totalGcs >= 3 && totalGcs <= 8) {
    consciousnessLevel = 'Koma (Penurunan Kesadaran Berat / Gawat Darurat)';
    clinicalStatus = 'Tidak ada respons sama sekali terhadap stimulus verbal maupun nyeri. Wajib proteksi jalan napas (intubasi/ventilator)!';
    badgeColor = 'text-red-500 bg-red-500/10 border-red-500/30';
  }

  return (
    <div className="space-y-6 text-xs">
      
      {/* HEADER INFORMASI */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="font-bold text-blue-500 mb-2">🧠 Kalkulator Glasgow Coma Scale (GCS) & Tingkat Kesadaran</h3>
        <p className="text-slate-400 text-[11px] mb-4">
          Digunakan untuk menilai tingkat kesadaran pasien trauma kepala, stroke, atau kasus gawat darurat neurologi di IGD/ICU.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. EYE (MATA) */}
          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>1. Eye / Respon Membuka Mata (E)</label>
            <select
              value={eye}
              onChange={(e) => setEye(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            >
              <option value="4">4 - Membuka mata spontan (Spontaneous)</option>
              <option value="3">3 - Membuka mata dengan perintah suara (To Speech)</option>
              <option value="2">2 - Membuka mata dengan rangsangan nyeri (To Pain)</option>
              <option value="1">1 - Tidak ada respon / Menutup terus (None)</option>
            </select>
          </div>

          {/* 2. MOTORIK */}
          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>2. Motorik / Respon Gerakan (M)</label>
            <select
              value={motor}
              onChange={(e) => setMotor(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            >
              <option value="6">6 - Mengikuti perintah dengan baik (Obeys Commands)</option>
              <option value="5">5 - Melokalisir nyeri / Mengetahui letak nyeri (Localized Pain)</option>
              <option value="4">4 - Menarik diri dari nyeri / Menghindar (Withdrawal)</option>
              <option value="3">3 - Fleksi abnormal / Dekortikasi (Abnormal Flexion)</option>
              <option value="2">2 - Ekstensi abnormal / Deserebrasi (Abnormal Extension)</option>
              <option value="1">1 - Tidak ada gerakan sama sekali (None)</option>
            </select>
          </div>

          {/* 3. VERBAL */}
          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>3. Verbal / Respon Bicara (V)</label>
            <select
              value={verbal}
              onChange={(e) => setVerbal(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            >
              <option value="5">5 - Orientasi baik, sadar, bicara normal (Oriented)</option>
              <option value="4">4 - Bingung, disorientasi tempat/waktu (Confused)</option>
              <option value="3">3 - Kata-kata kacau, tidak nyambung (Inappropriate Words)</option>
              <option value="2">2 - Mengerang, suara tanpa arti (Incomprehensible Sounds)</option>
              <option value="1">1 - Tidak ada suara / Bersuara (None)</option>
            </select>
          </div>

        </div>
      </div>

      {/* HASIL INTERPRETASI */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-center gap-4 ${
        isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'
      }`}>
        <div>
          <span className="text-xs text-blue-500 font-bold block mb-1">TOTAL SKOR GCS: E{eye} M{motor} V{verbal} = <strong className="text-base">{totalGcs}</strong></span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-3 py-1 rounded-lg font-extrabold text-xs border ${badgeColor}`}>
              {consciousnessLevel}
            </span>
          </div>
        </div>

        <div className="text-right text-[11px] max-w-sm space-y-1">
          <p className="text-slate-400 font-medium leading-relaxed">{clinicalStatus}</p>
        </div>
      </div>

    </div>
  );
}