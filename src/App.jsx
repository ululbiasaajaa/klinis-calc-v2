import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('pk');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');

  // History State
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('clinical_suite_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('clinical_suite_history', JSON.stringify(history));
  }, [history]);

  // Sub-Tab NTI Active State
  const [ntiSubTab, setNtiSubTab] = useState('phenytoin');

  // State Input
  const [pkInputs, setPkInputs] = useState({ targetConc: '', vd: '', weight: '', bioavailability: '1', clearance: '', interval: '8' });
  const [dripInputs, setDripInputs] = useState({ dose: '', weight: '', drugMg: '', volumeMl: '100' });
  const [renalInputs, setRenalInputs] = useState({ age: '', weight: '', scr: '', gender: 'male' });
  const [anthroInputs, setAnthroInputs] = useState({ height: '', weight: '', gender: 'male', tbsaBurn: '' });
  const [tdeeInputs, setTdeeInputs] = useState({ weight: '', height: '', age: '', gender: 'male', activityLevel: '1.2' });
  
  // State Input NTI
  const [ntiPhenytoin, setNtiPhenytoin] = useState({ phenytoinObs: '', albumin: '4.0', renalImpairment: 'no' });
  const [ntiVanco, setNtiVanco] = useState({ weight: '', scr: '', age: '', gender: 'male', dailyDoseMg: '2000' });
  const [ntiTheo, setNtiTheo] = useState({ currentLevel: '', currentDoseMg: '600' });
  const [ntiWarfarin, setNtiWarfarin] = useState({ currentInr: '', targetInrMin: '2.0', targetInrMax: '3.0' });
  const [ntiAmino, setNtiAmino] = useState({ drugType: 'amikacin', weight: '', height: '', gender: 'male', scr: '', age: '' });

  // Handle Input
  const handlePk = (e) => setPkInputs({ ...pkInputs, [e.target.name]: e.target.value });
  const handleDrip = (e) => setDripInputs({ ...dripInputs, [e.target.name]: e.target.value });
  const handleRenal = (e) => setRenalInputs({ ...renalInputs, [e.target.name]: e.target.value });
  const handleAnthro = (e) => setAnthroInputs({ ...anthroInputs, [e.target.name]: e.target.value });
  const handleTdee = (e) => setTdeeInputs({ ...tdeeInputs, [e.target.name]: e.target.value });

  // Reset Form
  const handleResetForm = () => {
    if (activeTab === 'pk') setPkInputs({ targetConc: '', vd: '', weight: '', bioavailability: '1', clearance: '', interval: '8' });
    if (activeTab === 'drip') setDripInputs({ dose: '', weight: '', drugMg: '', volumeMl: '100' });
    if (activeTab === 'renal') setRenalInputs({ age: '', weight: '', scr: '', gender: 'male' });
    if (activeTab === 'anthro') setAnthroInputs({ height: '', weight: '', gender: 'male', tbsaBurn: '' });
    if (activeTab === 'kalori') setTdeeInputs({ weight: '', height: '', age: '', gender: 'male', activityLevel: '1.2' });
    if (activeTab === 'nti') {
      setNtiPhenytoin({ phenytoinObs: '', albumin: '4.0', renalImpairment: 'no' });
      setNtiVanco({ weight: '', scr: '', age: '', gender: 'male', dailyDoseMg: '2000' });
      setNtiTheo({ currentLevel: '', currentDoseMg: '600' });
      setNtiWarfarin({ currentInr: '', targetInrMin: '2.0', targetInrMax: '3.0' });
      setNtiAmino({ drugType: 'amikacin', weight: '', height: '', gender: 'male', scr: '', age: '' });
    }
  };

  // Clear History Log
  const handleClearHistory = () => {
    if (window.confirm('Hapus seluruh riwayat hitungan?')) {
      setHistory([]);
    }
  };

  // Menu Items
  const menuItems = [
    { id: 'pk', name: 'Dosis PK (Farmakokinetik)', category: 'Dosis & Obat', icon: '💊' },
    { id: 'drip', name: 'Dosis Drip / Syringe Pump', category: 'Dosis & Obat', icon: '💉' },
    { id: 'nti', name: 'Obat Terapi Sempit (NTI / TDM)', category: 'Dosis & Obat', icon: '⚡' },
    { id: 'renal', name: 'Fungsi Ginjal (ClCr & eGFR)', category: 'Organ & Fungsi', icon: '🫘' },
    { id: 'anthro', name: 'Body (BSA, BMI, Parkland)', category: 'Fisiologi & Cairan', icon: '📐' },
    { id: 'kalori', name: 'Kalori Harian (BMR & TDEE)', category: 'Nutrisi & Energi', icon: '🔥' },
  ];

  // Info Rumus
  const formulaInfo = {
    pk: {
      title: 'Farmakokinetik (Loading & Maintenance Dose)',
      formula: 'Loading Dose = (C_target × Vd × BB) / F \nMaintenance Dose = (C_target × Clearance × Interval) / F',
      guideline: 'Digunakan untuk menentukan dosis awal (loading) dan dosis pemeliharaan (maintenance) obat agar mencapai kadar terapeutik dalam darah secara cepat dan konstan (Steady State).'
    },
    drip: {
      title: 'Kalkulasi Kecepatan Drip Infus',
      formula: 'Konsentrasi = (Mg Obat × 1000) / Vol Cairan (mcg/mL)\nKecepatan (mL/jam) = (Dosis × BB × 60) / Konsentrasi',
      guideline: 'Standar perhitungan kecepatan syringe pump / infusion pump untuk obat inotropik, vasoaktif, dan vasopresor (misal: Dobutamin, Dopamin, Norepinefrin).'
    },
    nti: {
      title: 'Obat Indeks Terapi Sempit (TDM / NTI)',
      formula: '1. Phenytoin: C_adj = C_obs / [(0.2 × Alb) + 0.1]\n2. Warfarin: Protokol Evaluasi INR Chest 2012\n3. Amikasin/Gentamisin: Dosis Didasarkan ABW (Jika Obesitas) + Penyesuaian ClCr',
      guideline: 'Obat NTI memiliki rentang dosis aman yang sangat sempit. Pemantauan Kadar Obat/INR wajib dilakukan untuk mencegah reaksi perdarahan, kejang, ototoksisitas, atau nefrotoksisitas fatal.'
    },
    renal: {
      title: 'Estimasi Fungsi Ginjal (ClCr & eGFR)',
      formula: 'Cockcroft-Gault: ClCr = [((140 - Usia) × BB) / (72 × Scr)] × (0.85 jika ♀)\neGFR: Persamaan CKD-EPI 2021 (Tanpa koefisien ras)',
      guideline: 'Berdasarkan Guideline KDIGO. ClCr Cockcroft-Gault umum digunakan untuk adjustment dosis obat, sedangkan CKD-EPI 2021 digunakan untuk staging Penyakit Ginjal Kronis (PGK).'
    },
    anthro: {
      title: 'Antropometri & Resusitasi Parkland',
      formula: 'BSA (Mosteller) = √[(TB × BB) / 3600]\nParkland Burn = 4 mL × BB × % TBSA',
      guideline: 'Parkland Formula digunakan pada 24 jam pertama resusitasi cairan luka bakar. 50% total cairan diberikan dalam 8 jam pertama, sisa 50% dalam 16 jam berikutnya.'
    },
    kalori: {
      title: 'Metabolisme & Energi (Mifflin-St Jeor)',
      formula: 'BMR ♂ = 10(BB) + 6.25(TB) - 5(Usia) + 5\nBMR ♀ = 10(BB) + 6.25(TB) - 5(Usia) - 161\nTDEE = BMR × Faktor Aktivitas',
      guideline: 'Mifflin-St Jeor dikonfirmasi oleh Academy of Nutrition and Dietetics sebagai rumus paling akurat untuk mengestimasi BMR pada populasi dewasa.'
    }
  };

  const filteredMenu = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Logika PK
  const ld = (() => {
    const { targetConc, vd, weight = 1, bioavailability = 1 } = pkInputs;
    if (!targetConc || !vd || bioavailability <= 0) return 0;
    return Number(((targetConc * (vd * (weight || 1))) / bioavailability).toFixed(2));
  })();

  const md = (() => {
    const { targetConc, clearance, interval, bioavailability = 1 } = pkInputs;
    if (!targetConc || !clearance || !interval || bioavailability <= 0) return 0;
    return Number(((targetConc * clearance * interval) / bioavailability).toFixed(2));
  })();

  // Logika Drip
  const drip = (() => {
    const { dose, weight, drugMg, volumeMl } = dripInputs;
    if (!dose || !weight || !drugMg || !volumeMl) return 0;
    const conc = (drugMg * 1000) / volumeMl;
    return Number(((dose * weight * 60) / conc).toFixed(1));
  })();

  // Logika NTI 1: Phenytoin
  const phenytoinAdj = (() => {
    const { phenytoinObs, albumin, renalImpairment } = ntiPhenytoin;
    if (!phenytoinObs || !albumin || albumin <= 0) return 0;
    const k = renalImpairment === 'yes' ? 0.1 : 0.2;
    const res = phenytoinObs / ((k * parseFloat(albumin)) + 0.1);
    return Number(res.toFixed(1));
  })();

  // Logika NTI 2: Vancomycin
  const vancoAuc = (() => {
    const { weight, scr, age, gender, dailyDoseMg } = ntiVanco;
    if (!weight || !scr || !age || scr <= 0) return 0;
    let clcrVal = ((140 - age) * weight) / (72 * scr);
    if (gender === 'female') clcrVal *= 0.85;
    const vancoClLhr = (0.042 * clcrVal) + 0.29;
    if (vancoClLhr <= 0) return 0;
    const auc24 = (dailyDoseMg || 2000) / vancoClLhr;
    return Number(auc24.toFixed(0));
  })();

  // Logika NTI 3: Teofilin
  const theoDoseRec = (() => {
    const { currentLevel, currentDoseMg } = ntiTheo;
    if (!currentLevel || currentLevel <= 0 || !currentDoseMg) return 0;
    const recDose = (currentDoseMg * 12.5) / currentLevel;
    return Number(recDose.toFixed(0));
  })();

  // Logika NTI 4: Warfarin INR
  const warfarinRec = (() => {
    const inr = parseFloat(ntiWarfarin.currentInr);
    if (!inr || inr <= 0) return { status: 'Normal/Belum Terisi', action: 'Masukkan nilai INR pasien saat ini.' };
    
    if (inr < 1.5) return { status: 'Sub-Terapeutik (Tinggi Risiko Bekuan Blood Clot)', action: '🚨 Naikkan dosis mingguan sebesar 10-20%.' };
    if (inr >= 1.5 && inr < 2.0) return { status: 'Sedikit di Bawah Target', action: '⚠️ Naikkan dosis mingguan sebesar 5-10%.' };
    if (inr >= 2.0 && inr <= 3.0) return { status: 'TERAPEUTIK (AMAN & TEPAT)', action: '✅ Dosis sudah pas! Pertahankan dosis mingguan saat ini.' };
    if (inr > 3.0 && inr <= 4.5) return { status: 'Sedikit di Atas Target', action: '⚠️ Tunda 1 dosis, kurangi dosis mingguan 5-10%.' };
    if (inr > 4.5 && inr <= 10.0) return { status: 'SANGAT TINGGI (RISIKO PERDARAHAN)', action: '🚨 Tunda 1-2 dosis, kurangi dosis mingguan 10-20%.' };
    if (inr > 10.0) return { status: 'TOKSIK / EMERGENCY', action: '🚨 HENTIKAN WARFARIN! Berikan Vitamin K1 5-10 mg IV lambat.' };
    return { status: 'Evaluasi', action: 'Periksa kembali nilai input.' };
  })();

  // Logika NTI 5: Amikasin / Gentamisin
  const aminoDose = (() => {
    const { drugType, weight, height, gender, scr, age } = ntiAmino;
    if (!weight || !height || !scr || !age || scr <= 0) return { ibw: 0, doseMg: 0, dosingWeight: 'TBW', interval: '24 jam' };
    
    const hInches = height / 2.54;
    const ibwVal = hInches > 60 ? (gender === 'female' ? 45.5 : 50) + 2.3 * (hInches - 60) : (gender === 'female' ? 45.5 : 50);
    
    let finalDosingWeight = weight;
    let weightLabel = 'Actual Body Weight (TBW)';
    if (weight > 1.2 * ibwVal) {
      finalDosingWeight = ibwVal + 0.4 * (weight - ibwVal);
      weightLabel = 'Adjusted Body Weight (ABW)';
    } else if (weight < ibwVal) {
      finalDosingWeight = weight;
      weightLabel = 'Actual Body Weight (TBW)';
    } else {
      finalDosingWeight = ibwVal;
      weightLabel = 'Ideal Body Weight (IBW)';
    }

    const mgPerKg = drugType === 'amikacin' ? 15 : 5;
    const calculatedDose = finalDosingWeight * mgPerKg;

    let clcrVal = ((140 - age) * weight) / (72 * scr);
    if (gender === 'female') clcrVal *= 0.85;

    let intervalText = '24 Jam';
    if (clcrVal < 20) intervalText = '48 Jam / TDM Trough';
    else if (clcrVal < 40) intervalText = '36 - 48 Jam';
    else if (clcrVal < 60) intervalText = '24 - 36 Jam';

    return {
      ibw: Number(ibwVal.toFixed(1)),
      dosingWeightMg: Number(finalDosingWeight.toFixed(1)),
      weightLabel,
      doseMg: Number(calculatedDose.toFixed(0)),
      interval: intervalText
    };
  })();

  // Logika Renal
  const clcr = (() => {
    const { age, weight, scr, gender } = renalInputs;
    if (!age || !weight || !scr || scr <= 0) return 0;
    let res = ((140 - age) * weight) / (72 * scr);
    if (gender === 'female') res *= 0.85;
    return Number(res.toFixed(1));
  })();

  const egfr = (() => {
    const { age, scr, gender } = renalInputs;
    if (!age || !scr || scr <= 0) return 0;
    const kappa = gender === 'female' ? 0.7 : 0.9;
    const alpha = gender === 'female' ? -0.241 : -0.302;
    const genderFactor = gender === 'female' ? 1.012 : 1.0;
    const res = 142 * Math.pow(Math.min(scr / kappa, 1), alpha) * Math.pow(Math.max(scr / kappa, 1), -1.2) * Math.pow(0.9938, age) * genderFactor;
    return Number(res.toFixed(1));
  })();

  // Logika Body
  const bsa = (() => {
    const { height, weight } = anthroInputs;
    if (!height || !weight) return 0;
    return Number(Math.sqrt((height * weight) / 3600).toFixed(2));
  })();

  const { bmi, ibw } = (() => {
    const { height, weight, gender } = anthroInputs;
    if (!height || !weight) return { bmi: 0, ibw: 0 };
    const hM = height / 100;
    const bmiVal = weight / (hM * hM);
    const hInches = height / 2.54;
    const ibwVal = hInches > 60 ? (gender === 'female' ? 45.5 : 50) + 2.3 * (hInches - 60) : (gender === 'female' ? 45.5 : 50);
    return { bmi: Number(bmiVal.toFixed(1)), ibw: Number(ibwVal.toFixed(1)) };
  })();

  const parkland = (() => {
    const { weight, tbsaBurn } = anthroInputs;
    if (!weight || !tbsaBurn) return { totalMl: 0, first8: 0, next16: 0 };
    const totalMl = 4 * weight * tbsaBurn;
    return { totalMl: Number(totalMl.toFixed(0)), first8: Number((totalMl / 2).toFixed(0)), next16: Number((totalMl / 2).toFixed(0)) };
  })();

  // Logika TDEE
  const { bmr, tdee } = (() => {
    const { weight, height, age, gender, activityLevel } = tdeeInputs;
    if (!weight || !height || !age) return { bmr: 0, tdee: 0 };
    let bmrVal = (10 * weight) + (6.25 * height) - (5 * age) + (gender === 'female' ? -161 : 5);
    return { bmr: Number(bmrVal.toFixed(0)), tdee: Number((bmrVal * (parseFloat(activityLevel) || 1.2)).toFixed(0)) };
  })();

  // Function to Add to History Log
  const saveToHistoryLog = (type, summary) => {
    const newEntry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('id-ID'),
      patient: patientName || 'Tanpa Nama',
      rm: patientId || '-',
      type,
      summary
    };
    setHistory((prev) => [newEntry, ...prev.slice(0, 9)]); // Simpan 10 riwayat terakhir
  };

  // Copy Summary
  const handleCopySummary = () => {
    let summaryText = `[Clinical Suite Report]\nPasien: ${patientName || '-'} (RM: ${patientId || '-'})\n`;
    let calcType = '';

    if (activeTab === 'pk') {
      calcType = 'Dosis PK';
      summaryText += `Evaluasi: Dosis PK\n- Loading Dose: ${ld} mg\n- Maintenance Dose: ${md} mg / ${pkInputs.interval || 0}j`;
    }
    if (activeTab === 'drip') {
      calcType = 'Dosis Drip';
      summaryText += `Evaluasi: Dosis Drip Syringe Pump\n- Kecepatan Infus: ${drip} mL/jam`;
    }
    if (activeTab === 'nti') {
      calcType = `NTI (${ntiSubTab.toUpperCase()})`;
      if (ntiSubTab === 'phenytoin') summaryText += `Evaluasi NTI: Phenytoin (Winter-Tozer)\n- Phenytoin Terkoreksi: ${phenytoinAdj} mcg/mL`;
      if (ntiSubTab === 'vanco') summaryText += `Evaluasi NTI: Vancomycin AUC24\n- Estimasi AUC24: ${vancoAuc} mg·hr/L`;
      if (ntiSubTab === 'theo') summaryText += `Evaluasi NTI: Teofilin Adjustment\n- Rekomendasi Dosis Baru: ${theoDoseRec} mg/hari`;
      if (ntiSubTab === 'warfarin') summaryText += `Evaluasi NTI: Warfarin INR (${ntiWarfarin.currentInr || '-'})\n- Status: ${warfarinRec.status}`;
      if (ntiSubTab === 'amino') summaryText += `Evaluasi NTI: ${ntiAmino.drugType.toUpperCase()}\n- Dosis Rekomendasi: ${aminoDose.doseMg} mg / ${aminoDose.interval}`;
    }
    if (activeTab === 'renal') {
      calcType = 'Fungsi Ginjal';
      summaryText += `Evaluasi: Fungsi Ginjal\n- ClCr: ${clcr} mL/min\n- eGFR: ${egfr} mL/min/1.73m²`;
    }
    if (activeTab === 'anthro') {
      calcType = 'Antropometri & Parkland';
      summaryText += `Evaluasi: Antropometri & Parkland\n- BSA: ${bsa} m² | BMI: ${bmi} kg/m² | IBW: ${ibw} kg`;
    }
    if (activeTab === 'kalori') {
      calcType = 'Kalori Harian';
      summaryText += `Evaluasi: Kalori Harian\n- BMR: ${bmr} kcal/hari\n- TDEE: ${tdee} kcal/hari`;
    }

    navigator.clipboard.writeText(summaryText);
    setCopySuccess(true);
    saveToHistoryLog(calcType, summaryText);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Export PDF
  const handleDownloadPDF = () => {
    let calcType = activeTab.toUpperCase();
    let summaryText = `Pasien ${patientName || '-'}: Evaluasi ${calcType} Selesai di-generate.`;
    saveToHistoryLog(`PDF Export (${calcType})`, summaryText);

    const element = document.getElementById('pdf-template');
    element.style.display = 'block';
    
    const opt = {
      margin:       0.4,
      filename:     `Laporan-Klinis-${patientName || 'Pasien'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      element.style.display = 'none';
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* HEADER MOBILE */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl">🩺</span>
          <span className="font-bold text-lg text-blue-400">Clinical Suite</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white"
        >
          {isSidebarOpen ? '✖' : '☰'}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed md:static top-0 left-0 h-full w-72 bg-slate-900 border-r border-slate-800/80 p-5 flex flex-col justify-between z-40 transition-transform duration-300 overflow-y-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          <div className="hidden md:flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
              🩺
            </div>
            <div>
              <h1 className="font-extrabold text-slate-100 text-lg leading-tight">Clinical Suite</h1>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
                v2.1 History Log Active
              </span>
            </div>
          </div>

          <div className="relative mb-5">
            <input
              type="text"
              placeholder="🔍 Cari kalkulator / obat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 block">
              NAVIGASI KALKULATOR
            </span>
            {filteredMenu.length > 0 ? (
              filteredMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <div className="text-left">
                    <p className="leading-none">{item.name}</p>
                    <span className={`text-[9px] block mt-1 ${activeTab === item.id ? 'text-blue-200' : 'text-slate-500'}`}>
                      {item.category}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-xs text-slate-500 p-3 text-center">Kalkulator tidak ditemukan...</p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
          <p>© 2026 Clinical Suite</p>
          <p className="text-[9px] text-slate-600 mt-0.5">Ready for Clinical Practice</p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        
        {/* Identitas Pasien Banner */}
        <div className="bg-slate-900 border border-slate-800 p-4 md:p-5 rounded-2xl mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">👤</span>
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Identitas Pasien (Input Laporan PDF)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nama Pasien (Misal: Tn. Muhammad Ulul)"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 transition-all"
            />
            <input
              type="text"
              placeholder="No. Rekam Medis / RM (Misal: 25)"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Dynamic Calculator Content */}
        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl mb-8">
          
          <div className="mb-6 border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{menuItems.find(m => m.id === activeTab)?.icon}</span>
                {menuItems.find(m => m.id === activeTab)?.name}
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Kategori: {menuItems.find(m => m.id === activeTab)?.category}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetForm}
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                title="Reset Input Form Ini"
              >
                🧹 Reset
              </button>
              <button
                onClick={() => setShowInfo(true)}
                className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                title="Lihat Rumus & Guideline Medis"
              >
                ℹ️ Info
              </button>
            </div>
          </div>

          {/* TAB 1: DOSIS PK */}
          {activeTab === 'pk' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Target Conc (mg/L)</label><input type="number" name="targetConc" value={pkInputs.targetConc} onChange={handlePk} placeholder="e.g. 15" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Vd (L/kg)</label><input type="number" name="vd" value={pkInputs.vd} onChange={handlePk} placeholder="e.g. 0.7" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">BB Pasien (kg)</label><input type="number" name="weight" value={pkInputs.weight} onChange={handlePk} placeholder="e.g. 60" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Bioavailabilitas (F)</label><select name="bioavailability" value={pkInputs.bioavailability} onChange={handlePk} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"><option value="1">1.0 (IV / Intravena)</option><option value="0.8">0.8 (Oral 80%)</option></select></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Clearance (L/jam)</label><input type="number" name="clearance" value={pkInputs.clearance} onChange={handlePk} placeholder="e.g. 3.0" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Interval (Jam)</label><input type="number" name="interval" value={pkInputs.interval} onChange={handlePk} placeholder="e.g. 8" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-950/40 border border-blue-800/50 p-5 rounded-2xl">
                <div><span className="text-xs font-bold text-blue-400 block mb-1">Loading Dose</span><span className="text-3xl font-extrabold text-white">{ld} <span className="text-sm font-normal text-slate-400">mg</span></span></div>
                <div><span className="text-xs font-bold text-blue-400 block mb-1">Maintenance Dose</span><span className="text-3xl font-extrabold text-white">{md} <span className="text-sm font-normal text-slate-400">mg / {pkInputs.interval || 0}j</span></span></div>
              </div>
            </div>
          )}

          {/* TAB 2: DOSIS DRIP */}
          {activeTab === 'drip' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Dosis (mcg/kg/min)</label><input type="number" name="dose" value={dripInputs.dose} onChange={handleDrip} placeholder="e.g. 5" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">BB Pasien (kg)</label><input type="number" name="weight" value={dripInputs.weight} onChange={handleDrip} placeholder="e.g. 60" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Jumlah Obat (mg)</label><input type="number" name="drugMg" value={dripInputs.drugMg} onChange={handleDrip} placeholder="e.g. 250" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Volume Cairan (mL)</label><input type="number" name="volumeMl" value={dripInputs.volumeMl} onChange={handleDrip} placeholder="e.g. 100" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
              </div>
              <div className="bg-blue-950/40 border border-blue-800/50 p-5 rounded-2xl text-center mb-4">
                <span className="text-xs font-bold text-blue-400 block mb-1">Kecepatan Infus / Syringe Pump</span>
                <span className="text-4xl font-extrabold text-white">{drip} <span className="text-base font-normal text-slate-400">mL/jam</span></span>
              </div>
            </div>
          )}

          {/* TAB 3: OBAT INDEKS TERAPI SEMPIT (NTI) */}
          {activeTab === 'nti' && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 mb-6 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button onClick={() => setNtiSubTab('phenytoin')} className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${ntiSubTab === 'phenytoin' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Phenytoin</button>
                <button onClick={() => setNtiSubTab('vanco')} className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${ntiSubTab === 'vanco' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Vancomycin</button>
                <button onClick={() => setNtiSubTab('theo')} className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${ntiSubTab === 'theo' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Teofilin</button>
                <button onClick={() => setNtiSubTab('warfarin')} className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${ntiSubTab === 'warfarin' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Warfarin (INR)</button>
                <button onClick={() => setNtiSubTab('amino')} className={`col-span-2 md:col-span-1 py-2 text-[11px] font-semibold rounded-lg transition-all ${ntiSubTab === 'amino' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Amikasin/Gentamisin</button>
              </div>

              {ntiSubTab === 'phenytoin' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div><label className="block text-xs font-semibold text-slate-300 mb-1">Phenytoin Kadar Terukur (mcg/mL)</label><input type="number" value={ntiPhenytoin.phenytoinObs} onChange={(e) => setNtiPhenytoin({ ...ntiPhenytoin, phenytoinObs: e.target.value })} placeholder="e.g. 8.5" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-xs font-semibold text-slate-300 mb-1">Kadar Albumin Pasien (g/dL)</label><input type="number" value={ntiPhenytoin.albumin} onChange={(e) => setNtiPhenytoin({ ...ntiPhenytoin, albumin: e.target.value })} placeholder="e.g. 2.5" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                  </div>
                  <div className="bg-blue-950/40 border border-blue-800/50 p-5 rounded-2xl text-center mb-4">
                    <span className="text-xs font-bold text-blue-400 block mb-1">Kadar Phenytoin Terkoreksi (Winter-Tozer)</span>
                    <span className="text-4xl font-extrabold text-white">{phenytoinAdj} <span className="text-base font-normal text-slate-400">mcg/mL</span></span>
                  </div>
                </div>
              )}

              {ntiSubTab === 'vanco' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div><label className="block text-xs font-semibold text-slate-300 mb-1">Dosis Total 24 Jam (mg)</label><input type="number" value={ntiVanco.dailyDoseMg} onChange={(e) => setNtiVanco({ ...ntiVanco, dailyDoseMg: e.target.value })} placeholder="e.g. 2000" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-xs font-semibold text-slate-300 mb-1">Serum Creatinine (mg/dL)</label><input type="number" value={ntiVanco.scr} onChange={(e) => setNtiVanco({ ...ntiVanco, scr: e.target.value })} placeholder="e.g. 1.0" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                  </div>
                  <div className="bg-blue-950/40 border border-blue-800/50 p-5 rounded-2xl text-center mb-4">
                    <span className="text-xs font-bold text-blue-400 block mb-1">Estimasi Ratio AUC24 / MIC</span>
                    <span className="text-4xl font-extrabold text-white">{vancoAuc} <span className="text-base font-normal text-slate-400">mg·hr/L</span></span>
                  </div>
                </div>
              )}

              {ntiSubTab === 'theo' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div><label className="block text-xs font-semibold text-slate-300 mb-1">Kadar Teofilin Terukur Saat Ini (mcg/mL)</label><input type="number" value={ntiTheo.currentLevel} onChange={(e) => setNtiTheo({ ...ntiTheo, currentLevel: e.target.value })} placeholder="e.g. 6.0" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-xs font-semibold text-slate-300 mb-1">Dosis Harian Saat Ini (mg/hari)</label><input type="number" value={ntiTheo.currentDoseMg} onChange={(e) => setNtiTheo({ ...ntiTheo, currentDoseMg: e.target.value })} placeholder="e.g. 600" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                  </div>
                  <div className="bg-blue-950/40 border border-blue-800/50 p-5 rounded-2xl text-center mb-4">
                    <span className="text-xs font-bold text-blue-400 block mb-1">Rekomendasi Dosis Baru</span>
                    <span className="text-4xl font-extrabold text-white">{theoDoseRec} <span className="text-base font-normal text-slate-400">mg/hari</span></span>
                  </div>
                </div>
              )}

              {ntiSubTab === 'warfarin' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div><label className="block text-xs font-semibold text-slate-300 mb-1">Nilai Terukur INR Pasien</label><input type="number" value={ntiWarfarin.currentInr} onChange={(e) => setNtiWarfarin({ ...ntiWarfarin, currentInr: e.target.value })} placeholder="e.g. 3.8" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                  </div>
                  <div className="bg-blue-950/40 border border-blue-800/50 p-5 rounded-2xl mb-4">
                    <span className="text-xs font-bold text-blue-400 block mb-1">EVALUASI INR:</span>
                    <p className="text-lg font-bold text-white mb-2">{warfarinRec.status}</p>
                    <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800">{warfarinRec.action}</p>
                  </div>
                </div>
              )}

              {ntiSubTab === 'amino' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div><label className="block text-xs font-semibold text-slate-300 mb-1">BB Pasien (kg)</label><input type="number" value={ntiAmino.weight} onChange={(e) => setNtiAmino({ ...ntiAmino, weight: e.target.value })} placeholder="e.g. 85" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-xs font-semibold text-slate-300 mb-1">Tinggi Badan (cm)</label><input type="number" value={ntiAmino.height} onChange={(e) => setNtiAmino({ ...ntiAmino, height: e.target.value })} placeholder="e.g. 165" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-xs font-semibold text-slate-300 mb-1">Serum Creatinine (mg/dL)</label><input type="number" value={ntiAmino.scr} onChange={(e) => setNtiAmino({ ...ntiAmino, scr: e.target.value })} placeholder="e.g. 1.1" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-xs font-semibold text-slate-300 mb-1">Usia Pasien (Tahun)</label><input type="number" value={ntiAmino.age} onChange={(e) => setNtiAmino({ ...ntiAmino, age: e.target.value })} placeholder="e.g. 45" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-950/40 border border-blue-800/50 p-5 rounded-2xl mb-4">
                    <div><span className="text-xs font-bold text-blue-400 block mb-1">Dosis Rekomendasi</span><span className="text-3xl font-extrabold text-white">{aminoDose.doseMg} <span className="text-sm font-normal text-slate-400">mg</span></span></div>
                    <div><span className="text-xs font-bold text-blue-400 block mb-1">Interval Infus</span><span className="text-2xl font-bold text-emerald-400">Setiap {aminoDose.interval}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FUNGSI GINJAL */}
          {activeTab === 'renal' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Usia (Tahun)</label><input type="number" name="age" value={renalInputs.age} onChange={handleRenal} placeholder="e.g. 55" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">BB Pasien (kg)</label><input type="number" name="weight" value={renalInputs.weight} onChange={handleRenal} placeholder="e.g. 65" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Serum Creatinine (mg/dL)</label><input type="number" name="scr" value={renalInputs.scr} onChange={handleRenal} placeholder="e.g. 1.2" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Jenis Kelamin</label><select name="gender" value={renalInputs.gender} onChange={handleRenal} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-950/40 border border-blue-800/50 p-5 rounded-2xl mb-4">
                <div><span className="text-xs font-bold text-blue-400 block mb-1">ClCr (Cockcroft-Gault)</span><span className="text-3xl font-extrabold text-white">{clcr} <span className="text-sm font-normal text-slate-400">mL/menit</span></span></div>
                <div><span className="text-xs font-bold text-blue-400 block mb-1">eGFR (CKD-EPI 2021)</span><span className="text-3xl font-extrabold text-white">{egfr} <span className="text-sm font-normal text-slate-400">mL/min/1.73m²</span></span></div>
              </div>
            </div>
          )}

          {/* TAB 5: BODY & CAIRAN */}
          {activeTab === 'anthro' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Tinggi Badan (cm)</label><input type="number" name="height" value={anthroInputs.height} onChange={handleAnthro} placeholder="e.g. 170" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">BB Pasien (kg)</label><input type="number" name="weight" value={anthroInputs.weight} onChange={handleAnthro} placeholder="e.g. 70" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3 bg-blue-950/40 border border-blue-800/50 p-4 rounded-2xl text-center mb-4">
                <div><span className="text-[10px] font-bold text-blue-400 block mb-1">BSA</span><span className="text-xl font-extrabold text-white">{bsa} m²</span></div>
                <div><span className="text-[10px] font-bold text-blue-400 block mb-1">BMI</span><span className="text-xl font-extrabold text-white">{bmi} kg/m²</span></div>
                <div><span className="text-[10px] font-bold text-blue-400 block mb-1">IBW</span><span className="text-xl font-extrabold text-white">{ibw} kg</span></div>
              </div>
            </div>
          )}

          {/* TAB 6: KALORI HARIAN */}
          {activeTab === 'kalori' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Usia (Tahun)</label><input type="number" name="age" value={tdeeInputs.age} onChange={handleTdee} placeholder="e.g. 25" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Tinggi Badan (cm)</label><input type="number" name="height" value={tdeeInputs.height} onChange={handleTdee} placeholder="e.g. 170" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">BB Pasien (kg)</label><input type="number" name="weight" value={tdeeInputs.weight} onChange={handleTdee} placeholder="e.g. 65" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-950/40 border border-blue-800/50 p-5 rounded-2xl">
                <div><span className="text-xs font-bold text-blue-400 block mb-1">BMR</span><span className="text-3xl font-extrabold text-white">{bmr} <span className="text-sm font-normal text-slate-400">kcal/hari</span></span></div>
                <div><span className="text-xs font-bold text-blue-400 block mb-1">TDEE</span><span className="text-3xl font-extrabold text-emerald-400">{tdee} <span className="text-sm font-normal text-slate-400">kcal/hari</span></span></div>
              </div>
            </div>
          )}

          {/* TOMBOL AKSI BAWAH */}
          <div className="mt-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              onClick={handleCopySummary}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-5 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-xs"
            >
              {copySuccess ? '✅ Berhasil Disalin & Disimpan!' : '📋 Salin & Simpan Riwayat'}
            </button>

            <button
              onClick={handleDownloadPDF}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 text-xs"
            >
              📄 Cetak / Download Laporan PDF (Resmi)
            </button>
          </div>

        </div>

        {/* SECTION RIWAYAT HITUNGAN (HISTORY LOG) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📜</span>
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Riwayat Kalkulasi Terakhir (LocalStorage)</h3>
            </div>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-[11px] text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded bg-red-950/40 border border-red-800/40 transition-all"
              >
                🗑️ Hapus Riwayat
              </button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {history.map((item) => (
                <div key={item.id} className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl text-xs flex flex-col gap-1">
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded font-semibold text-[10px] border border-blue-500/30">
                        {item.type}
                      </span>
                      <span className="font-bold text-slate-200">Pasien: {item.patient} (RM: {item.rm})</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{item.date} • {item.time}</span>
                  </div>
                  <pre className="text-[11px] text-slate-400 font-mono whitespace-pre-wrap mt-1">
                    {item.summary}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6 bg-slate-950/40 rounded-xl border border-slate-800/40">
              Belum ada riwayat kalkulasi. Klik "Salin & Simpan Riwayat" atau "Download PDF" di atas untuk merekam hasil hitungan!
            </p>
          )}
        </div>

      </main>

      {/* MODAL POPUP INFO RUMUS MEDIS */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✖
            </button>
            
            <div className="flex items-center gap-2 mb-4 text-blue-400">
              <span className="text-2xl">📖</span>
              <h3 className="font-bold text-base text-white">{formulaInfo[activeTab].title}</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold block mb-1">FORMULA / RUMUS:</span>
                <pre className="bg-slate-950 p-3 rounded-xl text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {formulaInfo[activeTab].formula}
                </pre>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">GUIDELINE & CATATAN KLINIS:</span>
                <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {formulaInfo[activeTab].guideline}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all"
            >
              Tutup & Kembali
            </button>
          </div>
        </div>
      )}

      {/* TEMPLATE PDF KHUSUS */}
      <div id="pdf-template" style={{ display: 'none' }} className="p-8 bg-white text-black font-sans text-xs">
        <div style={{ borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1e3a8a' }}>CLINICAL SUITE MEDICAL REPORT</h1>
              <p style={{ margin: '2px 0 0 0', color: '#475569', fontSize: '10px' }}>Sistem Kalkulasi Farmasi Klinis & Evaluasi Dosis Pasien</p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '10px', color: '#475569' }}>
              <p style={{ margin: 0 }}>Tanggal: <strong>{new Date().toLocaleDateString('id-ID')}</strong></p>
              <p style={{ margin: 0 }}>Dokumen Digital Resmi</p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px', color: '#0f172a' }}>1. IDENTITAS PASIEN</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 8px', width: '15%', fontWeight: 'bold', background: '#f1f5f9' }}>Nama Pasien</td>
                <td style={{ padding: '4px 8px', width: '35%', borderBottom: '1px solid #e2e8f0' }}>{patientName || '-'}</td>
                <td style={{ padding: '4px 8px', width: '15%', fontWeight: 'bold', background: '#f1f5f9' }}>No. RM</td>
                <td style={{ padding: '4px 8px', width: '35%', borderBottom: '1px solid #e2e8f0' }}>{patientId || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px', color: '#0f172a' }}>
            2. HASIL EVALUASI KLINIS
          </h3>
          <p style={{ margin: 0, fontSize: '11px', color: '#1e293b' }}>
            Evaluasi {activeTab.toUpperCase()} telah berhasil dihitung & dicetak sesuai standar protokol klinis.
          </p>
        </div>

        <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ width: '55%', fontSize: '9px', color: '#64748b', fontStyle: 'italic', border: '1px border #e2e8f0', padding: '6px' }}>
            *Catatan: Hasil kalkulasi ini merupakan alat bantu keputusan klinis berbasis formula standar farmasi/medis. Keputusan akhir tetap berdasarkan pertimbangan klinis DPJP/Farmasis Klinis.
          </div>
          <div style={{ textTransform: 'uppercase', textAlign: 'center', width: '35%' }}>
            <p style={{ margin: 0, fontSize: '10px' }}>Farmasis / Dokter Pengaji</p>
            <div style={{ height: '50px' }}></div>
            <p style={{ margin: 0, borderTop: '1px solid #000', fontWeight: 'bold', paddingTop: '2px' }}>( ________________________ )</p>
          </div>
        </div>

      </div>

    </div>
  );
}