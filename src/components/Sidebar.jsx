import React from 'react';

export default function Sidebar({
  menuItems,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  isSidebarOpen,
  setIsSidebarOpen,
}) {
  const filteredMenu = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={`fixed md:static top-0 left-0 h-full w-72 bg-slate-900 border-r border-slate-800/80 p-5 flex flex-col justify-between z-40 transition-transform duration-300 overflow-y-auto ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div>
        <div className="hidden md:flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
            🩺
          </div>
          <div>
            <h1 className="font-extrabold text-slate-100 text-lg leading-tight">Clinical Suite</h1>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
              v2.2 Clean Modular
            </span>
          </div>
        </div>

        <div className="relative mb-5">
          <input
            type="text"
            placeholder="🔍 Cari kalkulator / obat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 block">
            NAVIGASI KALKULATOR
          </span>
          {filteredMenu.length > 0 ? (
            filteredMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <div className="text-left">
                  <p className="leading-none">{item.name}</p>
                  <span
                    className={`text-[9px] block mt-1 ${
                      activeTab === item.id ? 'text-blue-200' : 'text-slate-500'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <p className="text-xs text-slate-500 p-3 text-center">Kalkulator tidak ditemukan...</p>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
        <p>© 2026 Clinical Suite</p>
        <p className="text-[9px] text-slate-600 mt-0.5">Ready for Clinical Practice</p>
      </div>
    </aside>
  );
}