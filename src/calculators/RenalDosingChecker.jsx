import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function RenalDosingChecker() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL DATA PASIEN GLOBAL DAN DISPATCHERS V3
  const { patient, addMedication, addLabRecord } = usePatientStore();
  const [inputs, setInputs] = useState({ clcr: '45' });

  // Auto-sync & hitung otomatis dari Patient Context Bar setiap data pasien berubah
  useEffect(() => {
    if (patient) {
      const age = Number(patient.age);
      const wt = Number(patient.weightKg);
      const scr = Number(patient.serumCreatinine);
      const isFemale = patient.gender === 'Perempuan';

      if (age > 0 && wt > 0 && scr > 0) {
        let calcClCr = ((140 - age) * wt) / (72 * scr);
        if (isFemale) calcClCr *= 0.85;
        
        setInputs({ clcr: calcClCr.toFixed(1) });
      }
    }
  }, [patient]);

  // Database Dosis Penyesuaian Ginjal untuk Obat High-Risk
  const renalDosingDatabase = [
    {
      drug: 'Gabapentin (Antikonvulsan / Neuropati)',
      normalDose: '300 - 400 mg tiap 8 jam',
      getCm: (cl) => {
        if (cl >= 60) return { dose: '300 - 400 mg tiap 8 jam', status: 'Normal / Tanpa Penyesuaian', color: 'text-emerald-500 bg-emerald-500/10' };
        if (cl >= 30) return { dose: '200 - 300 mg tiap 12 jam', status: '⚠️ Turunkan Dosis (Moderat)', color: 'text-amber-500 bg-amber-500/10' };
        if (cl >= 15) return { dose: '200 - 300 mg tiap 24 jam', status: '⚠️ Perpanjang Interval (Berat)', color: 'text-amber-500 bg-amber-500/10' };
        return { dose: '100 - 150 mg tiap 24 jam', status: '🚨 Penyesuaian Ketat (Gagal Ginjal Tahap Akhir)', color: 'text-red-500 bg-red-500/10' };
      }
    },
    {
      drug: 'Allopurinol (Anti-Asam Urat)',
      normalDose: '100 - 300 mg tiap 24 jam',
      getCm: (cl) => {
        if (cl >= 50) return { dose: '100 - 300 mg tiap 24 jam', status: 'Normal', color: 'text-emerald-500 bg-emerald-500/10' };
        if (cl >= 20) return { dose: '100 - 200 mg tiap 24 jam', status: '⚠️ Turunkan Dosis', color: 'text-amber-500 bg-amber-500/10' };
        if (cl >= 10) return { dose: '100 mg tiap 24-48 jam', status: '⚠️ Perpanjang Interval', color: 'text-amber-500 bg-amber-500/10' };
        return { dose: '100 mg tiap 48 jam atau lebih', status: '🚨 Risiko Toksisitas Tinggi', color: 'text-red-500 bg-red-500/10' };
      }
    },
    {
      drug: 'Enoxaparin (Antikoagulan LMWH - Profilaksis VTE)',
      normalDose: '40 mg Subkutan tiap 24 jam',
      getCm: (cl) => {
        if (cl >= 30) return { dose: '40 mg SC tiap 24 jam', status: 'Normal', color: 'text-emerald-500 bg-emerald-500/10' };
        return { dose: '30 mg SC tiap 24 jam', status: '🚨 Risiko Perdarahan Masif! Turunkan Dosis jika ClCr < 30', color: 'text-red-500 bg-red-500/10' };
      }
    },
    {
      drug: 'Digoxin (Gagal Jantung / Aritmia)',
      normalDose: '0.125 - 0.25 mg tiap 24 jam',
      getCm: (cl) => {
        if (cl >= 50) return { dose: '0.25 mg tiap 24 jam', status: 'Normal', color: 'text-emerald-500 bg-emerald-500/10' };
        if (cl >= 10) return { dose: '0.125 mg tiap 24 jam atau tiap 48 jam', status: '⚠️ Turunkan Dosis / Cek Kadar TDM', color: 'text-amber-500 bg-amber-500/10' };
        return { dose: 'Hindari atau 0.125 mg 2x seminggu', status: '🚨 Sangat Mudah Akumulasi (Toksik Fatal)', color: 'text-red-500 bg-red-500/10' };
      }
    },
    {
      drug: 'Metformin (Antidiabetes Oral)',
      normalDose: '500 - 850 mg 2-3x sehari',
      getCm: (cl) => {
        if (cl >= 60) return { dose: 'Dosis penuh (Max 2000-2500 mg/hari)', status: 'Normal', color: 'text-emerald-500 bg-emerald-500/10' };
        if (cl >= 45) return { dose: 'Dosis penuh, evaluasi fungsi ginjal tiap 3-6 bulan', status: '⚠️ Monitoring Berkala', color: 'text-amber-500 bg-amber-500/10' };
        if (cl >= 30) return { dose: 'Maksimal 1000 mg/hari (Bagi 2 dosis)', status: '⚠️ Batasi Dosis Maksimal', color: 'text-amber-500 bg-amber-500/10' };
        return { dose: 'KONTRAINDIKASI MUTLAK', status: '🚨 Risiko Asidosis Laktat Fatal!', color: 'text-red-500 bg-red-500/10' };
      }
    }
  ];

  const clValue = parseFloat(inputs.clcr) || 0;

  // HANDLER AKSI V3 DISPATCHERS
  const handleAddRenalMedication = (item) => {
    const res = item.getCm(clValue);
    addMedication({
      name: item.drug,
      dose: res.dose,
      category: 'Penyesuaian Dosis Ginjal (ClCr)',
      source: `ClCr Pasien: ${clValue} mL/min`
    });
    alert(`✅ Rekomendasi dosis ginjal untuk ${item.drug} (${res.dose}) berhasil ditambahkan ke regimen obat aktif pasien!`);
  };

  const handleSaveToTracker = () => {
    addLabRecord({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: 'Evaluasi Penyesuaian Dosis Ginjal (ClCr)',
      value: `ClCr Terhitung: ${clValue} mL/min`,
      unit: 'mL/min',
      source: 'Renal Dosing Checker v3'
    });
    alert(`✅ Evaluasi Renal Dosing berhasil disimpan ke Outcome Tracker Pasien!`);
  };

  return (
    <div className="space-y-6 text-xs">
      {patient?.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Nilai ClCr di bawah otomatis dihitung dari profil pasien.</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">STORE V3 SYNCED</span>
        </div>
      )}

      <div className={`p-4 rounded-xl border ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-blue-50 border-blue-200 text-slate-700'
      }`}>
        <p className="font-bold mb-1 text-blue-500">💊 Modul Auto-Checker Penyesuaian Dosis Obat Berbasis GFR / ClCr (v3):</p>
        <p className="leading-relaxed">
          Masukkan atau sesuaikan nilai klirens kreatinin (ClCr) pasien di bawah ini untuk melihat rekomendasi penyesuaian dosis obat high-risk secara real-time.
        </p>
      </div>

      <div>
        <label htmlFor="renal-clcr-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Klirens Kreatinin Pasien (ClCr in mL/min):
        </label>
        <input
          id="renal-clcr-input"
          type="number"
          value={inputs.clcr}
          onChange={(e) => setInputs({ ...inputs, clcr: e.target.value })}
          placeholder="e.g. 45"
          className={`w-full p-3 rounded-xl border outline-none font-bold ${
            isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
          }`}
        />
      </div>

      {/* TABEL HASIL PENYESUAIAN DOSIS */}
      <div className="space-y-3">
        <h3 className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          📋 Rekomendasi Penyesuaian Dosis untuk ClCr: {clValue} mL/min
        </h3>

        {renalDosingDatabase.map((item, idx) => {
          const res = item.getCm(clValue);
          return (
            <div key={idx} className={`p-4 rounded-xl border transition-all ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.drug}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md w-fit ${res.color}`}>
                  {res.status}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <span className="block text-[10px] text-slate-500 font-semibold">Dosis Normal:</span>
                  {item.normalDose}
                </div>
                <div className={`p-2.5 rounded-lg border font-bold ${isDark ? 'bg-blue-950/30 border-blue-900/50 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                  <span className="block text-[10px] text-blue-500 font-semibold">Rekomendasi Dosis Disesuaikan:</span>
                  {res.dose}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleAddRenalMedication(item)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] shadow transition-all cursor-pointer flex items-center gap-1"
                >
                  ➕ Tambahkan Dosis Ginjal Obat Ini ke Regimen
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AKSI SIMPAN KE TRACKER */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSaveToTracker}
          className={`font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-2 border ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-blue-700 border-slate-300'
          }`}
        >
          📈 Simpan Evaluasi Renal Dosing ke Outcome Tracker
        </button>
      </div>
    </div>
  );
}