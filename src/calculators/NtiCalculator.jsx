import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function NtiCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL DATA PASIEN & DISPATCHERS DARI STORE V3
  const { patient, addLabRecord, addMedication } = usePatientStore();

  const [ntiSubTab, setNtiSubTab] = useState('phenytoin');

  // 1. Phenytoin States
  const [phenytoinObs, setPhenytoinObs] = useState('');
  const [albumin, setAlbumin] = useState('4.0');

  // 2. Vancomycin States
  const [vancoWeight, setVancoWeight] = useState('');
  const [vancoScr, setVancoScr] = useState('');
  const [vancoAge, setVancoAge] = useState('');
  const [vancoGender, setVancoGender] = useState('male');
  const [vancoDailyDose, setVancoDailyDose] = useState('2000');

  // 3. Theophylline States
  const [theoLevel, setTheoLevel] = useState('6.0');
  const [theoDose, setTheoDose] = useState('600');

  // 4. Warfarin States
  const [warfarinInr, setWarfarinInr] = useState('1.5');
  const [warfarinDoseWeekly, setWarfarinDoseWeekly] = useState('35');

  // 5. Aminoglycoside States
  const [aminoDrug, setAminoDrug] = useState('amikacin');
  const [aminoWeight, setAminoWeight] = useState('');
  const [aminoHeight, setAminoHeight] = useState('');
  const [aminoGender, setAminoGender] = useState('male');
  const [aminoScr, setAminoScr] = useState('');
  const [aminoAge, setAminoAge] = useState('');

  // 6. Renal Dosing Checker States
  const [renalInputs, setRenalInputs] = useState({ clcr: '45' });

  // Auto-sync data dari Patient Context Bar secara real-time ke semua kalkulator NTI & Renal Dosing
  useEffect(() => {
    if (patient) {
      if (patient.weightKg !== undefined && patient.weightKg !== '') {
        const wtStr = String(patient.weightKg);
        setVancoWeight(wtStr);
        setAminoWeight(wtStr);
      }
      if (patient.serumCreatinine !== undefined && patient.serumCreatinine !== '') {
        const scrStr = String(patient.serumCreatinine);
        setVancoScr(scrStr);
        setAminoScr(scrStr);
      }
      if (patient.age !== undefined && patient.age !== '') {
        const ageStr = String(patient.age);
        setVancoAge(ageStr);
        setAminoAge(ageStr);
      }
      if (patient.heightCm !== undefined && patient.heightCm !== '') {
        setAminoHeight(String(patient.heightCm));
      }
      if (patient.gender) {
        const isFemale = patient.gender === 'Perempuan';
        const genderVal = isFemale ? 'female' : 'male';
        setVancoGender(genderVal);
        setAminoGender(genderVal);
      }

      // Auto-hitung ClCr untuk Renal Dosing & Vancomycin/Aminoglycoside jika parameter lengkap
      const ageNum = Number(patient.age);
      const wtNum = Number(patient.weightKg);
      const scrNum = Number(patient.serumCreatinine);
      const isFemaleVal = patient.gender === 'Perempuan';

      if (ageNum > 0 && wtNum > 0 && scrNum > 0) {
        let calcClCr = ((140 - ageNum) * wtNum) / (72 * scrNum);
        if (isFemaleVal) calcClCr *= 0.85;
        setRenalInputs({ clcr: calcClCr.toFixed(1) });
      }
    }
  }, [patient]);

  // --- LOGIKA KALKULASI ---

  // A. Phenytoin Terkoreksi
  const phenytoinAdj = (() => {
    const obs = parseFloat(phenytoinObs) || 0;
    const alb = parseFloat(albumin) || 4.0;
    if (obs <= 0) return 0;
    return Number((obs / ((0.2 * alb) + 0.1)).toFixed(2));
  })();

  // B. Vancomycin AUC
  const vancoAuc = (() => {
    const w = parseFloat(vancoWeight) || 0;
    const s = parseFloat(vancoScr) || 0;
    const a = parseFloat(vancoAge) || 0;
    const d = parseFloat(vancoDailyDose) || 0;
    if (w <= 0 || s <= 0 || a <= 0) return 0;

    let clcr = ((140 - a) * w) / (72 * s);
    if (vancoGender === 'female') clcr *= 0.85;
    const estCl = clcr * 0.06;
    if (estCl <= 0) return 0;
    return Number((d / estCl).toFixed(1));
  })();

  // C. Theophylline Dosing Adjustment
  const theoRec = (() => {
    const lvl = parseFloat(theoLevel) || 0;
    const dose = parseFloat(theoDose) || 0;
    if (lvl <= 0 || dose <= 0) return { newDose: 0, status: 'Masukkan data valid' };

    const targetMid = 15.0;
    let newDose = (dose * targetMid) / lvl;
    let status = 'Kadar dalam batas terapeutik (10 - 20 mcg/mL). Pertahankan.';

    if (lvl < 10) {
      status = '⚠️ Sub-terapeutik (Kadar rendah). Dosis perlu dinaikkan.';
    } else if (lvl > 20) {
      status = '🚨 Toksik / Di atas target! Hentikan sementara atau turunkan dosis.';
      newDose = dose * 0.75;
    }

    return { newDose: Number(newDose.toFixed(0)), status };
  })();

  // D. Warfarin Adjustment
  const warfarinRec = (() => {
    const inr = parseFloat(warfarinInr) || 0;
    const weekly = parseFloat(warfarinDoseWeekly) || 0;
    if (inr <= 0 || weekly <= 0) return { action: 'Masukkan data valid', newWeekly: 0 };

    let newWeekly = weekly;
    let action = 'INR Stabil (Target 2.0 - 3.0). Lanjutkan dosis saat ini.';

    if (inr < 1.5) {
      action = 'INR terlalu rendah (< 1.5). Naikkan dosis total mingguan 10-15%.';
      newWeekly = weekly * 1.12;
    } else if (inr >= 1.5 && inr < 2.0) {
      action = 'INR sedikit di bawah target. Naikkan dosis mingguan 5-10%.';
      newWeekly = weekly * 1.07;
    } else if (inr > 3.0 && inr <= 3.5) {
      action = 'INR sedikit di atas target. Turunkan dosis mingguan 5-10%.';
      newWeekly = weekly * 0.93;
    } else if (inr > 3.5) {
      action = '🚨 INR Tinggi (> 3.5)! Risiko perdarahan. Skip 1 dosis dan turunkan dosis mingguan 15-20%.';
      newWeekly = weekly * 0.82;
    }

    return { action, newWeekly: Number(newWeekly.toFixed(1)) };
  })();

  // E. Aminoglycoside Dosing
  const aminoCalc = (() => {
    const h = parseFloat(aminoHeight) || 165;
    const a = parseFloat(aminoAge) || 50;
    const s = parseFloat(aminoScr) || 1.0;
    const w = parseFloat(aminoWeight) || 60;

    let ibw = h > 60 ? (aminoGender === 'female' ? 45.5 : 50) + 2.3 * ((h / 2.54) - 60) : (aminoGender === 'female' ? 45.5 : 50);
    let clcr = ((140 - a) * w) / (72 * s);
    if (aminoGender === 'female') clcr *= 0.85;

    let doseMg = aminoDrug === 'amikacin' ? ibw * 15 : ibw * 5;
    let interval = '24 Jam';
    if (clcr < 50 && clcr >= 30) interval = '36 Jam';
    else if (clcr < 30) interval = '48 Jam / Berdasarkan TDM Puncak-Tembah';

    return { ibw: Number(ibw.toFixed(1)), clcr: Number(clcr.toFixed(1)), recDose: Number(doseMg.toFixed(0)), interval };
  })();

  // F. Renal Dosing Database
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

  const clValue = parseFloat(renalInputs.clcr) || 0;

  // HANDLER AKSI V3 DISPATCHERS

  const handleSaveTdmRecord = (type) => {
    let param = '';
    let valStr = '';

    if (type === 'phenytoin') {
      param = 'TDM Phenytoin Terkoreksi Albumin';
      valStr = `${phenytoinAdj} mg/L (Obs: ${phenytoinObs} mg/L, Alb: ${albumin} g/dL)`;
    } else if (type === 'vancomycin') {
      param = 'TDM Vancomycin AUC 24h';
      valStr = `AUC: ${vancoAuc} mg·hr/L (Dosis Harian: ${vancoDailyDose} mg)`;
    } else if (type === 'theophylline') {
      param = 'TDM Theophylline Level';
      valStr = `Kadar: ${theoLevel} mcg/mL (Rekomendasi Dosis: ${theoRec.newDose} mg/hr)`;
    } else if (type === 'warfarin') {
      param = 'TDM Warfarin & INR';
      valStr = `INR: ${warfarinInr} (Rekomendasi Dosis Mingguan: ${warfarinRec.newWeekly} mg)`;
    } else if (type === 'aminoglycoside') {
      param = `TDM Empiris ${aminoDrug.toUpperCase()}`;
      valStr = `Dosis: ${aminoCalc.recDose} mg / ${aminoCalc.interval} (ClCr: ${aminoCalc.clcr} mL/min)`;
    }

    addLabRecord({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: param,
      value: valStr,
      unit: 'TDM',
      source: 'Kalkulator NTI & TDM v3'
    });
    alert(`✅ Rekam TDM (${param}) berhasil disimpan ke Outcome Tracker Pasien!`);
  };

  const handleAddTdmMedication = (type) => {
    let drugName = '';
    let doseStr = '';

    if (type === 'phenytoin') {
      drugName = 'Phenytoin (Phenytoin Sodium)';
      doseStr = `Target Kadar 10-20 mg/L (Kadar Terkoreksi: ${phenytoinAdj} mg/L)`;
    } else if (type === 'vancomycin') {
      drugName = 'Vancomycin Infus IV';
      doseStr = `${vancoDailyDose} mg/hari Dibatasi (Target AUC 400-600 mg·hr/L)`;
    } else if (type === 'theophylline') {
      drugName = 'Theophylline / Aminophylline';
      doseStr = `${theoRec.newDose} mg/hari (Disesuaikan dari Kadar: ${theoLevel} mcg/mL)`;
    } else if (type === 'warfarin') {
      drugName = 'Warfarin Oral';
      doseStr = `${warfarinRec.newWeekly} mg Total Mingguan (Disesuaikan dari INR: ${warfarinInr})`;
    } else if (type === 'aminoglycoside') {
      drugName = `${aminoDrug === 'amikacin' ? 'Amikacin' : 'Gentamicin'} IV`;
      doseStr = `${aminoCalc.recDose} mg tiap ${aminoCalc.interval}`;
    }

    addMedication({
      name: drugName,
      dose: doseStr,
      category: 'Obat NTI / TDM Khusus',
      source: 'Kalkulator NTI v3'
    });
    alert(`✅ Regimen obat TDM (${drugName}) berhasil ditambahkan ke rekam medis pasien!`);
  };

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

  return (
    <div className="space-y-4 text-xs">
      {patient.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | BB: {patient.weightKg || '-'} kg, Usia: {patient.age || '-'} thn, SCr: {patient.serumCreatinine || '-'} mg/dL</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">STORE V3 SYNCED</span>
        </div>
      )}

      {/* SUB-TABS SELECTOR (6 TAB) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <button type="button" onClick={() => setNtiSubTab('phenytoin')} className={`p-2.5 rounded-xl font-bold border transition-all cursor-pointer ${ntiSubTab === 'phenytoin' ? 'bg-blue-600 text-white border-blue-500 shadow-md' : isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}>
          💊 Phenytoin
        </button>
        <button type="button" onClick={() => setNtiSubTab('vancomycin')} className={`p-2.5 rounded-xl font-bold border transition-all cursor-pointer ${ntiSubTab === 'vancomycin' ? 'bg-blue-600 text-white border-blue-500 shadow-md' : isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}>
          🧪 Vancomycin
        </button>
        <button type="button" onClick={() => setNtiSubTab('theophylline')} className={`p-2.5 rounded-xl font-bold border transition-all cursor-pointer ${ntiSubTab === 'theophylline' ? 'bg-blue-600 text-white border-blue-500 shadow-md' : isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}>
          ☕ Theophylline
        </button>
        <button type="button" onClick={() => setNtiSubTab('warfarin')} className={`p-2.5 rounded-xl font-bold border transition-all cursor-pointer ${ntiSubTab === 'warfarin' ? 'bg-blue-600 text-white border-blue-500 shadow-md' : isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}>
          🩸 Warfarin
        </button>
        <button type="button" onClick={() => setNtiSubTab('aminoglycoside')} className={`p-2.5 rounded-xl font-bold border transition-all cursor-pointer ${ntiSubTab === 'aminoglycoside' ? 'bg-blue-600 text-white border-blue-500 shadow-md' : isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}>
          🦠 Aminoglikosida
        </button>
        <button type="button" onClick={() => setNtiSubTab('renaldosing')} className={`p-2.5 rounded-xl font-bold border transition-all cursor-pointer ${ntiSubTab === 'renaldosing' ? 'bg-blue-600 text-white border-blue-500 shadow-md' : isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}>
          🩺 Renal Dosing
        </button>
      </div>

      {/* KONTEN SUB-TAB 1: PHENYTOIN */}
      {ntiSubTab === 'phenytoin' && (
        <div className={`p-4 rounded-xl border space-y-4 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="font-bold text-blue-500">💊 Koreksi Kadar Phenytoin (Hipoalbuminemia)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Kadar Phenytoin Observasi (mg/L)</label>
              <input type="number" step="0.1" value={phenytoinObs} onChange={(e) => setPhenytoinObs(e.target.value)} placeholder="e.g. 8.5" className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Albumin Serum (g/dL)</label>
              <input type="number" step="0.1" value={albumin} onChange={(e) => setAlbumin(e.target.value)} placeholder="e.g. 2.5" className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
            </div>
          </div>
          <div className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/30 flex justify-between items-center">
            <span className="font-bold text-blue-500">Phenytoin Terkoreksi:</span>
            <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{phenytoinAdj} mg/L (Target: 10 - 20)</span>
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" onClick={() => handleSaveTdmRecord('phenytoin')} className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-bold py-2 px-3 rounded-xl transition-all cursor-pointer">📈 Simpan TDM ke Tracker</button>
            <button type="button" onClick={() => handleAddTdmMedication('phenytoin')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl shadow-lg transition-all cursor-pointer">➕ Tambahkan ke Regimen Obat</button>
          </div>
        </div>
      )}

      {/* KONTEN SUB-TAB 2: VANCOMYCIN */}
      {ntiSubTab === 'vancomycin' && (
        <div className={`p-4 rounded-xl border space-y-4 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="font-bold text-blue-500">🧪 Vancomycin TDM & Estimasi AUC</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block mb-1 font-semibold">BB Pasien (kg)</label><input type="number" value={vancoWeight} onChange={(e) => setVancoWeight(e.target.value)} placeholder="65" className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} /></div>
            <div><label className="block mb-1 font-semibold">Serum Creatinine (mg/dL)</label><input type="number" step="0.1" value={vancoScr} onChange={(e) => setVancoScr(e.target.value)} placeholder="1.2" className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} /></div>
            <div><label className="block mb-1 font-semibold">Usia (Tahun)</label><input type="number" value={vancoAge} onChange={(e) => setVancoAge(e.target.value)} placeholder="55" className={`w-full p-3 rounded-xl border outline-none text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} /></div>
            <div><label className="block mb-1 font-semibold">Jenis Kelamin</label><select value={vancoGender} onChange={(e) => setVancoGender(e.target.value)} className={`w-full p-3 rounded-xl border outline-none text-xs font-semibold cursor-pointer ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></div>
            <div><label className="block mb-1 font-semibold">Total Dosis Harian (mg/hari)</label><input type="number" value={vancoDailyDose} onChange={(e) => setVancoDailyDose(e.target.value)} placeholder="2000" className={`w-full p-3 rounded-xl border outline-none text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} /></div>
          </div>
          <div className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/30 flex justify-between items-center">
            <span className="font-bold text-blue-500">Estimasi AUC 24 Jam:</span>
            <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{vancoAuc} mg·hr/L (Target: 400 - 600)</span>
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" onClick={() => handleSaveTdmRecord('vancomycin')} className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-bold py-2 px-3 rounded-xl transition-all cursor-pointer">📈 Simpan AUC ke Tracker</button>
            <button type="button" onClick={() => handleAddTdmMedication('vancomycin')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl shadow-lg transition-all cursor-pointer">➕ Tambahkan Dosis Vancomycin</button>
          </div>
        </div>
      )}

      {/* KONTEN SUB-TAB 3: THEOPHYLLINE */}
      {ntiSubTab === 'theophylline' && (
        <div className={`p-4 rounded-xl border space-y-4 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="font-bold text-blue-500">☕ Penyesuaian Dosis Theophylline (TDM)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Kadar Teofilin Aktual (mcg/mL)</label>
              <input type="number" step="0.1" value={theoLevel} onChange={(e) => setTheoLevel(e.target.value)} placeholder="6.0" className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Dosis Harian Saat Ini (mg/hari)</label>
              <input type="number" value={theoDose} onChange={(e) => setTheoDose(e.target.value)} placeholder="600" className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
            </div>
          </div>
          <div className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-amber-500">Rekomendasi Dosis Baru:</span>
              <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{theoRec.newDose} mg/hari</span>
            </div>
            <p className="text-slate-400 italic text-[11px]">{theoRec.status}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" onClick={() => handleSaveTdmRecord('theophylline')} className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-bold py-2 px-3 rounded-xl transition-all cursor-pointer">📈 Simpan TDM ke Tracker</button>
            <button type="button" onClick={() => handleAddTdmMedication('theophylline')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl shadow-lg transition-all cursor-pointer">➕ Update Dosis Teofilin</button>
          </div>
        </div>
      )}

      {/* KONTEN SUB-TAB 4: WARFARIN */}
      {ntiSubTab === 'warfarin' && (
        <div className={`p-4 rounded-xl border space-y-4 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="font-bold text-blue-500">🩸 Penyesuaian Dosis Warfarin Berdasarkan INR</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Nilai INR Aktual Pasien</label>
              <input type="number" step="0.1" value={warfarinInr} onChange={(e) => setWarfarinInr(e.target.value)} placeholder="1.5" className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Total Dosis Warfarin Mingguan (mg/minggu)</label>
              <input type="number" step="0.5" value={warfarinDoseWeekly} onChange={(e) => setWarfarinDoseWeekly(e.target.value)} placeholder="35" className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
            </div>
          </div>
          <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-500">Rekomendasi Dosis Baru Mingguan:</span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{warfarinRec.newWeekly} mg/minggu</span>
            </div>
            <p className="text-slate-400 italic text-[11px]">{warfarinRec.action}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" onClick={() => handleSaveTdmRecord('warfarin')} className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-bold py-2 px-3 rounded-xl transition-all cursor-pointer">📈 Simpan INR & Dosis ke Tracker</button>
            <button type="button" onClick={() => handleAddTdmMedication('warfarin')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl shadow-lg transition-all cursor-pointer">➕ Update Regimen Warfarin</button>
          </div>
        </div>
      )}

      {/* KONTEN SUB-TAB 5: AMINOGLYCOSIDE */}
      {ntiSubTab === 'aminoglycoside' && (
        <div className={`p-4 rounded-xl border space-y-4 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="font-bold text-blue-500">🦠 Dosis Empiris Aminoglikosida (Amikacin / Gentamicin)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Jenis Obat</label>
              <select value={aminoDrug} onChange={(e) => setAminoDrug(e.target.value)} className={`w-full p-3 rounded-xl border outline-none text-xs font-semibold cursor-pointer ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}>
                <option value="amikacin">Amikacin (15 mg/kg IBW)</option>
                <option value="gentamicin">Gentamicin (5-7 mg/kg IBW)</option>
              </select>
            </div>
            <div><label className="block mb-1 font-semibold">BB Aktual (kg)</label><input type="number" value={aminoWeight} onChange={(e) => setAminoWeight(e.target.value)} className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} /></div>
            <div><label className="block mb-1 font-semibold">Tinggi Badan (cm)</label><input type="number" value={aminoHeight} onChange={(e) => setAminoHeight(e.target.value)} className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} /></div>
            <div><label className="block mb-1 font-semibold">Usia (Tahun)</label><input type="number" value={aminoAge} onChange={(e) => setAminoAge(e.target.value)} className={`w-full p-3 rounded-xl border outline-none text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} /></div>
            <div><label className="block mb-1 font-semibold">Serum Creatinine (mg/dL)</label><input type="number" step="0.1" value={aminoScr} onChange={(e) => setAminoScr(e.target.value)} className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} /></div>
            <div><label className="block mb-1 font-semibold">Jenis Kelamin</label><select value={aminoGender} onChange={(e) => setAminoGender(e.target.value)} className={`w-full p-3 rounded-xl border outline-none text-xs font-semibold cursor-pointer ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></div>
          </div>
          <div className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/30 flex justify-between items-center">
            <div>
              <span className="font-bold text-blue-500 block">Rekomendasi Dosis Empiris:</span>
              <span className="text-[10px] text-slate-400">IBW: {aminoCalc.ibw} kg | ClCr: {aminoCalc.clcr} mL/min</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{aminoCalc.recDose} mg / {aminoCalc.interval}</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" onClick={() => handleSaveTdmRecord('aminoglycoside')} className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-bold py-2 px-3 rounded-xl transition-all cursor-pointer">📈 Simpan ke Tracker</button>
            <button type="button" onClick={() => handleAddTdmMedication('aminoglycoside')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl shadow-lg transition-all cursor-pointer">➕ Tambahkan Dosis Aminoglikosida</button>
          </div>
        </div>
      )}

      {/* KONTEN SUB-TAB 6: RENAL DOSING CHECKER */}
      {ntiSubTab === 'renaldosing' && (
        <div className={`p-4 rounded-xl border space-y-4 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="font-bold text-blue-500">🩺 Auto-Checker Penyesuaian Dosis Obat Berbasis ClCr</h3>
          <div>
            <label className="block mb-1 font-semibold">Klirens Kreatinin Pasien (ClCr in mL/min):</label>
            <input
              type="number"
              value={renalInputs.clcr}
              onChange={(e) => setRenalInputs({ clcr: e.target.value })}
              placeholder="e.g. 45"
              className={`w-full p-3 rounded-xl border outline-none text-xs font-bold ${
                isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
              }`}
            />
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-300 text-xs">📋 Rekomendasi Penyesuaian Dosis untuk ClCr: {clValue} mL/min</h4>
            {renalDosingDatabase.map((item, idx) => {
              const res = item.getCm(clValue);
              return (
                <div key={idx} className={`p-3 rounded-xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.drug}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md w-fit ${res.color}`}>{res.status}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-2">
                    <div className={`p-2 rounded-lg border ${isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                      <span className="block text-[10px] text-slate-500 font-semibold">Dosis Normal:</span>
                      {item.normalDose}
                    </div>
                    <div className={`p-2 rounded-lg border font-bold ${isDark ? 'bg-blue-950/30 border-blue-900/50 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
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
                      ➕ Tambahkan Dosis Ginjal Obat Ini
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}