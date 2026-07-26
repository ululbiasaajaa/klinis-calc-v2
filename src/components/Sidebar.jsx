import React from 'react';
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

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // MAPPING LABEL DARI TRANSLATION BERSAHAJA
  const labelMap = {
    pk: t.navPk,
    drip: t.navDrip,
    peds_geri: t.navPedsGeri,
    label_print: t.navLabelPrint,
    nti: t.navNti,
    tdm_chart: t.navTdmChart,
    ddi: t.navDdi,
    renal: t.navRenal,
    anthro: t.navAnthro,
    kalori: t.navKalori,
  };

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 p-4 transform transition-transform duration-300 ease-in-out flex flex-col justify-between ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div>
        {/* LOGO BRAND + TOGGLE LANG */}
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🩺</span>
            <div>
              <h1 className="font-bold text-base text-white leading-tight">Clinical Suite</h1>
              <span className="text-[10px] text-blue-400 font-semibold">v2.5 Professional</span>
            </div>
          </div>

          {/* LANGUAGE SWITCHER BUTTON */}
          <button
            onClick={toggleLang}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-200 transition-all flex items-center gap-1 shadow-sm"
            title="Switch Language / Ganti Bahasa"
          >
            <span>{lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-4">
          <input
            type="text"
            placeholder={lang === 'id' ? "🔍 Cari kalkulator..." : "🔍 Search calculator..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
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
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
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

      <div className="border-t border-slate-800 pt-3 mt-4 text-[11px] text-slate-500 text-center">
        Clinical Decision Support System
      </div>
    </aside>
  );
}