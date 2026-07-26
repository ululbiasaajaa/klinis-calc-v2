import React, { useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function HospitalHeader({ hospitalInfo, setHospitalInfo }) {
  const fileInputRef = useRef(null);
  const { t } = useLanguage();

  const handleChange = (e) => {
    setHospitalInfo({ ...hospitalInfo, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran gambar terlalu besar! Maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setHospitalInfo({ ...hospitalInfo, logoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setHospitalInfo({ ...hospitalInfo, logoUrl: '' });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 md:p-5 rounded-2xl mb-6 shadow-md">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
          <span>🏢</span> {t.hospitalSettings}
        </h3>
        <span className="text-[10px] text-blue-400 font-semibold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50">
          {t.hospitalCustomization}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-slate-400 mb-1 font-semibold">{t.hospitalNameLabel}</label>
          <input
            type="text"
            name="name"
            value={hospitalInfo.name}
            onChange={handleChange}
            placeholder="e.g. RSUD GENERAL HOSPITAL"
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-semibold">{t.hospitalAddressLabel}</label>
          <input
            type="text"
            name="address"
            value={hospitalInfo.address}
            onChange={handleChange}
            placeholder="e.g. Jl. Kesehatan No. 123, Telp: (021) 555-019"
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-semibold">{t.hospitalLogoLabel}</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoUpload}
            accept="image/*"
            className="hidden"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current.click()}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold w-full text-left truncate transition-all flex items-center justify-between"
            >
              <span>{hospitalInfo.logoUrl ? t.logoUploaded : t.uploadLogo}</span>
              <span className="text-[10px] text-slate-400">{t.chooseFile}</span>
            </button>

            {hospitalInfo.logoUrl && (
              <button
                onClick={handleRemoveLogo}
                className="bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/60 px-2.5 py-2 rounded-xl text-xs font-bold"
                title="Hapus Logo"
              >
                ✖
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}