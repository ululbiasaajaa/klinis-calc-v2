import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function AuditTrailModal({ isOpen, onClose, userRole }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Ambil data pasien, encounter, dan riwayat audit dari Store v3
  const { patient, activeEncounter, labsHistory } = usePatientStore();

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
              <h3 className="font-bold text-base text-blue-500">Audit Trail & Keamanan Sistem (Enterprise v3)</h3>
              <p className="text-[10px] text-slate-400">Pengawasan akses pengguna & rekam jejak operasional nakes terintegrasi.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✖</button>
        </div>

        {/* INFO PASIEN & ENCOUNTER AKTIF */}
        <div className={`p-4 rounded-xl border mb-4 grid grid-cols-1 md:grid-cols-2 gap-3 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">ROLE & PASIEN AKTIF</span>
            <span className="text-xs font-black text-blue-500 block">{userRole || 'Professional Medical Staff'}</span>
            <span className="text-[11px] text-slate-300 font-semibold mt-0.5 block">
              👤 {patient.patientName || 'Tanpa Nama Pasien'} (RM: {patient.patientId || '-'})
            </span>
          </div>

          <div className="flex flex-col justify-between items-end">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold block">ENCOUNTER ID</span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {activeEncounter?.encounterId || 'ENC-ACTIVE'}
              </span>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('clinical_suite_auth_role');
                window.location.reload();
              }}
              className="mt-2 px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold text-[10px] transition-all border border-red-500/30"
            >
              🔒 Lock / Switch Role
            </button>
          </div>
        </div>

        {/* LIST LOG AUDIT */}
        <div className="overflow-y-auto space-y-2 pr-1 flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-xs text-slate-400">
              Jejak Aktivitas & Perubahan Klinis ({labsHistory.length + 2}):
            </span>
          </div>

          <div className="space-y-2">
            {/* LOG SISTEM STANDAR */}
            <div className={`p-3 rounded-xl border flex justify-between items-center text-xs ${
              isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">Session Initialized & Store v3 Synced</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold">{userRole || 'User'}</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">🕒 Active Session • Single Source of Truth</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                VERIFIED
              </span>
            </div>

            {/* LOG PERUBAHAN PARAMETER / LAB PASIEN */}
            {labsHistory.map((log) => (
              <div key={log.id} className={`p-3 rounded-xl border flex justify-between items-center text-xs ${
                isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">Pembaruan Parameter / Lab Pasien</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold">
                      {log.source || 'Clinical Input'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    🕒 {new Date(log.timestamp).toLocaleTimeString('id-ID')} • SCr: {log.scr || '-'} mg/dL
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  LOGGED
                </span>
              </div>
            ))}
          </div>
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