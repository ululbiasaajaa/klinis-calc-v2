import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({
  menuItems,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  isSidebarOpen,
  setIsSidebarOpen,
}) {
  const { lang, toggleLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // State untuk mengontrol akordion kategori yang sedang terbuka
  const [openCategories, setOpenCategories] = useState({
    'Utama': true,
    'Dosis & Obat': true,
    'Organ & Fungsi': false,
    'Fisiologi & Cairan': false,
    'Nutrisi & Energi': false
  });

  const toggleCategory = (cat) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const labelMap = {
    pk: t.navPk,
    drip: t.navDrip,
    peds_geri: t.navPedsGeri,
    stopp_start: t.navStoppStart,
    crrt: t.navCrrt,
    electro: t.navElectro,
    ards: t.navArds,
    pregnancy: t.navPregnancy,
    renal_dose: t.navRenalDose,
    label_print: t.navLabelPrint,
    hd_dose: t.navHdDose,
    steroid: t.navSteroid,
    nti: t.navNti,
    tdm_chart: t.navTdmChart,
    ddi: t.navDdi,
    renal: t.navRenal,
    anthro: t.navAnthro,
    kalori: t.navKalori,
  };

  // Filter item berdasarkan pencarian
  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Grouping menu berdasarkan kategori
  const categories = ['Utama', 'Dosis & Obat', 'Organ & Fungsi', 'Fisiologi & Cairan', 'Nutrisi & Energi'];
  
  const groupedMenu = categories.reduce((acc, cat) => {
    acc[cat] = filteredItems.filter(item => item.category === cat);
    return acc;
  }, {});

  return (
    <>
      {/* BACKDROP GELAP KHUSUS MOBILE SAAT SIDEBAR BUKA */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 p-4 transform transition-transform duration-300 ease-in-out flex flex-col justify-between select-none shadow-2xl md:shadow-none ${
          isDark 
            ? 'bg-slate-900 border-r border-slate-800 text-slate-100' 
            : 'bg-white border-r border-slate-200 text-slate-800'
        } ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* LOGO BRAND + TOGGLE LANG & THEME */}
          <div className="flex justify-between items-center mb-4 px-1 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">🩺</span>
              <div>
                <h1 className={`font-bold text-sm leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Clinical Suite
                </h1>
                <span className="text-[9px] text-blue-500 font-semibold tracking-wider">ENTERPRISE v2.8</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleTheme}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all border ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400' 
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                }`}
                title="Ganti Tema (Dark / Light)"
              >
                {isDark ? '🌙' : '☀️'}
              </button>
              <button
                onClick={toggleLang}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all border ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' 
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                }`}
                title="Ganti Bahasa"
              >
                <span>{lang === 'id' ? '🇮🇩' : '🇬🇧'}</span>
              </button>

              {/* TOMBOL CLOSE KHUSUS MOBILE DI DALAM SIDEBAR */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className={`md:hidden p-1.5 rounded-lg text-xs font-bold border ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                ✕
              </button>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="mb-3 shrink-0">
            <input
              type="text"
              placeholder={lang === 'id' ? "🔍 Cari modul / kalkulator..." : "🔍 Search calculator..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-xs outline-none border transition-colors ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
              }`}
            />
          </div>

          {/* MENU LIST DENGAN ACCORDION */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {categories.map((cat) => {
              const itemsInCat = groupedMenu[cat];
              if (itemsInCat.length === 0) return null;
              
              const isOpen = openCategories[cat] || searchQuery.trim() !== '';

              return (
                <div key={cat} className="space-y-1">
                  {/* KATEGORI HEADER */}
                  <button
                    onClick={() => toggleCategory(cat)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${
                      isDark ? 'text-slate-400 hover:bg-slate-800/60' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-[10px]">{isOpen ? '▼' : '▶'}</span>
                  </button>

                  {/* ITEM DALAM KATEGORI */}
                  {isOpen && (
                    <div className="space-y-1 pl-1">
                      {itemsInCat.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsSidebarOpen(false); // Otomatis tutup sidebar di HP saat menu diklik
                            }}
                            className={`w-full p-2 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between ${
                              isActive
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                : isDark
                                ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="shrink-0">{item.icon}</span>
                              <span className="truncate">{labelMap[item.id] || item.name}</span>
                            </div>
                            {isActive && <span className="text-[10px] shrink-0">●</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* FOOTER SIDEBAR */}
          <div className={`border-t pt-3 mt-2 text-[10px] text-center shrink-0 ${
            isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
          }`}>
            Clinical Decision Support System
          </div>

        </div>
      </aside>
    </>
  );
}