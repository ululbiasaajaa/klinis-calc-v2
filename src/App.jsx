import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('pk');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false); // State Notifikasi Copy

  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');

  // State Input
  const [pkInputs, setPkInputs] = useState({ targetConc: '', vd: '', weight: '', bioavailability: '1', clearance: '', interval: '8' });
  const [dripInputs, setDripInputs] = useState({ dose: '', weight: '', drugMg: '', volumeMl: '100' });
  const [renalInputs, setRenalInputs] = useState({ age: '', weight: '', scr: '', gender: 'male' });
  const [anthroInputs, setAnthroInputs] = useState({ height: '', weight: '', gender: 'male', tbsaBurn: '' });
  const [tdeeInputs, setTdeeInputs] = useState({ weight: '', height: '', age: '', gender: 'male', activityLevel: '1.2' });

  // Handle Input
  const handlePk = (e) => setPkInputs({ ...pkInputs, [e.target.name]: e.target.value });
  const handleDrip = (e) => setDripInputs({ ...dripInputs, [e.target.name]: e.target.value });
  const handleRenal = (e) => setRenalInputs({ ...renalInputs, [e.target.name]: e.target.value });
  const handleAnthro = (e) => setAnthroInputs({ ...anthroInputs, [e.target.name]: e.target.value });
  const handleTdee = (e) => setTdeeInputs({ ...tdeeInputs, [e.target.name]: e.target.value });

  // Fungsi Reset Form Per Tab
  const handleResetForm = () => {
    if (activeTab === 'pk') setPkInputs({ targetConc: '', vd: '', weight: '', bioavailability: '1', clearance: '', interval: '8' });
    if (activeTab === 'drip') setDripInputs({ dose: '', weight: '', drugMg: '', volumeMl: '100' });
    if (activeTab === 'renal') setRenalInputs({ age: '', weight: '', scr: '', gender: 'male' });
    if (activeTab === 'anthro') setAnthroInputs({ height: '', weight: '', gender: 'male', tbsaBurn: '' });
    if (activeTab === 'kalori') setTdeeInputs({ weight: '', height: '', age: '', gender: 'male', activityLevel: '1.2' });
  };

  // Menu Items
  const menuItems = [
    { id: 'pk', name: 'Dosis PK (Farmakokinetik)', category: 'Dosis & Obat', icon: '💊' },
    { id: 'drip', name: 'Dosis Drip / Syringe Pump', category: 'Dosis & Obat', icon: '💉' },
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

  // Fungsi Salin Ringkasan Teks
  const handleCopySummary = () => {
    let summaryText = `[Clinical Suite Report]\nPasien: ${patientName || '-'} (RM: ${patientId || '-'})\n`;
    
    if (activeTab === 'pk') summaryText += `Evaluasi: Dosis PK\n- Loading Dose: ${ld} mg\n- Maintenance Dose: ${md} mg / ${pkInputs.interval || 0}j`;
    if (activeTab === 'drip') summaryText += `Evaluasi: Dosis Drip Syringe Pump\n- Kecepatan Infus: ${drip} mL/jam`;
    if (activeTab === 'renal') summaryText += `Evaluasi: Fungsi Ginjal\n- ClCr: ${clcr} mL/min\n- eGFR: ${egfr} mL/min/1.73m²`;
    if (activeTab === 'anthro') summaryText += `Evaluasi: Antropometri & Parkland\n- BSA: ${bsa} m² | BMI: ${bmi} kg/m² | IBW: ${ibw} kg${anthroInputs.tbsaBurn > 0 ? `\n- Parkland RL: Total ${parkland.totalMl} mL` : ''}`;
    if (activeTab === 'kalori') summaryText += `Evaluasi: Kalori Harian\n- BMR: ${bmr} kcal/hari\n- TDEE: ${tdee} kcal/hari`;

    navigator.clipboard.writeText(summaryText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Export PDF
  const handleDownloadPDF = () => {
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
        fixed md:static top-0 left-0 h-full w-72 bg-slate-900 border-r border-slate-800/80 p-5 flex flex-col justify-between z-40 transition-transform duration-300
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
                v2.0 Enterprise
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
        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl">
          
          {/* Active Tab Header + TOMBOL AKSI ATAS */}
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

              {drip > 50 && (
                <div className="bg-amber-950/60 border border-amber-500/50 p-4 rounded-xl flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div className="text-xs">
                    <p className="font-bold text-amber-400">PERHATIAN: Kecepatan Infus Cukup Tinggi ({drip} mL/jam)</p>
                    <p className="text-amber-200/80 mt-0.5">Pastikan ketersediaan IV line vena besar/sentral untuk mencegah kelebihan cairan & iritasi pembuluh darah.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FUNGSI GINJAL */}
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

              {egfr > 0 && egfr < 30 && (
                <div className="bg-red-950/80 border border-red-500/60 p-4 rounded-xl flex items-start gap-3">
                  <span className="text-xl">🚨</span>
                  <div className="text-xs">
                    <p className="font-bold text-red-400">ALERT: eGFR &lt; 30 mL/min/1.73m² (CKD Stage 4-5 / Severe Renal Impairment)</p>
                    <p className="text-red-200/80 mt-1">Sangat rentan intoksikasi obat! Lakukan penyesuaian/penurunan dosis obat ginjal (Aminoglikosida, Meropenem, Metformin, dll) dan hindari obat nefrotoksik (NSAID).</p>
                  </div>
                </div>
              )}

              {egfr >= 30 && egfr < 60 && (
                <div className="bg-amber-950/60 border border-amber-500/50 p-4 rounded-xl flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div className="text-xs">
                    <p className="font-bold text-amber-400">WARNING: eGFR 30 - 59 mL/min/1.73m² (CKD Stage 3 / Moderate Impairment)</p>
                    <p className="text-amber-200/80 mt-1">Fungsi ginjal menurun moderat. Evaluasi beberapa rejimen obat yang diekskresi via ginjal.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BODY & CAIRAN */}
          {activeTab === 'anthro' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Tinggi Badan (cm)</label><input type="number" name="height" value={anthroInputs.height} onChange={handleAnthro} placeholder="e.g. 170" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">BB Pasien (kg)</label><input type="number" name="weight" value={anthroInputs.weight} onChange={handleAnthro} placeholder="e.g. 70" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Jenis Kelamin</label><select name="gender" value={anthroInputs.gender} onChange={handleAnthro} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Luka Bakar / TBSA (%)</label><input type="number" name="tbsaBurn" value={anthroInputs.tbsaBurn} onChange={handleAnthro} placeholder="e.g. 30" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3 bg-blue-950/40 border border-blue-800/50 p-4 rounded-2xl text-center mb-4">
                <div><span className="text-[10px] font-bold text-blue-400 block mb-1">BSA</span><span className="text-xl font-extrabold text-white">{bsa} m²</span></div>
                <div><span className="text-[10px] font-bold text-blue-400 block mb-1">BMI</span><span className="text-xl font-extrabold text-white">{bmi} kg/m²</span></div>
                <div><span className="text-[10px] font-bold text-blue-400 block mb-1">IBW</span><span className="text-xl font-extrabold text-white">{ibw} kg</span></div>
              </div>

              {anthroInputs.tbsaBurn > 0 && (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs font-bold text-amber-400 block mb-2">🔥 Resusitasi Cairan Parkland</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800"><p className="text-slate-400">Total RL</p><p className="text-lg font-bold text-white">{parkland.totalMl} mL</p></div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800"><p className="text-slate-400">8 Jam I</p><p className="text-lg font-bold text-amber-300">{parkland.first8} mL</p></div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800"><p className="text-slate-400">16 Jam Sisa</p><p className="text-lg font-bold text-amber-300">{parkland.next16} mL</p></div>
                  </div>
                  {anthroInputs.tbsaBurn > 20 && (
                    <p className="text-[11px] text-red-400 bg-red-950/40 p-2 rounded border border-red-800/40">
                      🚨 <strong>Luka Bakar Berat (&gt;20% TBSA):</strong> Risiko tinggi syok hipovolemik & edema. Awasi produksi urin (target 0.5 - 1 mL/kg/jam).
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: KALORI HARIAN */}
          {activeTab === 'kalori' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Usia (Tahun)</label><input type="number" name="age" value={tdeeInputs.age} onChange={handleTdee} placeholder="e.g. 25" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Tinggi Badan (cm)</label><input type="number" name="height" value={tdeeInputs.height} onChange={handleTdee} placeholder="e.g. 170" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">BB Pasien (kg)</label><input type="number" name="weight" value={tdeeInputs.weight} onChange={handleTdee} placeholder="e.g. 65" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Jenis Kelamin</label><select name="gender" value={tdeeInputs.gender} onChange={handleTdee} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></div>
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
              {copySuccess ? '✅ Berhasil Disalin!' : '📋 Salin Ringkasan Teks'}
            </button>

            <button
              onClick={handleDownloadPDF}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 text-xs"
            >
              📄 Cetak / Download Laporan PDF (Resmi)
            </button>
          </div>

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
            2. HASIL EVALUASI ({activeTab === 'pk' ? 'FARMAKOKINETIK DOSIS' : activeTab === 'drip' ? 'DOSIS DRIP / SYRINGE PUMP' : activeTab === 'renal' ? 'EVALUASI FUNGSI GINJAL' : activeTab === 'anthro' ? 'ANTROPOMETRI & RESUSITASI' : 'KEBUTUHAN KALORI'})
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
            <thead>
              <tr style={{ background: '#1e293b', color: '#fff', textAlign: 'left' }}>
                <th style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>Parameter Klinis</th>
                <th style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>Nilai / Hasil Hitung</th>
                <th style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>Satuan</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'pk' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Target Concentration</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{pkInputs.targetConc || '-'}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>mg/L</td></tr>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Clearance / Volume Dst</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{pkInputs.clearance || '-'} / {pkInputs.vd || '-'}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>L/jam | L/kg</td></tr>
                  <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>RECOMMENDED LOADING DOSE</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '14px', color: '#1e40af' }}>{ld}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>mg</td></tr>
                  <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>MAINTENANCE DOSE</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '14px', color: '#1e40af' }}>{md}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>mg / {pkInputs.interval || 0} jam</td></tr>
                </>
              )}

              {activeTab === 'drip' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Dosis Target & BB Pasien</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{dripInputs.dose || '-'} mcg/kg/min</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>BB: {dripInputs.weight || '-'} kg</td></tr>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Konsentrasi Obat</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{dripInputs.drugMg || '-'} mg dalam {dripInputs.volumeMl || '-'} mL</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Cairan Infus</td></tr>
                  <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>KECEPATAN SYRINGE PUMP</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '14px', color: '#1e40af' }}>{drip}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>mL/jam</td></tr>
                </>
              )}

              {activeTab === 'renal' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Usia / BB / Scr Pasien</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>{renalInputs.age || '-'} thn / {renalInputs.weight || '-'} kg / {renalInputs.scr || '-'} mg/dL</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>{renalInputs.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</td></tr>
                  <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>Cockcroft-Gault (ClCr)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '13px', color: '#0f766e' }}>{clcr}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>mL/menit</td></tr>
                  <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>eGFR (CKD-EPI 2021)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '13px', color: '#0f766e' }}>{egfr}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>mL/min/1.73m²</td></tr>
                </>
              )}

              {activeTab === 'anthro' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>BSA (Mosteller)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{bsa}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>m²</td></tr>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>BMI / IBW</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{bmi} / {ibw}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>kg/m² | kg</td></tr>
                </>
              )}

              {activeTab === 'kalori' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Basal Metabolic Rate (BMR)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{bmr}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>kcal/hari</td></tr>
                  <tr style={{ background: '#f0fdf4' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#15803d' }}>Total Daily Energy Expenditure (TDEE)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '14px', color: '#15803d' }}>{tdee}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#15803d' }}>kcal/hari</td></tr>
                </>
              )}
            </tbody>
          </table>
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