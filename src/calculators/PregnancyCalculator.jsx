import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function PregnancyCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL DATA PASIEN GLOBAL DAN DISPATCHERS V3
  const { patient, addLabRecord, addMedication } = usePatientStore();

  // Default HPHT (Hari Pertama Haid Terakhir) diset ke beberapa bulan lalu
  const [hpht, setHpht] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3); // Default 3 bulan lalu
    return d.toISOString().split('T')[0];
  });

  // State untuk Fitur Estimasi Berat Janin (Johnson)
  const [tfu, setTfu] = useState('');
  const [isPap, setIsPap] = useState('belum'); // 'belum' (n=11) atau 'sudah' (n=12)

  // Auto-sync data dari Patient Context Bar jika tersedia
  useEffect(() => {
    if (patient && patient.hpht) {
      setHpht(patient.hpht);
    }
  }, [patient]);

  const calculationResult = (() => {
    if (!hpht) return null;
    const lmpDate = new Date(hpht);
    const today = new Date();

    if (isNaN(lmpDate.getTime())) return null;

    // Hitung HPL (Naegle's Rule: LMP + 7 days - 3 months + 1 year)
    const eddDate = new Date(lmpDate);
    eddDate.setDate(eddDate.getDate() + 7);
    eddDate.setMonth(eddDate.getMonth() - 3);
    eddDate.setFullYear(eddDate.getFullYear() + 1);

    // Hitung Usia Kehamilan (Gestational Age dalam hari)
    const diffTime = today - lmpDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'future', msg: 'Tanggal HPHT berada di masa depan. Periksa kembali input Anda.' };
    }

    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;

    // Trimester Check
    let trimester = 'Trimester I (0 - 13 minggu)';
    let color = 'text-blue-500 bg-blue-500/15 border-blue-500/30';
    if (weeks >= 14 && weeks <= 27) {
      trimester = 'Trimester II (14 - 27 minggu)';
      color = 'text-emerald-500 bg-emerald-500/15 border-emerald-500/30';
    } else if (weeks >= 28) {
      trimester = 'Trimester III (28+ minggu / Menjelang Term)';
      color = 'text-amber-500 bg-amber-500/15 border-amber-500/30';
    }

    const formatDate = (dateObj) => {
      return dateObj.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    return {
      status: 'success',
      edd: formatDate(eddDate),
      weeks,
      days,
      trimester,
      color,
      totalDays: diffDays
    };
  })();

  // Kalkulasi Berat Janin (Johnson-Tauscher Formula)
  const estimatedFetalWeight = (() => {
    const tfuVal = parseFloat(tfu);
    if (!tfuVal || tfuVal <= 0) return null;
    const n = isPap === 'belum' ? 11 : 12;
    const ebjGram = (tfuVal - n) * 155;
    return Math.max(0, Math.round(ebjGram));
  })();

  // HANDLER AKSI V3 DISPATCHERS

  const handleSaveToTracker = () => {
    if (!calculationResult || calculationResult.status !== 'success') return;

    let summaryText = `HPL: ${calculationResult.edd} | Usia: ${calculationResult.weeks} mg ${calculationResult.days} hr`;
    if (estimatedFetalWeight !== null) {
      summaryText += ` | Estimasi Berat Janin (EBJ): ${estimatedFetalWeight} gram`;
    }

    addLabRecord({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: 'Estimasi Kehamilan, HPL & EBJ',
      value: summaryText,
      unit: 'Minggu Gestasi & Gram',
      source: `HPHT: ${hpht} (${calculationResult.trimester})`
    });
    alert(`✅ Data Kehamilan & EBJ berhasil disimpan ke Outcome Tracker Pasien!`);
  };

  const handleAddAncSupplements = () => {
    addMedication({
      name: 'Tablet Tambah Darah (Fe) + Asam Folat 400 mcg + Kalsium',
      dose: '1x1 Tablet Sehari (Suplemen Rutin Antenatal Care / ANC)',
      category: 'Suplemen Kehamilan / Obstetri',
      source: `Usia Kehamilan: ${calculationResult?.weeks || '-'} Minggu`
    });
    alert(`✅ Paket Suplemen ANC (Fe & Asam Folat) berhasil ditambahkan ke regimen obat aktif pasien!`);
  };

  return (
    <div className="space-y-6 text-xs">
      
      {patient?.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Kalkulator HPL & Berat Janin Terintegrasi.</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">STORE V3 SYNCED</span>
        </div>
      )}

      <div className={`p-4 rounded-xl border ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-blue-50 border-blue-200 text-slate-700'
      }`}>
        <p className="font-bold mb-1 text-blue-500">🤰 Kalkulator Usia Kehamilan, HPL & Estimasi Berat Janin (Johnson v3):</p>
        <p className="leading-relaxed">
          Modul komprehensif Poli Kandungan (KIA) untuk menghitung Hari Perkiraan Lahir (Naegle), Usia Gestasi, serta Estimasi Berat Janin (EBJ) berdasarkan Tinggi Fundus Uteri (TFU).
        </p>
      </div>

      <div>
        <label htmlFor="hpht-date-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Tanggal HPHT (Hari Pertama Haid Terakhir):
        </label>
        <input
          id="hpht-date-input"
          type="date"
          value={hpht}
          onChange={(e) => setHpht(e.target.value)}
          className={`w-full p-3 rounded-xl border outline-none font-bold cursor-pointer ${
            isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
          }`}
        />
      </div>

      {calculationResult && calculationResult.status === 'success' && (
        <div className="space-y-4">
          {/* HASIL UTAMA HPL */}
          <div className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <span className="text-xs text-blue-500 font-bold block mb-1">📅 HARI PERKIRAAN LAHIR (HPL / EDD):</span>
            <div className={`text-2xl font-extrabold my-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {calculationResult.edd}
            </div>
            <p className="text-[11px] text-slate-400">Dihitung berdasarkan rumus Naegle standar klinis kebidanan.</p>
          </div>

          {/* USIA KEHAMILAN & TRIMESTER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <span className="text-xs text-slate-400 font-bold block mb-1">⏱️ USIA KEHAMILAN SAAT INI</span>
              <div className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {calculationResult.weeks} <span className="text-sm font-normal text-slate-400">Minggu</span> {calculationResult.days} <span className="text-sm font-normal text-slate-400">Hari</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Total usia gestasi: {calculationResult.totalDays} hari</span>
            </div>

            <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <span className="text-xs text-slate-400 font-bold block mb-1">📊 FASE TRIMESTER</span>
              <div className={`text-xs font-bold px-3 py-2 rounded-lg w-fit border ${calculationResult.color}`}>
                {calculationResult.trimester}
              </div>
              <span className="text-[10px] text-slate-500">Penentuan pemantauan nutrisi & skrining janin.</span>
            </div>
          </div>

          {/* FITUR ESTIMASI BERAT JANIN (JOHNSON) TERINTEGRASI */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div>
              <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                👶 Estimasi Berat Janin (Rumus Johnson-Tauscher)
              </h3>
              <p className="text-[11px] text-slate-400">
                Masukkan Tinggi Fundus Uteri (TFU) untuk menaksir berat janin intrauterin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tfu-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Tinggi Fundus Uteri (TFU dalam cm):
                </label>
                <input
                  id="tfu-input"
                  type="number"
                  value={tfu}
                  onChange={(e) => setTfu(e.target.value)}
                  placeholder="e.g. 30"
                  className={`w-full p-3 rounded-xl border outline-none font-bold ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="pap-position-select" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Posisi Kepala Janin Terhadap PAP (Pintu Atas Panggul):
                </label>
                <select
                  id="pap-position-select"
                  value={isPap}
                  onChange={(e) => setIsPap(e.target.value)}
                  className={`w-full p-3 rounded-xl border outline-none font-bold cursor-pointer ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                >
                  <option value="belum">Belum masuk PAP (n = 11)</option>
                  <option value="sudah">Sudah masuk PAP / Masuk panggul (n = 12)</option>
                </select>
              </div>
            </div>

            {estimatedFetalWeight !== null && (
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold block opacity-80">Hasil Estimasi Berat Janin (EBJ)</span>
                  <span className="text-2xl font-extrabold">{estimatedFetalWeight} gram</span>
                </div>
                <span className="text-[11px] italic font-mono bg-emerald-900/40 px-2.5 py-1 rounded-lg">
                  Formula: (TFU - {isPap === 'belum' ? 11 : 12}) × 155g
                </span>
              </div>
            )}
          </div>

          {/* AKSI SIMPAN DAN DISTRIBUSI KE STORE V3 */}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleSaveToTracker}
              className={`font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-2 border ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-blue-700 border-slate-300'
              }`}
            >
              📈 Simpan Data HPL & EBJ ke Outcome Tracker
            </button>
            <button
              type="button"
              onClick={handleAddAncSupplements}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              💊 Tambahkan Suplemen ANC (Fe & Folat) ke Regimen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}