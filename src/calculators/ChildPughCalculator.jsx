import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function ChildPughCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL DATA PASIEN GLOBAL DAN DISPATCH STORE V3
  const { patient, addLabRecord } = usePatientStore();

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
  const [isDialysis, setIsDialysis] = useState('no');

  // Auto-sync serum creatinine dari Patient Store v3 jika ada
  useEffect(() => {
    if (patient?.serumCreatinine) {
      setMeldCr(patient.serumCreatinine.toString());
    }
  }, [patient?.serumCreatinine]);

  // 1. Kalkulasi Child-Pugh
  const totalCPScore = parseInt(encephalopathy, 10) + parseInt(ascites, 10) + parseInt(bilirubinCP, 10) + parseInt(albumin, 10) + parseInt(inrCP, 10);

  let cClass = 'A (Mild Impairment)';
  let survival1Year = '100%';
  let surgicalRisk = 'Low Risk (Perioperatif aman)';
  let colorBadge = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';

  if (totalCPScore >= 7 && totalCPScore <= 9) {
    cClass = 'B (Moderate Impairment)';
    survival1Year = '80%';
    surgicalRisk = 'Moderate Risk (Perlu evaluasi dosis & ketat)';
    colorBadge = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
  } else if (totalCPScore >= 10) {
    cClass = 'C (Severe Impairment)';
    survival1Year = '45%';
    surgicalRisk = 'High Risk (Kontraindikasi bedah elektif)';
    colorBadge = 'text-red-500 bg-red-500/10 border-red-500/30';
  }

  // 2. Kalkulasi MELD Score (Standard UNOS Formula)
  let b = parseFloat(meldBili);
  let i = parseFloat(meldInr);
  let c = parseFloat(meldCr);

  b = isNaN(b) || b < 1.0 ? 1.0 : b;
  i = isNaN(i) || i < 1.0 ? 1.0 : i;
  c = isNaN(c) || c < 1.0 ? 1.0 : c;

  // Jika pasien menjalani dialisis 2x dalam seminggu terakhir atau CVVH, kreatinin otomatis diset 4.0
  if (isDialysis === 'yes') {
    c = 4.0;
  }
  // Batas maksimal kreatinin untuk MELD adalah 4.0 mg/dL
  if (c > 4.0) c = 4.0;

  const rawMeld = (0.957 * Math.log(c)) + (0.378 * Math.log(b)) + (1.12 * Math.log(i)) + 0.643;
  let meldScore = Math.round(rawMeld * 10);
  
  // MELD Score dibatasi antara 6 sampai 40
  if (meldScore < 6) meldScore = 6;
  if (meldScore > 40) meldScore = 40;

  // Estimasi Mortalitas 3 Bulan Berdasarkan MELD Score
  let meldMortality = '3.6% (Risiko Rendah)';
  if (meldScore >= 10 && meldScore <= 19) meldMortality = '19.6% (Risiko Sedang)';
  else if (meldScore >= 20 && meldScore <= 29) meldMortality = '52.6% (Risiko Tinggi)';
  else if (meldScore >= 30 && meldScore <= 39) meldMortality = '71.3% (Risiko Sangat Tinggi)';
  else if (meldScore >= 40) meldMortality = '> 70% - 100% (Gawat Darurat / Prioritas Transplantasi)';

  // Simpan hasil ke Outcome Tracker v3
  const handleSaveToRecord = () => {
    addLabRecord({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: 'Child-Pugh & MELD',
      value: `CP: ${totalCPScore} (${cClass.split(' ')[0]}) | MELD: ${meldScore}`,
      unit: 'Points',
      source: `Evaluasi Hepar (Mortalitas 3B: ${meldMortality})`
    });
    alert(`✅ Skor Child-Pugh (${totalCPScore}) & MELD (${meldScore}) berhasil disimpan ke Outcome Tracker Pasien!`);
  };

  return (
    <div className="space-y-6 text-xs">
      
      {patient?.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Evaluasi fungsi hepar, sirosis & MELD score.</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">STORE V3 SYNCED</span>
        </div>
      )}

      {/* BAGIAN 1: CHILD-PUGH SCORE */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="font-bold text-blue-500 mb-2">🫀 1. Kalkulator Child-Pugh Score (Sirosis & Fungsi Hepar)</h3>
        <p className="text-slate-400 text-[11px] mb-4">
          Menilai tingkat keparahan sirosis kronis serta penyesuaian dosis obat hepatotoksik.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="encephalopathy-select" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Ensefalopati Hepatik
            </label>
            <select
              id="encephalopathy-select"
              value={encephalopathy}
              onChange={(e) => setEncephalopathy(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="1">Tidak Ada (Normal) - 1 Poin</option>
              <option value="2">Grade 1-2 (Letargi ringan) - 2 Poin</option>
              <option value="3">Grade 3-4 (Koma / Stupor) - 3 Poin</option>
            </select>
          </div>

          <div>
            <label htmlFor="ascites-select" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Asites
            </label>
            <select
              id="ascites-select"
              value={ascites}
              onChange={(e) => setAscites(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="1">Tidak Ada (None) - 1 Poin</option>
              <option value="2">Mild / Terkontrol Medikamentosa - 2 Poin</option>
              <option value="3">Severe / Refrakter - 3 Poin</option>
            </select>
          </div>

          <div>
            <label htmlFor="bilirubin-cp-select" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Bilirubin Total (mg/dL)
            </label>
            <select
              id="bilirubin-cp-select"
              value={bilirubinCP}
              onChange={(e) => setBilirubinCP(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="1">&lt; 2.0 mg/dL - 1 Poin</option>
              <option value="2">2.0 - 3.0 mg/dL - 2 Poin</option>
              <option value="3">&gt; 3.0 mg/dL - 3 Poin</option>
            </select>
          </div>

          <div>
            <label htmlFor="albumin-select" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Albumin Serum (g/dL)
            </label>
            <select
              id="albumin-select"
              value={albumin}
              onChange={(e) => setAlbumin(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="1">&gt; 3.5 g/dL - 1 Poin</option>
              <option value="2">2.8 - 3.5 g/dL - 2 Poin</option>
              <option value="3">&lt; 2.8 g/dL - 3 Poin</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="inr-cp-select" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Prothrombin Time (INR)
            </label>
            <select
              id="inr-cp-select"
              value={inrCP}
              onChange={(e) => setInrCP(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
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
            <p className="text-slate-400">
              Survival 1 Tahun: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{survival1Year}</strong>
            </p>
            <p className="text-slate-400">
              Risiko Bedah: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{surgicalRisk}</strong>
            </p>
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
            <label htmlFor="meld-bili-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Bilirubin Total Aktual (mg/dL)
            </label>
            <input
              id="meld-bili-input"
              type="number"
              step="0.1"
              value={meldBili}
              onChange={(e) => setMeldBili(e.target.value)}
              placeholder="e.g. 2.5"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label htmlFor="meld-inr-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              INR Aktual
            </label>
            <input
              id="meld-inr-input"
              type="number"
              step="0.1"
              value={meldInr}
              onChange={(e) => setMeldInr(e.target.value)}
              placeholder="e.g. 1.5"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label htmlFor="meld-cr-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Serum Creatinine (mg/dL)
            </label>
            <input
              id="meld-cr-input"
              type="number"
              step="0.1"
              value={meldCr}
              onChange={(e) => setMeldCr(e.target.value)}
              placeholder="e.g. 1.2"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="dialysis-select" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Apakah pasien menjalani Dialisis / Hemodialisis (≥ 2x dalam seminggu terakhir)?
            </label>
            <select
              id="dialysis-select"
              value={isDialysis}
              onChange={(e) => setIsDialysis(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
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

      {/* SIMPAN KEDUA SKOR KE STORE OUTCOME TRACKER V3 */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveToRecord}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all text-xs cursor-pointer flex items-center gap-2"
        >
          💾 Simpan Skor Child-Pugh & MELD ke Outcome Tracker
        </button>
      </div>

    </div>
  );
}