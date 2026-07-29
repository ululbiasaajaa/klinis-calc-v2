import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { usePatientStore } from '../store/usePatientStore';

export default function PregnancyCalculator() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';

  // Ambil data pasien global dari store atas
  const { patient } = usePatientStore();

  // Default HPHT (Hari Pertama Haid Terakhir) diset ke beberapa bulan lalu
  const [hpht, setHpht] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3); // Default 3 bulan lalu
    return d.toISOString().split('T')[0];
  });

  // Auto-sync data dari Patient Context Bar jika tersedia
  useEffect(() => {
    if (patient) {
      // Jika di store pasien ada properti hpht, sinkronkan di sini
      if (patient.hpht) {
        setHpht(patient.hpht);
      }
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
    let color = 'text-blue-500 bg-blue-500/10';
    if (weeks >= 14 && weeks <= 27) {
      trimester = 'Trimester II (14 - 27 minggu)';
      color = 'text-emerald-500 bg-emerald-500/10';
    } else if (weeks >= 28) {
      trimester = 'Trimester III (28+ minggu / Menjelang Term)';
      color = 'text-amber-500 bg-amber-500/10';
    }

    const formatDate = (dateObj) => {
      return dateObj.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
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

  return (
    <div className="space-y-6">
      
      {patient.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between text-xs">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Kalkulator usia kehamilan & HPL.</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">Active</span>
        </div>
      )}

      <div className={`p-4 rounded-xl border text-xs ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-blue-50 border-blue-200 text-slate-700'
      }`}>
        <p className="font-bold mb-1">🤰 Kalkulator Usia Kehamilan & HPL (Naegle&apos;s Rule):</p>
        <p>
          Digunakan di IGD, Poli Kandungan (KIA), dan Praktik Kebidanan untuk menentukan Hari Perkiraan Lahir (HPL) serta Usia Kehamilan saat ini berdasarkan HPHT (Hari Pertama Haid Terakhir).
        </p>
      </div>

      <div>
        <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Tanggal HPHT (Hari Pertama Haid Terakhir):
        </label>
        <input
          type="date"
          value={hpht}
          onChange={(e) => setHpht(e.target.value)}
          className={`w-full p-3 rounded-xl border outline-none text-xs font-bold ${
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
              <div className={`text-xs font-bold px-3 py-2 rounded-lg w-fit ${calculationResult.color}`}>
                {calculationResult.trimester}
              </div>
              <span className="text-[10px] text-slate-500">Penentuan pemantauan nutrisi & skrining janin.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}