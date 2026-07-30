import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

// DATABASE INTERAKSI OBAT HIGH-RISK / HIGH-IMPACT
const DRUG_LIST = [
  { id: 'warfarin', name: 'Warfarin' },
  { id: 'aspirin', name: 'Aspirin / NSAID' },
  { id: 'ciprofloxacin', name: 'Ciprofloxacin / Levofloxacin' },
  { id: 'antasida', name: 'Antasida / Sucralfate / Kalsium' },
  { id: 'digoxin', name: 'Digoxin' },
  { id: 'amiodarone', name: 'Amiodarone' },
  { id: 'phenytoin', name: 'Phenytoin' },
  { id: 'fluconazole', name: 'Fluconazole' },
  { id: 'simvastatin', name: 'Simvastatin / Atorvastatin' },
  { id: 'gemfibrozil', name: 'Gemfibrozil / Ketoconazole' },
  { id: 'clopidogrel', name: 'Clopidogrel' },
  { id: 'omeprazole', name: 'Omeprazole' },
  { id: 'spironolactone', name: 'Spironolactone / ACE Inhibitor' },
  { id: 'kalium', name: 'Suplemen Kalium (KCl)' },
  { id: 'metformin', name: 'Metformin' },
  { id: 'kontras_radiologi', name: 'Media Kontras Radiologi (Iodine)' },
];

const INTERACTION_DATABASE = [
  {
    drugs: ['warfarin', 'aspirin'],
    severity: 'Major',
    effect: 'Peningkatan Risiko Perdarahan Saluran Cerna / Mayor',
    mechanism: 'Inhibisi fungsi trombosit oleh Aspirin berinteraksi sinergis dengan efek antikoagulasi Warfarin.',
    action: '🚨 Hindari penggunaan bersama kecuali ada indikasi khusus (misal: Katup Jantung Mekanik). Monitoring ketat nilai INR dan tanda perdarahan.',
  },
  {
    drugs: ['ciprofloxacin', 'antasida'],
    severity: 'Major',
    effect: 'Penurunan Absorpsi & Efikasi Antibiotik Fluorokinolon',
    mechanism: 'Kation multivalen (Al3+, Mg2+, Ca2+) pada antasida membentuk kompleks kelat (chelation) dengan Ciprofloxacin sehingga tidak dapat diserap sistemik.',
    action: '⚠️ Beri jeda pemberian! Berikan Ciprofloxacin minimal 2 jam sebelum atau 6 jam setelah pemberian antasida.',
  },
  {
    drugs: ['digoxin', 'amiodarone'],
    severity: 'Major',
    effect: 'Peningkatan Kadar Digoxin dalam Darah (Toksisitas Digoxin)',
    mechanism: 'Amiodarone menghambat P-glycoprotein (P-gp) transporter yang bertanggung jawab mengeliminasi Digoxin.',
    action: '🚨 Kurangi dosis Digoxin sebesar 30% - 50% saat mengawali terapi Amiodarone. Monitoring kadar serum Digoxin dan EKG.',
  },
  {
    drugs: ['phenytoin', 'fluconazole'],
    severity: 'Major',
    effect: 'Toksisitas Phenytoin (Ataksia, Nistagmus, Penurunan Kesadaran)',
    mechanism: 'Fluconazole menghambat kuat enzim CYP2C9 di hati, menurunkan metabolisme Phenytoin.',
    action: '🚨 Turunkan dosis Phenytoin dan monitoring ketat kadar Phenytoin plasma selama kombinasi terapi.',
  },
  {
    drugs: ['simvastatin', 'gemfibrozil'],
    severity: 'Major',
    effect: 'Peningkatan Risiko Rhabdomyolysis & Kerusakan Ginjal Akut',
    mechanism: 'Gemfibrozil menghambat glukuronidasi Simvastatin dan menurunkan klirens hati statin.',
    action: '🚨 Hindari kombinasi! Gunakan alternatif fibrat lain seperti Fenofibrate jika membutuhkan kombinasi penurun lipid.',
  },
  {
    drugs: ['clopidogrel', 'omeprazole'],
    severity: 'Moderate',
    effect: 'Penurunan Efek Antiplatelet Clopidogrel (Risiko Trombosis Kronis)',
    mechanism: 'Omeprazole menghambat enzim CYP2C19 yang diperlukan untuk mengaktivasi prodrug Clopidogrel menjadi bentuk aktifnya.',
    action: '⚠️ Pertimbangkan mengganti Omeprazole dengan PPI lain yang lebih sedikit menghambat CYP2C19, seperti Pantoprazole.',
  },
  {
    drugs: ['spironolactone', 'kalium'],
    severity: 'Major',
    effect: 'Hiperkalemia Berat / Fatal (Aritmia Jantung)',
    mechanism: 'Spironolactone retensi kalium di tubulus ginjal, ditambah suplementasi kalium eksogen dapat memicu kadar K+ > 6.0 mEq/L.',
    action: '🚨 Hindari suplemen kalium rutin pada pasien spironolactone kecuali terbukti hipokalemia persisten. Monitor serum Kalium berkala.',
  },
  {
    drugs: ['metformin', 'kontras_radiologi'],
    severity: 'Major',
    effect: 'Risiko Asidosis Laktat Fatal pasca tindakan Radiologi Kontras',
    mechanism: 'Kontras iodine dapat memicu gagal ginjal akut transient, menyebabkan akumulasi Metformin dalam tubuh.',
    action: '🚨 Hentikan Metformin saat/sebelum prosedur kontras IV. Lanjutkan kembali setelah 48 jam jika fungsi ginjal (eGFR) terbukti stabil.',
  }
];

export default function DdiCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL DATABASES OBAT PASIEN DARI STORE V3
  const { patient, medications } = usePatientStore();

  const [selectedDrugs, setSelectedDrugs] = useState([]);

  // AUTO-MATCH OBAT DARI PATIENT STORE KE CHECKLIST SCREENING
  useEffect(() => {
    if (medications.length > 0) {
      const autoMatchedIds = [];
      medications.forEach((med) => {
        const medNameLower = med.name.toLowerCase();
        DRUG_LIST.forEach((d) => {
          const dNameLower = d.name.toLowerCase();
          // Cek substring matching
          if (dNameLower.split('/')[0].trim() && medNameLower.includes(d.id)) {
            if (!autoMatchedIds.includes(d.id)) autoMatchedIds.push(d.id);
          }
        });
      });

      if (autoMatchedIds.length > 0) {
        setSelectedDrugs((prev) => Array.from(new Set([...prev, ...autoMatchedIds])));
      }
    }
  }, [medications]);

  // Toggle Pilihan Obat
  const handleToggleDrug = (drugId) => {
    if (selectedDrugs.includes(drugId)) {
      setSelectedDrugs(selectedDrugs.filter((id) => id !== drugId));
    } else {
      setSelectedDrugs([...selectedDrugs, drugId]);
    }
  };

  // Cek Interaksi Berdasarkan Obat Terpilih
  const detectInteractions = () => {
    if (selectedDrugs.length < 2) return [];

    const matches = [];
    INTERACTION_DATABASE.forEach((item) => {
      // Cek apakah SEMUA obat dalam pasangan interaksi ada di dalam selectedDrugs
      const isMatch = item.drugs.every((d) => selectedDrugs.includes(d));
      if (isMatch) {
        matches.push(item);
      }
    });

    return matches;
  };

  const detectedList = detectInteractions();

  return (
    <div className="space-y-6 text-xs">
      
      {patient.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Evaluasi interaksi obat (DDI Engine v3).</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">STORE V3 SYNCED</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <span>💊</span> Pilih Kombinasi Obat Pasien (DDI High-Risk Screening v3):
        </h3>
        <p className="text-slate-400 text-xs">
          Pilih resep obat aktif pasien atau gunakan pencocokan otomatis dari rekam medis untuk memindai potensi interaksi berisiko tinggi.
        </p>
      </div>

      {/* DRUG SELECTOR GRID */}
      <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
          {DRUG_LIST.map((drug) => {
            const isSelected = selectedDrugs.includes(drug.id);
            return (
              <button
                key={drug.id}
                type="button"
                onClick={() => handleToggleDrug(drug.id)}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex justify-between items-center cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/30 border-blue-500 text-white shadow-md'
                    : isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200' : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                <span>{drug.name}</span>
                <span className={`text-xs ${isSelected ? 'opacity-100' : 'opacity-30'}`}>
                  {isSelected ? '✅' : '➕'}
                </span>
              </button>
            );
          })}
        </div>

        {/* STATUS OBAT TERPILIH */}
        <div className="mt-3 flex justify-between items-center text-xs">
          <span className="text-slate-400">
            Terpilih: <strong className="text-blue-400">{selectedDrugs.length} Obat</strong>
          </span>
          {selectedDrugs.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedDrugs([])}
              className="text-slate-500 hover:text-red-400 underline font-medium cursor-pointer"
            >
              Kosongkan Pilihan
            </button>
          )}
        </div>
      </div>

      {/* HASIL ANALYSIS SCREENING */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
          📊 HASIL ANALISIS INTERAKSI OBAT:
        </h4>

        {selectedDrugs.length < 2 && (
          <div className={`p-6 rounded-2xl border text-center text-xs text-slate-500 ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            Pilih minimal <strong>2 obat</strong> dari daftar di atas untuk memulai kalkulasi screening interaksi.
          </div>
        )}

        {selectedDrugs.length >= 2 && detectedList.length === 0 && (
          <div className="bg-emerald-950/40 border border-emerald-800/50 p-6 rounded-2xl text-center">
            <span className="text-2xl block mb-2">✅</span>
            <p className="text-emerald-300 font-bold text-sm mb-1">
              Tidak Ditemukan Interaksi Berisiko Tinggi
            </p>
            <p className="text-slate-400 text-xs">
              Kombinasi obat terpilih relatif aman berdasarkan database interaksi obat kritis kami.
            </p>
          </div>
        )}

        {detectedList.map((item, index) => {
          const drugName1 = DRUG_LIST.find((d) => d.id === item.drugs[0])?.name;
          const drugName2 = DRUG_LIST.find((d) => d.id === item.drugs[1])?.name;

          return (
            <div
              key={index}
              className={`p-5 rounded-2xl border ${
                item.severity === 'Major'
                  ? 'bg-red-950/40 border-red-800/60'
                  : 'bg-amber-950/40 border-amber-800/60'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="font-bold text-sm text-white flex items-center gap-2">
                  <span>⚡</span> {drugName1} + {drugName2}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                    item.severity === 'Major'
                      ? 'bg-red-500 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  SEVERITY: {item.severity}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Efek Interaksi Klinis:</span>
                  <p className="text-slate-200 font-semibold">{item.effect}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Mekanisme Farmakologi:</span>
                  <p className="text-slate-400 leading-relaxed">{item.mechanism}</p>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 mt-2">
                  <span className="text-blue-400 font-bold block mb-1">💡 Rekomendasi Aksi Klinis:</span>
                  <p className="text-slate-300 leading-relaxed">{item.action}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}