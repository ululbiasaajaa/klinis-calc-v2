import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function ClinicalSafetyBanner({ activeTab, currentInputs }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // MEMANGGIL STORE V3 SEBAGAI SINGLE SOURCE OF TRUTH
  const { patient, getClinicalContext, medications } = usePatientStore();
  const { egfr } = getClinicalContext();

  // Logika deteksi risiko tinggi otomatis berbasis Store v3 & Modul Aktif
  const getRiskAlerts = () => {
    let alerts = [];

    // 1. GLOBAL RENAL SAFETY CHECK (Selalu Aktif Apapun Modulnya)
    const scr = parseFloat(patient?.serumCreatinine) || parseFloat(currentInputs?.scr) || 0;
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

    // 3. MEDICATION DDI / HIGH-RISK DRUG CHECK (Diperbarui dengan rincian nama obat & dosis)
    if (medications && medications.length > 0) {
      const medListString = medications
        .map((med, idx) => {
          if (typeof med === 'object' && med !== null) {
            const name = med.name || med.drugName || 'Obat Tanpa Nama';
            const doseVal = med.dose || med.dosage || med.strength || '';
            const freq = med.frequency || med.interval || '';
            const doseDetail = [doseVal, freq].filter(Boolean).join(' - ');
            return `${idx + 1}. ${name}${doseDetail ? ` (${doseDetail})` : ' (Dosis Standar)'}`;
          }
          return `${idx + 1}. ${med}`;
        })
        .join('\n');

      alerts.push({
        type: 'info',
        title: '💊 ACTIVE MEDICATIONS MONITORED:',
        desc: `Terdaftar ${medications.length} obat aktif beserta pemantauan dosis & potensi interaksi:\n${medListString}`
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
        let borderBgStyle = isDark
          ? 'from-blue-950/80 via-slate-900 to-slate-900 border-blue-500/40 text-blue-400'
          : 'from-blue-50 via-white to-white border-blue-200 text-blue-700 shadow-sm';

        if (item.type === 'critical') {
          borderBgStyle = isDark
            ? 'from-red-950/90 via-slate-900 to-slate-900 border-red-500/60 text-red-400 animate-pulse'
            : 'from-red-50 via-white to-white border-red-300 text-red-700 shadow-sm animate-pulse';
        } else if (item.type === 'warning') {
          borderBgStyle = isDark
            ? 'from-amber-950/80 via-slate-900 to-slate-900 border-amber-500/40 text-amber-400'
            : 'from-amber-50 via-white to-white border-amber-200 text-amber-800 shadow-sm';
        }

        return (
          <div key={idx} className={`p-4 rounded-2xl bg-gradient-to-r border shadow-xl flex items-start gap-3 transition-all ${borderBgStyle}`}>
            <span className="text-xl">🛡️</span>
            <div className="text-xs w-full">
              <span className="font-bold block mb-0.5">{item.title}</span>
              <p className={`leading-relaxed whitespace-pre-line ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {item.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}