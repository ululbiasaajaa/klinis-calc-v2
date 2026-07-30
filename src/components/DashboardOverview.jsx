import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function DashboardOverview({ history, onNavigateTab }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL PASIEN & COMPUTED CONTEXT LANGSUNG DARI STORE V3
  const { patient, getClinicalContext, medications } = usePatientStore();
  const { egfr, clcr, bmi, bsa } = getClinicalContext();

  // Hitung Statistik dari History Log
  const totalCalculations = history.length;
  
  // Hitung Modul yang paling sering muncul di history
  const typeCounts = history.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {});

  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  const favoriteModule = sortedTypes.length > 0 ? sortedTypes[0][0] : 'Belum ada data';

  // Daftar Shortcut Cepat ke Modul Populer
  const quickModules = [
    { id: 'pk', name: 'Dosis PK', icon: '💊', desc: 'Farmakokinetik & Loading Dose' },
    { id: 'drip', name: 'Dosis Drip', icon: '💉', desc: 'Syringe Pump & Infusiometer' },
    { id: 'renal', name: 'Fungsi Ginjal', icon: '🫘', desc: 'Cockcroft-Gault & eGFR' },
    { id: 'framingham', name: 'Risiko Jantung', icon: '❤️', desc: 'Framingham 10-Year Score' },
    { id: 'abx_dose', name: 'Dosis Antibiotik', icon: '🦠', desc: 'Penyesuaian Berdasarkan ClCr' },
    { id: 'nti', name: 'Obat Terapi Sempit', icon: '⚡', desc: 'TDM Phenytoin, Vanco, Teofilin' }
  ];

  return (
    <div className="space-y-6 text-xs">
      
      {/* BANNER SELAMAT DATANG */}
      <div className={`p-6 rounded-2xl border relative overflow-hidden ${
        isDark ? 'bg-gradient-to-r from-blue-950/80 to-slate-900 border-blue-800/50' : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white border-blue-700'
      }`}>
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-blue-500/30 text-blue-200 inline-block">
            Pusat Komando Klinis Enterprise v3
          </span>
          <h2 className="text-2xl font-black">Dashboard & Analitik Pengguna</h2>
          <p className={`${isDark ? 'text-slate-300' : 'text-blue-100'} text-[11px] max-w-xl leading-relaxed`}>
            Pantau ringkasan asesmen harian, status pasien aktif terintegrasi, dan akses cepat modul kegawatdaruratan klinis dalam satu layar.
          </p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] text-8xl opacity-10 pointer-events-none">
          📊
        </div>
      </div>

      {/* KARTU RINGKASAN PASIEN AKTIF (SINGLE SOURCE OF TRUTH V3) */}
      <div className={`p-5 rounded-2xl border ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800/60">
          <span className="font-bold text-xs text-blue-500 flex items-center gap-1.5">
            👤 Status Pasien Aktif Dalam Sesi
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
            STORE V3 ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[9px] text-slate-400 block mb-0.5">PASIEN / RM</span>
            <strong className={`text-xs block truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {patient.patientName || 'Tanpa Nama'}
            </strong>
            <span className="text-[10px] text-slate-400 block">RM: {patient.patientId || '-'}</span>
          </div>

          <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[9px] text-slate-400 block mb-0.5">FUNGSI GINJAL (eGFR)</span>
            <strong className={`text-base font-black ${egfr > 0 && egfr < 30 ? 'text-red-500' : 'text-emerald-500'}`}>
              {egfr > 0 ? `${egfr} mL/min` : '-'}
            </strong>
            <span className="text-[10px] text-slate-400 block">ClCr: {clcr > 0 ? `${clcr} mL/min` : '-'}</span>
          </div>

          <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[9px] text-slate-400 block mb-0.5">ANTROPOMETRI (BMI/BSA)</span>
            <strong className={`text-xs block ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {bmi > 0 ? `${bmi} kg/m²` : '-'}
            </strong>
            <span className="text-[10px] text-slate-400 block">BSA: {bsa > 0 ? `${bsa} m²` : '-'}</span>
          </div>

          <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[9px] text-slate-400 block mb-0.5">REGIMEN OBAT AKTIF</span>
            <strong className="text-xs text-indigo-400 block">
              {medications.length} Obat Terdaftar
            </strong>
            <span className="text-[10px] text-slate-400 block">Monitoring DDI Active</span>
          </div>
        </div>
      </div>

      {/* KARTU STATISTIK UTAMA (METRICS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 text-2xl font-bold">
            📈
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-bold block">TOTAL SESI / RIWAYAT</span>
            <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalCalculations}</span>
            <span className="text-[10px] text-emerald-500 block mt-0.5">Tercatat di cache lokal</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 text-2xl font-bold">
            ⭐
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-bold block">MODUL TERFAVORIT</span>
            <span className={`text-lg font-black truncate max-w-[150px] block ${isDark ? 'text-white' : 'text-slate-900'}`}>{favoriteModule}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Paling sering dievaluasi</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 text-2xl font-bold">
            🏥
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-bold block">STATUS SISTEM</span>
            <span className="text-lg font-black text-emerald-500 block">Optimal v3</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Single Source of Truth Active</span>
          </div>
        </div>
      </div>

      {/* QUICK ACCESS MODUL POPULER */}
      <div className="space-y-3">
        <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>⚡ Shortcut Modul Unggulan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {quickModules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => onNavigateTab(mod.id)}
              className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] flex items-start gap-3 group cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-800 hover:border-blue-500' : 'bg-white border-slate-200 hover:border-blue-600 shadow-sm'
              }`}
            >
              <span className="text-2xl p-2 rounded-xl bg-blue-500/10 group-hover:bg-blue-600 group-hover:text-white transition-all">
                {mod.icon}
              </span>
              <div>
                <h4 className={`font-bold text-xs group-hover:text-blue-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {mod.name}
                </h4>
                <p className="text-slate-400 text-[10px] mt-1 line-clamp-2">
                  {mod.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}