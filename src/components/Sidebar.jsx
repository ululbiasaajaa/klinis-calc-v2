import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

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

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-40 w-64 p-4 transform transition-colors duration-300 ease-in-out flex flex-col justify-between ${
        isDark 
          ? 'bg-slate-900 border-r border-slate-800' 
          : 'bg-white border-r border-slate-200'
      } ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div>
        {/* LOGO BRAND + TOGGLE LANG & THEME */}
        <div className="flex justify-between items-center mb-6 px-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🩺</span>
            <div>
              <h1 className={`font-bold text-base leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Clinical Suite
              </h1>
              <span className="text-[10px] text-blue-500 font-semibold">v2.5 Professional</span>
            </div>
          </div>

          {/* CONTROLS (LANG & THEME) */}
          <div className="flex items-center gap-1.5">
            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all border ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              }`}
              title="Switch Theme (Dark / Light)"
            >
              {isDark ? '🌙' : '☀️'}
            </button>

            {/* LANGUAGE SWITCHER */}
            <button
              onClick={toggleLang}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all border ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
              }`}
              title="Switch Language / Ganti Bahasa"
            >
              <span>{lang === 'id' ? '🇮🇩' : '🇬🇧'}</span>
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-4">
          <input
            type="text"
            placeholder={lang === 'id' ? "🔍 Cari kalkulator..." : "🔍 Search calculator..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full p-2.5 rounded-xl text-xs outline-none border transition-colors ${
              isDark 
                ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' 
                : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        {/* MENU LIST */}
        <nav className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : isDark
                    ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span>{labelMap[item.id] || item.name}</span>
                </div>
                {isActive && <span className="text-[10px]">●</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={`border-t pt-3 mt-4 text-[11px] text-center ${
        isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
      }`}>
        Clinical Decision Support System
      </div>
    </aside>
  );
}