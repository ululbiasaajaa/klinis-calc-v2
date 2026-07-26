import React from 'react';

export default function HistoryLog({ history, handleClearHistory }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📜</span>
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">
            Riwayat Kalkulasi Terakhir (LocalStorage)
          </h3>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-[11px] text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded bg-red-950/40 border border-red-800/40 transition-all"
          >
            🗑️ Hapus Riwayat
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl text-xs flex flex-col gap-1"
            >
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded font-semibold text-[10px] border border-blue-500/30">
                    {item.type}
                  </span>
                  <span className="font-bold text-slate-200">
                    Pasien: {item.patient} (RM: {item.rm})
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {item.date} • {item.time}
                </span>
              </div>
              <pre className="text-[11px] text-slate-400 font-mono whitespace-pre-wrap mt-1">
                {item.summary}
              </pre>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500 text-center py-6 bg-slate-950/40 rounded-xl border border-slate-800/40">
          Belum ada riwayat kalkulasi. Klik "Salin & Simpan Riwayat" atau "Download PDF" di atas untuk merekam hasil hitungan!
        </p>
      )}
    </div>
  );
}