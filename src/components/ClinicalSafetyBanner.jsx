import React from 'react';

export default function ClinicalSafetyBanner({ activeTab, currentInputs }) {
  // Logika deteksi risiko tinggi otomatis berdasarkan modul & input aktif
  const getRiskAlerts = () => {
    let alerts = [];

    // Cek modul NTI / TDM atau Renal
    if (activeTab === 'renal') {
      const scr = parseFloat(currentInputs?.scr) || 0;
      if (scr > 2.0) {
        alerts.push({
          title: '🚨 CRITICAL RENAL RISK:',
          desc: 'Serum Kreatinin > 2.0 mg/dL. Semua dosis obat ekskresi ginjal wajib direduksi 50% atau perpanjang interval!'
        });
      }
    }

    if (activeTab === 'drip') {
      const dose = parseFloat(currentInputs?.dose) || 0;
      if (dose > 10) {
        alerts.push({
          title: '⚠️ HIGH-ALERT VASOPRESSOR WARNING:',
          desc: 'Dosis Drip Infus > 10 mcg/kg/min. Wajib monitoring tekanan darah ketat via Arterial Line (A-Line) tiap 5 menit.'
        });
      }
    }

    // Default general clinical pearl kalau tidak ada alert spesifik
    if (alerts.length === 0) {
      alerts.push({
        title: '💡 CLINICAL PEARL:',
        desc: 'Selalu verifikasi ulang berat badan aktual (ABW) vs berat badan ideal (IBW) sebelum kalkulasi dosis obat indeks terapi sempit.'
      });
    }

    return alerts;
  };

  const currentAlerts = getRiskAlerts();

  return (
    <div className="mb-6 space-y-2">
      {currentAlerts.map((item, idx) => (
        <div key={idx} className="p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border border-red-500/40 shadow-xl flex items-start gap-3 animate-pulse">
          <span className="text-xl">🛡️</span>
          <div className="text-xs">
            <span className="font-bold text-red-400 block mb-0.5">{item.title}</span>
            <p className="text-slate-300 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}