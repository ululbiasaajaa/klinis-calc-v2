import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function PrescriptionEtiquetteCalculator() {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL DATA PASIEN GLOBAL DAN DISPATCHERS V3
  const { patient, addMedication, addLabRecord } = usePatientStore();

  // State Formulir Etiket / Resep
  const [medInfo, setMedInfo] = useState({
    drugName: 'Paracetamol 500mg Tab',
    signa: '3 x sehari 1 tablet sesudah makan',
    type: 'white', // 'white' (obat dalam) or 'blue' (obat luar)
    qty: '10 Tab',
    expDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // default 30 hari
    notes: 'Kocok dahulu / Simpan pada suhu ruang',
    patientNameOverride: '',
  });

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Auto-sync nama pasien dari Patient Context Bar
  useEffect(() => {
    if (patient && patient.patientName) {
      setMedInfo((prev) => ({
        ...prev,
        patientNameOverride: patient.patientName
      }));
    }
  }, [patient]);

  const handleChange = (e) => {
    setMedInfo({ ...medInfo, [e.target.name]: e.target.value });
  };

  // Handler Print Khusus Label Etiket
  const handlePrintLabel = () => {
    const printContent = document.getElementById('pharmacy-label-print');
    const win = window.open('', '', 'width=600,height=600');
    win.document.write(`
      <html>
        <head>
          <title>Cetak Etiket Obat</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 10px; margin: 0; }
            .label-card {
              width: 320px;
              border: 2px solid ${medInfo.type === 'white' ? '#1e293b' : '#1d4ed8'};
              padding: 12px;
              border-radius: 8px;
              background-color: ${medInfo.type === 'white' ? '#ffffff' : '#eff6ff'};
              color: #0f172a;
            }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 8px; }
            .header h4 { margin: 0; font-size: 13px; text-transform: uppercase; font-weight: bold; }
            .header p { margin: 2px 0 0 0; font-size: 9px; color: #475569; }
            .type-badge {
              text-align: center;
              font-size: 10px;
              font-weight: bold;
              padding: 3px;
              margin-bottom: 8px;
              background-color: ${medInfo.type === 'white' ? '#f1f5f9' : '#3b82f6'};
              color: ${medInfo.type === 'white' ? '#0f172a' : '#ffffff'};
              border-radius: 4px;
            }
            .row { font-size: 11px; margin-bottom: 6px; display: flex; justify-content: space-between; }
            .signa-box {
              border: 1px solid #000;
              background: #f8fafc;
              padding: 8px;
              text-align: center;
              font-size: 14px;
              font-weight: bold;
              margin: 8px 0;
              border-radius: 6px;
            }
            .footer { font-size: 9px; display: flex; justify-content: space-between; margin-top: 10px; border-top: 1px solid #cbd5e1; padding-top: 4px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // HANDLER DOWNLOAD ETIKET VERSUS PDF
  const handleDownloadPdf = async () => {
    const element = document.getElementById('pharmacy-label-print');
    if (!element) return;

    try {
      setIsExportingPdf(true);
      const canvas = await html2canvas(element, {
        scale: 3, // High DPI rendering
        useCORS: true,
        backgroundColor: null
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Ukuran Etiket Standar Thermal (80mm x 50mm)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [80, 50]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 80, 50);
      
      const safePatientName = (medInfo.patientNameOverride || 'Umum').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`Etiket_${safePatientName}_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('❌ Gagal mengunduh PDF etiket. Silakan coba lagi.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // HANDLER AKSI V3 DISPATCHERS
  const handleAddToMedications = () => {
    addMedication({
      name: medInfo.drugName,
      dose: `${medInfo.signa} (${medInfo.qty})`,
      category: medInfo.type === 'white' ? 'Obat Dalam / Oral' : 'Obat Luar / Topikal',
      source: `Etiket Apotek • BUD: ${medInfo.expDate}`
    });
    alert(`✅ Obat (${medInfo.drugName}) berhasil ditambahkan ke regimen obat aktif pasien!`);
  };

  const handleSaveToTracker = () => {
    addLabRecord({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: 'Dispensing Etiket Apotek',
      value: `${medInfo.drugName} - ${medInfo.signa} (Qty: ${medInfo.qty})`,
      unit: 'Label',
      source: `Tipe: ${medInfo.type === 'white' ? 'Obat Dalam' : 'Obat Luar'} | BUD: ${medInfo.expDate}`
    });
    alert(`✅ Rekam Dispensing Etiket berhasil disimpan ke Outcome Tracker Pasien!`);
  };

  return (
    <div className="space-y-6 text-xs">
      
      {patient?.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Nama pasien otomatis masuk ke etiket resep.</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">STORE V3 SYNCED</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* INPUT TIPE ETIKET */}
        <div>
          <label htmlFor="label-type-select" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Tipe Etiket (Jalur Obat)' : 'Label Type (Route)'}
          </label>
          <select
            id="label-type-select"
            name="type"
            value={medInfo.type}
            onChange={handleChange}
            className={`w-full p-3 rounded-xl border outline-none text-xs font-bold cursor-pointer ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          >
            <option value="white">⚪ Etiket Putih (OBAT DALAM / ORAL)</option>
            <option value="blue">🔵 Etiket Biru (OBAT LUAR / TOPIKAL / TETES)</option>
          </select>
        </div>

        {/* NAMA PASIEN DI ETIKET */}
        <div>
          <label htmlFor="patient-name-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Nama Pasien pada Etiket' : 'Patient Name on Label'}
          </label>
          <input
            id="patient-name-input"
            type="text"
            name="patientNameOverride"
            value={medInfo.patientNameOverride}
            onChange={handleChange}
            placeholder="e.g. Ny. Siti Aminah"
            className={`w-full p-3 rounded-xl border outline-none text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        {/* NAMA OBAT */}
        <div>
          <label htmlFor="drug-name-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Nama Obat & Sediaan' : 'Medication Name & Form'}
          </label>
          <input
            id="drug-name-input"
            type="text"
            name="drugName"
            value={medInfo.drugName}
            onChange={handleChange}
            placeholder="e.g. Amoxicillin 500mg Cap"
            className={`w-full p-3 rounded-xl border outline-none text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        {/* ATURAN PAKAI (SIGNA) */}
        <div>
          <label htmlFor="signa-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Aturan Pakai / Signa' : 'Directions / Signa'}
          </label>
          <input
            id="signa-input"
            type="text"
            name="signa"
            value={medInfo.signa}
            onChange={handleChange}
            placeholder="e.g. 3 x sehari 1 kapsul sesudah makan"
            className={`w-full p-3 rounded-xl border outline-none text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        {/* JUMLAH / QTY */}
        <div>
          <label htmlFor="qty-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Jumlah Obat (Qty)' : 'Quantity (Qty)'}
          </label>
          <input
            id="qty-input"
            type="text"
            name="qty"
            value={medInfo.qty}
            onChange={handleChange}
            placeholder="e.g. 10 Tablet / 1 Botol"
            className={`w-full p-3 rounded-xl border outline-none text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        {/* EXP / BEYOND USE DATE */}
        <div>
          <label htmlFor="exp-date-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Batas Kadaluarsa (BUD / Expired)' : 'Beyond Use Date (BUD)'}
          </label>
          <input
            id="exp-date-input"
            type="date"
            name="expDate"
            value={medInfo.expDate}
            onChange={handleChange}
            className={`w-full p-3 rounded-xl border outline-none text-xs font-semibold cursor-pointer ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        {/* CATATAN KHUSUS */}
        <div className="md:col-span-2">
          <label htmlFor="notes-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Peringatan Khusus / Instruksi' : 'Special Instruction'}
          </label>
          <input
            id="notes-input"
            type="text"
            name="notes"
            value={medInfo.notes}
            onChange={handleChange}
            placeholder="e.g. Harus dihabiskan / Simpan di kulkas"
            className={`w-full p-3 rounded-xl border outline-none text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>
      </div>

      {/* PREVIEW TAMPILAN ETIKET OBAT AKAN DICETAK */}
      <div className={`border p-4 rounded-2xl ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h4 className={`text-xs font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          <span>🏷️</span> Preview Etiket Obat Standar Rumah Sakit / Apotek:
        </h4>

        <div className="flex justify-center">
          <div
            id="pharmacy-label-print"
            className={`w-80 p-4 rounded-xl border-2 text-slate-900 shadow-xl transition-all ${
              medInfo.type === 'white'
                ? 'bg-white border-slate-300'
                : 'bg-blue-50 border-blue-500'
            }`}
          >
            {/* KOP ETIKET */}
            <div className="text-center border-b-2 border-slate-800 pb-2 mb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                APOTEK CLINICAL SUITE
              </h4>
              <p className="text-[9px] text-slate-600">
                SIA: 449/APT/2026 • Telp: (021) 555-0199
              </p>
            </div>

            {/* BADGE OBAT DALAM / LUAR */}
            <div
              className={`text-center text-[10px] font-extrabold py-1 rounded mb-2 uppercase ${
                medInfo.type === 'white'
                  ? 'bg-slate-100 text-slate-800 border border-slate-300'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {medInfo.type === 'white' ? '⚪ OBAT DALAM' : '🔵 OBAT LUAR (TIDAK BOLEH DITELAN)'}
            </div>

            {/* INFO PASIEN & OBAT */}
            <div className="text-[11px] space-y-1 mb-2">
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span>Pasien: <strong>{medInfo.patientNameOverride || 'Umum / Tanpa Nama'}</strong></span>
                <span>Tgl: <strong>{new Date().toLocaleDateString('id-ID')}</strong></span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1 pt-1">
                <span>Qty: <strong>{medInfo.qty || '-'}</strong></span>
              </div>
              <div className="font-bold text-xs text-slate-900 pt-1">
                {medInfo.drugName || 'Nama Obat'}
              </div>
            </div>

            {/* SIGNA ATURAN PAKAI */}
            <div className="bg-slate-100 border border-slate-300 rounded-lg p-2.5 text-center my-2">
              <span className="text-[9px] text-slate-500 block uppercase font-semibold">Aturan Pakai:</span>
              <span className="text-xs font-extrabold text-blue-900 block mt-0.5">
                {medInfo.signa || 'Aturan Pakai Obat'}
              </span>
            </div>

            {/* CATATAN & BUD */}
            <div className="text-[9px] text-slate-600 flex justify-between items-end border-t border-slate-200 pt-2">
              <div>
                <span className="block font-semibold text-slate-800">{medInfo.notes}</span>
                <span>BUD/ED: <strong>{medInfo.expDate || '-'}</strong></span>
              </div>
              <div className="text-[8px] bg-slate-200 px-1.5 py-0.5 rounded font-mono">
                R/VERIFIED
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOMBOL AKSI, DOWNLOAD PDF, & CETAK ETIKET */}
      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={handleSaveToTracker}
          className={`font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-2 border ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-blue-700 border-slate-300'
          }`}
        >
          📈 Simpan Dispensing ke Tracker
        </button>
        <button
          type="button"
          onClick={handleAddToMedications}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          ➕ Tambahkan Obat ke Regimen Pasien
        </button>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isExportingPdf}
          className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg cursor-pointer flex items-center gap-2"
        >
          {isExportingPdf ? '⌛ Mengunduh PDF...' : '📄 Unduh PDF Etiket'}
        </button>
        <button
          type="button"
          onClick={handlePrintLabel}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg cursor-pointer flex items-center gap-2"
        >
          🖨️ Cetak Etiket Obat Spooler (Thermal / Stiker)
        </button>
      </div>
    </div>
  );
}