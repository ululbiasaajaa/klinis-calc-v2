import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function FluidParklandCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL DATA PASIEN GLOBAL DARI STORE V3
  const { patient, addMedication, addLabRecord } = usePatientStore();

  // State untuk Holliday-Segar (Rumatan Cairan)
  const [weightFluid, setWeightFluid] = useState('65');

  // State untuk Parkland Formula (Luka Bakar)
  const [weightBurn, setWeightBurn] = useState('60');
  const [tbsa, setTbsa] = useState('25'); // Persentase Luas Luka Bakar (%)

  // Auto-sync data berat badan dari Patient Context Bar ke kedua kalkulator cairan
  useEffect(() => {
    if (patient && patient.weightKg !== '') {
      const wtStr = String(patient.weightKg);
      setWeightFluid(wtStr);
      setWeightBurn(wtStr);
    }
  }, [patient]);

  // 1. Kalkulasi Holliday-Segar (Rumatan Cairan 24 Jam)
  const maintenanceFluid = (() => {
    const w = parseFloat(weightFluid) || 0;
    if (w <= 0) return 0;
    let ml = 0;
    if (w <= 10) {
      ml = w * 100;
    } else if (w <= 20) {
      ml = 1000 + (w - 10) * 50;
    } else {
      ml = 1500 + (w - 20) * 20;
    }
    return Math.round(ml);
  })();

  const hourlyRateFluid = Math.round(maintenanceFluid / 24);

  // 2. Kalkulasi Parkland Formula (Resusitasi Cairan Luka Bakar 24 Jam - Ringer Laktat)
  const { totalParkland, first8Hours, next16Hours } = (() => {
    const w = parseFloat(weightBurn) || 0;
    const b = parseFloat(tbsa) || 0;
    if (w <= 0 || b <= 0) return { totalParkland: 0, first8Hours: 0, next16Hours: 0 };

    // Formula Parkland: 4 mL x BB (kg) x % TBSA
    const total = 4 * w * b;
    const half = total / 2;
    return {
      totalParkland: Math.round(total),
      first8Hours: Math.round(half / 8),
      next16Hours: Math.round(half / 16)
    };
  })();

  // Aksi simpan ke Regimen Obat Pasien Store v3
  const handleAddMaintenanceMed = () => {
    addMedication({
      name: 'Infus Cairan Rumatan (NaCl 0.9% / D5%)',
      dose: `${hourlyRateFluid} mL/jam (${maintenanceFluid} mL/24 jam)`,
      category: 'Cairan Rumatan (Holliday-Segar)',
      source: `BB Pasien: ${weightFluid} kg`
    });
    alert(`✅ Cairan Rumatan (${hourlyRateFluid} mL/jam) berhasil ditambahkan ke daftar obat/cairan aktif pasien!`);
  };

  const handleAddParklandMed = () => {
    addMedication({
      name: 'Infus Resusitasi Ringer Laktat (RL)',
      dose: `8 Jam Pertama: ${first8Hours} mL/jam | 16 Jam Berikutnya: ${next16Hours} mL/jam (Total: ${totalParkland} mL)`,
      category: 'Resusitasi Luka Bakar (Parkland)',
      source: `TBSA: ${tbsa}% | BB: ${weightBurn} kg`
    });
    alert(`✅ Instruksi Resusitasi Parkland RL (${totalParkland} mL) berhasil ditambahkan ke daftar obat/cairan aktif pasien!`);
  };

  // Simpan ke Outcome Tracker
  const handleSaveToTracker = (type) => {
    const param = type === 'maintenance' ? 'Rumatan Cairan (Holliday-Segar)' : 'Resusitasi Parkland (Luka Bakar)';
    const val = type === 'maintenance' ? `${maintenanceFluid} mL/24h (${hourlyRateFluid} mL/h)` : `Total: ${totalParkland} mL (TBSA ${tbsa}%)`;
    
    addLabRecord({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: param,
      value: val,
      unit: 'mL',
      source: 'Kalkulator Cairan v3'
    });
    alert(`✅ Data ${param} berhasil disimpan ke Outcome Tracker Pasien!`);
  };

  return (
    <div className="space-y-6 text-xs">
      
      {patient.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Berat badan tersinkronisasi otomatis.</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">STORE V3 SYNCED</span>
        </div>
      )}

      {/* BAGIAN 1: HOLLIDAY-SEGAR (RUMATAN CAIRAN) */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="font-bold text-blue-500 mb-2">💧 1. Kalkulator Cairan Rumatan (Holliday-Segar Method)</h3>
        <p className="text-slate-400 text-[11px] mb-4">
          Menghitung kebutuhan cairan rumatan 24 jam untuk anak dan dewasa berdasarkan berat badan aktual.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Berat Badan Pasien (kg)</label>
            <input
              type="number"
              value={weightFluid}
              onChange={(e) => setWeightFluid(e.target.value)}
              placeholder="e.g. 65"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>

          <div className={`p-4 rounded-xl border flex justify-around text-center ${isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'}`}>
            <div>
              <span className="text-[10px] text-blue-500 font-bold block mb-1">TOTAL 24 JAM</span>
              <span className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{maintenanceFluid} <span className="text-xs font-normal text-slate-400">mL</span></span>
            </div>
            <div className="border-l border-blue-500/20 pl-4">
              <span className="text-[10px] text-blue-500 font-bold block mb-1">KECEPATAN INFUS</span>
              <span className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{hourlyRateFluid} <span className="text-xs font-normal text-slate-400">mL/jam</span></span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={() => handleSaveToTracker('maintenance')}
            className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-bold py-2 px-3 rounded-xl transition-all cursor-pointer"
          >
            📈 Simpan ke Outcome Tracker
          </button>
          <button
            type="button"
            onClick={handleAddMaintenanceMed}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl shadow-lg transition-all cursor-pointer"
          >
            ➕ Tambahkan Cairan Rumatan ke Regimen
          </button>
        </div>
      </div>


      {/* BAGIAN 2: PARKLAND FORMULA (LUKA BAKAR) */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="font-bold text-amber-500 mb-2">🔥 2. Resusitasi Cairan Luka Bakar (Parkland Formula)</h3>
        <p className="text-slate-400 text-[11px] mb-4">
          Acuan resusitasi cairan kristaloid (Ringer Laktat) untuk pasien dengan luka bakar parah dalam 24 jam pertama.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Berat Badan Pasien (kg)</label>
            <input
              type="number"
              value={weightBurn}
              onChange={(e) => setWeightBurn(e.target.value)}
              placeholder="e.g. 60"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Luas Luka Bakar / TBSA (% Rule of Nines)</label>
            <input
              type="number"
              value={tbsa}
              onChange={(e) => setTbsa(e.target.value)}
              placeholder="e.g. 25"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>
        </div>

        {/* Hasil Parkland Formula */}
        <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-amber-950/30 border-amber-800/50' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex justify-between items-center border-b pb-2 border-amber-500/20">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Total Cairan RL 24 Jam:</span>
            <span className="text-lg font-extrabold text-amber-700 dark:text-white">{totalParkland} mL</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] text-amber-500 font-bold block">50% PERTAMA (8 Jam Sejak Kejadian)</span>
              <span className="text-base font-bold text-slate-200">{first8Hours} mL/jam</span>
            </div>
            <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] text-amber-500 font-bold block">50% KEDUA (16 Jam Berikutnya)</span>
              <span className="text-base font-bold text-slate-200">{next16Hours} mL/jam</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={() => handleSaveToTracker('parkland')}
            className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-bold py-2 px-3 rounded-xl transition-all cursor-pointer"
          >
            📈 Simpan ke Outcome Tracker
          </button>
          <button
            type="button"
            onClick={handleAddParklandMed}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-3 rounded-xl shadow-lg transition-all cursor-pointer"
          >
            ➕ Tambahkan Resusitasi RL ke Regimen
          </button>
        </div>
      </div>

    </div>
  );
}