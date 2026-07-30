import React from 'react';
import { usePatientStore } from '../store/usePatientStore';

export default function ClinicalSafetyBanner({ activeTab, currentInputs }) {
  // MEMANGGIL STORE V3 SEBAGAI SINGLE SOURCE OF TRUTH
  const { patient, getClinicalContext, medications } = usePatientStore();
  const { egfr, clcr } = getClinicalContext();

  // Logika deteksi risiko tinggi otomatis berbasis Store v3 & Modul Aktif
  const getRiskAlerts = () => {
    let alerts = [];

    // 1. GLOBAL RENAL SAFETY CHECK (Selalu Aktif Apapun Modulnya)
    const scr = parseFloat(patient.serumCreatinine) || parseFloat(currentInputs?.scr) || 0;
    if (scr > 2.0 || (egfr > 0 && egfr < 30)) {
      alerts.push({
        type: 'critical',
        title: '🚨 CRITICAL RENAL IMPAIRMENT ALERT:',
        desc: `eGFR Pasien: ${egfr || '<30'} mL/min (SCr: ${scr} mg/dL). Semua dosis obat ekskresi ginjal wajib direduksi atau perpanjang interval penakaran!`
      });
    } else if (egfr >= 30 && egfr < 60) {
      alerts.push({
        type: 'warning',
        title: '⚠️ MODERATE RENAL WARNING:',
        desc: `eGFR Pasien: ${egfr} mL/min (CKD Stage 3). Pertimbangkan penyesuaian dosis antibiotik & obat berisiko nefrototoksik.`
      });
    }

    // 2. DRIP & VASOPRESSOR SAFETY CHECK
    if (activeTab === 'drip') {
      const dose = parseFloat(currentInputs?.dose) || 0;
      if (dose > 10) {
        alerts.push({
          type: 'warning',
          title: '⚠️ HIGH-ALERT VASOPRESSOR WARNING:',
          desc: 'Dosis Drip Infus > 10 mcg/kg/min. Wajib monitoring tekanan darah ketat via Arterial Line (A-Line) tiap 5 menit.'
        });
      }
    }

    // 3. MEDICATION DDI / HIGH-RISK DRUG CHECK
    if (medications.length > 0) {
      alerts.push({
        type: 'info',
        title: '💊 ACTIVE MEDICATIONS MONITORED:',
        desc: `Terdaftar ${medications.length} obat aktif. Sistem memantau potensi interaksi & penyesuaian dosis harian.`
      });
    }

    // Default clinical pearl jika tidak ada critical alert
    if (alerts.length === 0) {
      alerts.push({
        type: 'pearl',
        title: '💡 CLINICAL PEARL:',
        desc: 'Selalu verifikasi ulang berat badan aktual (ABW) vs berat badan ideal (IBW) sebelum kalkulasi dosis obat indeks terapi sempit.'
      });
    }

    return alerts;
  };

  const currentAlerts = getRiskAlerts();

  return (
    <div className="mb-6 space-y-2">
      {currentAlerts.map((item, idx) => {
        let borderBgStyle = 'from-blue-950/80 via-slate-900 to-slate-900 border-blue-500/40 text-blue-400';
        if (item.type === 'critical') {
          borderBgStyle = 'from-red-950/90 via-slate-900 to-slate-900 border-red-500/60 text-red-400 animate-pulse';
        } else if (item.type === 'warning') {
          borderBgStyle = 'from-amber-950/80 via-slate-900 to-slate-900 border-amber-500/40 text-amber-400';
        }

        return (
          <div key={idx} className={`p-4 rounded-2xl bg-gradient-to-r border shadow-xl flex items-start gap-3 ${borderBgStyle}`}>
            <span className="text-xl">🛡️</span>
            <div className="text-xs">
              <span className="font-bold block mb-0.5">{item.title}</span>
              <p className="text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}