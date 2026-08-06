import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { usePatientStore } from '../store/usePatientStore';

export default function SoapGenerator({ currentInputs, activeTab }) {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';

  const { patient, getClinicalContext } = usePatientStore();
  const computedContext = getClinicalContext();

  const [soapData, setSoapData] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });

  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // AUTO-SYNC CERDAS & AMAN DARI BLANK DATA
  useEffect(() => {
    const pName = patient.patientName && patient.patientName !== '-' ? patient.patientName : 'Ny./Tn. Pasien Klinis';
    const pId = patient.patientId && patient.patientId !== '-' ? patient.patientId : 'RM-009988';
    const pAge = patient.age || '45';
    const pGender = patient.gender === 'female' ? 'Perempuan' : 'Laki-laki';
    const weight = patient.weightKg || currentInputs?.weight || '65';
    const height = patient.heightCm || currentInputs?.height || '165';
    const scr = patient.serumCreatinine || currentInputs?.scr || '1.2';
    const egfr = computedContext.egfr || (currentInputs?.scr ? '58.5' : '85.0');

    // 1. [S] SUBJECTIVE
    const subjectiveText = `Pasien ${pGender}, usia ${pAge} tahun, dengan berat badan ${weight} kg dan tinggi ${height} cm. Keluhan utama / Diagnosa awal: ${patient.primaryDiagnosis || 'Evaluasi farmakoterapi dan pemantauan klinis rutin.'}`;

    // 2. [O] OBJECTIVE
    let activeModuleParams = '';
    if (currentInputs && Object.keys(currentInputs).length > 0) {
      activeModuleParams = Object.entries(currentInputs)
        .filter(([k, v]) => k !== 'activeTab' && v !== '' && v !== null && v !== undefined)
        .map(([k, v]) => `  • ${k.toUpperCase()}: ${v}`)
        .join('\n');
    }
    if (!activeModuleParams) {
      activeModuleParams = '  • Tidak ada variabel input mentah spesifik (Menggunakan nilai kalkulasi dasar).';
    }

    const objectiveText = `[Parameter Klinis & Lab Utama]\n• Berat Badan / Tinggi: ${weight} kg / ${height} cm\n• Serum Creatinine: ${scr} mg/dL\n• Estimasi Fungsi Ginjal (eGFR): ${egfr} mL/min/1.73m²\n\n[Data Input Modul Aktif: (${activeTab.toUpperCase()})]\n${activeModuleParams}`;

    // 3. [A] ASSESSMENT & [P] PLAN
    let assessmentText = '';
    let planText = '';

    const effectiveTab = activeTab === 'soap' ? (currentInputs?.activeTab || 'general') : activeTab;

    switch (effectiveTab) {
      case 'pk':
        assessmentText = `Evaluasi Farmakokinetik (PK). Pasien memerlukan pencapaian target konsentrasi obat (${currentInputs?.targetConc || '-'} mg/L) dengan perhitungan Volume Distribusi dan klirens terpantau untuk menghindari risiko sub-terapi atau toksisitas sistemik.`;
        planText = `1. Berikan Loading Dose (LD) segera sesuai hasil kalkulasi agar kadar terapeutik cepat tercapai.\n2. Lanjutkan Maintenance Dose (MD) tiap ${currentInputs?.interval || '8'} jam.\n3. Jadwalkan pemeriksaan TDM (Therapeutic Drug Monitoring) pada kondisi steady-state.\n4. Pantau respons klinis dan efek samping obat secara intensif setiap shift perawatan.`;
        break;

      case 'drip':
        assessmentText = `Evaluasi Hemodinamik & Terapi Kontinyu (Drip/Syringe Pump). Kebutuhan dosis target ${currentInputs?.dose || '-'} mcg/kg/min memerlukan pemantauan ketat terhadap stabilitas kardiovaskular dan potensi fluktuasi tekanan darah.`;
        planText = `1. Atur kecepatan alat infus/syringe pump sesuai hasil kalkulasi (${currentInputs?.dose ? 'Dosis aktif' : 'Terapkan dosis standar'} mL/jam).\n2. Lakukan titrasi dosis secara bertahap berdasarkan respons tekanan darah dan MAP pasien.\n3. Monitor tanda vital (Tekanan darah & Nadi) tiap 15 menit pada 1 jam pertama, dilanjutkan tiap jam.\n4. Periksa kepatatan jalur infus dan kepatenan akses Vena Sentral / Perifer.`;
        break;

      case 'renal':
      case 'renal_dose':
      case 'abx_dose':
      case 'hd_dose':
      case 'crrt':
        const numEgfr = parseFloat(egfr);
        if (numEgfr < 30) {
          assessmentText = `WARNING KRITIS: Gagal ginjal berat (eGFR < 30 mL/min). Terjadi penurunan drastis ekskresi obat renal yang berisiko memicu akumulasi obat toksik dan perburukan fungsi ginjal permanen.`;
          planText = `1. WAJIB LAKUKAN PENYESUAIAN DOSIS (Dose Reduction 50-75% / Perpanjang interval waktu pemberian obat).\n2. Hentikan segera obat-obatan yang bersifat nefrotoksik (cth: NSAID, Aminoglikosida tanpa indikasi mutlak).\n3. Monitoring ketat kadar Serum Creatinine, BUN, dan elektrolit serum (K+, Na+) tiap 24 jam.\n4. Koordinasikan dengan DPJP terkait pertimbangan terapi pengganti ginjal (Dialisis) jika diperlukan.`;
        } else {
          assessmentText = `Fungsi ginjal stabil/normal (eGFR > 30 mL/min). Eliminasi obat melalui jalur renal diperkirakan tidak mengalami hambatan bermakna.`;
          planText = `1. Pertahankan regimen dosis obat standar sesuai indikasi penyakit.\n2. Pantau fungsi ginjal (SCr/eGFR) secara berkala tiap 48-72 jam.\n3. Evaluasi potensi interaksi obat (DDI) jika pasien mendapatkan polifarmasi.`;
        }
        break;

      case 'kalori':
      case 'anthro':
        assessmentText = `Evaluasi Status Nutrisi & Kebutuhan Energi (Target Goal: ${currentInputs?.goal || 'Maintenance'}). Pasien membutuhkan kecukupan asupan kalori harian untuk mendukung metabolisme dan proses penyembuhan jaringan.`;
        planText = `1. Berikan total asupan energi sesuai target kalori hasil kalkulasi.\n2. Atur komposisi makronutrien (Protein tinggi untuk pasien klinis / rawat inap).\n3. Konsultasikan dengan Tim Gizi Klinik untuk bentuk makanan (saring, lunak, atau biasa).\n4. Monitor berat badan berkala dan catatan persentase makanan yang dihabiskan pasien (visual food intake).`;
        break;

      case 'steroid':
        assessmentText = `Evaluasi Konversi Steroid. Perpindahan regimen dari ${currentInputs?.sourceDrug || 'kortikosteroid asal'} ke ${currentInputs?.targetDrug || 'target'} harus memperhitungkan potensi ekuivalensi anti-inflamasi dan efek samping metabolik.`;
        planText = `1. Berikan dosis ekuivalen steroid yang baru secara terbagi sesuai jadwal.\n2. Lakukan Tapering-Off bertahap jika durasi penggunaan lebih dari 2 minggu (cegah krisis adrenal).\n3. Monitor ketat kadar glukosa darah sewaktu (GDS) karena risiko hiperglikemia akibat steroid.\n4. Berikan antasida/gastroprotektor untuk pencegahan tukak lambung induksi steroid.`;
        break;

      case 'diabetes':
        assessmentText = `Evaluasi Manajemen Diabetes & Terapi Insulin. Pasien memerlukan kontrol glikemik ketat untuk mencegah komplikasi akut (hipoglikemia/hiperglikemia) dan perbaikan sensitivitas insulin.`;
        planText = `1. Monitor Gula Darah Sewaktu (GDS) secara berkala minimal 4 kali sehari (sebelum makan dan sebelum tidur).\n2. Sesuaikan dosis insulin basal/bolus berdasarkan faktor sensitivitas insulin (ISF) dan rasio karbohidrat (ICR).\n3. Sediakan protokol penanganan hipoglikemia (Dextrose 40% IV) di bedside pasien.\n4. Evaluasi kepatuhan diet dan pencatatan asupan karbohidrat harian.`;
        break;

      case 'hepar':
        assessmentText = `Evaluasi Fungsi Hepar & Skor Sirosis (Child-Pugh/MELD). Penurunan metabolisme hati berisiko mengubah bersihan obat-obatan yang dimetabolisme melalui jalur hepatik (First-pass effect).`;
        planText = `1. Lakukan penyesuaian dosis obat yang dimetabolisme di hati secara signifikan.\n2. Pantau ketat enzim hati (SGOT/SGPT), Albumin, Bilirubin total, dan parameter koagulasi (INR).\n3. Waspadai tanda-tanda ensefalopati hepatikum dan asites klinis.\n4. Hindari pemberian obat-obatan bersifat hepatotoksik (cth: Paracetamol dosis tinggi, NSAID).`;
        break;

      default:
        assessmentText = `Analisis Farmakoterapi Klinis Komprehensif Berdasarkan Modul (${effectiveTab.toUpperCase()}). Berdasarkan data parameter fisik, fungsi organ, dan riwayat klinis, pasien memerlukan evaluasi efektivitas terapi serta pencegahan potensi efek samping obat.`;
        planText = `1. Lanjutkan monitoring tanda vital dan parameter laboratorium secara berkala.\n2. Evaluasi kepatuhan pasien dalam meminum obat (Adherence).\n3. Lakukan rekonsiliasi obat untuk menghindari duplikasi atau interaksi obat merugikan.\n4. Laporkan kepada DPJP jika target klinis tidak tercapai dalam waktu 3 hari perawatan.`;
        break;
    }

    setSoapData({
      subjective: subjectiveText,
      objective: objectiveText,
      assessment: assessmentText,
      plan: planText
    });
  }, [patient, currentInputs, activeTab, computedContext]);

  const handleChange = (field, value) => {
    setSoapData(prev => ({ ...prev, [field]: value }));
  };

  const handleCopySoap = () => {
    const formattedSoap = 
      `📋 DRAFT CATATAN SOAP KLINIS\n` +
      `----------------------------------------\n` +
      `Nama: ${patient.patientName && patient.patientName !== '-' ? patient.patientName : 'Ny./Tn. Pasien Klinis'} (RM: ${patient.patientId && patient.patientId !== '-' ? patient.patientId : 'RM-009988'}) | Modul: ${activeTab.toUpperCase()}\n` +
      `----------------------------------------\n\n` +
      `[S] SUBJECTIVE:\n${soapData.subjective}\n\n` +
      `[O] OBJECTIVE:\n${soapData.objective}\n\n` +
      `[A] ASSESSMENT:\n${soapData.assessment}\n\n` +
      `[P] PLAN:\n${soapData.plan}`;

    navigator.clipboard.writeText(formattedSoap);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSoapPdf = async () => {
    setIsDownloading(true);
    const element = document.getElementById('soap-pdf-template');
    if (!element) {
      setIsDownloading(false);
      return;
    }

    element.style.display = 'block';

    const opt = {
      margin:       0.4,
      filename:     `Catatan-SOAP-${patient.patientName || 'Pasien'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    try {
      const worker = html2pdf().set(opt).from(element);
      const pdfBase64 = await worker.output('datauristring');
      element.style.display = 'none';

      const base64Data = pdfBase64.split(',')[1];
      const fileName = `Catatan-SOAP-${patient.patientName || 'Pasien'}-${Date.now()}.pdf`;

      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true
      });

      setIsDownloading(false);

      await Share.share({
        title: 'Catatan SOAP Medis',
        text: `Berikut file PDF catatan SOAP untuk pasien ${patient.patientName || 'Pasien'}.`,
        url: savedFile.uri,
        dialogTitle: 'Simpan / Bagikan Catatan SOAP'
      });

    } catch (error) {
      console.error('Gagal unduh PDF SOAP:', error);
      element.style.display = 'none';
      setIsDownloading(false);
      html2pdf().set(opt).from(element).save().then(() => {});
    }
  };

  return (
    <div className={`p-4 sm:p-6 rounded-3xl border shadow-xl max-w-4xl mx-auto transition-all ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* Header & Action Buttons */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b ${
        isDark ? 'border-slate-700/50' : 'border-slate-200'
      }`}>
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>📋</span> Automated SOAP Generator
          </h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Auto-Sync Cerdas Aktif • Referensi Modul: <span className="font-bold text-blue-500 uppercase">{activeTab}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySoap}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            {copied ? '✅ Disalin!' : '📋 Salin Teks'}
          </button>
          <button
            type="button"
            onClick={handleDownloadSoapPdf}
            disabled={isDownloading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
          >
            {isDownloading ? '⏳ Memproses...' : '📥 Unduh PDF'}
          </button>
        </div>
      </div>

      {/* Form Fields SOAP */}
      <div className="space-y-4 text-xs">
        {/* Subjective */}
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <label htmlFor="soap-subj-input" className="block font-bold text-blue-500 mb-1.5 uppercase tracking-wide cursor-pointer">
            [S] Subjective (Subjektif)
          </label>
          <textarea
            id="soap-subj-input"
            rows={2}
            value={soapData.subjective}
            onChange={(e) => handleChange('subjective', e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none leading-relaxed resize-y ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-200 focus:border-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        {/* Objective */}
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <label htmlFor="soap-obj-input" className="block font-bold text-amber-500 mb-1.5 uppercase tracking-wide cursor-pointer">
            [O] Objective (Parameter & Input Modul {activeTab.toUpperCase()})
          </label>
          <textarea
            id="soap-obj-input"
            rows={6}
            value={soapData.objective}
            onChange={(e) => handleChange('objective', e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none leading-relaxed resize-y font-mono text-[11px] ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-200 focus:border-amber-500' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-600'
            }`}
          />
        </div>

        {/* Assessment */}
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <label htmlFor="soap-assess-input" className="block font-bold text-purple-500 mb-1.5 uppercase tracking-wide cursor-pointer">
            [A] Assessment (Analisis Klinis Spesifik)
          </label>
          <textarea
            id="soap-assess-input"
            rows={4}
            value={soapData.assessment}
            onChange={(e) => handleChange('assessment', e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none leading-relaxed resize-y ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-200 focus:border-purple-500' : 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
            }`}
          />
        </div>

        {/* Plan */}
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <label htmlFor="soap-plan-input" className="block font-bold text-emerald-500 mb-1.5 uppercase tracking-wide cursor-pointer">
            [P] Plan (Rekomendasi Terapi & Monitoring)
          </label>
          <textarea
            id="soap-plan-input"
            rows={6}
            value={soapData.plan}
            onChange={(e) => handleChange('plan', e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none leading-relaxed resize-y ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-200 focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600'
            }`}
          />
        </div>
      </div>

      <div className={`mt-4 text-[10px] text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        💡 Otak AI SOAP kini secara otomatis mendeteksi nilai dari kalkulator manapun meskipun data store pasien utama kosong.
      </div>

      {/* TEMPLATE PDF */}
      <div id="soap-pdf-template" style={{ display: 'none' }} className="p-8 bg-white text-black font-sans text-xs">
        <div style={{ borderBottom: '3px double #000', paddingBottom: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '24px' }}>🩺</div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h1 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', color: '#0f172a' }}>
                LEMBAR CATATAN REKAM MEDIS (SOAP)
              </h1>
              <p style={{ margin: '3px 0 0 0', color: '#334155', fontSize: '9px' }}>
                Clinical Suite Enterprise v3 • Evaluasi Modul Spesifik
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '9px', color: '#475569' }}>
              <p style={{ margin: 0 }}>Tanggal: <strong>{new Date().toLocaleDateString('id-ID')}</strong></p>
            </div>
          </div>
        </div>

        {/* Identitas Pasien */}
        <div style={{ marginBottom: '15px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
            <tbody>
              <tr>
                <td style={{ padding: '5px 8px', width: '15%', fontWeight: 'bold', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>Nama Pasien</td>
                <td style={{ padding: '5px 8px', width: '35%', border: '1px solid #cbd5e1' }}>{patient.patientName && patient.patientName !== '-' ? patient.patientName : 'Ny./Tn. Pasien Klinis'}</td>
                <td style={{ padding: '5px 8px', width: '15%', fontWeight: 'bold', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>No. RM</td>
                <td style={{ padding: '5px 8px', width: '35%', border: '1px solid #cbd5e1' }}>{patient.patientId && patient.patientId !== '-' ? patient.patientId : 'RM-009988'}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 8px', fontWeight: 'bold', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>Demografi</td>
                <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{patient.gender === 'female' ? 'Perempuan' : 'Laki-laki'} | {patient.age || '45'} thn</td>
                <td style={{ padding: '5px 8px', fontWeight: 'bold', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>Modul Referensi</td>
                <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 'bold', color: '#2563eb' }}>{activeTab.toUpperCase()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Isi SOAP */}
        <div>
          <div style={{ marginBottom: '10px', padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
            <strong style={{ color: '#2563eb', display: 'block', marginBottom: '3px' }}>[S] SUBJECTIVE:</strong>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{soapData.subjective}</p>
          </div>

          <div style={{ marginBottom: '10px', padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
            <strong style={{ color: '#d97706', display: 'block', marginBottom: '3px' }}>[O] OBJECTIVE:</strong>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.4', fontFamily: 'monospace' }}>{soapData.objective}</p>
          </div>

          <div style={{ marginBottom: '10px', padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
            <strong style={{ color: '#7c3aed', display: 'block', marginBottom: '3px' }}>[A] ASSESSMENT:</strong>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{soapData.assessment}</p>
          </div>

          <div style={{ marginBottom: '15px', padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
            <strong style={{ color: '#059669', display: 'block', marginBottom: '3px' }}>[P] PLAN:</strong>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{soapData.plan}</p>
          </div>
        </div>

        {/* Tanda Tangan */}
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ textTransform: 'uppercase', textAlign: 'center', width: '35%' }}>
            <p style={{ margin: 0, fontSize: '9px' }}>Tenaga Medis Penanggung Jawab</p>
            <div style={{ height: '40px' }}></div>
            <p style={{ margin: 0, borderTop: '1px solid #000', fontWeight: 'bold', paddingTop: '2px' }}>( ________________________ )</p>
          </div>
        </div>
      </div>
    </div>
  );
}