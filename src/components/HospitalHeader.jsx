import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function HospitalHeader({ hospitalInfo: propsInfo, setHospitalInfo: propsSetInfo }) {
  const fileInputRef = useRef(null);
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // 1. BACKWARD & STANDALONE COMPATIBILITY (State Lokal dengan LocalStorage)
  const [localInfo, setLocalInfo] = useState(() => {
    const saved = localStorage.getItem('clinical_suite_hospital_info_v3');
    return saved ? JSON.parse(saved) : {
      name: 'RSUD GENERAL HOSPITAL ENTERPRISE',
      address: 'Jl. Kesehatan No. 123, Telp: (021) 555-019',
      logoUrl: ''
    };
  });

  // Gunakan props jika ada, jika tidak gunakan local state
  const hospitalInfo = propsInfo || localInfo;

  // Sync propsInfo ke localStorage jika ada pembaruan dari parent
  useEffect(() => {
    if (propsInfo) {
      localStorage.setItem('clinical_suite_hospital_info_v3', JSON.stringify(propsInfo));
    }
  }, [propsInfo]);

  const updateHospitalInfo = (newInfo) => {
    if (propsSetInfo) {
      propsSetInfo(newInfo);
    } else {
      setLocalInfo(newInfo);
    }
    localStorage.setItem('clinical_suite_hospital_info_v3', JSON.stringify(newInfo));
  };

  const handleChange = (e) => {
    const newInfo = { ...hospitalInfo, [e.target.name]: e.target.value };
    updateHospitalInfo(newInfo);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran gambar terlalu besar! Maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newInfo = { ...hospitalInfo, logoUrl: reader.result };
        updateHospitalInfo(newInfo);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    const newInfo = { ...hospitalInfo, logoUrl: '' };
    updateHospitalInfo(newInfo);
  };

  return (
    <div className={`p-5 rounded-2xl mb-6 border transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* SECTION TITLE */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700/40">
        <div className="flex items-center gap-2">
          <span className="text-base">🏢</span>
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {t?.hospitalSettings || 'Pengaturan Kop & Logo Rumah Sakit (v3)'}
          </h3>
        </div>
        <span className="text-[10px] text-blue-500 font-semibold bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
          {t?.hospitalCustomization || 'Kop Laporan PDF Autentik'}
        </span>
      </div>

      {/* CLEAN INPUT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        
        {/* NAMA RS */}
        <div className="space-y-1.5">
          <label htmlFor="hospital-name-input" className={`block font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t?.hospitalNameLabel || 'Nama Instansi / Rumah Sakit'}
          </label>
          <input
            id="hospital-name-input"
            type="text"
            name="name"
            value={hospitalInfo.name || ''}
            onChange={handleChange}
            placeholder="e.g. RSUD GENERAL HOSPITAL"
            className={`w-full p-3 rounded-xl border outline-none font-medium transition-colors ${
              isDark 
                ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-600' 
                : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        {/* ALAMAT RS */}
        <div className="space-y-1.5">
          <label htmlFor="hospital-address-input" className={`block font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t?.hospitalAddressLabel || 'Alamat & Kontak Instansi'}
          </label>
          <input
            id="hospital-address-input"
            type="text"
            name="address"
            value={hospitalInfo.address || ''}
            onChange={handleChange}
            placeholder="e.g. Jl. Kesehatan No. 123, Telp: (021) 555-019"
            className={`w-full p-3 rounded-xl border outline-none font-medium transition-colors ${
              isDark 
                ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-600' 
                : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        {/* LOGO UPLOAD SECTION */}
        <div className="space-y-1.5">
          <label id="hospital-logo-label" className={`block font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t?.hospitalLogoLabel || 'Logo Resmi Instansi (PNG/JPG)'}
          </label>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoUpload}
            accept="image/*"
            className="hidden"
            aria-labelledby="hospital-logo-label"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 p-3 rounded-xl border text-left truncate transition-all flex items-center justify-between font-semibold cursor-pointer ${
                isDark 
                  ? 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-200' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              <span className="truncate">
                {hospitalInfo.logoUrl ? (t?.logoUploaded || '✓ Logo Terpasang') : (t?.uploadLogo || 'Upload Logo Instansi')}
              </span>
              <span className="text-[10px] opacity-60 ml-2 shrink-0">{t?.chooseFile || 'Pilih File'}</span>
            </button>

            {hospitalInfo.logoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="bg-red-600 hover:bg-red-500 text-white p-3 rounded-xl font-bold transition-all shrink-0 shadow-sm cursor-pointer"
                title="Hapus Logo"
              >
                🗑
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}