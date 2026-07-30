import React, { useRef } from 'react';
import { usePatientStore } from '../store/usePatientStore';

export default function HistoryLog({ history, handleClearHistory, setHistory }) {
  const fileInputRef = useRef(null);

  // MENGAMBIL ENCOUNTER & STATUS STORE V3
  const { activeEncounter } = usePatientStore();

  // 1. EXPORT TO JSON
  const handleExportJSON = () => {
    if (history.length === 0) {
      alert('Belum ada riwayat kalkulasi untuk di-export!');
      return;
    }
    const exportPayload = {
      version: 'v3_enterprise',
      exportDate: new Date().toISOString(),
      encounterId: activeEncounter?.encounterId || 'ENC-GENERAL',
      records: history
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Clinical_Suite_v3_History_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 2. EXPORT TO CSV (EXCEL FRIENDLY)
  const handleExportCSV = () => {
    if (history.length === 0) {
      alert('Belum ada riwayat kalkulasi untuk di-export!');
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,ID,Tanggal,Jam,Pasien,No RM,Kategori,Ringkasan\n";
    history.forEach((row) => {
      const cleanSummary = `"${(row.summary || '').replace(/"/g, '""').replace(/\n/g, ' | ')}"`;
      csvContent += `${row.id},${row.date},${row.time},"${row.patient}","${row.rm}","${row.type}",${cleanSummary}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Clinical_Suite_v3_History_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // 3. IMPORT FROM JSON FILE
  const handleImportJSON = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsedData = JSON.parse(event.target.result);
          // Dukungan format v3 wrapper maupun array biasa v2
          const records = parsedData.records || parsedData;

          if (Array.isArray(records)) {
            setHistory(records);
            alert('✅ Berhasil mengimpor riwayat data pasien Enterprise v3!');
          } else {
            alert('❌ Format file JSON tidak valid!');
          }
        } catch (error) {
          alert('❌ Gagal membaca file JSON!');
        }
      };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>📜</span> Riwayat Kalkulasi Pasien (History Log v3)
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Tersimpan lokal & tersinkronisasi dengan Clinical Encounter active.
          </p>
        </div>

        {/* CONTROLS BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
            title="Upload Backup File JSON"
          >
            <span>📂</span> Import JSON
          </button>

          <button
            onClick={handleExportJSON}
            className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
            title="Download Backup JSON"
          >
            <span>💾</span> JSON
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
            title="Download CSV / Excel"
          >
            <span>📊</span> CSV
          </button>

          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/60 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              🗑️ Hapus
            </button>
          )}
        </div>
      </div>

      {/* LIST HISTORY */}
      {history.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
          Belum ada riwayat kalkulasi. Lakukan perhitungan lalu klik tombol <strong>"Salin & Simpan Riwayat"</strong>.
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all text-xs"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                    👤 {item.patient}
                  </span>
                  <span className="text-slate-400 text-[11px]">RM: {item.rm}</span>
                </div>
                <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {item.date} • {item.time}
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                {item.summary}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}