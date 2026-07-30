import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { usePatientStore } from '../store/usePatientStore';

export default function StoppStartCalculator() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';

  // AMBIL DATA PASIEN GLOBAL DAN DISPATCHERS V3
  const { patient, addLabRecord, addMedication } = usePatientStore();

  // Daftar Kriteria STOPP (Potentially Inappropriate Medications in Older People)
  const stoppCriteriaList = [
    { id: 'stopp_1', category: 'Kardiovaskular', text: 'Loop diuretic sebagai lini pertama hipertensi (tanpa gagal jantung).' },
    { id: 'stopp_2', category: 'Kardiovaskular', text: 'Beta-blocker dikombinasikan dengan verapamil atau diltiazem (risiko blokade jantung / asystole).' },
    { id: 'stopp_3', category: 'Saraf Pusat', text: 'Benzodiazepine durasi panjang (diazepam, clobazam) atau kerja singkat untuk insomnia kronis.' },
    { id: 'stopp_4', category: 'Saraf Pusat', text: 'Antipsikotik sebagai terapi lini pertama pada Behavioral and Psychological Symptoms of Dementia (BPSD).' },
    { id: 'stopp_5', category: 'Gastrointestinal', text: 'PPI (Omeprazole/Lansoprazole) dosis penuh untuk tukak lambung >8 minggu tanpa indikasi jelas.' },
    { id: 'stopp_6', category: 'Muskuloskeletal', text: 'NSAID jangka panjang (ibuprofen, meloxicam) pada riwayat hipertensi tidak terkontrol atau gagal jantung.' },
  ];

  // Daftar Kriteria START (Screening Tool to Alert to Right Treatment)
  const startCriteriaList = [
    { id: 'start_1', category: 'Kardiovaskular', text: 'Warfarin / DOAC pada pasien Atrial Fibrilasi kronis (jika tidak ada kontraindikasi perdarahan).' },
    { id: 'start_2', category: 'Kardiovaskular', text: 'Statin pada pasien dengan riwayat penyakit kardiovaskular aterosklerotik (ASCVD).' },
    { id: 'start_3', category: 'Respiratori', text: 'Inhaler LAMA (Long-Acting Muscarinic Antagonist) atau LABA untuk PPOK / Asma sedang-berat.' },
    { id: 'start_4', category: 'Endokrin', text: 'ACE inhibitor atau ARB pada nefropati diabetik / proteinuria.' },
    { id: 'start_5', category: 'Muskuloskeletal', text: 'Suplemen Kalsium & Vitamin D pada pasien osteoporosis terkonfirmasi atau riwayat fraktur.' },
  ];

  const [checkedStopp, setCheckedStopp] = useState({});
  const [checkedStart, setCheckedStart] = useState({});

  // Auto-sync status usia (opsional untuk indikator geriatri)
  useEffect(() => {
    if (patient && patient.age !== '') {
      // Data usia tersedia untuk asesmen klinis geriatri
    }
  }, [patient]);

  const handleToggleStopp = (id) => {
    setCheckedStopp({ ...checkedStopp, [id]: !checkedStopp[id] });
  };

  const handleToggleStart = (id) => {
    setCheckedStart({ ...checkedStart, [id]: !checkedStart[id] });
  };

  const stoppCount = Object.values(checkedStopp).filter(Boolean).length;
  const startCount = Object.values(checkedStart).filter(Boolean).length;

  // HANDLER AKSI V3 DISPATCHERS
  const handleSaveToTracker = () => {
    addLabRecord({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: 'Skrining Geriatri STOPP/START v2',
      value: `STOPP Triggers: ${stoppCount} | START Omissions: ${startCount}`,
      unit: 'Kriteria',
      source: 'StoppStartCalculator v3'
    });
    alert(`✅ Hasil Skrining STOPP/START berhasil disimpan ke Outcome Tracker Pasien!`);
  };

  const handleAddDeprescribingNote = () => {
    const activeStoppItems = stoppCriteriaList
      .filter((item) => checkedStopp[item.id])
      .map((item) => item.text)
      .join(' | ');

    addMedication({
      name: 'Rencana Evaluasi Deprescribing Geriatri',
      dose: activeStoppItems ? `STOPP Triggers: ${activeStoppItems}` : 'Evaluasi penghentian obat tidak tepat / overprescribing',
      category: 'Geriatri / Deprescribing',
      source: `STOPP Count: ${stoppCount} item`
    });
    alert(`✅ Rencana Deprescribing berhasil ditambahkan ke rekam medis aktif pasien!`);
  };

  return (
    <div className="space-y-6 text-xs">
      
      {patient.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Skrining farmakoterapi geriatri STOPP/START.</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">STORE V3 SYNCED</span>
        </div>
      )}

      <div className={`p-4 rounded-xl border ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-blue-50 border-blue-200 text-slate-700'
      }`}>
        <p className="font-bold mb-1 text-blue-400">👴 Modul Screening Geriatri STOPP / START v2 (v3):</p>
        <p className="leading-relaxed">
          Centang temuan kondisi atau obat pada resep pasien lansia di bawah ini untuk mendeteksi potensi <strong>Overprescribing (STOPP)</strong> maupun <strong>Underprescribing (START)</strong>.
        </p>
      </div>

      {/* SECTION STOPP */}
      <div className={`p-5 rounded-2xl border ${
        isDark ? 'bg-slate-900 border-red-900/50' : 'bg-white border-red-200 shadow-sm'
      }`}>
        <div className="flex justify-between items-center mb-4 border-b pb-3 border-red-500/20">
          <h3 className="font-bold text-sm text-red-500 flex items-center gap-2">
            <span>🛑</span> Kriteria STOPP (Potentially Inappropriate Prescriptions)
          </h3>
          <span className="text-xs bg-red-500/10 text-red-500 font-bold px-2.5 py-1 rounded-lg border border-red-500/30">
            Terdeteksi: {stoppCount}
          </span>
        </div>

        <div className="space-y-2.5">
          {stoppCriteriaList.map((item) => (
            <label
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                checkedStopp[item.id]
                  ? 'bg-red-500/10 border-red-500/50'
                  : isDark ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={!!checkedStopp[item.id]}
                onChange={() => handleToggleStopp(item.id)}
                className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-red-400 block mb-0.5">[{item.category}]</span>
                <span className={isDark ? 'text-slate-200 font-medium' : 'text-slate-800 font-medium'}>{item.text}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* SECTION START */}
      <div className={`p-5 rounded-2xl border ${
        isDark ? 'bg-slate-900 border-emerald-900/50' : 'bg-white border-emerald-200 shadow-sm'
      }`}>
        <div className="flex justify-between items-center mb-4 border-b pb-3 border-emerald-500/20">
          <h3 className="font-bold text-sm text-emerald-500 flex items-center gap-2">
            <span>✅</span> Kriteria START (Omission / Kurang Terapi yang Diperlukan)
          </h3>
          <span className="text-xs bg-emerald-500/10 text-emerald-500 font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30">
            Terdeteksi: {startCount}
          </span>
        </div>

        <div className="space-y-2.5">
          {startCriteriaList.map((item) => (
            <label
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                checkedStart[item.id]
                  ? 'bg-emerald-500/10 border-emerald-500/50'
                  : isDark ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={!!checkedStart[item.id]}
                onChange={() => handleToggleStart(item.id)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-emerald-400 block mb-0.5">[{item.category}]</span>
                <span className={isDark ? 'text-slate-200 font-medium' : 'text-slate-800 font-medium'}>{item.text}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* KESIMPULAN EVALUASI */}
      <div className={`p-4 rounded-xl border space-y-1 ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}>
        <p className="font-bold text-blue-500">📋 Ringkasan Evaluasi Geriatri:</p>
        <p className="leading-relaxed">
          • <strong>STOPP Trigger:</strong> {stoppCount} potensi obat tidak tepat (perlu dipertimbangkan *deprescribing* / penghentian obat).<br />
          • <strong>START Trigger:</strong> {startCount} indikasi obat yang terlewat (perlu dipertimbangkan penambahan terapi demi luaran klinis optimal).
        </p>
      </div>

      {/* AKSI SIMPAN DAN DISTRIBUSI KE STORE V3 */}
      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={handleSaveToTracker}
          className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-2"
        >
          📈 Simpan Skrining ke Outcome Tracker
        </button>
        <button
          type="button"
          onClick={handleAddDeprescribingNote}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          💊 Tambahkan Rencana Deprescribing ke Regimen
        </button>
      </div>
    </div>
  );
}