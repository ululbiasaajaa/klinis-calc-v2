import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function TriageCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL DATA PASIEN GLOBAL DAN DISPATCHERS V3
  const { patient, addLabRecord, addMedication } = usePatientStore();

  // State untuk pilihan kategori triase berdasarkan asesmen klinis cepat
  const [selectedCategory, setSelectedCategory] = useState('cat1');

  const triageData = {
    cat1: {
      level: 'Kategori 1 (Resusitasi)',
      color: 'bg-red-600 text-white border-red-500',
      badgeColor: 'text-red-500 bg-red-500/10 border-red-500/30',
      targetTime: 'Segera (0 Menit / Langsung Tindakan)',
      description: 'Kondisi yang mengancam nyawa secara langsung dan membutuhkan resusitasi seketika.',
      examples: [
        'Henti jantung (Cardiac Arrest) / Henti napas',
        'Sumbatan jalan napas berat / Asfiksia',
        'Trauma kepala berat dengan penurunan kesadaran (GCS < 8)',
        'Syok hipovolemik / Syok septik berat / Syok kardiogenik',
        'Kejang berulang / Status epileptikus'
      ],
      action: '🚨 AKTIFKAN TIM RESUSITASI / CODE BLUE SEKETIKA!'
    },
    cat2: {
      level: 'Kategori 2 (Emergent / Darurat)',
      color: 'bg-amber-600 text-white border-amber-500',
      badgeColor: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
      targetTime: 'Maksimal 10 Menit',
      description: 'Kondisi berpotensi mengancam nyawa atau organ vital jika tidak ditangani dengan sangat cepat.',
      examples: [
        'Nyeri dada khas infark miokard akut (STEMI / ACS)',
        'Sesak napas berat / Asma bronkial eksaserbasi akut',
        'Penurunan kesadaran sedang (GCS 9-12) / Stroke akut',
        'Nyeri hebat skala 8-10 (misal: Kolik renal, nyeri abdomen akut berat)',
        'Demam tinggi disertai penurunan kesadaran atau petekie (kecurigaan Meningitis / DBD Syok)'
      ],
      action: '⚡ Pindahkan ke Bed Resusitasi / Ruang Tindakan IGD Segera.'
    },
    cat3: {
      level: 'Kategori 3 (Urgent / Mendesak)',
      color: 'bg-yellow-500 text-slate-950 border-yellow-400',
      badgeColor: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
      targetTime: 'Maksimal 30 Menit',
      description: 'Kondisi cukup serius, stabil untuk saat ini tetapi berisiko memburuk jika terlambat ditangani.',
      examples: [
        'Dehidrasi sedang (muntah/diare akut tanpa syok)',
        'Demam tinggi pada anak (tanpa tanda syok/kejang)',
        'Fraktur tertutup tulang panjang / Cedera ekstremitas sedang',
        'Perdarahan ringan-sedang yang terkontrol',
        'Nyeri perut akut ringan-sedang'
      ],
      action: '⏱️ Masuk antrean prioritas IGD, evaluasi tanda vital berkala.'
    },
    cat4: {
      level: 'Kategori 4 (Semi-Urgent / Kurang Mendesak)',
      color: 'bg-emerald-600 text-white border-emerald-500',
      badgeColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
      targetTime: 'Maksimal 60 Menit',
      description: 'Kondisi kronis atau cedera ringan yang tidak mengancam nyawa dan hemodinamik stabil.',
      examples: [
        'Luka robek ringan (butuh jahit sederhana / hecting luar)',
        'Muntah atau diare tanpa tanda dehidrasi',
        'Infeksi saluran kemih (ISK) tanpa komplikasi demam tinggi',
        'Nyeri tenggorokan / batuk pilek ringan'
      ],
      action: '📋 Registrasi ulang, dapat diarahkan ke poliklinik atau antrean IGD reguler.'
    },
    cat5: {
      level: 'Kategori 5 (Non-Urgent / Tidak Mendesak)',
      color: 'bg-blue-600 text-white border-blue-500',
      badgeColor: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
      targetTime: 'Maksimal 120 Menit (2 Jam)',
      description: 'Kasus rawat jalan atau keluhan ringan yang sebenarnya bisa ditangani di Fasilitas Kesehatan Tingkat Pertama (FKTP/Puskesmas).',
      examples: [
        'Kontrol luka / ganti perban rutin',
        'Permintaan surat keterangan sehat / sakit',
        'Keluhan ringan yang sudah berlangsung berhari-hari/minggu (tanpa perburukan akut)',
        'Pengambilan obat rutin'
      ],
      action: 'ℹ️ Berikan edukasi atau arahkan ke Poli Rawat Jalan / Puskesmas terdekat.'
    }
  };

  const activeTriage = triageData[selectedCategory];

  // HANDLER AKSI V3 DISPATCHERS
  const handleSaveToTracker = () => {
    addLabRecord({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: 'Asesmen Triase IGD (ATS)',
      value: `${activeTriage.level} (Target: ${activeTriage.targetTime})`,
      unit: 'Kategori',
      source: 'TriageCalculator v3'
    });
    alert(`✅ Hasil Triase (${activeTriage.level}) berhasil disimpan ke Outcome Tracker Pasien!`);
  };

  const handleAddTriageProtocol = () => {
    addMedication({
      name: `Protokol IGD: ${activeTriage.level}`,
      dose: `${activeTriage.action} (Target Waktu: ${activeTriage.targetTime})`,
      category: 'Gawat Darurat / Triase',
      source: 'Triage Calculator v3'
    });
    alert(`✅ Protokol penanganan triase berhasil ditambahkan ke rekam medis aktif pasien!`);
  };

  return (
    <div className="space-y-6 text-xs">
      
      {patient.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Asesmen triase & kegawatdaruratan IGD.</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">STORE V3 SYNCED</span>
        </div>
      )}

      {/* HEADER INFORMASI */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="font-bold text-blue-500 mb-2">🚑 Asisten Triase IGD (Australasian Triage Scale - ATS)</h3>
        <p className="text-slate-400 text-[11px] mb-4">
          Sistem pemilahan pasien gawat darurat di IGD berdasarkan tingkat keparahan kondisi klinis untuk menentukan prioritas penanganan medis.
        </p>

        {/* TOMBOL PILIHAN KATEGORI */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.keys(triageData).map((key) => {
            const item = triageData[key];
            const isSelected = selectedCategory === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                className={`p-2.5 rounded-xl font-bold text-center transition-all border text-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  isSelected 
                    ? `${item.color} shadow-lg scale-105` 
                    : isDark 
                      ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' 
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{item.level.split(' ')[0]} {item.level.split(' ')[1]}</span>
                <span className="text-[9px] opacity-90">{key === 'cat1' ? '0 Menit' : key === 'cat2' ? '10 Menit' : key === 'cat3' ? '30 Menit' : key === 'cat4' ? '60 Menit' : '120 Menit'}</span>
              </button>
            );
          })}
        </div>
      </div>


      {/* DETAIL KATEGORI TERPILIH */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3 border-slate-700/50">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Klasifikasi Terpilih</span>
            <h4 className={`text-base font-extrabold ${activeTriage.badgeColor.split(' ')[0]}`}>{activeTriage.level}</h4>
          </div>
          <div className={`px-3 py-1.5 rounded-xl border font-bold text-xs ${activeTriage.badgeColor}`}>
            ⏱️ Target Waktu: {activeTriage.targetTime}
          </div>
        </div>

        <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {activeTriage.description}
        </p>

        <div>
          <span className="font-bold text-blue-500 block mb-2">📌 Contoh Kasus / Kriteria Klinis:</span>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400 text-[11px]">
            {activeTriage.examples.map((ex, idx) => (
              <li key={idx}>{ex}</li>
            ))}
          </ul>
        </div>

        <div className={`p-3.5 rounded-xl border text-center font-bold text-xs ${
          selectedCategory === 'cat1' ? 'bg-red-500/10 border-red-500/40 text-red-500' :
          selectedCategory === 'cat2' ? 'bg-amber-500/10 border-amber-500/40 text-amber-500' :
          selectedCategory === 'cat3' ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-600' :
          selectedCategory === 'cat4' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500' :
          'bg-blue-500/10 border-blue-500/40 text-blue-500'
        }`}>
          {activeTriage.action}
        </div>
      </div>

      {/* AKSI SIMPAN DAN DISTRIBUSI KE STORE V3 */}
      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={handleSaveToTracker}
          className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-2"
        >
          📈 Simpan Triase ke Outcome Tracker
        </button>
        <button
          type="button"
          onClick={handleAddTriageProtocol}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          ➕ Tambahkan Protokol Triase ke Regimen Aktif
        </button>
      </div>

    </div>
  );
}