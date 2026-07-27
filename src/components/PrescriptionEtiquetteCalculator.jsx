import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import html2pdf from 'html2pdf.js';

export default function PrescriptionEtiquetteCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [patientName, setPatientName] = useState('Ny. Siti Aminah');
  const [drugName, setDrugName] = useState('Paracetamol 500 mg Tab');
  const [signdose, setSigndose] = useState('3 kali sehari 1 tablet');
  const [rules, setRules] = useState('Sesudah makan');
  const [etiquetteType, setEtiquetteType] = useState('oral'); // oral / external

  const handleDownloadEtiquettePDF = () => {
    const element = document.getElementById('etiquette-card-target');
    element.style.display = 'block';

    const opt = {
      margin:       0.3,
      filename:     `Etiket-Obat-${patientName.replace(/\s+/g, '-')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: [4, 3], orientation: 'landscape' } // Ukuran pas untuk etiket obat
    };

    html2pdf().set(opt).from(element).save().then(() => {
      element.style.display = 'none';
    });
  };

  return (
    <div className="space-y-6 text-xs">
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="font-bold text-blue-500 mb-2">🖨️ Cetak & Download Etiket / Resep Obat</h3>
        <p className="text-slate-400 text-[11px] mb-4">
          Sesuaikan informasi etiket obat oral atau luar sebelum di-download ke format file cetak.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold text-slate-300">Nama Pasien</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-slate-300">Nama Obat & Kekuatan</label>
            <input
              type="text"
              value={drugName}
              onChange={(e) => setDrugName(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-slate-300">Aturan Pakai (Signa)</label>
            <input
              type="text"
              value={signdose}
              onChange={(e) => setSigndose(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-slate-300">Keterangan Tambahan</label>
            <input
              type="text"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleDownloadEtiquettePDF}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all flex items-center gap-2 text-xs"
          >
            📥 Download Etiket Obat (PDF)
          </button>
        </div>
      </div>

      {/* HIDDEN TEMPLATE UNTUK DOWNLOAD PDF ETIKET */}
      <div id="etiquette-card-target" style={{ display: 'none' }} className="p-4 bg-white text-black font-sans border-2 border-dashed border-slate-400 rounded-lg max-w-sm">
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '6px', marginBottom: '8px' }}>
          <h4 style={{ fontSize: '11px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>APOTEK RUMAH SAKIT CLINICAL SUITE</h4>
          <p style={{ fontSize: '8px', margin: '2px 0 0 0' }}>Instalasi Farmasi • Telp: (021) 555-0199</p>
        </div>

        <div style={{ fontSize: '9px', marginBottom: '8px' }}>
          <p style={{ margin: '2px 0' }}>No. R/ : <strong>{Math.floor(Math.random() * 89999 + 10000)}</strong> | Tgl: {new Date().toLocaleDateString('id-ID')}</p>
          <p style={{ margin: '2px 0' }}>Pasien: <strong>{patientName}</strong></p>
        </div>

        <div style={{ textAlign: 'center', background: '#f1f5f9', padding: '8px', borderRadius: '4px', margin: '8px 0', border: '1px solid #cbd5e1' }}>
          <p style={{ fontSize: '11px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1e293b' }}>{signdose}</p>
          <p style={{ fontSize: '9px', margin: 0, fontStyle: 'italic', color: '#475569' }}>({rules})</p>
        </div>

        <div style={{ fontSize: '9px', fontWeight: 'bold', textAlign: 'center', marginTop: '6px', borderTop: '1px dashed #cbd5e1', paddingTop: '4px' }}>
          <span>{drugName}</span>
          <p style={{ fontSize: '7px', fontWeight: 'normal', color: '#64748b', margin: '2px 0 0 0' }}>Harap Habiskan Sesuai Petunjuk Dokter</p>
        </div>
      </div>
    </div>
  );
}