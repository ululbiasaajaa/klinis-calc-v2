import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';

import Sidebar from './components/Sidebar';
import PatientHeader from './components/PatientHeader';
import HospitalHeader from './components/HospitalHeader';
import HistoryLog from './components/HistoryLog';
import NtiCalculator from './calculators/NtiCalculator';
import DdiCalculator from './calculators/DdiCalculator';
import TdmChartCalculator from './calculators/TdmChartCalculator';
import PedsGeriCalculator from './calculators/PedsGeriCalculator';
import PrescriptionEtiquetteCalculator from './calculators/PrescriptionEtiquetteCalculator'; // Import Komponen Etiket
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('pk');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');

  // State Kop Surat RS
  const [hospitalInfo, setHospitalInfo] = useState(() => {
    const saved = localStorage.getItem('clinical_suite_hospital');
    return saved ? JSON.parse(saved) : {
      name: 'RUMAH SAKIT UMUM CLINICAL SUITE',
      address: 'Jl. Pelayanan Kesehatan No. 1, Jakarta • Telp: (021) 555-0199',
      logoUrl: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('clinical_suite_hospital', JSON.stringify(hospitalInfo));
  }, [hospitalInfo]);

  // History State
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('clinical_suite_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('clinical_suite_history', JSON.stringify(history));
  }, [history]);

  // NTI Active Subtab
  const [ntiSubTab, setNtiSubTab] = useState('phenytoin');

  // State Inputs
  const [pkInputs, setPkInputs] = useState({ targetConc: '', vd: '', weight: '', bioavailability: '1', clearance: '', interval: '8' });
  const [dripInputs, setDripInputs] = useState({ dose: '', weight: '', drugMg: '', volumeMl: '100' });
  const [renalInputs, setRenalInputs] = useState({ age: '', weight: '', scr: '', gender: 'male' });
  const [anthroInputs, setAnthroInputs] = useState({ height: '', weight: '', gender: 'male', tbsaBurn: '' });
  const [tdeeInputs, setTdeeInputs] = useState({ weight: '', height: '', age: '', gender: 'male', activityLevel: '1.2', goal: 'fat_loss' });

  // State NTI
  const [ntiPhenytoin, setNtiPhenytoin] = useState({ phenytoinObs: '', albumin: '4.0', renalImpairment: 'no' });
  const [ntiVanco, setNtiVanco] = useState({ weight: '', scr: '', age: '', gender: 'male', dailyDoseMg: '2000' });
  const [ntiTheo, setNtiTheo] = useState({ currentLevel: '', currentDoseMg: '600' });
  const [ntiWarfarin, setNtiWarfarin] = useState({ currentInr: '', targetInrMin: '2.0', targetInrMax: '3.0' });
  const [ntiAmino, setNtiAmino] = useState({ drugType: 'amikacin', weight: '', height: '', gender: 'male', scr: '', age: '' });

  // Handlers
  const handlePk = (e) => setPkInputs({ ...pkInputs, [e.target.name]: e.target.value });
  const handleDrip = (e) => setDripInputs({ ...dripInputs, [e.target.name]: e.target.value });
  const handleRenal = (e) => setRenalInputs({ ...renalInputs, [e.target.name]: e.target.value });
  const handleAnthro = (e) => setAnthroInputs({ ...anthroInputs, [e.target.name]: e.target.value });
  const handleTdee = (e) => setTdeeInputs({ ...tdeeInputs, [e.target.name]: e.target.value });

  const handleResetForm = () => {
    if (activeTab === 'pk') setPkInputs({ targetConc: '', vd: '', weight: '', bioavailability: '1', clearance: '', interval: '8' });
    if (activeTab === 'drip') setDripInputs({ dose: '', weight: '', drugMg: '', volumeMl: '100' });
    if (activeTab === 'renal') setRenalInputs({ age: '', weight: '', scr: '', gender: 'male' });
    if (activeTab === 'anthro') setAnthroInputs({ height: '', weight: '', gender: 'male', tbsaBurn: '' });
    if (activeTab === 'kalori') setTdeeInputs({ weight: '', height: '', age: '', gender: 'male', activityLevel: '1.2', goal: 'fat_loss' });
    if (activeTab === 'nti') {
      setNtiPhenytoin({ phenytoinObs: '', albumin: '4.0', renalImpairment: 'no' });
      setNtiVanco({ weight: '', scr: '', age: '', gender: 'male', dailyDoseMg: '2000' });
      setNtiTheo({ currentLevel: '', currentDoseMg: '600' });
      setNtiWarfarin({ currentInr: '', targetInrMin: '2.0', targetInrMax: '3.0' });
      setNtiAmino({ drugType: 'amikacin', weight: '', height: '', gender: 'male', scr: '', age: '' });
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Hapus seluruh riwayat hitungan?')) setHistory([]);
  };

  // Menu Config dengan Tambahan Menu Label/Etiket
  const menuItems = [
    { id: 'pk', name: 'Dosis PK (Farmakokinetik)', category: 'Dosis & Obat', icon: '💊' },
    { id: 'drip', name: 'Dosis Drip / Syringe Pump', category: 'Dosis & Obat', icon: '💉' },
    { id: 'peds_geri', name: 'Pediatrik & Geriatri', category: 'Dosis & Obat', icon: '👶' },
    { id: 'label_print', name: 'Cetak Etiket & Resep Obat', category: 'Dosis & Obat', icon: '🖨️' },
    { id: 'nti', name: 'Obat Terapi Sempit (NTI / TDM)', category: 'Dosis & Obat', icon: '⚡' },
    { id: 'tdm_chart', name: 'Grafik Trend Monitoring TDM', category: 'Dosis & Obat', icon: '📊' },
    { id: 'ddi', name: 'Cek Interaksi Obat (DDI High-Risk)', category: 'Dosis & Obat', icon: '⚠️' },
    { id: 'renal', name: 'Fungsi Ginjal (ClCr & eGFR)', category: 'Organ & Fungsi', icon: '🫘' },
    { id: 'anthro', name: 'Body (BSA, BMI, Parkland)', category: 'Fisiologi & Cairan', icon: '📐' },
    { id: 'kalori', name: 'Kalori Harian & Diet Plan', category: 'Nutrisi & Energi', icon: '🔥' },
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
    peds_geri: {
      title: 'Kalkulasi Pediatrik & Beers Criteria Geriatri',
      formula: 'Dosis Anak = BB (kg) × Dosis Target (mg/kg/hari)\nBSA Mosteller = √[(TB × BB) / 3600]',
      guideline: 'Dosis anak tidak boleh melebihi batas dosis harian maksimal dewasa. Kriteria Beers digunakan untuk mencegah pemberian Potentially Inappropriate Medications (PIM) pada lansia.'
    },
    label_print: {
      title: 'Generator Label Etiket Obat Standar Kemenkes',
      formula: 'Aturan Pakai (Signa) + Penentuan Jalur Obat (Etiket Putih Oral vs Etiket Biru Topikal)',
      guideline: 'Etiket Obat berfungsi sebagai petunjuk resmi aturan pakai bagi pasien. Etiket putih digunakan khusus obat oral/ditelan, sedangkan etiket biru untuk obat pemakaian luar.'
    },
    nti: {
      title: 'Obat Indeks Terapi Sempit (TDM / NTI)',
      formula: '1. Phenytoin: C_adj = C_obs / [(0.2 × Alb) + 0.1]\n2. Warfarin: Protokol Evaluasi INR Chest Guideline\n3. Amikasin/Gentamisin: Dosis Didasarkan ABW (Jika Obesitas) + Penyesuaian ClCr',
      guideline: 'Obat NTI memiliki rentang dosis aman yang sangat sempit. Pemantauan Kadar Obat/INR wajib dilakukan untuk mencegah reaksi perdarahan, kejang, ototoksisitas, atau nefrotoksisitas fatal.'
    },
    tdm_chart: {
      title: 'Pemantauan Kurva Trend Kadar Obat Dalam Serum (TDM)',
      formula: 'Plotting Time-Series Sampling vs Rentang Terapeutik Target (Min & Max Target)',
      guideline: 'Digunakan untuk memantau akumulasi obat atau penurunan kadar obat pasien dari waktu ke waktu guna memastikan kadar obat selalu berada di dalam jendela terapeutik (Therapeutic Window).'
    },
    ddi: {
      title: 'Screening Interaksi Obat Risiko Tinggi (Drug-Drug Interaction)',
      formula: 'Database Matriks Pasangan Obat Terpilih vs Profil Interaksi Klinis (Major/Moderate)',
      guideline: 'Dilakukan untuk mendeteksi potensi efek samping fatal akibat interaksi farmakokinetik (sistem enzim CYP450/transporter) maupun farmakodinamik (efek aditif/antagonis).'
    },
    renal: {
      title: 'Estimasi Fungsi Ginjal (ClCr & eGFR)',
      formula: 'Cockcroft-Gault: ClCr = [((140 - Usia) × BB) / (72 × Scr)] × (0.85 jika ♀)\neGFR: Persamaan CKD-EPI 2021 (Tanpa koefisien ras)',
      guideline: 'Berdasarkan Guideline KDIGO. ClCr Cockcroft-Gault umum digunakan untuk adjustment dosis obat, sedangkan CKD-EPI 2021 digunakan untuk staging Penyakit Ginjal Kronis (PGK).'
    },
    anthro: {
      title: 'Antropometri & Resusitasi Parkland',
      formula: 'BSA (Mosteller) = √[(TB × BB) / 3600]\nBMI = BB / (TB_m)² | IBW (Devine) = 50 (♂) / 45.5 (♀) + 2.3 × (TB_inci - 60)\nParkland Burn = 4 mL × BB × % TBSA',
      guideline: 'BMI mengukur status gizi populasi Asia (WHO/Kemenkes). IBW digunakan sebagai penyesuaian dosis obat hidrofilik (misal: Aminoglikosida), dan Parkland Formula digunakan untuk resusitasi cairan luka bakar 24 jam pertama.'
    },
    kalori: {
      title: 'Metabolisme Energi & Perencanaan Diet',
      formula: 'BMR (Mifflin-St Jeor): ♂ 10(BB)+6.25(TB)-5(Usia)+5 | ♀ 10(BB)+6.25(TB)-5(Usia)-161\nTarget Defisit Fat Loss: TDEE - 500 kcal | Surplus Gain: TDEE + 400 kcal',
      guideline: 'Defisit kalori 500 kcal/hari terbukti aman mereduksi lemak tubuh 0.5 kg per minggu tanpa mengikis massa otot jika asupan protein tercukupi (1.6-2.0 g/kg BB).'
    }
  };

  // Calculations
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

  const drip = (() => {
    const { dose, weight, drugMg, volumeMl } = dripInputs;
    if (!dose || !weight || !drugMg || !volumeMl) return 0;
    const conc = (drugMg * 1000) / volumeMl;
    return Number(((dose * weight * 60) / conc).toFixed(1));
  })();

  const phenytoinAdj = (() => {
    const { phenytoinObs, albumin, renalImpairment } = ntiPhenytoin;
    if (!phenytoinObs || !albumin || albumin <= 0) return 0;
    const k = renalImpairment === 'yes' ? 0.1 : 0.2;
    return Number((phenytoinObs / ((k * parseFloat(albumin)) + 0.1)).toFixed(1));
  })();

  const vancoAuc = (() => {
    const { weight, scr, age, gender, dailyDoseMg } = ntiVanco;
    if (!weight || !scr || !age || scr <= 0) return 0;
    let clcrVal = ((140 - age) * weight) / (72 * scr);
    if (gender === 'female') clcrVal *= 0.85;
    const vancoClLhr = (0.042 * clcrVal) + 0.29;
    if (vancoClLhr <= 0) return 0;
    return Number(((dailyDoseMg || 2000) / vancoClLhr).toFixed(0));
  })();

  const theoDoseRec = (() => {
    const { currentLevel, currentDoseMg } = ntiTheo;
    if (!currentLevel || currentLevel <= 0 || !currentDoseMg) return 0;
    return Number(((currentDoseMg * 12.5) / currentLevel).toFixed(0));
  })();

  const warfarinRec = (() => {
    const inr = parseFloat(ntiWarfarin.currentInr);
    if (!inr || inr <= 0) return { status: 'Normal/Belum Terisi', action: 'Masukkan nilai INR pasien saat ini.' };
    if (inr < 1.5) return { status: 'Sub-Terapeutik (Risiko Bekuan Darah)', action: '🚨 Naikkan dosis mingguan sebesar 10-20%.' };
    if (inr >= 1.5 && inr < 2.0) return { status: 'Sedikit di Bawah Target', action: '⚠️ Naikkan dosis mingguan sebesar 5-10%.' };
    if (inr >= 2.0 && inr <= 3.0) return { status: 'TERAPEUTIK (AMAN)', action: '✅ Dosis sudah pas! Pertahankan dosis mingguan saat ini.' };
    if (inr > 3.0 && inr <= 4.5) return { status: 'Sedikit di Atas Target', action: '⚠️ Tunda 1 dosis, kurangi dosis mingguan 5-10%.' };
    if (inr > 4.5 && inr <= 10.0) return { status: 'SANGAT TINGGI (RISIKO PERDARAHAN)', action: '🚨 Tunda 1-2 dosis, kurangi dosis mingguan 10-20%.' };
    if (inr > 10.0) return { status: 'TOKSIK / EMERGENCY', action: '🚨 HENTIKAN WARFARIN! Berikan Vitamin K1 5-10 mg IV lambat.' };
    return { status: 'Evaluasi', action: 'Periksa kembali nilai input.' };
  })();

  const aminoDose = (() => {
    const { drugType, weight, height, gender, scr, age } = ntiAmino;
    if (!weight || !height || !scr || !age || scr <= 0) return { ibw: 0, doseMg: 0, dosingWeight: 'TBW', interval: '24 jam' };
    const hInches = height / 2.54;
    const ibwVal = hInches > 60 ? (gender === 'female' ? 45.5 : 50) + 2.3 * (hInches - 60) : (gender === 'female' ? 45.5 : 50);
    let finalDosingWeight = weight > 1.2 * ibwVal ? ibwVal + 0.4 * (weight - ibwVal) : weight;
    let weightLabel = weight > 1.2 * ibwVal ? 'Adjusted Body Weight (ABW)' : 'Actual Body Weight (TBW)';
    const mgPerKg = drugType === 'amikacin' ? 15 : 5;
    let clcrVal = ((140 - age) * weight) / (72 * scr);
    if (gender === 'female') clcrVal *= 0.85;
    let intervalText = clcrVal < 20 ? '48 Jam / TDM Trough' : clcrVal < 40 ? '36 - 48 Jam' : clcrVal < 60 ? '24 - 36 Jam' : '24 Jam';
    return { ibw: Number(ibwVal.toFixed(1)), dosingWeightMg: Number(finalDosingWeight.toFixed(1)), weightLabel, doseMg: Number((finalDosingWeight * mgPerKg).toFixed(0)), interval: intervalText };
  })();

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

  const bsa = (() => {
    const { height, weight } = anthroInputs;
    if (!height || !weight) return 0;
    return Number(Math.sqrt((height * weight) / 3600).toFixed(2));
  })();

  const { bmi, ibw, bmiCategory } = (() => {
    const { height, weight, gender } = anthroInputs;
    if (!height || !weight) return { bmi: 0, ibw: 0, bmiCategory: '-' };
    const hM = height / 100;
    const bmiVal = weight / (hM * hM);
    const hInches = height / 2.54;
    const ibwVal = hInches > 60 ? (gender === 'female' ? 45.5 : 50) + 2.3 * (hInches - 60) : (gender === 'female' ? 45.5 : 50);

    let cat = '';
    if (bmiVal < 18.5) cat = 'Underweight (Berat Badan Kurang)';
    else if (bmiVal >= 18.5 && bmiVal <= 22.9) cat = 'Normal / Ideal';
    else if (bmiVal >= 23.0 && bmiVal <= 24.9) cat = 'Overweight (Kelebihan BB)';
    else if (bmiVal >= 25.0 && bmiVal <= 29.9) cat = 'Obesitas Tingkat I';
    else if (bmiVal >= 30.0) cat = 'Obesitas Tingkat II (Sangat Tinggi)';

    return { bmi: Number(bmiVal.toFixed(1)), ibw: Number(ibwVal.toFixed(1)), bmiCategory: cat };
  })();

  const parkland = (() => {
    const { weight, tbsaBurn } = anthroInputs;
    if (!weight || !tbsaBurn) return { totalMl: 0, first8: 0, next16: 0 };
    const totalMl = 4 * weight * tbsaBurn;
    return { totalMl: Number(totalMl.toFixed(0)), first8: Number((totalMl / 2).toFixed(0)), next16: Number((totalMl / 2).toFixed(0)) };
  })();

  // Diet Plan
  const dietPlan = (() => {
    const { weight, height, age, gender, activityLevel, goal } = tdeeInputs;
    if (!weight || !height || !age) return { bmr: 0, tdee: 0, targetCal: 0, protein: 0, carbs: 0, fat: 0, advice: '' };
    
    let bmrVal = (10 * weight) + (6.25 * height) - (5 * age) + (gender === 'female' ? -161 : 5);
    let tdeeVal = bmrVal * (parseFloat(activityLevel) || 1.2);
    let targetCal = tdeeVal;
    let advice = '';

    if (goal === 'fat_loss') {
      targetCal = tdeeVal - 500;
      advice = '🔥 Target Defisit Kalori (Turun ~0.5 kg/minggu). Utamakan makanan tinggi protein & serat biar kenyang lebih lama.';
    } else if (goal === 'gain') {
      targetCal = tdeeVal + 400;
      advice = '📈 Target Surplus Kalori (Naik Berat / Otot). Imbangi dengan latihan beban agar yang naik massa otot, bukan lemak!';
    } else {
      targetCal = tdeeVal;
      advice = '⚖️ Target Maintenance (Menjaga Berat Badan Saat Ini).';
    }

    const proteinGrams = (targetCal * 0.30) / 4;
    const carbsGrams = (targetCal * 0.40) / 4;
    const fatGrams = (targetCal * 0.30) / 9;

    return {
      bmr: Number(bmrVal.toFixed(0)),
      tdee: Number(tdeeVal.toFixed(0)),
      targetCal: Number(targetCal.toFixed(0)),
      protein: Number(proteinGrams.toFixed(0)),
      carbs: Number(carbsGrams.toFixed(0)),
      fat: Number(fatGrams.toFixed(0)),
      advice
    };
  })();

  // Evaluasi Teks Alert untuk PDF
  const getPdfAlertMessage = () => {
    if (activeTab === 'drip' && drip > 50) {
      return { isAlert: true, text: `⚠️ WARNING: Kecepatan Drip Tinggi (${drip} mL/jam). Pertimbangkan peningkatan konsentrasi atau pergunakan Vena Sentral (CVC)!` };
    }
    if (activeTab === 'peds_geri') {
      return { isAlert: true, text: '👶/👵 EVALUASI PEDIATRIK/GERIATRI: Pastikan dosis penyesuaian tidak melebihi batas aman maksimal dewasa atau kriteria Beers.' };
    }
    if (activeTab === 'label_print') {
      return { isAlert: true, text: '🖨️ ETIKET OBAT: Pastikan informasi aturan pakai (signa) dan jenis etiket (putih/biru) sudah sesuai dengan resep dokter.' };
    }
    if (activeTab === 'renal' && egfr > 0 && egfr < 30) {
      return { isAlert: true, text: '🚨 ALERT: eGFR < 30 mL/min (CKD Stage 4-5 Severe). Wajib lakukan penyesuaian/penurunan dosis obat ginjal!' };
    }
    if (activeTab === 'renal' && egfr >= 30 && egfr < 60) {
      return { isAlert: true, text: '⚠️ WARNING: eGFR 30 - 59 mL/min (CKD Stage 3 Moderate). Lakukan evaluasi klirens ginjal pasien.' };
    }
    if (activeTab === 'nti') {
      if (ntiSubTab === 'phenytoin' && phenytoinAdj > 0 && phenytoinAdj < 10) return { isAlert: true, text: '⚠️ WARNING: Kadar Phenytoin Sub-terapeutuik (<10 mcg/mL). Risiko kejang berulang.' };
      if (ntiSubTab === 'phenytoin' && phenytoinAdj > 20) return { isAlert: true, text: '🚨 ALERT: Kadar Phenytoin TOKSIK (>20 mcg/mL). Risiko nistagmus, ataksia & penurunan kesadaran!' };
      if (ntiSubTab === 'vanco' && vancoAuc > 0 && vancoAuc < 400) return { isAlert: true, text: '⚠️ WARNING: AUC24/MIC < 400 mg·hr/L. Sub-terapeutuik untuk infeksi MRSA.' };
      if (ntiSubTab === 'vanco' && vancoAuc > 600) return { isAlert: true, text: '🚨 ALERT: AUC24/MIC > 600 mg·hr/L. Risiko Gagal Ginjal Akut (AKI) meningkat signifikan!' };
      if (ntiSubTab === 'warfarin' && parseFloat(ntiWarfarin.currentInr) > 4.5) return { isAlert: true, text: `🚨 ALERT WARFARIN: ${warfarinRec.status} -> ${warfarinRec.action}` };
    }
    if (activeTab === 'tdm_chart') {
      return { isAlert: true, text: '📊 INFORMASI: Lakukan evaluasi kurva trend kadar obat pasien secara berkala untuk menjaga efikasi terapi.' };
    }
    if (activeTab === 'ddi') {
      return { isAlert: true, text: '⚠️ PERHATIAN: Lakukan penyesuaian/monitoring dosis apabila terdeteksi interaksi obat berisiko Major/Moderate.' };
    }
    return { isAlert: false, text: '' };
  };

  const pdfAlert = getPdfAlertMessage();

  // History Helper
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
    setHistory((prev) => [newEntry, ...prev.slice(0, 9)]);
  };

  const handleCopySummary = () => {
    let summaryText = `[Clinical Suite Report]\nPasien: ${patientName || '-'} (RM: ${patientId || '-'})\n`;
    let calcType = activeTab.toUpperCase();

    if (activeTab === 'pk') summaryText += `Evaluasi: Dosis PK\n- Loading Dose: ${ld} mg\n- Maintenance Dose: ${md} mg / ${pkInputs.interval || 0}j`;
    if (activeTab === 'drip') summaryText += `Evaluasi: Dosis Drip Syringe Pump\n- Kecepatan Infus: ${drip} mL/jam`;
    if (activeTab === 'peds_geri') summaryText += `Evaluasi: Dosis Pediatrik / Screening Beers Criteria Geriatri Selesai.`;
    if (activeTab === 'label_print') summaryText += `Evaluasi: Pembuatan Etiket & Label Obat Selesai.`;
    if (activeTab === 'nti') summaryText += `Evaluasi NTI (${ntiSubTab}): Dosis disesuaikan parameter klinis.`;
    if (activeTab === 'tdm_chart') summaryText += `Evaluasi: Pemantauan Grafik Kurva Trend TDM Obat Selesai Di-generate.`;
    if (activeTab === 'ddi') summaryText += `Evaluasi: Interaksi Obat Risiko Tinggi (DDI) Selesai di-screening.`;
    if (activeTab === 'renal') summaryText += `Evaluasi: Fungsi Ginjal\n- ClCr: ${clcr} mL/min\n- eGFR: ${egfr} mL/min/1.73m²`;
    if (activeTab === 'anthro') summaryText += `Evaluasi: Antropometri\n- BSA: ${bsa} m² | BMI: ${bmi} kg/m² (${bmiCategory}) | IBW: ${ibw} kg`;
    if (activeTab === 'kalori') summaryText += `Evaluasi: Diet Kalori (${tdeeInputs.goal.toUpperCase()})\n- TDEE: ${dietPlan.tdee} kcal\n- Target Harian: ${dietPlan.targetCal} kcal/hari\n- Macro: Protein ${dietPlan.protein}g | Carbs ${dietPlan.carbs}g | Fat ${dietPlan.fat}g`;

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
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl">🩺</span>
          <span className="font-bold text-lg text-blue-400">Clinical Suite</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-800 rounded-lg text-slate-300">
          {isSidebarOpen ? '✖' : '☰'}
        </button>
      </div>

      {/* SIDEBAR COMPONENT */}
      <Sidebar
        menuItems={menuItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* MAIN AREA */}
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        {/* COMPONENT PENGATURAN KOP SURAT RS */}
        <HospitalHeader
          hospitalInfo={hospitalInfo}
          setHospitalInfo={setHospitalInfo}
        />

        {/* COMPONENT INPUT PASIEN */}
        <PatientHeader
          patientName={patientName}
          setPatientName={setPatientName}
          patientId={patientId}
          setPatientId={setPatientId}
        />

        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl mb-8">
          <div className="mb-6 border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{menuItems.find((m) => m.id === activeTab)?.icon}</span>
                {menuItems.find((m) => m.id === activeTab)?.name}
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Kategori: {menuItems.find((m) => m.id === activeTab)?.category}
              </p>
            </div>

            {/* TOMBOL RESET & INFO RUMUS */}
            <div className="flex items-center gap-2">
              <button onClick={handleResetForm} className="bg-slate-800 text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all">
                {t.resetBtn}
              </button>
              <button onClick={() => setShowInfo(true)} className="bg-slate-800 text-blue-400 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all">
                {t.infoBtn}
              </button>
            </div>
          </div>

          {/* CALCULATORS SWITCH */}
          {activeTab === 'pk' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-xs text-slate-300 mb-1">Target Conc (mg/L)</label><input type="number" name="targetConc" value={pkInputs.targetConc} onChange={handlePk} placeholder="e.g. 15" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs" /></div>
                <div><label className="block text-xs text-slate-300 mb-1">Vd (L/kg)</label><input type="number" name="vd" value={pkInputs.vd} onChange={handlePk} placeholder="e.g. 0.7" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs" /></div>
                <div><label className="block text-xs text-slate-300 mb-1">BB Pasien (kg)</label><input type="number" name="weight" value={pkInputs.weight} onChange={handlePk} placeholder="e.g. 60" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs" /></div>
                <div><label className="block text-xs text-slate-300 mb-1">Clearance (L/jam)</label><input type="number" name="clearance" value={pkInputs.clearance} onChange={handlePk} placeholder="e.g. 3.0" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs" /></div>
                <div><label className="block text-xs text-slate-300 mb-1">Interval (Jam)</label><input type="number" name="interval" value={pkInputs.interval} onChange={handlePk} placeholder="e.g. 8" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs" /></div>
              </div>

              <div className="bg-blue-950/40 border border-blue-800/50 p-4 rounded-xl flex justify-between mb-4">
                <div><span className="text-xs text-blue-400 font-bold block">Loading Dose (LD)</span><span className="text-2xl font-bold text-white">{ld} mg</span></div>
                <div><span className="text-xs text-blue-400 font-bold block">Maintenance Dose (MD)</span><span className="text-2xl font-bold text-white">{md} mg/{pkInputs.interval || 0}j</span></div>
              </div>

              {/* KETERANGAN KLINIS PK */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                <p className="text-slate-300 font-bold">💡 Catatan Klinis Farmakokinetik:</p>
                <p className="text-slate-400 leading-relaxed">
                  • <strong>Loading Dose:</strong> Diberikan 1 kali di awal untuk segera mencapai kadar obat terapeutik plasma tanpa menunggu <i>Steady State</i>.<br />
                  • <strong>Maintenance Dose:</strong> Diberikan secara berkala untuk menggantikan jumlah obat yang dieliminasi oleh tubuh (Clearance).<br />
                  • Keseimbangan kadar konstan (Steady State) umumnya tercapai setelah <strong>4 hingga 5 kali waktu paruh ($t_{1/2}$)</strong> obat.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'drip' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-xs text-slate-300 mb-1">Dosis Target (mcg/kg/min)</label><input type="number" name="dose" value={dripInputs.dose} onChange={handleDrip} placeholder="e.g. 5" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs" /></div>
                <div><label className="block text-xs text-slate-300 mb-1">BB Pasien (kg)</label><input type="number" name="weight" value={dripInputs.weight} onChange={handleDrip} placeholder="e.g. 60" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs" /></div>
                <div><label className="block text-xs text-slate-300 mb-1">Jumlah Obat Dalam Vial/Ampul (mg)</label><input type="number" name="drugMg" value={dripInputs.drugMg} onChange={handleDrip} placeholder="e.g. 250" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs" /></div>
                <div><label className="block text-xs text-slate-300 mb-1">Volume Pelarut Syringe Pump (mL)</label><input type="number" name="volumeMl" value={dripInputs.volumeMl} onChange={handleDrip} placeholder="e.g. 50" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs" /></div>
              </div>

              <div className="bg-blue-950/40 border border-blue-800/50 p-4 rounded-xl text-center mb-4">
                <span className="text-xs text-blue-400 font-bold block">Kecepatan Syringe Pump / Infusiometer</span>
                <span className="text-3xl font-extrabold text-white">{drip} mL/jam</span>
              </div>

              {/* KETERANGAN & WARNING DRIP */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                <p className="text-slate-300 font-bold">💡 Keterangan & Safety Check Infus Continuous:</p>
                <p className="text-slate-400 leading-relaxed">
                  • Rumus dikalibrasi untuk obat inotropik/vasopresor (Dobutamin, Dopamin, Norepinefrin).<br />
                  • Pastikan label konsentrasi spuit terpasang jelas pada alat syringe pump.
                </p>
                {drip > 50 && (
                  <div className="bg-amber-950/60 border border-amber-500/50 p-3 rounded-lg text-amber-300 font-medium">
                    ⚠️ <strong>WARNING:</strong> Kecepatan Drip Tinggi ({drip} mL/jam). Pertimbangkan peningkatan konsentrasi obat atau gunakan akses Vena Sentral (CVC)!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PEDIATRIK & GERIATRI */}
          {activeTab === 'peds_geri' && <PedsGeriCalculator />}

          {/* TAB BARU: CETAK ETIKET & RESEP */}
          {activeTab === 'label_print' && <PrescriptionEtiquetteCalculator />}

          {activeTab === 'nti' && (
            <NtiCalculator
              ntiSubTab={ntiSubTab}
              setNtiSubTab={setNtiSubTab}
              ntiPhenytoin={ntiPhenytoin}
              setNtiPhenytoin={setNtiPhenytoin}
              phenytoinAdj={phenytoinAdj}
              ntiVanco={ntiVanco}
              setNtiVanco={setNtiVanco}
              vancoAuc={vancoAuc}
              ntiTheo={ntiTheo}
              setNtiTheo={setNtiTheo}
              theoDoseRec={theoDoseRec}
              ntiWarfarin={ntiWarfarin}
              setNtiWarfarin={setNtiWarfarin}
              warfarinRec={warfarinRec}
              ntiAmino={ntiAmino}
              setNtiAmino={setNtiAmino}
              aminoDose={aminoDose}
            />
          )}

          {/* TAB: TDM TREND CHART */}
          {activeTab === 'tdm_chart' && <TdmChartCalculator />}

          {/* TAB: CEK INTERAKSI OBAT (DDI) */}
          {activeTab === 'ddi' && <DdiCalculator />}

          {activeTab === 'renal' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-xs text-slate-300 mb-1">Usia (Tahun)</label><input type="number" name="age" value={renalInputs.age} onChange={handleRenal} placeholder="e.g. 55" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs" /></div>
                <div><label className="block text-xs text-slate-300 mb-1">BB Pasien (kg)</label><input type="number" name="weight" value={renalInputs.weight} onChange={handleRenal} placeholder="e.g. 65" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs" /></div>
                <div><label className="block text-xs text-slate-300 mb-1">Serum Creatinine (mg/dL)</label><input type="number" name="scr" value={renalInputs.scr} onChange={handleRenal} placeholder="e.g. 1.2" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs" /></div>
                <div><label className="block text-xs text-slate-300 mb-1">Jenis Kelamin</label><select name="gender" value={renalInputs.gender} onChange={handleRenal} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></div>
              </div>

              <div className="bg-blue-950/40 border border-blue-800/50 p-4 rounded-xl flex justify-between mb-4">
                <div><span className="text-xs text-blue-400 font-bold block">Cockcroft-Gault (ClCr)</span><span className="text-2xl font-bold text-white">{clcr} mL/min</span></div>
                <div><span className="text-xs text-blue-400 font-bold block">CKD-EPI (eGFR)</span><span className="text-2xl font-bold text-white">{egfr} mL/min/1.73m²</span></div>
              </div>

              {/* ALERT FUNGSI GINJAL */}
              {egfr > 0 && egfr < 30 && (
                <div className="bg-red-950/80 border border-red-500/60 p-4 rounded-xl text-xs text-red-300 mb-2">
                  🚨 <strong>ALERT: eGFR &lt; 30 mL/min (CKD Stage 4-5 / Severe):</strong> Risiko tinggi toksisitas obat ginjal! Kurangi dosis Meropenem/Aminoglikosida/Metformin.
                </div>
              )}
              {egfr >= 30 && egfr < 60 && (
                <div className="bg-amber-950/60 border border-amber-500/50 p-4 rounded-xl text-xs text-amber-300 mb-2">
                  ⚠️ <strong>WARNING: eGFR 30 - 59 mL/min (CKD Stage 3):</strong> Gangguan ginjal moderat. Lakukan penyesuaian dosis beberapa obat.
                </div>
              )}

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-1">
                <p className="text-slate-300 font-bold">💡 Keterangan Klinis KDIGO:</p>
                <p className="text-slate-400">
                  • <strong>ClCr Cockcroft-Gault:</strong> Digunakan khusus sebagai acuan penyesuaian dosis obat dalam leaflet/FDA.<br />
                  • <strong>CKD-EPI 2021:</strong> Digunakan untuk penentuan derajat/staging Penyakit Ginjal Kronis (PGK).
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: BODY (BSA, BMI, IBW, PARKLAND) */}
          {activeTab === 'anthro' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-xs text-slate-300 mb-1">Tinggi Badan (cm)</label><input type="number" name="height" value={anthroInputs.height} onChange={handleAnthro} placeholder="e.g. 165" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs" /></div>
                <div><label className="block text-xs text-slate-300 mb-1">BB Pasien (kg)</label><input type="number" name="weight" value={anthroInputs.weight} onChange={handleAnthro} placeholder="e.g. 60" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs" /></div>
                <div><label className="block text-xs text-slate-300 mb-1">Jenis Kelamin</label><select name="gender" value={anthroInputs.gender} onChange={handleAnthro} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></div>
                <div><label className="block text-xs text-slate-300 mb-1">Luas Luka Bakar / TBSA (%)</label><input type="number" name="tbsaBurn" value={anthroInputs.tbsaBurn} onChange={handleAnthro} placeholder="Opsional, e.g. 25" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs" /></div>
              </div>

              {/* CARD RINGKASAN HASIL */}
              <div className="grid grid-cols-3 gap-2 bg-blue-950/40 border border-blue-800/50 p-4 rounded-2xl text-center mb-4">
                <div><span className="text-xs text-blue-400 font-bold block mb-1">BSA (Luas Permukaan)</span><span className="text-xl font-bold text-white">{bsa} <span className="text-xs font-normal text-slate-400">m²</span></span></div>
                <div><span className="text-xs text-blue-400 font-bold block mb-1">BMI (Indeks Massa)</span><span className="text-xl font-bold text-white">{bmi} <span className="text-xs font-normal text-slate-400">kg/m²</span></span></div>
                <div><span className="text-xs text-blue-400 font-bold block mb-1">IBW (BB Ideal)</span><span className="text-xl font-bold text-white">{ibw} <span className="text-xs font-normal text-slate-400">kg</span></span></div>
              </div>

              {/* REKOMENDASI & INTERPRETASI KLINIS BODY */}
              {bmi > 0 && (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2 mb-4">
                  <p className="text-slate-300 font-bold">💡 Interpretasi Antropometri Pasien:</p>
                  <p className="text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    • <strong>Kategori BMI (Asia Pasifik):</strong> <span className="text-emerald-400 font-bold">{bmiCategory}</span><br />
                    • <strong>BSA (Body Surface Area):</strong> Digunakan sebagai dasar perhitungan dosis Kemoterapi Sitostatika & Cairan Hemodialisis.<br />
                    • <strong>IBW (Ideal Body Weight):</strong> Digunakan untuk penyesuaian dosis obat hidrofilik (misal: Aminoglikosida, Vancomycin) pada pasien obesitas.
                  </p>
                </div>
              )}

              {/* CAIRAN PARKLAND */}
              {anthroInputs.tbsaBurn > 0 && (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl mb-4 space-y-2">
                  <span className="text-xs font-bold text-amber-400 block">🔥 Resusitasi Cairan Parkland (24 Jam Pertama):</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800"><p className="text-slate-400 text-[10px]">Total Cairan RL</p><p className="text-lg font-bold text-white">{parkland.totalMl} mL</p></div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800"><p className="text-slate-400 text-[10px]">⏱️ 8 Jam Pertama</p><p className="text-lg font-bold text-amber-300">{parkland.first8} mL</p></div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800"><p className="text-slate-400 text-[10px]">⏱️ 16 Jam Sisa</p><p className="text-lg font-bold text-amber-300">{parkland.next16} mL</p></div>
                  </div>
                  <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    💡 <strong>Protokol Resusitasi:</strong> Berikan 50% cairan ({parkland.first8} mL) dalam 8 jam pertama terhitung saat terjadinya trauma luka bakar, dan sisanya 50% ({parkland.next16} mL) diberikan bertahap dalam 16 jam berikutnya.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: KALORI HARIAN & DIET PLAN */}
          {activeTab === 'kalori' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-xs text-slate-300 mb-1">Usia (Tahun)</label><input type="number" name="age" value={tdeeInputs.age} onChange={handleTdee} placeholder="e.g. 24" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs" /></div>
                <div><label className="block text-xs text-slate-300 mb-1">TB (cm)</label><input type="number" name="height" value={tdeeInputs.height} onChange={handleTdee} placeholder="e.g. 170" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs" /></div>
                <div><label className="block text-xs text-slate-300 mb-1">BB Pasien (kg)</label><input type="number" name="weight" value={tdeeInputs.weight} onChange={handleTdee} placeholder="e.g. 70" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs" /></div>
                <div><label className="block text-xs text-slate-300 mb-1">Jenis Kelamin</label><select name="gender" value={tdeeInputs.gender} onChange={handleTdee} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Tingkat Aktivitas Harian</label>
                  <select name="activityLevel" value={tdeeInputs.activityLevel} onChange={handleTdee} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs">
                    <option value="1.2">Sedentary (Jarang Olahraga / Kerja Duduk)</option>
                    <option value="1.375">Light Activity (Olahraga Ringan 1-3x/minggu)</option>
                    <option value="1.55">Moderate Activity (Olahraga Sedang 3-5x/minggu)</option>
                    <option value="1.725">Very Active (Olahraga Berat 6-7x/minggu)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">🎯 Target Goal Pasien / User</label>
                  <select name="goal" value={tdeeInputs.goal} onChange={handleTdee} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs">
                    <option value="fat_loss">📉 Fat Loss / Diet Defisit (Turun Berat Badan)</option>
                    <option value="maintain">⚖️ Maintenance (Menjaga Berat Badan Saat Ini)</option>
                    <option value="gain">📈 Muscle Gain / Surplus (Menaikkan Berat Badan)</option>
                  </select>
                </div>
              </div>

              {/* SUMMARY HASIL KALORI & MACRO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-blue-950/40 border border-blue-800/50 p-4 rounded-2xl text-center mb-4">
                <div><span className="text-[10px] font-bold text-blue-400 block mb-1">BMR (Metabolisme Basal)</span><span className="text-xl font-extrabold text-white">{dietPlan.bmr} <span className="text-xs font-normal text-slate-400">kcal</span></span></div>
                <div><span className="text-[10px] font-bold text-blue-400 block mb-1">TDEE (Kebutuhan Harian)</span><span className="text-xl font-extrabold text-white">{dietPlan.tdee} <span className="text-xs font-normal text-slate-400">kcal</span></span></div>
                <div className="bg-emerald-950/60 border border-emerald-500/40 p-2 rounded-xl"><span className="text-[10px] font-bold text-emerald-400 block mb-1">TARGET ASUPAN HARIAN</span><span className="text-2xl font-extrabold text-emerald-300">{dietPlan.targetCal} <span className="text-xs font-normal text-slate-300">kcal</span></span></div>
              </div>

              {/* REKOMENDASI MAKRONUTRISI HARIAN */}
              {dietPlan.targetCal > 0 && (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 text-xs">
                  <span className="font-bold text-blue-400 block">📊 Target Makronutrisi Harian:</span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800"><p className="text-slate-400 text-[10px]">🍗 Protein (30%)</p><p className="text-lg font-bold text-amber-400">{dietPlan.protein} g</p></div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800"><p className="text-slate-400 text-[10px]">🍚 Karbohidrat (40%)</p><p className="text-lg font-bold text-blue-400">{dietPlan.carbs} g</p></div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800"><p className="text-slate-400 text-[10px]">🥑 Lemak Sehat (30%)</p><p className="text-lg font-bold text-emerald-400">{dietPlan.fat} g</p></div>
                  </div>
                  <p className="text-[11px] text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                    💡 <strong>Panduan Klinis:</strong> {dietPlan.advice}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ACTION BUTTONS (COPY & PDF) */}
          <div className="mt-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              onClick={handleCopySummary}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-5 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-xs"
            >
              {copySuccess ? t.copiedBtn : t.copySaveBtn}
            </button>

            <button
              onClick={handleDownloadPDF}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 text-xs"
            >
              {t.downloadPdfBtn}
            </button>
          </div>
        </div>

        {/* COMPONENT HISTORY LOG */}
        <HistoryLog
          history={history}
          handleClearHistory={handleClearHistory}
          setHistory={setHistory}
        />
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

      {/* TEMPLATE PDF LENGKAP DENGAN KOP SURAT DINAMIS */}
      <div id="pdf-template" style={{ display: 'none' }} className="p-8 bg-white text-black font-sans text-xs">
        
        {/* KOP SURAT RUMAH SAKIT DINAMIS */}
        <div style={{ borderBottom: '3px double #000', paddingBottom: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
            
            {/* LOGO RS (JIKA ADA) */}
            {hospitalInfo.logoUrl ? (
              <img
                src={hospitalInfo.logoUrl}
                alt="Logo RS"
                style={{ maxHeight: '60px', maxWidth: '90px', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ fontSize: '28px' }}>🩺</div>
            )}

            {/* HEADER NAMA RS & ALAMAT */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', color: '#0f172a' }}>
                {hospitalInfo.name || 'CLINICAL SUITE MEDICAL CENTER'}
              </h1>
              <p style={{ margin: '3px 0 0 0', color: '#334155', fontSize: '10px' }}>
                {hospitalInfo.address || 'Sistem Pelayanan Evaluasi Farmasi & Dosis Klinis Pasien'}
              </p>
            </div>

            <div style={{ textAlign: 'right', fontSize: '9px', color: '#475569', minWidth: '100px' }}>
              <p style={{ margin: 0 }}>Tanggal: <strong>{new Date().toLocaleDateString('id-ID')}</strong></p>
              <p style={{ margin: 0 }}>Dokumen Resmi</p>
            </div>
          </div>
        </div>

        {/* IDENTITAS PASIEN */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px', color: '#0f172a' }}>1. {t.patientIdent}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 8px', width: '15%', fontWeight: 'bold', background: '#f1f5f9' }}>{t.patientName}</td>
                <td style={{ padding: '4px 8px', width: '35%', borderBottom: '1px solid #e2e8f0' }}>{patientName || '-'}</td>
                <td style={{ padding: '4px 8px', width: '15%', fontWeight: 'bold', background: '#f1f5f9' }}>{t.medicalRecordNo}</td>
                <td style={{ padding: '4px 8px', width: '35%', borderBottom: '1px solid #e2e8f0' }}>{patientId || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* HASIL EVALUASI */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px', color: '#0f172a' }}>
            2. {t.evalTitle} ({activeTab === 'pk' ? 'FARMAKOKINETIK DOSIS' : activeTab === 'drip' ? 'DOSIS DRIP / SYRINGE PUMP' : activeTab === 'peds_geri' ? 'DOSIS PEDIATRIK & BEERS CRITERIA GERIATRI' : activeTab === 'label_print' ? 'ETIKET & RESEP OBAT' : activeTab === 'nti' ? `KOREKSI OBAT NTI (${ntiSubTab.toUpperCase()})` : activeTab === 'tdm_chart' ? 'GRAFIK MONITORING TDM' : activeTab === 'ddi' ? 'INTERAKSI OBAT (DDI SCREENING)' : activeTab === 'renal' ? 'EVALUASI FUNGSI GINJAL' : activeTab === 'anthro' ? 'ANTROPOMETRI & RESUSITASI' : 'KEBUTUHAN KALORI & DIET'})
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
            <thead>
              <tr style={{ background: '#1e293b', color: '#fff', textAlign: 'left' }}>
                <th style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{t.paramKlinis}</th>
                <th style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{t.nilaiHasil}</th>
                <th style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{t.satuanCatatan}</th>
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
                  <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>KECEPATAN SYRINGE PUMP</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '14px', color: '#1e40af' }}>{drip}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>mL/jam</td></tr>
                </>
              )}

              {activeTab === 'peds_geri' && (
                <>
                  <tr style={{ background: '#f8fafc' }}>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>MODUL PEDIATRIK & GERIATRI</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }} colSpan="2">Evaluasi Dosis Anak / Kriteria Beers Lansia Selesai</td>
                  </tr>
                </>
              )}

              {activeTab === 'label_print' && (
                <>
                  <tr style={{ background: '#f8fafc' }}>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>MODUL CETAK ETIKET OBAT</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }} colSpan="2">Label Etiket Obat Berhasil Di-generate & Siap Cetak</td>
                  </tr>
                </>
              )}

              {activeTab === 'nti' && (
                <>
                  {ntiSubTab === 'phenytoin' && (
                    <>
                      <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Observed Phenytoin / Albumin</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{ntiPhenytoin.phenytoinObs || '-'} mcg/mL / {ntiPhenytoin.albumin || '-'} g/dL</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Serum Pasien</td></tr>
                      <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>ADJUSTED PHENYTOIN (WINTER-TOZER)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '14px', color: '#1e40af' }}>{phenytoinAdj}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>mcg/mL (Target: 10-20)</td></tr>
                    </>
                  )}
                  {ntiSubTab === 'vanco' && (
                    <>
                      <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Dosis Harian & Scr Pasien</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{ntiVanco.dailyDoseMg || '-'} mg/24j / Scr: {ntiVanco.scr || '-'} mg/dL</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Vancomycin IV</td></tr>
                      <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>ESTIMATED AUC24 / MIC RATIO</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '14px', color: '#1e40af' }}>{vancoAuc}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>mg·hr/L (Target: 400-600)</td></tr>
                    </>
                  )}
                  {ntiSubTab === 'theo' && (
                    <>
                      <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Kadar Observed / Dosis Lama</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{ntiTheo.currentLevel || '-'} mcg/mL / {ntiTheo.currentDoseMg || '-'} mg/hari</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Teofilin Serum</td></tr>
                      <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>RECOMMENDED NEW DOSE</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '14px', color: '#1e40af' }}>{theoDoseRec}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>mg/hari (Target: 10-15)</td></tr>
                    </>
                  )}
                  {ntiSubTab === 'warfarin' && (
                    <>
                      <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Nilai INR Pasien Terukur</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{ntiWarfarin.currentInr || '-'}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Status: {warfarinRec.status}</td></tr>
                      <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>TINDAKAN KLINIS (CHEST GUIDELINE)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }} colSpan="2">{warfarinRec.action}</td></tr>
                    </>
                  )}
                  {ntiSubTab === 'amino' && (
                    <>
                      <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Jenis Aminoglikosida & Berat Pengujung</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{ntiAmino.drugType.toUpperCase()} / {aminoDose.weightLabel} ({aminoDose.dosingWeightMg} kg)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Serum Pasien</td></tr>
                      <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>RECOMMENDED EXTENDED DOSE</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '14px', color: '#1e40af' }}>{aminoDose.doseMg} mg / {aminoDose.interval}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>IV Infus</td></tr>
                    </>
                  )}
                </>
              )}

              {activeTab === 'tdm_chart' && (
                <>
                  <tr style={{ background: '#f8fafc' }}>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>MODUL TDM TREND MONITORING</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }} colSpan="2">Plotting Line Chart Time-Series Selesai</td>
                  </tr>
                </>
              )}

              {activeTab === 'ddi' && (
                <>
                  <tr style={{ background: '#f8fafc' }}>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>MODUL SCREENING INTERAKSI OBAT</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }} colSpan="2">Evaluasi Matriks DDI High-Risk Aktif</td>
                  </tr>
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
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>BMI / Kategori / IBW</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{bmi} kg/m² ({bmiCategory}) / IBW: {ibw} kg</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Status Gizi Pasien</td></tr>
                  {anthroInputs.tbsaBurn > 0 && (
                    <tr style={{ background: '#fff7ed' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#c2410c' }}>Resusitasi Parkland (RL)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#c2410c' }}>Total: {parkland.totalMl} mL</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>8j I: {parkland.first8} mL | 16j Sisa: {parkland.next16} mL</td></tr>
                  )}
                </>
              )}

              {activeTab === 'kalori' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>BMR / TDEE Harian</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>{dietPlan.bmr} / {dietPlan.tdee}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>kcal/hari</td></tr>
                  <tr style={{ background: '#f0fdf4' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#15803d' }}>TARGET ASUPAN ({tdeeInputs.goal.toUpperCase()})</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '14px', color: '#15803d' }}>{dietPlan.targetCal}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#15803d' }}>kcal/hari</td></tr>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Makronutrisi (P / C / F)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{dietPlan.protein}g / {dietPlan.carbs}g / {dietPlan.fat}g</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Protein / Karbo / Lemak</td></tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* SECTION ALERT & PERINGATAN KLINIS KHUSUS PDF */}
        {pdfAlert.isAlert && (
          <div style={{ marginBottom: '20px', padding: '10px 12px', background: '#fef2f2', border: '1.5px solid #ef4444', borderRadius: '6px', color: '#991b1b', fontSize: '10px' }}>
            <strong style={{ display: 'block', marginBottom: '2px', fontSize: '11px' }}>{t.safetyAlertHeader}</strong>
            <span>{pdfAlert.text}</span>
          </div>
        )}

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ width: '55%', fontSize: '9px', color: '#64748b', fontStyle: 'italic', border: '1px border #e2e8f0', padding: '6px' }}>
            {t.pdfNote}
          </div>
          <div style={{ textTransform: 'uppercase', textAlign: 'center', width: '35%' }}>
            <p style={{ margin: 0, fontSize: '10px' }}>{t.pharmacistSign}</p>
            <div style={{ height: '45px' }}></div>
            <p style={{ margin: 0, borderTop: '1px solid #000', fontWeight: 'bold', paddingTop: '2px' }}>( ________________________ )</p>
          </div>
        </div>

      </div>

    </div>
  );
}