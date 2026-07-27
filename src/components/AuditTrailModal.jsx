import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function AuditTrailModal({ isOpen, onClose, userRole }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('clinical_suite_audit_trail');
    return saved ? JSON.parse(saved) : [
      { id: 1, time: '10:15:22', date: '27/07/2026', role: 'Apoteker Klinis', action: 'Login Sesi Berhasil', status: 'SECURE' },
      { id: 2, time: '10:18:05', date: '27/07/2026', role: 'Apoteker Klinis', action: 'Kalkulasi Dosis PK / Vanco', status: 'SUCCESS' },
      { id: 3, time: '10:25:40', date: '27/07/2026', role: 'Apoteker Klinis', action: 'Export Laporan PDF Pasien', status: 'LOGGED' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('clinical_suite_audit_trail', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const handleClearAudit = () => {
    if (window.confirm('Bersihkan seluruh log audit keamanan?')) {
      setAuditLogs([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`border p-6 rounded-2xl max-w-2xl w-full shadow-2xl relative max-h-[90vh] flex flex-col ${
        isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
      }`}>
        
        {/* HEADER */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-700/50 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔒</span>
            <div>
              <h3 className="font-bold text-base text-blue-500">Audit Trail & Keamanan Sistem</h3>
              <p className="text-[10px] text-slate-400">Pengawasan akses pengguna & rekam jejak operasional nakes.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✖</button>
        </div>

        {/* INFO USER SESI */}
        <div className={`p-4 rounded-xl border mb-4 flex justify-between items-center ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">ROLE AKTIF SAAT INI</span>
            <span className="text-sm font-black text-blue-500">{userRole || 'Professional Medical Staff'}</span>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem('clinical_suite_auth_role');
              window.location.reload();
            }}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold text-xs transition-all border border-red-500/30"
          >
            🔒 Lock / Ganti Role
          </button>
        </div>

        {/* LIST LOG AUDIT */}
        <div className="overflow-y-auto space-y-2 pr-1 flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-xs text-slate-400">Log Aktivitas Keamanan ({auditLogs.length}):</span>
            {auditLogs.length > 0 && (
              <button onClick={handleClearAudit} className="text-[10px] text-red-500 hover:underline">
                Bersihkan Log
              </button>
            )}
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-slate-500 italic text-center py-6 text-xs">Belum ada aktivitas log keamanan tercatat.</p>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className={`p-3 rounded-xl border flex justify-between items-center text-xs ${
                  isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{log.action}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold">{log.role}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">🕒 {log.time} • {log.date}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-700/50 mt-4">
          <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 rounded-xl text-xs transition-all">
            Tutup Keamanan
          </button>
        </div>

      </div>
    </div>
  );
}