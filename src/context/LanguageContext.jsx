import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  id: {
    hospitalSettings: 'Pengaturan Kop Surat Laporan PDF (Instansi / RS)',
    hospitalCustomization: 'Kustomisasi Laporan PDF',
    hospitalNameLabel: 'Nama Rumah Sakit / Klinik:',
    hospitalAddressLabel: 'Alamat & Kontak Instansi:',
    hospitalLogoLabel: 'Logo Instansi (PNG/JPG):',
    logoUploaded: '🖼️ Logo Terpasang',
    uploadLogo: '📤 Upload Logo RS',
    chooseFile: 'Pilih File',

    patientIdent: 'IDENTITAS PASIEN',
    patientName: 'Nama Pasien',
    medicalRecordNo: 'No. RM',
    patientPlaceholder: 'Nama Pasien',
    rmPlaceholder: 'No. Rekam Medis (e.g. RM-10293)',

    resetBtn: '🧹 Reset',
    infoBtn: 'ℹ️ Info',
    copySaveBtn: '📋 Salin & Simpan Riwayat',
    copiedBtn: '✅ Disalin & Disimpan!',
    downloadPdfBtn: '📄 Cetak / Download Laporan PDF (Resmi)',

    evalTitle: 'HASIL EVALUASI',
    paramKlinis: 'Parameter Klinis',
    nilaiHasil: 'Nilai / Hasil Hitung',
    satuanCatatan: 'Satuan / Catatan',
    safetyAlertHeader: 'PERINGATAN & PERHATIAN KLINIS (SAFETY ALERT):',
    pdfNote: '*Catatan: Hasil kalkulasi ini merupakan alat bantu keputusan klinis berbasis formula standar farmasi/medis. Keputusan akhir tetap berdasarkan pertimbangan klinis DPJP/Farmasis/Ahli Gizi.',
    pharmacistSign: 'Farmasis / Dokter / Konsultan Gizi',

    historyTitle: 'Riwayat Kalkulasi Pasien (History Log)',
    historySub: 'Tersimpan lokal di browser & dapat di-backup / di-restore kapan saja.',
    importJson: '📂 Import JSON',
    exportJson: '💾 JSON',
    exportCsv: '📊 CSV',
    deleteBtn: '🗑️ Hapus',
    noHistory: 'Belum ada riwayat kalkulasi. Lakukan perhitungan lalu klik tombol "Salin & Simpan Riwayat".',

    navPk: 'Dosis PK (Farmakokinetik)',
    navDrip: 'Dosis Drip / Syringe Pump',
    navPedsGeri: 'Pediatrik & Geriatri',
    navStoppStart: 'Screening Geriatri (STOPP/START)',
    navCrrt: 'Dosis ICU & CRRT (Continuous Dialysis)',
    navElectro: 'Koreksi Elektrolit Darurat (IGD)',
    navArds: 'Evaluasi ARDS & AGD (ICU)',
    navLabelPrint: 'Cetak Etiket & Resep Obat',
    navHdDose: 'Dosis Pasien Cuci Darah (HD)',
    navSteroid: 'Konversi Dosis Steroid',
    navNti: 'Obat Terapi Sempit (NTI / TDM)',
    navTdmChart: 'Grafik Trend Monitoring TDM',
    navDdi: 'Cek Interaksi Obat (DDI High-Risk)',
    navRenal: 'Fungsi Ginjal (ClCr & eGFR)',
    navAnthro: 'Body (BSA, BMI, Parkland)',
    navKalori: 'Kalori Harian & Diet Plan',
  },
  en: {
    hospitalSettings: 'PDF Report Header Settings (Institution / Hospital)',
    hospitalCustomization: 'PDF Customization',
    hospitalNameLabel: 'Hospital / Clinic Name:',
    hospitalAddressLabel: 'Institution Address & Contact:',
    hospitalLogoLabel: 'Institution Logo (PNG/JPG):',
    logoUploaded: '🖼️ Logo Uploaded',
    uploadLogo: '📤 Upload Hospital Logo',
    chooseFile: 'Choose File',

    patientIdent: 'PATIENT IDENTIFICATION',
    patientName: 'Patient Name',
    medicalRecordNo: 'MRN',
    patientPlaceholder: 'Patient Name',
    rmPlaceholder: 'Medical Record Number (e.g. MRN-10293)',

    resetBtn: '🧹 Reset',
    infoBtn: 'ℹ️ Info',
    copySaveBtn: '📋 Copy & Save History',
    copiedBtn: '✅ Copied & Saved!',
    downloadPdfBtn: '📄 Print / Download Official PDF Report',

    evalTitle: 'EVALUATION RESULTS',
    paramKlinis: 'Clinical Parameters',
    nilaiHasil: 'Calculated Value / Result',
    satuanCatatan: 'Unit / Notes',
    safetyAlertHeader: 'CLINICAL SAFETY ALERT:',
    pdfNote: '*Note: This calculation is a clinical decision support tool based on standard medical/pharmaceutical formulas. Final decisions remain with the attending physician/pharmacist/clinical nutritionist.',
    pharmacistSign: 'Clinical Pharmacist / Physician / Specialist',

    historyTitle: 'Patient Calculation History Log',
    historySub: 'Stored locally in browser & can be backed up / restored anytime.',
    importJson: '📂 Import JSON',
    exportJson: '💾 JSON',
    exportCsv: '📊 CSV',
    deleteBtn: '🗑️ Delete',
    noHistory: 'No calculation history yet. Perform a calculation and click "Copy & Save History".',

    navPk: 'PK Dosing (Pharmacokinetics)',
    navDrip: 'Drip / Syringe Pump Rate',
    navPedsGeri: 'Pediatric & Geriatric',
    navStoppStart: 'Geriatric Screening (STOPP/START)',
    navCrrt: 'ICU & CRRT Dosing',
    navElectro: 'Emergency Electrolyte Correction',
    navArds: 'ARDS & ABG Evaluation (ICU)',
    navLabelPrint: 'Prescription & Drug Labeling',
    navHdDose: 'Hemodialysis Dosing (HD)',
    navSteroid: 'Steroid Dose Equivalency',
    navNti: 'Narrow Therapeutic Index (NTI)',
    navTdmChart: 'TDM Trend Monitoring Chart',
    navDdi: 'Drug Interaction (DDI High-Risk)',
    navRenal: 'Renal Function (ClCr & eGFR)',
    navAnthro: 'Body (BSA, BMI, Parkland)',
    navKalori: 'Daily Calories & Diet Plan',
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('clinical_suite_lang') || 'id';
  });

  useEffect(() => {
    localStorage.setItem('clinical_suite_lang', lang);
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'id' ? 'en' : 'id'));
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}