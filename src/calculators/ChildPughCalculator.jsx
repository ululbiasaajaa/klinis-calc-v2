import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ChildPughCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State untuk Child-Pugh Score
  const [encephalopathy, setEncephalopathy] = useState('1'); 
  const [ascites, setAscites] = useState('1');           
  const [bilirubinCP, setBilirubinCP] = useState('2');         
  const [albumin, setAlbumin] = useState('2');           
  const [inrCP, setInrCP] = useState('1');                   

  // State untuk MELD Score (Membutuhkan angka lab aktual)
  const [meldBili, setMeldBili] = useState('1.5');
  const [meldInr, setMeldInr] = useState('1.2');
  const [meldCr, setMeldCr] = useState('1.0');
  const [isDialysis, setIsDialysis] = useState('no'); // Dalam 7 hari terakhir cuci darah 2x atau CVVH

  // 1. Kalkulasi Child-Pugh
  const totalCPScore = parseInt(encephalopathy) + parseInt(ascites) + parseInt(bilirubinCP) + parseInt(albumin) + parseInt(inrCP);

  let cClass = 'A';
  let survival1Year = '100%';
  let surgicalRisk = 'Low Risk (Perioperatif aman)';
  let colorBadge = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';

  if (totalCPScore >= 7 && totalCPScore <= 9) {
    cClass = 'B (Moderate Impairment)';
    survival1Year = '80%';
    surgicalRisk = 'Moderate Risk (Perlu evaluasi ketat)';
    colorBadge = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
  } else if (totalCPScore >= 10) {
    cClass = 'C (Severe Impairment)';
    survival1Year = '45%';
    surgicalRisk = 'High Risk (Kontraindikasi bedah elektif)';
    colorBadge = 'text-red-500 bg-red-500/10 border-red-500/30';
  }

  // 2. Kalkulasi MELD Score (Standard UNOS Formula)
  const meldScore = (() => {
    let b = parseFloat(meldBili) || 1.0;
    let i = parseFloat(meldInr) || 1.0;
    let c = parseFloat(meldCr) || 1.0;

    // Batasan minimum nilai lab adalah 1.0
    if (b < 1.0) b = 1.0;
    if (i < 1.0) i = 1.0;
    if (c < 1.0) c = 1.0;

    // Jika pasien menjalani dialisis 2x dalam seminggu terakhir atau CVVH, kreatinin otomatis diset 4.0
    if (isDialysis === 'yes') {
      c = 4.0;
    }
    // Batas maksimal kreatinin untuk MELD adalah 4.0 mg/dL
    if (c > 4.0) c = 4.0;

    const rawMeld = (0.957 * Math.log(c)) + (0.378 * Math.log(b)) + (1.12 * Math.log(i)) + 0.643;
    let roundedMeld = Math.round(rawMeld * 10);
    
    // MELD Score dibatasi antara 6 sampai 40
    let finalMeld = Math.round(roundedMeld / 10);
    if (finalMeld < 6) finalMeld = 6;
    if (finalMeld > 40) finalMeld = 40;

    return finalMeld;
  })();

  // Estimasi Mortalitas 3 Bulan Berdasarkan MELD Score
  let meldMortality = '3.6% (Risiko Rendah)';
  if (meldScore >= 10 && meldScore <= 19) meldMortality = '19.6% (Risiko Sedang)';
  else if (meldScore >= 20 && meldScore <= 29) meldMortality = '52.6% (Risiko Tinggi)';
  else if (meldScore >= 30 && meldScore <= 39) meldMortality = '71.3% (Risiko Sangat Tinggi)';
  else if (meldScore >= 40) meldMortality = '> 70% - 100% (Gawat Darurat / Prioritas Transplantasi)';

  return (
    <div className="space-y-6 text-xs">
      
      {/* BAGIAN 1: CHILD-PUGH SCORE */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="font-bold text-blue-500 mb-2">🫀 1. Kalkulator Child-Pugh Score (Sirosis & Fungsi Hepar)</h3>
        <p className="text-slate-400 text-[11px] mb-4">
          Menilai tingkat keparahan sirosis kronis serta penyesuaian dosis obat hepatotoksik.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Ensefalopati Hepatik</label>
            <select
              value={encephalopathy}
              onChange={(e) => setEncephalopathy(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            >
              <option value="1">Tidak Ada (Normal) - 1 Poin</option>
              <option value="2">Grade 1-2 (Letargi ringan) - 2 Poin</option>
              <option value="3">Grade 3-4 (Koma / Stupor) - 3 Poin</option>
            </select>
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Asites</label>
            <select
              value={ascites}
              onChange={(e) => setAscites(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            >
              <option value="1">Tidak Ada (None) - 1 Poin</option>
              <option value="2">Mild / Terkontrol Medikamentosa - 2 Poin</option>
              <option value="3">Severe / Refrakter - 3 Poin</option>
            </select>
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Bilirubin Total (mg/dL)</label>
            <select
              value={bilirubinCP}
              onChange={(e) => setBilirubinCP(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            >
              <option value="1">&lt; 2.0 mg/dL - 1 Poin</option>
              <option value="2">2.0 - 3.0 mg/dL - 2 Poin</option>
              <option value="3">&gt; 3.0 mg/dL - 3 Poin</option>
            </select>
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Albumin Serum (g/dL)</label>
            <select
              value={albumin}
              onChange={(e) => setAlbumin(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            >
              <option value="1">&gt; 3.5 g/dL - 1 Poin</option>
              <option value="2">2.8 - 3.5 g/dL - 2 Poin</option>
              <option value="3">&lt; 2.8 g/dL - 3 Poin</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Prothrombin Time (INR)</label>
            <select
              value={inrCP}
              onChange={(e) => setInrCP(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            >
              <option value="1">INR &lt; 1.7 - 1 Poin</option>
              <option value="2">INR 1.7 - 2.3 - 2 Poin</option>
              <option value="3">INR &gt; 2.3 - 3 Poin</option>
            </select>
          </div>
        </div>

        {/* Hasil Child-Pugh */}
        <div className={`mt-4 p-4 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-3 ${
          isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'
        }`}>
          <div>
            <span className="text-xs text-blue-500 font-bold block mb-1">TOTAL SKOR CHILD-PUGH: {totalCPScore}</span>
            <span className={`px-3 py-1 rounded-lg font-extrabold text-sm border ${colorBadge}`}>
              KELAS {cClass}
            </span>
          </div>
          <div className="text-right text-[11px] space-y-0.5">
            <p className="text-slate-400">Survival 1 Tahun: <strong className="text-white">{survival1Year}</strong></p>
            <p className="text-slate-400">Risiko Bedah: <strong className="text-white">{surgicalRisk}</strong></p>
          </div>
        </div>
      </div>


      {/* BAGIAN 2: MELD SCORE (END-STAGE LIVER DISEASE) */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="font-bold text-amber-500 mb-2">⚡ 2. Kalkulator MELD Score (End-Stage Liver Disease / Transplantasi)</h3>
        <p className="text-slate-400 text-[11px] mb-4">
          Menilai tingkat keparahan penyakit hati stadium akhir dan estimasi mortalitas 3 bulan sebagai prioritas donor/transplantasi.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Bilirubin Total Aktual (mg/dL)</label>
            <input
              type="number"
              step="0.1"
              value={meldBili}
              onChange={(e) => setMeldBili(e.target.value)}
              placeholder="e.g. 2.5"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>INR Aktual</label>
            <input
              type="number"
              step="0.1"
              value={meldInr}
              onChange={(e) => setMeldInr(e.target.value)}
              placeholder="e.g. 1.5"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Serum Creatinine (mg/dL)</label>
            <input
              type="number"
              step="0.1"
              value={meldCr}
              onChange={(e) => setMeldCr(e.target.value)}
              placeholder="e.g. 1.2"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>

          <div className="md:col-span-3">
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Apakah pasien menjalani Dialisis / Hemodialisis (≥ 2x dalam seminggu terakhir)?</label>
            <select
              value={isDialysis}
              onChange={(e) => setIsDialysis(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            >
              <option value="no">Tidak (Normal)</option>
              <option value="yes">Ya (Kreatinin otomatis diset 4.0 sesuai protokol MELD)</option>
            </select>
          </div>
        </div>

        {/* Hasil MELD Score */}
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-3 ${
          isDark ? 'bg-amber-950/30 border-amber-800/50' : 'bg-amber-50 border-amber-200'
        }`}>
          <div>
            <span className="text-xs text-amber-500 font-bold block mb-1">MELD SCORE: {meldScore}</span>
            <span className="text-[11px] text-slate-400">Skor Berkisar 6 (Ringan) hingga 40 (Gawat Darurat)</span>
          </div>
          <div className="text-right text-[11px] space-y-0.5">
            <p className="text-slate-400">Estimasi Mortalitas 3 Bulan:</p>
            <strong className="text-amber-600 dark:text-amber-400 text-sm">{meldMortality}</strong>
          </div>
        </div>
      </div>

    </div>
  );
}