import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function DrugScannerModal({ isOpen, onClose, onScanResult }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const videoRef = useRef(null);

  // AMBIL AKSES TAMBAH OBAT KE STORE V3 SEBAGAI SINGLE SOURCE OF TRUTH
  const { addMedication, patient } = usePatientStore();

  const startCamera = async () => {
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Gagal mengakses kamera: ' + err.message);
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
    }
    setScanning(false);
  };

  // EVENT LISTENER: TUTUP MODAL DENGAN TOMBOL ESCAPE
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        stopCamera();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopCamera();
    };
  }, [isOpen, onClose]);

  // Simulasi hasil scan cerdas & Auto-Push ke Store v3 Pasien
  const simulateScan = () => {
    const mockDrugs = [
      { name: 'Paracetamol 500mg Tablet', category: 'Analgesik / Antipiretik', dose: '500', unit: 'mg', route: 'Oral', frequency: 'q8h', warning: 'Max 4g/hari' },
      { name: 'Amlodipine 10mg Tablet', category: 'Antihipertensi (CCB)', dose: '10', unit: 'mg', route: 'Oral', frequency: 'q24h', warning: 'Monitoring TD & Edema' },
      { name: 'Furosemide 40mg Tablet', category: 'Diuretik Loop', dose: '40', unit: 'mg', route: 'Oral', frequency: 'q12h', warning: 'Periksa elektrolit & fungsi ginjal' },
      { name: 'Ceftriaxone 1g Vial', category: 'Antibiotik Sefalosporin', dose: '1', unit: 'g', route: 'IV', frequency: 'q24h', warning: 'Uji alergi / skin test wajib' },
      { name: 'Vancomycin 500mg Vial', category: 'Antibiotik Glycopeptide', dose: '1000', unit: 'mg', route: 'IV', frequency: 'q12h', warning: 'Monitor TDM Trough & SCr Pasien' }
    ];
    
    const randomDrug = mockDrugs[Math.floor(Math.random() * mockDrugs.length)];
    setScannedResult(randomDrug);
    stopCamera();

    // AUTO-PUSH KE SINGLE SOURCE OF TRUTH PASIEN V3
    addMedication({
      name: randomDrug.name,
      dose: randomDrug.dose,
      unit: randomDrug.unit,
      category: randomDrug.category,
      route: randomDrug.route,
      frequency: randomDrug.frequency,
      source: 'Barcode Scanner v3'
    });

    if (onScanResult) onScanResult(randomDrug);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-fadeIn"
      onClick={() => { stopCamera(); onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="scanner-modal-title"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`border p-6 rounded-3xl max-w-md w-full shadow-2xl relative transition-all ${
          isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
        }`}
      >
        <button 
          type="button"
          onClick={() => { stopCamera(); onClose(); }} 
          className={`absolute top-4 right-4 font-bold text-lg cursor-pointer transition-all ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-label="Tutup Modal"
        >
          ✖
        </button>

        <div className="flex items-center gap-2 mb-2 text-emerald-500">
          <span className="text-2xl">📸</span>
          <div>
            <h3 id="scanner-modal-title" className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Scanner Obat & Auto-Sync (v3)
            </h3>
            <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Pasien Aktif: {patient?.patientName || 'Umum'} (RM: {patient?.patientId || '-'})
            </span>
          </div>
        </div>

        <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Arahkan kamera ke kemasan obat / barcode untuk menambahkan obat secara instan ke rekam medis & engine DDI.
        </p>

        {/* Area Tampilan Kamera / Preview */}
        <div className={`relative w-full h-64 rounded-2xl overflow-hidden border flex items-center justify-center mb-4 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'
        }`}>
          {!scanning ? (
            <div className="text-center p-6">
              <span className="text-4xl block mb-2">📷</span>
              <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Kamera belum aktif</p>
              <button
                type="button"
                onClick={startCamera}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all shadow-lg cursor-pointer"
              >
                Nyalakan Kamera
              </button>
            </div>
          ) : (
            <div className="w-full h-full relative">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              {/* Garis Scanner Animasi */}
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-500 shadow-[0_0_15px_#10b981] animate-pulse"></div>
              <div className="absolute bottom-4 inset-x-4 text-center">
                <button
                  type="button"
                  onClick={simulateScan}
                  className="bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl text-xs backdrop-blur shadow-lg border border-emerald-400/30 cursor-pointer"
                >
                  🔍 Tangkap / Scan Barcode
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hasil Scan & Status Store */}
        {scannedResult && (
          <div className={`p-4 rounded-2xl border text-xs space-y-1.5 animate-fadeIn ${
            isDark 
              ? 'bg-emerald-950/40 border-emerald-800/50 text-slate-200' 
              : 'bg-emerald-50 border-emerald-200 text-slate-800'
          }`}>
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">✅ Obat Dideteksi & Disimpan:</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                AUTO-SYNCED TO V3
              </span>
            </div>
            <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{scannedResult.name}</p>
            <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>Kategori: <strong>{scannedResult.category}</strong></p>
            <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>Regimen: <strong>{scannedResult.dose} {scannedResult.unit} ({scannedResult.route}) - {scannedResult.frequency}</strong></p>
            <p className="text-amber-600 dark:text-amber-400 mt-1 font-medium">⚠️ Catatan: {scannedResult.warning}</p>
          </div>
        )}
      </div>
    </div>
  );
}