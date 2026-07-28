import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { usePatientStore } from '../store/usePatientStore';

// DATABASE BEERS CRITERIA (OBAT HIGH-RISK UNTUK GERIATRI / LANSIA)
const GERI_BEERS_LIST = [
  {
    id: 'diazepam',
    name: 'Diazepam / Lorazepam / Alprazolam (Benzodiazepin)',
    risk: 'High Risk (Sangat Berbahaya)',
    reason: 'Peningkatan sensitivitas, kebingungan (delirium), dan risiko jatuh/fraktur yang sangat tinggi pada lansia.',
    recommendation: 'Hindari penggunaan rutin. Gunakan non-farmakologi atau dosis minimal durasi pendek jika sangat diperlukan.'
  },
  {
    id: 'ctm',
    name: 'Chlorpheniramine (CTM) / Diphenhydramine (Antihistamin Generasi I)',
    risk: 'High Risk (Efek Antikolinergik)',
    reason: 'Menyebabkan mulut kering, konstipasi, retensi urin, retensi memori buruk, dan risiko jatuh.',
    recommendation: 'Gunakan antihistamin generasi kedua (Cetirizine / Loratadine).'
  },
  {
    id: 'amitriptyline',
    name: 'Amitriptyline / Imipramine (Antidepresan Trisiklik)',
    risk: 'High Risk (Antikolinergik & Hipotensi)',
    reason: 'Sangat antikolinergik, hipotensi ortostatik, dan efek sedasi berat.',
    recommendation: 'Gunakan alternatif SSRI (Sertraline / Escitalopram).'
  },
  {
    id: 'nsaid',
    name: 'Ibuprofen / Ketorolac / Piroxicam (NSAID Dosis Tinggi / Kronis)',
    risk: 'Moderate-High Risk',
    reason: 'Risiko perdarahan saluran cerna fatal, memicu gagal ginjal akut, dan memperburuk hipertensi/gagal jantung.',
    recommendation: 'Gunakan Parasetamol sebagai first-line analgesik. Hindari penggunaan NSAID > 2 minggu.'
  },
  {
    id: 'metoclopramide',
    name: 'Metoclopramide',
    risk: 'High Risk (Efek Ekstrapiramidal)',
    reason: 'Risiko tinggi menyebabkan Tardive Dyskinesia dan gejala Parkinsonisme pada lansia.',
    recommendation: 'Hindari penggunaan jangka panjang (>12 minggu) kecuali pada kasus gastroparesis berat.'
  }
];

export default function PedsGeriCalculator() {
  const { lang } = useLanguage();
  const { patient } = usePatientStore();
  const [subTab, setSubTab] = useState('peds'); // 'peds' or 'geri'

  // PEDIATRIC STATE
  const [pedsInput, setPedsInput] = useState({
    weight: '',
    dosePerKg: '',
    frequency: '3', // x sehari
    maxAdultDose: '',
    height: '',
  });

  // GERIATRIC STATE
  const [selectedGeriDrugs, setSelectedGeriDrugs] = useState([]);

  // Auto-sync data dari Patient Context Bar (Berat & Tinggi Badan anak)
  useEffect(() => {
    if (patient) {
      setPedsInput((prev) => ({
        ...prev,
        weight: patient.weightKg !== '' ? String(patient.weightKg) : prev.weight,
        height: patient.heightCm !== '' ? String(patient.heightCm) : prev.height,
      }));
    }
  }, [patient]);

  const handlePedsChange = (e) => {
    setPedsInput({ ...pedsInput, [e.target.name]: e.target.value });
  };

  // KALKULASI PEDIATRIK
  const pedsCalc = (() => {
    const { weight, dosePerKg, frequency, maxAdultDose, height } = pedsInput;
    if (!weight || !dosePerKg) return { dailyDose: 0, singleDose: 0, isExceed: false, bsaPeds: 0 };

    const w = parseFloat(weight);
    const dPerKg = parseFloat(dosePerKg);
    const freq = parseFloat(frequency) || 1;
    const maxDose = parseFloat(maxAdultDose) || 0;

    const dailyDose = w * dPerKg;
    const singleDose = dailyDose / freq;

    let isExceed = false;
    if (maxDose > 0 && dailyDose > maxDose) {
      isExceed = true;
    }

    // BSA Pediatrik Mosteller
    let bsaPeds = 0;
    if (height && weight) {
      bsaPeds = Math.sqrt((parseFloat(height) * w) / 3600);
    }

    return {
      dailyDose: Number(dailyDose.toFixed(1)),
      singleDose: Number(singleDose.toFixed(1)),
      isExceed,
      bsaPeds: Number(bsaPeds.toFixed(2))
    };
  })();

  const handleToggleGeriDrug = (id) => {
    if (selectedGeriDrugs.includes(id)) {
      setSelectedGeriDrugs(selectedGeriDrugs.filter((d) => d !== id));
    } else {
      setSelectedGeriDrugs([...selectedGeriDrugs, id]);
    }
  };

  return (
    <div>
      {patient.patientName && (
        <div className="p-3 mb-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between text-xs">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Berat & Tinggi badan tersinkronisasi otomatis.</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">Synced</span>
        </div>
      )}

      {/* SUB-TAB NAVIGATOR */}
      <div className="flex border-b border-slate-800 mb-6 gap-2">
        <button
          onClick={() => setSubTab('peds')}
          className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 ${
            subTab === 'peds'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          👶 {lang === 'id' ? 'Kalkulator Dosis Pediatrik (Anak)' : 'Pediatric Dosing Calculator'}
        </button>
        <button
          onClick={() => setSubTab('geri')}
          className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 ${
            subTab === 'geri'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          👵 {lang === 'id' ? 'Evaluasi Geriatri (Beers Criteria)' : 'Geriatric Safety (Beers Criteria)'}
        </button>
      </div>

      {/* SUB-TAB 1: PEDIATRIK */}
      {subTab === 'peds' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                {lang === 'id' ? 'Berat Badan Anak (kg)' : 'Child Weight (kg)'}
              </label>
              <input
                type="number"
                name="weight"
                value={pedsInput.weight}
                onChange={handlePedsChange}
                placeholder="e.g. 12"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                {lang === 'id' ? 'Dosis Target (mg/kg/hari)' : 'Target Dose (mg/kg/day)'}
              </label>
              <input
                type="number"
                name="dosePerKg"
                value={pedsInput.dosePerKg}
                onChange={handlePedsChange}
                placeholder="e.g. 15 (Paracetamol 10-15 mg/kg)"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                {lang === 'id' ? 'Frekuensi Pemberian' : 'Administration Frequency'}
              </label>
              <select
                name="frequency"
                value={pedsInput.frequency}
                onChange={handlePedsChange}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              >
                <option value="1">1x Sehari (q24h)</option>
                <option value="2">2x Sehari (q12h)</option>
                <option value="3">3x Sehari (q8h)</option>
                <option value="4">4x Sehari (q6h)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                {lang === 'id' ? 'Dosis Maks Dewasa Harian (mg) [Opsional]' : 'Max Adult Daily Dose (mg) [Optional]'}
              </label>
              <input
                type="number"
                name="maxAdultDose"
                value={pedsInput.maxAdultDose}
                onChange={handlePedsChange}
                placeholder="e.g. 4000 (Max Paracetamol)"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                {lang === 'id' ? 'Tinggi Badan Anak (cm) [Opsional BSA]' : 'Child Height (cm) [Optional BSA]'}
              </label>
              <input
                type="number"
                name="height"
                value={pedsInput.height}
                onChange={handlePedsChange}
                placeholder="e.g. 85"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          {/* HASIL PEDIATRIK */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-blue-950/40 border border-blue-800/50 p-4 rounded-2xl text-center">
            <div>
              <span className="text-[10px] font-bold text-blue-400 block mb-1">
                {lang === 'id' ? 'DOSIS TOTAL HARIAN' : 'TOTAL DAILY DOSE'}
              </span>
              <span className="text-2xl font-extrabold text-white">
                {pedsCalc.dailyDose} <span className="text-xs font-normal text-slate-400">mg/hari</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-blue-400 block mb-1">
                {lang === 'id' ? 'DOSIS PER KALI MINUM' : 'SINGLE DOSE (PER ADMINISTRATION)'}
              </span>
              <span className="text-2xl font-extrabold text-emerald-300">
                {pedsCalc.singleDose} <span className="text-xs font-normal text-slate-300">mg</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-blue-400 block mb-1">
                {lang === 'id' ? 'BSA ANAK (MOSTELLER)' : 'CHILD BSA'}
              </span>
              <span className="text-xl font-bold text-white">
                {pedsCalc.bsaPeds > 0 ? `${pedsCalc.bsaPeds} m²` : '-'}
              </span>
            </div>
          </div>

          {/* WARNING EXCEED MAX DOSE */}
          {pedsCalc.isExceed && (
            <div className="bg-red-950/80 border border-red-500/60 p-4 rounded-xl text-xs text-red-300">
              🚨 <strong>SAFETY ALERT OVERDOSE:</strong> {lang === 'id' ? 'Hasil dosis total harian anak' : 'Child total daily dose'} ({pedsCalc.dailyDose} mg) {lang === 'id' ? 'MELEBIHI Dosis Maksimal Dewasa' : 'EXCEEDS Max Adult Dose'} ({pedsInput.maxAdultDose} mg)! {lang === 'id' ? 'Turunkan dosis sesuai batas aman maksimal dewasa.' : 'Cap the dose to adult maximum.'}
            </div>
          )}

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-1">
            <p className="text-slate-300 font-bold">💡 {lang === 'id' ? 'Catatan Klinis Pediatrik:' : 'Pediatric Clinical Note:'}</p>
            <p className="text-slate-400 leading-relaxed">
              • {lang === 'id' ? 'Dosis anak tidak boleh melebihi dosis maksimal harian orang dewasa.' : 'Child doses must never exceed the maximum adult daily dose.'}<br />
              • {lang === 'id' ? 'Gunakan spuit/pipet ukur berskala presisi (bukan sendok makan/teh dapur) untuk meminimalisir kesalahan penakaran obat cair.' : 'Always use calibrated oral syringes or dosing cups for liquid medication.'}
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GERIATRI */}
      {subTab === 'geri' && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-300 mb-2">
            👵 {lang === 'id' ? 'Screening Potensi Obat Berbahaya Pada Lansia (Beers Criteria 2023):' : 'Screening Potentially Inappropriate Medications in Elderly (Beers Criteria):'}
          </h4>

          <div className="space-y-2">
            {GERI_BEERS_LIST.map((item) => {
              const isSelected = selectedGeriDrugs.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => handleToggleGeriDrug(item.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500/80'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-white">{item.name}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.risk}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="mt-2 text-xs space-y-1 pt-2 border-t border-amber-900/50">
                      <p className="text-amber-200"><strong>Alasan Risiko:</strong> {item.reason}</p>
                      <p className="text-emerald-300"><strong>💡 Rekomendasi:</strong> {item.recommendation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}