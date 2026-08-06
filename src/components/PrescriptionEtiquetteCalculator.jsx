import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';
import html2pdf from 'html2pdf.js';

export default function PrescriptionEtiquetteCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL PASIEN & DAFTAR OBAT AKTIF DARI STORE V3
  const { patient, medications } = usePatientStore();

  // BACA INFO HOSPITAL UNTUK KOP ETIKET
  const [hospitalInfo, setHospitalInfo] = useState({
    name: 'APOTEK RUMAH SAKIT CLINICAL SUITE',
    address: 'Instalasi Farmasi • Telp: (021) 555-0199'
  });

  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const savedRS = localStorage.getItem('clinical_suite_hospital_info_v3');
    if (savedRS) {
      try {
        const parsed = JSON.parse(savedRS);
        setHospitalInfo({
          name: parsed.name || 'APOTEK RUMAH SAKIT CLINICAL SUITE',
          address: parsed.address || 'Instalasi Farmasi • Telp: (021) 555-0199'
        });
      } catch (e) {
        // Fallback default
      }
    }
  }, []);

  const [patientNameInput, setPatientNameInput] = useState(patient.patientName || 'Ny. Siti Aminah');
  const [drugName, setDrugName] = useState('Paracetamol 500 mg Tab');
  const [signdose, setSigndose] = useState('3 kali sehari 1 tablet');
  const [rules, setRules] = useState('Sesudah makan');

  // Sync jika pasien di store berubah
  useEffect(() => {
    if (patient.patientName) {
      setPatientNameInput(patient.patientName);
    }
  }, [patient.patientName]);

  const handleDownloadEtiquettePDF = () => {
    const element = document.getElementById('etiquette-card-target');
    if (!element) return;
    
    setIsExporting(true);
    element.style.display = 'block';

    const opt = {
      margin:       0.3,
      filename:     `Etiket-Obat-${patientNameInput.replace(/\s+/g, '-')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: [4, 3], orientation: 'landscape' }
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        element.style.display = 'none';
        setIsExporting(false);
      })
      .catch((err) => {
        console.error('Export Error:', err);
        element.style.display = 'none';
        setIsExporting(false);
      });
  };

  return (
    <div className="space-y-6 text-xs">
      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className={`flex justify-between items-center mb-3 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <h3 className="font-bold text-sm text-blue-500 flex items-center gap-2">
            <span>🖨️</span> Cetak & Download Etiket / Resep Obat (v3)
          </h3>
          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold border border-blue-500/20">
            STORE SYNCED
          </span>
        </div>

        <p className={`text-[11px] mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Sesuaikan informasi etiket obat oral atau luar sebelum di-download ke format PDF siap cetak.
        </p>

        {/* PILIH DARI REKAM MEDIS AKTIF JIKA ADA */}
        {medications && medications.length > 0 && (
          <div className={`mb-4 p-3 rounded-xl border ${
            isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'
          }`}>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block mb-1">💡 Pilih dari Obat Aktif Pasien:</span>
            <div className="flex flex-wrap gap-1.5">
              {medications.map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setDrugName(m.name);
                    if (m.frequency) setSigndose(m.frequency);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] border transition-all cursor-pointer ${
                    isDark
                      ? 'bg-slate-800 hover:bg-blue-600 text-white border-slate-700'
                      : 'bg-white hover:bg-blue-600 hover:text-white text-slate-800 border-slate-300'
                  }`}
                >
                  + {m.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="etiq-patient-name" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Nama Pasien
            </label>
            <input
              id="etiq-patient-name"
              type="text"
              value={patientNameInput}
              onChange={(e) => setPatientNameInput(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${
                isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
              }`}
            />
          </div>

          <div>
            <label htmlFor="etiq-drug-name" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Nama Obat & Kekuatan
            </label>
            <input
              id="etiq-drug-name"
              type="text"
              value={drugName}
              onChange={(e) => setDrugName(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${
                isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
              }`}
            />
          </div>

          <div>
            <label htmlFor="etiq-signdose" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Aturan Pakai (Signa)
            </label>
            <input
              id="etiq-signdose"
              type="text"
              value={signdose}
              onChange={(e) => setSigndose(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${
                isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
              }`}
            />
          </div>

          <div>
            <label htmlFor="etiq-rules" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Keterangan Tambahan
            </label>
            <input
              id="etiq-rules"
              type="text"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${
                isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
              }`}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleDownloadEtiquettePDF}
            disabled={isExporting}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all flex items-center gap-2 text-xs cursor-pointer"
          >
            {isExporting ? '⌛ Menyiapkan PDF...' : '📥 Download Etiket Obat (PDF)'}
          </button>
        </div>
      </div>

      {/* HIDDEN TEMPLATE UNTUK DOWNLOAD PDF ETIKET */}
      <div id="etiquette-card-target" style={{ display: 'none' }} className="p-4 bg-white text-black font-sans border-2 border-dashed border-slate-400 rounded-lg max-w-sm">
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '6px', marginBottom: '8px' }}>
          <h4 style={{ fontSize: '11px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{hospitalInfo.name}</h4>
          <p style={{ fontSize: '8px', margin: '2px 0 0 0' }}>{hospitalInfo.address}</p>
        </div>

        <div style={{ fontSize: '9px', marginBottom: '8px' }}>
          <p style={{ margin: '2px 0' }}>No. R/ : <strong>{Math.floor(Math.random() * 89999 + 10000)}</strong> | Tgl: {new Date().toLocaleDateString('id-ID')}</p>
          <p style={{ margin: '2px 0' }}>Pasien: <strong>{patientNameInput}</strong> {patient.patientId ? `(RM: ${patient.patientId})` : ''}</p>
        </div>

        <div style={{ textAlign: 'center', background: '#f1f5f9', padding: '8px', borderRadius: '4px', margin: '8px 0', border: '1px solid #cbd5e1' }}>
          <p style={{ fontSize: '11px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1e293b' }}>{signdose}</p>
          <p style={{ fontSize: '9px', margin: 0, fontStyle: 'italic', color: '#475569' }}>({rules})</p>
        </div>

        <div style={{ fontSize: '9px', fontWeight: 'bold', textAlign: 'center', marginTop: '6px', borderTop: '1px dashed #cbd5e1', paddingTop: '4px' }}>
          <span>{drugName}</span>
          <p style={{ fontSize: '7px', fontWeight: 'normal', color: '#64748b', margin: '2px 0 0 0' }}>Harap Habiskan Sesuai Petunjuk Dokter / Apoteker</p>
        </div>
      </div>
    </div>
  );
}