import React, { useRef } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { usePatientStore } from '../store/usePatientStore';

export default function HistoryLog({ history, handleClearHistory, setHistory }) {
  const fileInputRef = useRef(null);

  // MENGAMBIL ENCOUNTER & STATUS STORE V3
  const { activeEncounter } = usePatientStore();

  // 1. EXPORT TO JSON (Native Capacitor & Web Fallback)
  const handleExportJSON = async () => {
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

    const jsonString = JSON.stringify(exportPayload, null, 2);
    const fileName = `Clinical_Suite_v3_History_${new Date().toISOString().slice(0,10)}.json`;

    try {
      // Simpan ke Cache Android lalu buka Share Sheet (bisa Simpan ke Unduhan / Drive)
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: jsonString,
        directory: Directory.Cache,
        encoding: 'utf8'
      });

      await Share.share({
        title: 'Export Riwayat JSON',
        text: 'File backup riwayat klinis Clinical Suite.',
        url: savedFile.uri,
        dialogTitle: 'Simpan File Backup JSON'
      });
    } catch (error) {
      console.warn('Native write failed, using web download fallback:', error);
      // Fallback untuk browser / web preview
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", fileName);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  // 2. EXPORT TO CSV (Native Capacitor & Web Fallback)
  const handleExportCSV = async () => {
    if (history.length === 0) {
      alert('Belum ada riwayat kalkulasi untuk di-export!');
      return;
    }
    let csvContent = "ID,Tanggal,Jam,Pasien,No RM,Kategori,Ringkasan\n";
    history.forEach((row) => {
      const cleanSummary = `"${(row.summary || '').replace(/"/g, '""').replace(/\n/g, ' | ')}"`;
      csvContent += `${row.id},${row.date},${row.time},"${row.patient}","${row.rm}","${row.type}",${cleanSummary}\n`;
    });

    const fileName = `Clinical_Suite_v3_History_${new Date().toISOString().slice(0,10)}.csv`;

    try {
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: csvContent,
        directory: Directory.Cache,
        encoding: 'utf8'
      });

      await Share.share({
        title: 'Export Riwayat CSV',
        text: 'File spreadsheet CSV riwayat klinis.',
        url: savedFile.uri,
        dialogTitle: 'Simpan File CSV'
      });
    } catch (error) {
      console.warn('Native CSV write failed, using web download fallback:', error);
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  // 3. IMPORT FROM JSON FILE (Aman untuk Web & Mobile)
  const handleImportJSON = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsedData = JSON.parse(event.target.result);
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