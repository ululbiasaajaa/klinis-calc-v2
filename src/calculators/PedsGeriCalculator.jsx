import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
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
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';

  const { patient, addMedication, addLabRecord } = usePatientStore();
  const [subTab, setSubTab] = useState('peds'); // 'peds' or 'geri'

  // PEDIATRIC STATE
  const [pedsInput, setPedsInput] = useState({
    drugName: 'Paracetamol',
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
        weight: patient.weightKg !== undefined && patient.weightKg !== '' ? String(patient.weightKg) : prev.weight,
        height: patient.heightCm !== undefined && patient.heightCm !== '' ? String(patient.heightCm) : prev.height,
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

  // HANDLER AKSI V3 DISPATCHERS

  const handleAddPedsMedication = () => {
    if (pedsCalc.isExceed) {
      alert('⚠️ PERINGATAN OVERDOSE: Dosis total harian anak melebihi batas maksimal dewasa! Harap sesuaikan dosis sebelum menambahkan ke regimen.');
      return;
    }

    addMedication({
      name: `${pedsInput.drugName || 'Obat Pediatrik'} (${pedsCalc.singleDose} mg / kali)`,
      dose: `${pedsInput.frequency}x sehari @ ${pedsCalc.singleDose} mg (Total: ${pedsCalc.dailyDose} mg/hari)`,
      category: 'Dosis Pediatrik Anak',
      source: `BB Anak: ${pedsInput.weight} kg (${pedsInput.dosePerKg} mg/kg)`
    });
    alert(`✅ Regimen Dosis Anak (${pedsInput.drugName || 'Obat'} ${pedsCalc.singleDose} mg) berhasil ditambahkan ke rekam medis pasien!`);
  };

  const handleSavePedsRecord = () => {
    addLabRecord({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: `Dosis Pediatrik ${pedsInput.drugName || 'Anak'}`,
      value: `${pedsCalc.singleDose} mg x ${pedsInput.frequency}/hari (Total: ${pedsCalc.dailyDose} mg/hari)`,
      unit: 'mg',
      source: `BB: ${pedsInput.weight} kg | BSA: ${pedsCalc.bsaPeds || '-'} m²`
    });
    alert(`✅ Rekam Dosis Pediatrik berhasil disimpan ke Outcome Tracker Pasien!`);
  };

  const handleSaveGeriRecord = () => {
    if (selectedGeriDrugs.length === 0) {
      alert('Pilih setidaknya satu obat geriatri untuk disimpan.');
      return;
    }

    const drugNames = selectedGeriDrugs
      .map((id) => GERI_BEERS_LIST.find((d) => d.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    addLabRecord({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: 'Skrining Geriatri Beers Criteria 2023',
      value: `Obat Berisiko Terdeteksi: ${drugNames}`,
      unit: 'Beers Criteria',
      source: 'Evaluasi Keamanan Obat Geriatri v3'
    });
    alert(`✅ Skrining Keamanan Geriatri berhasil disimpan ke Outcome Tracker Pasien!`);
  };

  return (
    <div className="text-xs space-y-4">
      {patient?.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Berat & Tinggi badan tersinkronisasi otomatis.</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">STORE V3 SYNCED</span>
        </div>
      )}

      {/* SUB-TAB NAVIGATOR */}
      <div className={`flex border-b mb-4 gap-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <button
          type="button"
          onClick={() => setSubTab('peds')}
          className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            subTab === 'peds'
              ? 'border-blue-500 text-blue-500'
              : isDark
              ? 'border-transparent text-slate-400 hover:text-slate-200'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          👶 {lang === 'id' ? 'Kalkulator Dosis Pediatrik (Anak)' : 'Pediatric Dosing Calculator'}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('geri')}
          className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            subTab === 'geri'
              ? 'border-blue-500 text-blue-500'
              : isDark
              ? 'border-transparent text-slate-400 hover:text-slate-200'
              : 'border-transparent text-slate-500 hover:text-slate-800'
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
              <label htmlFor="peds-drug-name" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Nama Obat Anak
              </label>
              <input
                id="peds-drug-name"
                type="text"
                name="drugName"
                value={pedsInput.drugName}
                onChange={handlePedsChange}
                placeholder="e.g. Paracetamol / Amoxicillin"
                className={`w-full p-3 rounded-xl border outline-none text-xs font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              />
            </div>

            <div>
              <label htmlFor="peds-weight" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {lang === 'id' ? 'Berat Badan Anak (kg)' : 'Child Weight (kg)'}
              </label>
              <input
                id="peds-weight"
                type="number"
                name="weight"
                value={pedsInput.weight}
                onChange={handlePedsChange}
                placeholder="e.g. 12"
                className={`w-full p-3 rounded-xl border outline-none text-xs font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              />
            </div>

            <div>
              <label htmlFor="peds-dose-per-kg" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {lang === 'id' ? 'Dosis Target (mg/kg/hari)' : 'Target Dose (mg/kg/day)'}
              </label>
              <input
                id="peds-dose-per-kg"
                type="number"
                name="dosePerKg"
                value={pedsInput.dosePerKg}
                onChange={handlePedsChange}
                placeholder="e.g. 15 (Paracetamol 10-15 mg/kg)"
                className={`w-full p-3 rounded-xl border outline-none text-xs font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              />
            </div>

            <div>
              <label htmlFor="peds-frequency" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {lang === 'id' ? 'Frekuensi Pemberian' : 'Administration Frequency'}
              </label>
              <select
                id="peds-frequency"
                name="frequency"
                value={pedsInput.frequency}
                onChange={handlePedsChange}
                className={`w-full p-3 rounded-xl border outline-none text-xs font-bold cursor-pointer ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              >
                <option value="1">1x Sehari (q24h)</option>
                <option value="2">2x Sehari (q12h)</option>
                <option value="3">3x Sehari (q8h)</option>
                <option value="4">4x Sehari (q6h)</option>
              </select>
            </div>

            <div>
              <label htmlFor="peds-max-adult-dose" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {lang === 'id' ? 'Dosis Maks Dewasa Harian (mg) [Opsional]' : 'Max Adult Daily Dose (mg) [Optional]'}
              </label>
              <input
                id="peds-max-adult-dose"
                type="number"
                name="maxAdultDose"
                value={pedsInput.maxAdultDose}
                onChange={handlePedsChange}
                placeholder="e.g. 4000 (Max Paracetamol)"
                className={`w-full p-3 rounded-xl border outline-none text-xs font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              />
            </div>

            <div>
              <label htmlFor="peds-height" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {lang === 'id' ? 'Tinggi Badan Anak (cm) [Opsional BSA]' : 'Child Height (cm) [Optional BSA]'}
              </label>
              <input
                id="peds-height"
                type="number"
                name="height"
                value={pedsInput.height}
                onChange={handlePedsChange}
                placeholder="e.g. 85"
                className={`w-full p-3 rounded-xl border outline-none text-xs font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              />
            </div>
          </div>

          {/* HASIL PEDIATRIK */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl text-center border ${
            isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'
          }`}>
            <div>
              <span className="text-[10px] font-bold text-blue-500 block mb-1">
                {lang === 'id' ? 'DOSIS TOTAL HARIAN' : 'TOTAL DAILY DOSE'}
              </span>
              <span className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {pedsCalc.dailyDose} <span className="text-xs font-normal text-slate-400">mg/hari</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-blue-500 block mb-1">
                {lang === 'id' ? 'DOSIS PER KALI MINUM' : 'SINGLE DOSE (PER ADMINISTRATION)'}
              </span>
              <span className="text-2xl font-extrabold text-emerald-500">
                {pedsCalc.singleDose} <span className="text-xs font-normal text-slate-400">mg</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-blue-500 block mb-1">
                {lang === 'id' ? 'BSA ANAK (MOSTELLER)' : 'CHILD BSA'}
              </span>
              <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
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

          <div className={`p-4 rounded-xl border text-xs space-y-1 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <p className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>💡 {lang === 'id' ? 'Catatan Klinis Pediatrik:' : 'Pediatric Clinical Note:'}</p>
            <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              • {lang === 'id' ? 'Dosis anak tidak boleh melebihi dosis maksimal harian orang dewasa.' : 'Child doses must never exceed the maximum adult daily dose.'}<br />
              • {lang === 'id' ? 'Gunakan spuit/pipet ukur berskala presisi (bukan sendok makan/teh dapur) untuk meminimalisir kesalahan penakaran obat cair.' : 'Always use calibrated oral syringes or dosing cups for liquid medication.'}
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleSavePedsRecord}
              className={`font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-2 border ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-blue-700 border-slate-300'
              }`}
            >
              📈 Simpan Dosis ke Outcome Tracker
            </button>
            <button
              type="button"
              onClick={handleAddPedsMedication}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              ➕ Tambahkan Dosis Anak ke Regimen Pasien
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GERIATRI */}
      {subTab === 'geri' && (
        <div className="space-y-4">
          <h4 className={`font-bold text-xs mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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
                      : isDark
                      ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      isSelected ? 'bg-amber-500 text-slate-950' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.risk}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="mt-2 text-xs space-y-1 pt-2 border-t border-amber-900/50">
                      <p className="text-amber-400"><strong>Alasan Risiko:</strong> {item.reason}</p>
                      <p className="text-emerald-500"><strong>💡 Rekomendasi:</strong> {item.recommendation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleSaveGeriRecord}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              📈 Simpan Hasil Skrining Beers ke Outcome Tracker
            </button>
          </div>
        </div>
      )}
    </div>
  );
}