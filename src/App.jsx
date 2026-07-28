import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';

import Sidebar from './components/Sidebar';
import PatientHeader from './components/PatientHeader';
import HospitalHeader from './components/HospitalHeader';
import HistoryLog from './components/HistoryLog';
import RoleGateModal from './components/RoleGateModal';
import AiAssistantWidget from './components/AiAssistantWidget';
import PatientDirectoryModal from './components/PatientDirectoryModal';
import DashboardOverview from './components/DashboardOverview';
import AuditTrailModal from './components/AuditTrailModal';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import ToastAlert from './components/ToastAlert';
import PatientNotesWidget from './components/PatientNotesWidget';
import ClinicalSafetyBanner from './components/ClinicalSafetyBanner';
import DrugScannerModal from './components/DrugScannerModal';
import ClinicalOutcomeTracker from './components/ClinicalOutcomeTracker'; // <-- IMPORT OUTCOME TRACKER

import NtiCalculator from './calculators/NtiCalculator';
import DdiCalculator from './calculators/DdiCalculator';
import TdmChartCalculator from './calculators/TdmChartCalculator';
import PedsGeriCalculator from './calculators/PedsGeriCalculator';
import PrescriptionEtiquetteCalculator from './calculators/PrescriptionEtiquetteCalculator';
import HemodialysisDoseCalculator from './calculators/HemodialysisDoseCalculator';
import SteroidConversionCalculator from './calculators/SteroidConversionCalculator';
import StoppStartCalculator from './calculators/StoppStartCalculator';
import CrrtDoseCalculator from './calculators/CrrtDoseCalculator';
import ElectrolyteCorrectionCalculator from './calculators/ElectrolyteCorrectionCalculator';
import ArdsCalculator from './calculators/ArdsCalculator';
import RenalDosingChecker from './calculators/RenalDosingChecker';
import PregnancyCalculator from './calculators/PregnancyCalculator';
import ChildPughCalculator from './calculators/ChildPughCalculator';
import DiabetesCalculator from './calculators/DiabetesCalculator';
import TriageCalculator from './calculators/TriageCalculator';
import FluidCalculator from './calculators/FluidCalculator';
import GcsCalculator from './calculators/GcsCalculator';
import FraminghamCalculator from './calculators/FraminghamCalculator';
import AntibioticDoseCalculator from './calculators/AntibioticDoseCalculator';

import { useLanguage } from './context/LanguageContext';
import { useTheme } from './context/ThemeContext';
import { usePatient } from './context/PatientContext';

export default function App() {
  const { lang, t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { patientName, setPatientName, patientId, setPatientId } = usePatient();

  const [isAuthorized, setIsAuthorized] = useState(() => {
    return sessionStorage.getItem('clinical_suite_auth_role') ? true : false;
  });
  const [userRole, setUserRole] = useState(() => {
    return sessionStorage.getItem('clinical_suite_auth_role') || '';
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  // State Toast Alert Mengambang
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };
  
  // State Modal Pendukung
  const [isPatientDirOpen, setIsPatientDirOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [voiceResult, setVoiceResult] = useState('');

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

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('clinical_suite_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('clinical_suite_history', JSON.stringify(history));
  }, [history]);

  // States untuk Kalkulator Dasar App.jsx
  const [pkInputs, setPkInputs] = useState({ targetConc: '', vd: '', weight: '', bioavailability: '1', clearance: '', interval: '8' });
  const [dripInputs, setDripInputs] = useState({ dose: '', weight: '', drugMg: '', volumeMl: '100' });
  const [renalInputs, setRenalInputs] = useState({ age: '', weight: '', scr: '', gender: 'male' });
  const [anthroInputs, setAnthroInputs] = useState({ height: '', weight: '', gender: 'male', tbsaBurn: '' });
  const [tdeeInputs, setTdeeInputs] = useState({ weight: '', height: '', age: '', gender: 'male', activityLevel: '1.2', goal: 'fat_loss' });

  // States untuk NTI / TDM Calculator
  const [ntiSubTab, setNtiSubTab] = useState('phenytoin');
  const [ntiPhenytoin, setNtiPhenytoin] = useState({ phenytoinObs: '', albumin: '4.0', renalImpairment: 'no' });
  const [ntiVanco, setNtiVanco] = useState({ weight: '', scr: '', age: '', gender: 'male', dailyDoseMg: '2000' });
  const [ntiTheo, setNtiTheo] = useState({ currentLevel: '', currentDoseMg: '600' });
  const [ntiWarfarin, setNtiWarfarin] = useState({ currentInr: '', targetInrMin: '2.0', targetInrMax: '3.0' });
  const [ntiAmino, setNtiAmino] = useState({ drugType: 'amikacin', weight: '', height: '', gender: 'male', scr: '', age: '' });

  // States untuk Steroid Conversion Calculator
  const [steroidInputs, setSteroidInputs] = useState({ sourceDrug: 'hydrocortisone', sourceDose: '20', targetDrug: 'cortisone' });

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
    if (activeTab === 'steroid') setSteroidInputs({ sourceDrug: 'hydrocortisone', sourceDose: '20', targetDrug: 'cortisone' });
    if (activeTab === 'nti') {
      setNtiPhenytoin({ phenytoinObs: '', albumin: '4.0', renalImpairment: 'no' });
      setNtiVanco({ weight: '', scr: '', age: '', gender: 'male', dailyDoseMg: '2000' });
      setNtiTheo({ currentLevel: '', currentDoseMg: '600' });
      setNtiWarfarin({ currentInr: '', targetInrMin: '2.0', targetInrMax: '3.0' });
      setNtiAmino({ drugType: 'amikacin', weight: '', height: '', gender: 'male', scr: '', age: '' });
    }
    triggerToast('Formulir berhasil di-reset!', 'info');
  };

  const handleClearHistory = () => {
    if (window.confirm('Hapus seluruh riwayat hitungan?')) {
      setHistory([]);
      triggerToast('Riwayat berhasil dikosongkan!', 'warning');
    }
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard Analitik', category: 'Utama', icon: '📊' },
    { id: 'pk', name: 'Dosis PK (Farmakokinetik)', category: 'Dosis & Obat', icon: '💊' },
    { id: 'drip', name: 'Dosis Drip / Syringe Pump', category: 'Dosis & Obat', icon: '💉' },
    { id: 'abx_dose', name: 'Dosis Antibiotik (Adjusted ClCr)', category: 'Dosis & Obat', icon: '🦠' },
    { id: 'peds_geri', name: 'Pediatrik & Geriatri', category: 'Dosis & Obat', icon: '👶' },
    { id: 'stopp_start', name: 'Screening Geriatri (STOPP/START)', category: 'Dosis & Obat', icon: '📋' },
    { id: 'crrt', name: 'Dosis ICU & CRRT', category: 'Dosis & Obat', icon: '🌡️' },
    { id: 'framingham', name: 'Risiko Jantung (Framingham 10-Yr)', category: 'Organ & Fungsi', icon: '❤️' },
    { id: 'gcs', name: 'Neurologi IGD (GCS & Kesadaran)', category: 'Fisiologi & Cairan', icon: '🧠' },
    { id: 'triage', name: 'Triase IGD (Australasian Triage Scale)', category: 'Fisiologi & Cairan', icon: '🚑' },
    { id: 'fluid', name: 'Terapi Cairan & Luka Bakar (Parkland)', category: 'Fisiologi & Cairan', icon: '💧' },
    { id: 'electro', name: 'Koreksi Elektrolit Darurat (IGD)', category: 'Fisiologi & Cairan', icon: '🩸' },
    { id: 'ards', name: 'Evaluasi ARDS & AGD (ICU)', category: 'Fisiologi & Cairan', icon: '🫁' },
    { id: 'pregnancy', name: 'Usia Kehamilan & HPL (Obgin)', category: 'Organ & Fungsi', icon: '🤰' },
    { id: 'renal_dose', name: 'Auto-Checker Dosis Ginjal', category: 'Organ & Fungsi', icon: '🧪' },
    { id: 'label_print', name: 'Cetak Etiket & Resep Obat', category: 'Dosis & Obat', icon: '🖨️' },
    { id: 'hd_dose', name: 'Dosis Pasien Cuci Darah (HD)', category: 'Organ & Fungsi', icon: '🧪' },
    { id: 'hepar', name: 'Evaluasi Hepar (Child-Pugh & MELD)', category: 'Organ & Fungsi', icon: '🫀' },
    { id: 'diabetes', name: 'Manajemen Diabetes & Insulin', category: 'Nutrisi & Energi', icon: '🩸' },
    { id: 'steroid', name: 'Konversi Dosis Steroid', category: 'Dosis & Obat', icon: '🧬' },
    { id: 'nti', name: 'Obat Terapi Sempit (NTI / TDM)', category: 'Dosis & Obat', icon: '⚡' },
    { id: 'tdm_chart', name: 'Grafik Trend Monitoring TDM', category: 'Dosis & Obat', icon: '📊' },
    { id: 'ddi', name: 'Cek Interaksi Obat (DDI High-Risk)', category: 'Dosis & Obat', icon: '⚠️' },
    { id: 'renal', name: 'Fungsi Ginjal (ClCr & eGFR)', category: 'Organ & Fungsi', icon: '🫘' },
    { id: 'anthro', name: 'Body (BSA, BMI, Parkland)', category: 'Fisiologi & Cairan', icon: '📐' },
    { id: 'kalori', name: 'Kalori Harian & Diet Plan', category: 'Nutrisi & Energi', icon: '🔥' },
  ];

  const formulaInfo = {
    dashboard: { title: 'Dashboard Analitik', formula: 'Statistik Sesi & Cache Lokal', guideline: 'Pusat ringkasan aktivitas klinis.' },
    pk: { title: 'Farmakokinetik', formula: 'LD = (C × Vd × BB) / F', guideline: 'Menentukan dosis awal dan pemeliharaan obat.' },
    drip: { title: 'Drip Infus', formula: 'Kecepatan = (Dose × BB × 60) / Konstr', guideline: 'Standar syringe pump.' },
    renal: { title: 'Fungsi Ginjal', formula: 'Cockcroft-Gault & CKD-EPI', guideline: 'Acuan penyesuaian dosis obat.' },
    abx_dose: { title: 'Dosis Antibiotik (Ginjal)', formula: 'Penyesuaian Dosis = f(ClCr Pasien)', guideline: 'Menghitung penyesuaian frekuensi/dosis antibiotik empiris untuk mencegah toksisitas.' },
    anthro: { title: 'Antropometri', formula: 'BSA = √(TB×BB)/3600', guideline: 'Status gizi & BSA.' },
    kalori: { title: 'Kalori & Diet', formula: 'Mifflin-St Jeor TDEE', guideline: 'Perencanaan diet harian.' },
    hepar: { title: 'Child-Pugh & MELD Score', formula: 'Akumulasi Poin Ensefalopati + Asites + Lab Nilai', guideline: 'Evaluasi sirosis & prognostik transplantasi hepar.' },
    diabetes: { title: 'Manajemen Diabetes & Insulin', formula: 'eAG = 28.7(HbA1c)-46.7 | ISF = 1800/TDD | ICR = 500/TDD', guideline: 'Kalkulasi eAG, sensitivitas insulin, dan rasio karbohidrat.' },
    triage: { title: 'Triase IGD (ATS)', formula: 'Kategori 1 (0m) s.d Kategori 5 (120m)', guideline: 'Standar pemilahan kegawatdaruratan medis di IGD berdasarkan skala ATS.' },
    fluid: { title: 'Terapi Cairan & Luka Bakar', formula: 'Holliday-Segar & Parkland (4 mL × BB × %TBSA)', guideline: 'Perhitungan rumatan cairan harian & resusitasi luka bakar.' },
    gcs: { title: 'Glasgow Coma Scale (GCS)', formula: 'Total GCS = Eye (1-4) + Motorik (1-6) + Verbal (1-5)', guideline: 'Penilaian kuantitatif tingkat kesadaran pada kasus neurologi dan kegawatdaruratan.' },
    framingham: { title: 'Framingham Risk Score', formula: 'Akumulasi Poin Usia + Merokok + Kolesterol + TD Sistolik', guideline: 'Estimasi risiko Penyakit Jantung Koroner (PJK) dalam 10 tahun.' },
    steroid: { title: 'Konversi Dosis Steroid', formula: 'Dosis Target = (Dosis Asal / Equivalen Asal) × Equivalen Target', guideline: 'Konversi anti-inflamasi setara antar kortikosteroid.' },
    nti: { title: 'Terapi Sempit (NTI / TDM)', formula: 'Phenytoin Terkoreksi = C_obs / [(0.2 × Alb) + 0.1]', guideline: 'Pemantauan kadar obat sempit.' }
  };

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
    else if (bmiVal >= 25.0) cat = 'Obesitas';

    return { bmi: Number(bmiVal.toFixed(1)), ibw: Number(ibwVal.toFixed(1)), bmiCategory: cat };
  })();

  const dietPlan = (() => {
    const { weight, height, age, gender, activityLevel, goal } = tdeeInputs;
    if (!weight || !height || !age) return { bmr: 0, tdee: 0, targetCal: 0, protein: 0, carbs: 0, fat: 0, advice: '' };
    
    let bmrVal = (10 * weight) + (6.25 * height) - (5 * age) + (gender === 'female' ? -161 : 5);
    let tdeeVal = bmrVal * (parseFloat(activityLevel) || 1.2);
    let targetCal = tdeeVal;
    let advice = '';

    if (goal === 'fat_loss') {
      targetCal = tdeeVal - 500;
      advice = '🔥 Target Defisit Kalori (Turun ~0.5 kg/minggu). Utamakan makanan tinggi protein & serat.';
    } else if (goal === 'gain') {
      targetCal = tdeeVal + 400;
      advice = '📈 Target Surplus Kalori (Naik Berat / Otot). Imbangi latihan beban.';
    } else {
      targetCal = tdeeVal;
      advice = '⚖️ Target Maintenance (Menjaga Berat Badan Saat Ini).';
    }

    return {
      bmr: Number(bmrVal.toFixed(0)),
      tdee: Number(tdeeVal.toFixed(0)),
      targetCal: Number(targetCal.toFixed(0)),
      protein: Number(((targetCal * 0.3) / 4).toFixed(0)),
      carbs: Number(((targetCal * 0.4) / 4).toFixed(0)),
      fat: Number(((targetCal * 0.3) / 9).toFixed(0)),
      advice
    };
  })();

  const vancoAuc = (() => {
    const { weight, scr, age, gender, dailyDoseMg } = ntiVanco;
    if (!weight || !scr || !age || !dailyDoseMg || scr <= 0) return 0;
    let clcrVal = ((140 - age) * weight) / (72 * scr);
    if (gender === 'female') clcrVal *= 0.85;
    const estimatedCl = clcrVal * 0.06;
    if (estimatedCl <= 0) return 0;
    const auc = (dailyDoseMg / estimatedCl).toFixed(1);
    return Number(auc);
  })();

  const phenytoinAdj = (() => {
    const { phenytoinObs, albumin } = ntiPhenytoin;
    if (!phenytoinObs) return 0;
    const albVal = parseFloat(albumin) || 4.0;
    const adj = parseFloat(phenytoinObs) / ((0.2 * albVal) + 0.1);
    return Number(adj.toFixed(2));
  })();

  const getPdfAlertMessage = () => {
    if (activeTab === 'drip' && drip > 50) {
      return { isAlert: true, text: `⚠️ WARNING: Kecepatan Drip Tinggi (${drip} mL/jam).` };
    }
    if (activeTab === 'renal' && egfr > 0 && egfr < 30) {
      return { isAlert: true, text: '🚨 ALERT: eGFR < 30 mL/min (CKD Stage 4-5 Severe). Wajib lakukan penyesuaian dosis obat ginjal!' };
    }
    if (activeTab === 'renal' && egfr >= 30 && egfr < 60) {
      return { isAlert: true, text: '⚠️ WARNING: eGFR 30 - 59 mL/min (CKD Stage 3). Lakukan penyesuaian dosis.' };
    }
    return { isAlert: false, text: '' };
  };

  const pdfAlert = getPdfAlertMessage();

  const getCurrentActiveInputs = () => {
    if (activeTab === 'pk') return pkInputs;
    if (activeTab === 'drip') return dripInputs;
    if (activeTab === 'renal') return renalInputs;
    if (activeTab === 'anthro') return anthroInputs;
    if (activeTab === 'kalori') return tdeeInputs;
    if (activeTab === 'steroid') return steroidInputs;
    if (activeTab === 'nti') {
      if (ntiSubTab === 'phenytoin') return ntiPhenytoin;
      if (ntiSubTab === 'vancomycin') return ntiVanco;
    }
    return { activeTab };
  };

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
    let summaryText = `[Clinical Suite] Pasien: ${patientName || '-'} (RM: ${patientId || '-'})\nModul: ${activeTab.toUpperCase()}`;
    navigator.clipboard.writeText(summaryText);
    saveToHistoryLog(activeTab.toUpperCase(), summaryText);
    triggerToast('Ringkasan berhasil disalin ke clipboard!', 'success');
  };

  const handleDownloadPDF = () => {
    let calcType = activeTab.toUpperCase();
    saveToHistoryLog(`PDF Export (${calcType})`, `Pasien ${patientName || '-'}: Evaluasi ${calcType} Selesai.`);
    triggerToast('Memproses laporan PDF...', 'info');

    const element = document.getElementById('pdf-template');
    element.style.display = 'block';
    
    const opt = {
      margin:        0.4,
      filename:      `Laporan-Klinis-${patientName || 'Pasien'}.pdf`,
      image:         { type: 'jpeg', quality: 0.98 },
      html2canvas:   { scale: 2 },
      jsPDF:         { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      element.style.display = 'none';
      triggerToast('Laporan PDF berhasil diunduh!', 'success');
    });
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'
    }`}>
      
      {!isAuthorized && (
        <RoleGateModal 
          onAccessGranted={(role) => {
            setUserRole(role);
            setIsAuthorized(true);
            triggerToast(`Login sukses sebagai ${role}`, 'success');
          }} 
        />
      )}

      {/* TOAST ALERT COMPONENT */}
      {toast.show && (
        <ToastAlert 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      {/* QUICK CLINICAL NOTES WIDGET */}
      <PatientNotesWidget 
        onSaveNote={() => triggerToast('Catatan visite berhasil disimpan!', 'success')} 
      />

      {/* MODAL SCANNER OBAT */}
      <DrugScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanResult={(drug) => {
          triggerToast(`Obat terdeteksi: ${drug.name}`, 'success');
        }}
      />

      {/* MODAL DIREKTORI PASIEN LOKAL */}
      <PatientDirectoryModal
        isOpen={isPatientDirOpen}
        onClose={() => setIsPatientDirOpen(false)}
        onSelectPatient={(name, rm) => {
          setPatientName(name);
          setPatientId(rm);
          triggerToast(`Pasien ${name} dipilih!`, 'success');
        }}
        currentPatientName={patientName}
        currentPatientId={patientId}
      />

      {/* MODAL AUDIT TRAIL & KEAMANAN */}
      <AuditTrailModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        userRole={userRole}
      />

      {/* MODAL VOICE ASSISTANT */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscriptionResult={(text) => {
          setVoiceResult(text);
          triggerToast('Transkrip suara berhasil diterima!', 'success');
        }}
      />

      {/* MOBILE HEADER */}
      <div className={`md:hidden p-4 flex justify-between items-center sticky top-0 z-50 border-b ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">🩺</span>
          <div>
            <span className="font-bold text-base text-blue-500 block leading-tight">Clinical Suite</span>
            <span className="text-[9px] text-slate-400">Role: {userRole || 'Professional'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsScannerOpen(true)} className="p-2 rounded-lg bg-emerald-600 text-white text-xs font-bold" title="Scanner Obat">
            📸
          </button>
          <button onClick={() => setIsVoiceModalOpen(true)} className="p-2 rounded-lg bg-teal-600 text-white text-xs font-bold" title="Asisten Suara Klinis">
            🎙️
          </button>
          <button onClick={() => setIsPatientDirOpen(true)} className="p-2 rounded-lg bg-blue-600 text-white text-xs font-bold" title="Direktori Pasien">
            📁
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-lg ${
            isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
          }`}>
            {isSidebarOpen ? '✖' : '☰'}
          </button>
        </div>
      </div>

      <Sidebar
        menuItems={menuItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <HospitalHeader
          hospitalInfo={hospitalInfo}
          setHospitalInfo={setHospitalInfo}
        />

        {/* HEADER PASIEN DENGAN SHORTCUT DIREKTORI, VOICE, SCANNER & KEAMANAN */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div className="flex-1 w-full">
            <PatientHeader
              patientName={patientName}
              setPatientName={setPatientName}
              patientId={patientId}
              setPatientId={setPatientId}
            />
          </div>
          <div className="hidden md:flex items-center gap-2 self-end mb-1">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all text-xs whitespace-nowrap"
            >
              <span>📸</span> Scan Obat
            </button>
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all text-xs whitespace-nowrap"
            >
              <span>🎙️</span> Voice Notes
            </button>
            <button
              onClick={() => setIsPatientDirOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all text-xs whitespace-nowrap"
            >
              <span>📁</span> Direktori Pasien
            </button>
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className={`flex items-center gap-2 font-bold py-3 px-4 rounded-xl shadow-lg transition-all text-xs whitespace-nowrap border ${
                isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
            >
              <span>🔒</span> Keamanan
            </button>
          </div>
        </div>

        {/* BANNER HASIL TRANSKRIP SUARA JIKA ADA */}
        {voiceResult && (
          <div className={`p-4 rounded-xl mb-4 flex items-center justify-between border ${
            isDark ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <div className="text-xs">
              <span className="font-bold block mb-1">🎙️ Transkrip Suara Terakhir:</span>
              <p className="italic">"{voiceResult}"</p>
            </div>
            <button onClick={() => setVoiceResult('')} className="text-xs font-bold px-2 py-1 bg-emerald-600 text-white rounded-lg">Tutup</button>
          </div>
        )}

        {/* CDSS SAFETY BANNER (REAL-TIME KLINIS) */}
        <ClinicalSafetyBanner activeTab={activeTab} currentInputs={getCurrentActiveInputs()} />

        {/* CLINICAL OUTCOME TRACKER (TREND LAB PASIEN) */}
        <ClinicalOutcomeTracker />

        <div className={`p-6 md:p-8 rounded-2xl shadow-xl mb-8 border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
        }`}>
          <div className={`mb-6 border-b pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span>{menuItems.find((m) => m.id === activeTab)?.icon}</span>
                {menuItems.find((m) => m.id === activeTab)?.name}
              </h2>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Kategori: {menuItems.find((m) => m.id === activeTab)?.category} • Sesi Aktif: <span className="text-blue-500 font-bold">{userRole}</span>
              </p>
            </div>

            {activeTab !== 'dashboard' && (
              <div className="flex items-center gap-2">
                <button onClick={handleResetForm} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isDark ? 'bg-slate-800 text-slate-400 hover:text-white border-slate-700' : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-300'
                }`}>
                  {t.resetBtn}
                </button>
                <button onClick={() => setShowInfo(true)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isDark ? 'bg-slate-800 text-blue-400 border-slate-700' : 'bg-blue-50 text-blue-600 border-blue-200'
                }`}>
                  {t.infoBtn}
                </button>
              </div>
            )}
          </div>

          {activeTab === 'dashboard' && (
            <DashboardOverview 
              history={history} 
              onNavigateTab={(tabId) => setActiveTab(tabId)} 
            />
          )}

          {activeTab === 'pk' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Target Conc (mg/L)</label><input type="number" name="targetConc" value={pkInputs.targetConc} onChange={handlePk} placeholder="e.g. 15" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`} /></div>
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Vd (L/kg)</label><input type="number" name="vd" value={pkInputs.vd} onChange={handlePk} placeholder="e.g. 0.7" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`} /></div>
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>BB Pasien (kg)</label><input type="number" name="weight" value={pkInputs.weight} onChange={handlePk} placeholder="e.g. 60" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`} /></div>
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Clearance (L/jam)</label><input type="number" name="clearance" value={pkInputs.clearance} onChange={handlePk} placeholder="e.g. 3.0" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`} /></div>
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Interval (Jam)</label><input type="number" name="interval" value={pkInputs.interval} onChange={handlePk} placeholder="e.g. 8" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`} /></div>
              </div>

              <div className={`p-4 rounded-xl flex justify-between mb-4 border ${
                isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'
              }`}>
                <div><span className="text-xs text-blue-500 font-bold block">Loading Dose (LD)</span><span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{ld} mg</span></div>
                <div><span className="text-xs text-blue-500 font-bold block">Maintenance Dose (MD)</span><span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{md} mg/{pkInputs.interval || 0}j</span></div>
              </div>
            </div>
          )}

          {activeTab === 'drip' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Dosis Target (mcg/kg/min)</label><input type="number" name="dose" value={dripInputs.dose} onChange={handleDrip} placeholder="e.g. 5" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`} /></div>
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>BB Pasien (kg)</label><input type="number" name="weight" value={dripInputs.weight} onChange={handleDrip} placeholder="e.g. 60" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`} /></div>
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Jumlah Obat Dalam Vial/Ampul (mg)</label><input type="number" name="drugMg" value={dripInputs.drugMg} onChange={handleDrip} placeholder="e.g. 250" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`} /></div>
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Volume Pelarut Syringe Pump (mL)</label><input type="number" name="volumeMl" value={dripInputs.volumeMl} onChange={handleDrip} placeholder="e.g. 50" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`} /></div>
              </div>

              <div className={`p-4 rounded-xl text-center mb-4 border ${
                isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'
              }`}>
                <span className="text-xs text-blue-500 font-bold block">Kecepatan Syringe Pump / Infusiometer</span>
                <span className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{drip} mL/jam</span>
              </div>
              {drip > 50 && (
                <div className="bg-amber-500/10 border border-amber-500/40 p-3 rounded-lg text-amber-600 font-medium text-xs">
                  ⚠️ <strong>WARNING:</strong> Kecepatan Drip Tinggi ({drip} mL/jam). Pertimbangkan Vena Sentral (CVC)!
                </div>
              )}
            </div>
          )}

          {activeTab === 'peds_geri' && <PedsGeriCalculator />}
          {activeTab === 'abx_dose' && <AntibioticDoseCalculator />}
          {activeTab === 'stopp_start' && <StoppStartCalculator />}
          {activeTab === 'crrt' && <CrrtDoseCalculator />}
          {activeTab === 'framingham' && <FraminghamCalculator />}
          {activeTab === 'gcs' && <GcsCalculator />}
          {activeTab === 'triage' && <TriageCalculator />}
          {activeTab === 'fluid' && <FluidCalculator />}
          {activeTab === 'electro' && <ElectrolyteCorrectionCalculator />}
          {activeTab === 'ards' && <ArdsCalculator />}
          {activeTab === 'pregnancy' && <PregnancyCalculator />}
          {activeTab === 'renal_dose' && <RenalDosingChecker />}
          {activeTab === 'label_print' && <PrescriptionEtiquetteCalculator />}
          {activeTab === 'hd_dose' && <HemodialysisDoseCalculator />}
          
          {/* MODUL HEPAR & DIABETES */}
          {activeTab === 'hepar' && <ChildPughCalculator />}
          {activeTab === 'diabetes' && <DiabetesCalculator />}

          {activeTab === 'steroid' && (
            <SteroidConversionCalculator 
              inputs={steroidInputs}
              setInputs={setSteroidInputs}
            />
          )}

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
              theoDoseRec={0}
              ntiWarfarin={ntiWarfarin}
              setNtiWarfarin={setNtiWarfarin}
              warfarinRec={{ status: 'Stable', action: 'Lanjutkan regimen' }}
              ntiAmino={ntiAmino}
              setNtiAmino={setNtiAmino}
              aminoDose={{ ibw: 55, doseMg: 400, dosingWeight: 'IBW', interval: '24 jam' }}
            />
          )}

          {activeTab === 'tdm_chart' && <TdmChartCalculator />}
          {activeTab === 'ddi' && <DdiCalculator />}

          {activeTab === 'renal' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Usia (Tahun)</label><input type="number" name="age" value={renalInputs.age} onChange={handleRenal} placeholder="e.g. 55" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`} /></div>
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>BB Pasien (kg)</label><input type="number" name="weight" value={renalInputs.weight} onChange={handleRenal} placeholder="e.g. 65" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`} /></div>
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Serum Creatinine (mg/dL)</label><input type="number" name="scr" value={renalInputs.scr} onChange={handleRenal} placeholder="e.g. 1.2" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`} /></div>
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Jenis Kelamin</label><select name="gender" value={renalInputs.gender} onChange={handleRenal} className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`}><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></div>
              </div>

              <div className={`p-4 rounded-xl flex justify-between mb-4 border ${
                isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'
              }`}>
                <div><span className="text-xs text-blue-500 font-bold block">Cockcroft-Gault (ClCr)</span><span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{clcr} mL/min</span></div>
                <div><span className="text-xs text-blue-500 font-bold block">CKD-EPI (eGFR)</span><span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{egfr} mL/min/1.73m²</span></div>
              </div>

              {egfr > 0 && egfr < 30 && (
                <div className="bg-red-500/10 border border-red-500/40 p-4 rounded-xl text-xs text-red-600 mb-2 font-medium">
                  🚨 <strong>ALERT: eGFR &lt; 30 mL/min (CKD Stage 4-5 Severe):</strong> Risiko tinggi toksisitas obat ginjal!
                </div>
              )}
              {egfr >= 30 && egfr < 60 && (
                <div className="bg-amber-500/10 border border-amber-500/40 p-4 rounded-xl text-xs text-amber-600 mb-2 font-medium">
                  ⚠️ <strong>WARNING: eGFR 30 - 59 mL/min (CKD Stage 3):</strong> Gangguan ginjal moderat.
                </div>
              )}
            </div>
          )}

          {activeTab === 'anthro' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Tinggi Badan (cm)</label><input type="number" name="height" value={anthroInputs.height} onChange={handleAnthro} placeholder="e.g. 165" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`} /></div>
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>BB Pasien (kg)</label><input type="number" name="weight" value={anthroInputs.weight} onChange={handleAnthro} placeholder="e.g. 60" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`} /></div>
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Jenis Kelamin</label><select name="gender" value={anthroInputs.gender} onChange={handleAnthro} className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`}><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></div>
              </div>

              <div className={`grid grid-cols-3 gap-2 p-4 rounded-2xl text-center mb-4 border ${
                isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'
              }`}>
                <div><span className="text-xs text-blue-500 font-bold block mb-1">BSA</span><span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{bsa} m²</span></div>
                <div><span className="text-xs text-blue-500 font-bold block mb-1">BMI</span><span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{bmi} kg/m²</span></div>
                <div><span className="text-xs text-blue-500 font-bold block mb-1">IBW</span><span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{ibw} kg</span></div>
              </div>
            </div>
          )}

          {activeTab === 'kalori' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Usia (Tahun)</label><input type="number" name="age" value={tdeeInputs.age} onChange={handleTdee} placeholder="e.g. 24" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`} /></div>
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>TB (cm)</label><input type="number" name="height" value={tdeeInputs.height} onChange={handleTdee} placeholder="e.g. 170" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`} /></div>
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>BB Pasien (kg)</label><input type="number" name="weight" value={tdeeInputs.weight} onChange={handleTdee} placeholder="e.g. 70" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`} /></div>
                <div><label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Jenis Kelamin</label><select name="gender" value={tdeeInputs.gender} onChange={handleTdee} className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`}><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></div>
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Tingkat Aktivitas Harian</label>
                  <select name="activityLevel" value={tdeeInputs.activityLevel} onChange={handleTdee} className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`}>
                    <option value="1.2">Sedentary (Jarang Olahraga)</option>
                    <option value="1.375">Light Activity (Olahraga Ringan 1-3x/mg)</option>
                    <option value="1.55">Moderate Activity (Olahraga Sedang 3-5x/mg)</option>
                    <option value="1.725">Very Active (Olahraga Berat 6-7x/mg)</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>🎯 Target Goal Pasien / User</label>
                  <select name="goal" value={tdeeInputs.goal} onChange={handleTdee} className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'}`}>
                    <option value="fat_loss">📉 Fat Loss / Diet Defisit (Turun BB)</option>
                    <option value="maintain">⚖️ Maintenance (Jaga Berat Badan)</option>
                    <option value="gain">📈 Muscle Gain / Surplus (Naik BB)</option>
                  </select>
                </div>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl text-center mb-4 border ${
                isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'
              }`}>
                <div><span className="text-[10px] font-bold text-blue-500 block mb-1">BMR</span><span className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{dietPlan.bmr} kcal</span></div>
                <div><span className="text-[10px] font-bold text-blue-500 block mb-1">TDEE</span><span className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{dietPlan.tdee} kcal</span></div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl"><span className="text-[10px] font-bold text-emerald-500 block mb-1">TARGET</span><span className="text-2xl font-extrabold text-emerald-600">{dietPlan.targetCal} kcal</span></div>
              </div>

              {dietPlan.targetCal > 0 && (
                <div className={`p-4 rounded-xl space-y-3 text-xs border ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="font-bold text-blue-500 block">📊 Target Makronutrisi Harian:</span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}><p className="text-slate-400 text-[10px]">🍗 Protein (30%)</p><p className="text-lg font-bold text-amber-500">{dietPlan.protein} g</p></div>
                    <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}><p className="text-slate-400 text-[10px]">🍚 Karbohidrat (40%)</p><p className="text-lg font-bold text-blue-500">{dietPlan.carbs} g</p></div>
                    <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}><p className="text-slate-400 text-[10px]">🥑 Lemak Sehat (30%)</p><p className="text-lg font-bold text-emerald-500">{dietPlan.fat} g</p></div>
                  </div>
                  <p className="text-slate-400 italic text-[11px] mt-2">{dietPlan.advice}</p>
                </div>
              )}
            </div>
          )}

          {/* ACTION BUTTONS (Hidden in Dashboard view) */}
          {activeTab !== 'dashboard' && (
            <div className={`mt-8 border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <button
                onClick={handleCopySummary}
                className={`w-full sm:w-auto font-bold py-3 px-5 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
              >
                {t.copySaveBtn}
              </button>

              <button
                onClick={handleDownloadPDF}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs"
              >
                {t.downloadPdfBtn}
              </button>
            </div>
          )}
        </div>

        <HistoryLog
          history={history}
          handleClearHistory={handleClearHistory}
          setHistory={setHistory}
        />
      </main>

      <AiAssistantWidget 
        currentInputs={getCurrentActiveInputs()}
        activeTab={activeTab}
        patientName={patientName}
        patientId={patientId}
      />

      {/* MODAL POPUP INFO RUMUS */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border p-6 rounded-2xl max-w-md w-full shadow-2xl relative ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
          }`}>
            <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold">✖</button>
            <div className="flex items-center gap-2 mb-4 text-blue-500">
              <span className="text-2xl">📖</span>
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{formulaInfo[activeTab]?.title || 'Informasi Rumus'}</h3>
            </div>
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold block mb-1">FORMULA / RUMUS:</span>
                <pre className={`p-3 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre-wrap ${isDark ? 'bg-slate-950 text-emerald-400' : 'bg-slate-100 text-emerald-700'}`}>
                  {formulaInfo[activeTab]?.formula || 'Standar Medis Klinis'}
                </pre>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-1">GUIDELINE & CATATAN KLINIS:</span>
                <p className={`leading-relaxed p-3 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  {formulaInfo[activeTab]?.guideline || 'Digunakan sesuai indikasi klinis.'}
                </p>
              </div>
            </div>
            <button onClick={() => setShowInfo(false)} className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all">
              Tutup & Kembali
            </button>
          </div>
        </div>
      )}

      {/* TEMPLATE PDF DINAMIS (SEMUA MODUL MENAMPILKAN DATA DETAIL) */}
      <div id="pdf-template" style={{ display: 'none' }} className="p-8 bg-white text-black font-sans text-xs">
        <div style={{ borderBottom: '3px double #000', paddingBottom: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
            {hospitalInfo.logoUrl ? (
              <img src={hospitalInfo.logoUrl} alt="Logo RS" style={{ maxHeight: '60px', maxWidth: '90px', objectFit: 'contain' }} />
            ) : (
              <div style={{ fontSize: '28px' }}>🩺</div>
            )}
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
              <p style={{ margin: 0 }}>Role: <strong>{userRole || 'Medical Staff'}</strong></p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '6px', color: '#0f172a' }}>1. {t.patientIdent}</h3>
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

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px', color: '#0f172a' }}>
            2. {t.evalTitle} ({activeTab.toUpperCase()})
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
            <thead>
              <tr style={{ background: '#1e293b', color: '#fff', textAlign: 'left' }}>
                <th style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>Parameter Klinis / Variabel</th>
                <th style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>Nilai Hasil Kalkulasi / Input</th>
                <th style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>Satuan / Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'pk' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Target Concentration</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>{pkInputs.targetConc || '-'}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>mg/L</td></tr>
                  <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>Loading Dose (LD)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '12px', color: '#1e40af' }}>{ld}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>mg</td></tr>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>Maintenance Dose (MD)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '12px', color: '#1e40af' }}>{md}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>mg / {pkInputs.interval || 0} jam</td></tr>
                </>
              )}
              {activeTab === 'drip' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Target Dosis Infus</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>{dripInputs.dose || '-'}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>mcg/kg/min</td></tr>
                  <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>Kecepatan Syringe Pump</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '12px', color: '#1e40af' }}>{drip}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>mL/jam</td></tr>
                </>
              )}
              {activeTab === 'renal' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Serum Creatinine / Usia</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>{renalInputs.scr || '-'} mg/dL ({renalInputs.age || '-'} thn)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Variabel Pasien</td></tr>
                  <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>Cockcroft-Gault (ClCr)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '12px', color: '#1e40af' }}>{clcr}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>mL/min</td></tr>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>CKD-EPI (eGFR)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '12px', color: '#1e40af' }}>{egfr}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>mL/min/1.73m²</td></tr>
                </>
              )}
              {activeTab === 'anthro' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Tinggi / Berat Badan</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>{anthroInputs.height || '-'} cm / {anthroInputs.weight || '-'} kg</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Antropometri</td></tr>
                  <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>BSA (Luas Permukaan Tubuh)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{bsa}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>m²</td></tr>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>BMI & Kategori</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{bmi} ({bmiCategory})</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>kg/m²</td></tr>
                  <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>IBW (Berat Badan Ideal)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{ibw}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>kg</td></tr>
                </>
              )}
              {activeTab === 'kalori' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>BMR (Metabolisme Basal)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{dietPlan.bmr}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>kcal/hari</td></tr>
                  <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>TDEE (Kebutuhan Total)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{dietPlan.tdee}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>kcal/hari</td></tr>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#059669' }}>Target Asupan Kalori ({tdeeInputs.goal.toUpperCase()})</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '12px', color: '#059669' }}>{dietPlan.targetCal}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#059669' }}>kcal/hari</td></tr>
                  <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Makronutrisi (Protein / Carbs / Fat)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{dietPlan.protein}g / {dietPlan.carbs}g / {dietPlan.fat}g</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Gram/hari</td></tr>
                </>
              )}
              {activeTab === 'hepar' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Modul Evaluasi</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>Child-Pugh & MELD Score</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Hepatology Score</td></tr>
                  <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Status Sirosis & Prognosis</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>Tersedia di Panel Aktif</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Klinis Hepar</td></tr>
                </>
              )}
              {activeTab === 'diabetes' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Modul Endokrin</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>Manajemen Diabetes & Insulin</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Endocrine Management</td></tr>
                  <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Parameter Kalkulasi</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#059669' }}>eAG, ISF & ICR Dinamis</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Glikemik Kontrol</td></tr>
                </>
              )}
              {activeTab === 'triage' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Modul IGD</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>Triase IGD (ATS)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Emergency Triage</td></tr>
                  <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Kategori Kegawatdaruratan</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#dc2626' }}>Skala ATS 1 s.d 5 Terpilih</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Prioritas Respon</td></tr>
                </>
              )}
              {activeTab === 'fluid' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Modul Cairan & Luka Bakar</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>Holliday-Segar & Parkland Formula</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Resusitasi Cairan</td></tr>
                </>
              )}
              {activeTab === 'gcs' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Modul Neurologi</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>Glasgow Coma Scale (GCS)</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Kesadaran Pasien</td></tr>
                </>
              )}
              {activeTab === 'framingham' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Modul Kardiologi</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>Framingham 10-Year PVD Risk Score</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Risiko Kardiovaskular</td></tr>
                </>
              )}
              {activeTab === 'abx_dose' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Modul Antimikroba</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>Penyesuaian Dosis Antibiotik Berbasis ClCr</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Renal Dosing</td></tr>
                </>
              )}
              {activeTab === 'steroid' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Dosis & Obat Asal</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{steroidInputs.sourceDose || 0} mg {steroidInputs.sourceDrug}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Regimen Awal</td></tr>
                  <tr style={{ background: '#f8fafc' }}><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>Target Konversi Steroid</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e40af' }}>Dosis Setara Anti-inflamasi</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', color: '#1e40af' }}>Equipotent Dose</td></tr>
                </>
              )}
              {activeTab === 'nti' && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Modul TDM / NTI</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{ntiSubTab === 'vancomycin' ? `${vancoAuc} mg·hr/L (Vancomycin AUC)` : 'Terapi Sempit Terpilih'}</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Therapeutic Drug Monitoring</td></tr>
                </>
              )}
              {!['dashboard', 'pk', 'drip', 'renal', 'anthro', 'kalori', 'hepar', 'diabetes', 'triage', 'fluid', 'gcs', 'framingham', 'abx_dose', 'steroid', 'nti'].includes(activeTab) && (
                <>
                  <tr><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Modul Aktif</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{activeTab.toUpperCase()} Evaluasi Klinis</td><td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>Standar Rumah Sakit</td></tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {pdfAlert.isAlert && (
          <div style={{ marginBottom: '20px', padding: '10px 12px', background: '#fef2f2', border: '1.5px solid #ef4444', borderRadius: '6px', color: '#991b1b', fontSize: '10px' }}>
            <strong style={{ display: 'block', marginBottom: '2px', fontSize: '11px' }}>{t.safetyAlertHeader}</strong>
            <span>{pdfAlert.text}</span>
          </div>
        )}

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ width: '55%', fontSize: '9px', color: '#64748b', fontStyle: 'italic' }}>
            {t.pdfNote}
          </div>
          <div style={{ textTransform: 'uppercase', textAlign: 'center', width: '35%' }}>
            <p style={{ margin: 0, fontSize: '10px' }}>{t.pharmacistSign} ({userRole})</p>
            <div style={{ height: '45px' }}></div>
            <p style={{ margin: 0, borderTop: '1px solid #000', fontWeight: 'bold', paddingTop: '2px' }}>( ________________________ )</p>
          </div>
        </div>
      </div>

    </div>
  );
}