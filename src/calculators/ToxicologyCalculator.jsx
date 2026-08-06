import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function ToxicologyCalculator({ onSaveHistory }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL DATA PASIEN GLOBAL DAN DISPATCHERS V3
  const { patient, setPatientData, addLabRecord, addMedication } = usePatientStore();

  // Tab sub-menu dalam kalkulator toksik
  const [subTab, setSubTab] = useState('toxidrome'); // 'toxidrome' | 'anion_osmolar' | 'alcohol' | 'antidote'

  // 1. State Toxidrome Checker
  const [pupil, setPupil] = useState('normal'); // normal, miosis, midriasis
  const [hr, setHr] = useState('normal'); // normal, bradikardia, takikardia
  const [bp, setBp] = useState('normal'); // normal, hipotensi, hipertensi
  const [temp, setTemp] = useState('normal'); // normal, hipotermia, hipertermia
  const [bowel, setBowel] = useState('normal'); // normal, menurun, hiperaktif
  const [toxidromeResult, setToxidromeResult] = useState(null);

  // 2. State Anion Gap & Osmolar Gap
  const [na, setNa] = useState('');
  const [cl, setCl] = useState('');
  const [hco3, setHco3] = useState('');
  const [measuredOsm, setMeasuredOsm] = useState('');
  const [bun, setBun] = useState('');
  const [glucose, setGlucose] = useState('');
  const [agResult, setAgResult] = useState(null);

  // 3. State Widmark Blood Alcohol (BAC)
  const [alcDrink, setAlcDrink] = useState('beer'); // beer, wine, spirit
  const [volumeMl, setVolumeMl] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [hoursPassed, setHoursPassed] = useState('');
  const [alcResult, setAlcResult] = useState(null);

  // --- LOGIC 1: TOXIDROME EVALUATION ---
  const evaluateToxidrome = (e) => {
    e.preventDefault();
    let detected = 'Tidak Spesifik / Campuran';
    let recommendations = [
      'Monitor tanda vital ketat (Airway, Breathing, Circulation).',
      'Lakukan dekontaminasi gastrointestinal jika terindikasi dan dalam waktu < 1 jam ingestasi.'
    ];
    let badgeColor = isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300';

    if (pupil === 'miosis' && hr === 'bradikardia' && temp === 'hipotermia' && (bowel === 'hiperaktif' || bowel === 'normal')) {
      detected = 'Opioid / Opiate Syndrome';
      recommendations = [
        '🚨 Indikasi Kuat Toksidrom Opioid (Depresi pernapasan, miosis, penurunan kesadaran).',
        '💊 Berikan Antidot: Nalokson IV/IM (Dosis awal 0.4 - 2 mg, titrasi sampai napas adekuat).'
      ];
      badgeColor = isDark ? 'bg-red-950/60 text-red-300 border-red-800/60' : 'bg-red-50 text-red-800 border-red-200';
    } else if (pupil === 'midriasis' && hr === 'takikardia' && bp === 'hipertensi' && temp === 'hipertermia' && bowel === 'menurun') {
      detected = 'Anticholinergic Syndrome (Atropinic)';
      recommendations = [
        '⚠️ Toksidrom Antikolinergik ("Blind as a bat, mad as a hatter, red as a beet, hot as a hare, dry as a bone").',
        '💊 Manajemen suportif, pendinginan fisik jika hipertermia berat. Pertimbangkan Fisostigmin jika ada indikasi sistemik parah.'
      ];
      badgeColor = isDark ? 'bg-amber-950/60 text-amber-300 border-amber-800/60' : 'bg-amber-50 text-amber-800 border-amber-200';
    } else if (pupil === 'midriasis' && hr === 'takikardia' && bp === 'hipertensi' && temp === 'hipertermia' && bowel === 'hiperaktif') {
      detected = 'Sympathomimetic Syndrome (Amphetamine / Kokain)';
      recommendations = [
        '⚠️ Toksidrom Simpatomimetik (Agitasi, takikardia, hipertensi, midriasis, diaforesis).',
        '💊 Berikan Benzodiazepin (Lorazepam/Diazepam) untuk mengontrol agitasi, hipertensi, dan takikardia.'
      ];
      badgeColor = isDark ? 'bg-purple-950/60 text-purple-300 border-purple-800/60' : 'bg-purple-50 text-purple-800 border-purple-200';
    } else if (pupil === 'miosis' && hr === 'bradikardia' && bowel === 'hiperaktif') {
      detected = 'Cholinergic Syndrome (Organofosfat / Karbamat)';
      recommendations = [
        '🚨 Toksidrom Kolinergik ("DUMBELS": Diarrhea, Urination, Miosis, Bronchospasm, Emesis, Lacrimation, Salivation).',
        '💊 Berikan Atropin Sulfat IV dosis tinggi berulang + Pralidoksim (2-PAM) sebagai reaktivator kolinesterase.'
      ];
      badgeColor = isDark ? 'bg-red-950/60 text-red-300 border-red-800/60' : 'bg-red-50 text-red-800 border-red-200';
    }

    const res = { detected, recommendations, badgeColor };
    setToxidromeResult(res);

    if (setPatientData) {
      setPatientData({
        toxicology: { type: 'Toxidrome', status: detected }
      });
    }
  };

  // --- LOGIC 2: ANION GAP & OSMOLAR GAP ---
  const calculateAnionOsmolar = (e) => {
    e.preventDefault();
    const sodium = parseFloat(na);
    const chloride = parseFloat(cl);
    const bicarb = parseFloat(hco3);
    const mOsm = parseFloat(measuredOsm);
    const b = parseFloat(bun);
    const g = parseFloat(glucose);

    if (isNaN(sodium) || isNaN(chloride) || isNaN(bicarb)) {
      alert('Mohon isi Na, Cl, dan HCO3 minimal untuk menghitung Anion Gap!');
      return;
    }

    // Anion Gap = Na - (Cl + HCO3) [Normal: 8 - 12 mEq/L]
    const ag = sodium - (chloride + bicarb);
    let agStatus = ag > 12 ? 'High Anion Gap Metabolic Acidosis (HAGMA)' : 'Normal Anion Gap';

    let osmGap = null;
    let osmStatus = '-';
    if (!isNaN(mOsm) && !isNaN(b) && !isNaN(g)) {
      // Calculated Osmolality = 2*Na + (Glucose / 18) + (BUN / 2.8)
      const calcOsm = (2 * sodium) + (g / 18) + (b / 2.8);
      osmGap = mOsm - calcOsm;
      osmStatus = osmGap > 10 ? 'Elevated Osmolar Gap (> 10 mOsm/kg): Kecurigaan Toksin Alkohol (Metanol, Etilen Glikol, Isopropil)' : 'Normal Osmolar Gap';
    }

    const res = { ag: Number(ag.toFixed(1)), agStatus, osmGap: osmGap !== null ? Number(osmGap.toFixed(1)) : null, osmStatus };
    setAgResult(res);
  };

  // --- LOGIC 3: WIDMARK BLOOD ALCOHOL CONCENTRATION (BAC) ---
  const calculateAlcohol = (e) => {
    e.preventDefault();
    const vol = parseFloat(volumeMl);
    const wt = parseFloat(weightKg);
    const hp = parseFloat(hoursPassed) || 0;

    if (isNaN(vol) || isNaN(wt) || wt <= 0) {
      alert('Mohon isi volume minuman dan berat badan dengan benar!');
      return;
    }

    let abv = 0.05;
    if (alcDrink === 'wine') abv = 0.12;
    if (alcDrink === 'spirit') abv = 0.40;

    const alcoholGrams = vol * abv * 0.8;
    const r = 0.60;
    const bodyWeightGrams = wt * 1000;

    let peakBac = (alcoholGrams / (bodyWeightGrams * r)) * 100;
    const metabolismRate = 0.015;
    let currentBac = peakBac - (metabolismRate * hp);
    if (currentBac < 0) currentBac = 0;

    const res = {
      alcoholGrams: Number(alcoholGrams.toFixed(1)),
      peakBac: Number(peakBac.toFixed(3)),
      currentBac: Number(currentBac.toFixed(3)),
      clinicalEffect: getAlcoholEffect(currentBac)
    };
    setAlcResult(res);
  };

  const getAlcoholEffect = (bac) => {
    if (bac === 0) return 'Sobril / Bersih dari alkohol terdeteksi.';
    if (bac < 0.05) return 'Efek ringan: Penurunan inhibisi, euforia ringan.';
    if (bac < 0.10) return 'Gangguan koordinasi motorik, bicara mulai pelo, penurunan kewaspadaan.';
    if (bac < 0.20) return 'Mabuk berat: Ataksia nyata, gangguan emosi, mual/muntah.';
    if (bac < 0.30) return 'Kondisi kebingungan berat (Confusion), risiko aspirasi & hipotermia.';
    return '🚨 Koma / Risiko Depresi Pernapasan Fatal (Gawat Darurat Medis!).';
  };

  const handleSaveToHistory = (title, summaryText) => {
    addLabRecord({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: `Toksikologi: ${title}`,
      value: summaryText,
      unit: 'Hasil Evaluasi',
      source: 'Toxicology Calculator v3'
    });

    if (onSaveHistory) {
      onSaveHistory({ type: title, summary: summaryText });
    }
    alert('✅ Hasil Toksikologi berhasil disimpan ke Outcome Tracker Pasien!');
  };

  return (
    <div className={`p-6 rounded-2xl border shadow-xl space-y-6 text-xs ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* HEADER & PASIEN SYNC */}
      <div className={`border-b pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div>
          <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <span>🧪</span> Kalkulator Toksikologi Klinis & Manajemen Keracunan
          </h2>
          <p className={`mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Evaluasi toksidrom, Anion/Osmolar Gap, estimasi kadar alkohol darah (BAC), dan panduan antidot IGD.
          </p>
        </div>
        {patient?.patientName && (
          <div className="text-right text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 font-medium">
            Pasien: <strong>{patient.patientName}</strong> (RM: {patient.patientId || '-'})
          </div>
        )}
      </div>

      {/* SUB-TABS NAVIGASI */}
      <div className={`flex flex-wrap gap-2 border-b pb-4 font-semibold ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <button
          type="button"
          onClick={() => setSubTab('toxidrome')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            subTab === 'toxidrome'
              ? 'bg-blue-600 text-white shadow-md'
              : isDark
              ? 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          🔍 Deteksi Toksidrom
        </button>
        <button
          type="button"
          onClick={() => setSubTab('anion_osmolar')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            subTab === 'anion_osmolar'
              ? 'bg-blue-600 text-white shadow-md'
              : isDark
              ? 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          🩸 Anion & Osmolar Gap
        </button>
        <button
          type="button"
          onClick={() => setSubTab('alcohol')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            subTab === 'alcohol'
              ? 'bg-blue-600 text-white shadow-md'
              : isDark
              ? 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          🍺 Alkohol & BAC (Widmark)
        </button>
        <button
          type="button"
          onClick={() => setSubTab('antidote')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            subTab === 'antidote'
              ? 'bg-blue-600 text-white shadow-md'
              : isDark
              ? 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          💊 Panduan Antidot IGD
        </button>
      </div>

      {/* KONTEN 1: TOXIDROME CHECKER */}
      {subTab === 'toxidrome' && (
        <form onSubmit={evaluateToxidrome} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tox-pupil-select" className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Ukuran Pupil (Mata)</label>
              <select
                id="tox-pupil-select"
                value={pupil}
                onChange={(e) => setPupil(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 outline-none font-semibold cursor-pointer ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              >
                <option value="normal">Normal</option>
                <option value="miosis">Miosis (Kecil / Pinpoint)</option>
                <option value="midriasis">Midriasis (Melebar)</option>
              </select>
            </div>
            <div>
              <label htmlFor="tox-hr-select" className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Denyut Jantung (HR)</label>
              <select
                id="tox-hr-select"
                value={hr}
                onChange={(e) => setHr(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 outline-none font-semibold cursor-pointer ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              >
                <option value="normal">Normal</option>
                <option value="bradikardia">Bradikardia (&lt; 60 bpm)</option>
                <option value="takikardia">Takikardia (&gt; 100 bpm)</option>
              </select>
            </div>
            <div>
              <label htmlFor="tox-bp-select" className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Tekanan Darah (TD)</label>
              <select
                id="tox-bp-select"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 outline-none font-semibold cursor-pointer ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              >
                <option value="normal">Normal</option>
                <option value="hipotensi">Hipotensi</option>
                <option value="hipertensi">Hipertensi</option>
              </select>
            </div>
            <div>
              <label htmlFor="tox-temp-select" className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Suhu Tubuh</label>
              <select
                id="tox-temp-select"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 outline-none font-semibold cursor-pointer ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              >
                <option value="normal">Normal</option>
                <option value="hipotermia">Hipotermia</option>
                <option value="hipertermia">Hipertermia</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="tox-bowel-select" className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Bising Usus (GI Motility)</label>
              <select
                id="tox-bowel-select"
                value={bowel}
                onChange={(e) => setBowel(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 outline-none font-semibold cursor-pointer ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              >
                <option value="normal">Normal</option>
                <option value="menurun">Menurun / Hipoperistaltik</option>
                <option value="hiperaktif">Hiperaktif / Diare</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-lg">
            Analisis Toxidrome Klinis ➔
          </button>

          {toxidromeResult && (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className={`flex items-center justify-between border-b pb-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Hasil Deteksi:</span>
                <span className={`font-bold px-3 py-1 rounded-xl border ${toxidromeResult.badgeColor}`}>{toxidromeResult.detected}</span>
              </div>
              <ul className={`space-y-1.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {toxidromeResult.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
              <div className="text-right pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveToHistory('Toksidrom Klinis', `Deteksi: ${toxidromeResult.detected}`)}
                  className={`font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer border ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-blue-700 border-slate-300'
                  }`}
                >
                  📈 Simpan ke Outcome Tracker Pasien
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* KONTEN 2: ANION & OSMOLAR GAP */}
      {subTab === 'anion_osmolar' && (
        <form onSubmit={calculateAnionOsmolar} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="tox-na-input" className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Natrium (Na⁺) mEq/L</label>
              <input
                id="tox-na-input"
                type="number"
                value={na}
                onChange={(e) => setNa(e.target.value)}
                placeholder="e.g. 140"
                className={`w-full border rounded-xl px-3 py-2.5 outline-none font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
                required
              />
            </div>
            <div>
              <label htmlFor="tox-cl-input" className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Klorida (Cl⁻) mEq/L</label>
              <input
                id="tox-cl-input"
                type="number"
                value={cl}
                onChange={(e) => setCl(e.target.value)}
                placeholder="e.g. 104"
                className={`w-full border rounded-xl px-3 py-2.5 outline-none font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
                required
              />
            </div>
            <div>
              <label htmlFor="tox-hco3-input" className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Bikarbonat (HCO₃⁻)</label>
              <input
                id="tox-hco3-input"
                type="number"
                value={hco3}
                onChange={(e) => setHco3(e.target.value)}
                placeholder="e.g. 22"
                className={`w-full border rounded-xl px-3 py-2.5 outline-none font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
                required
              />
            </div>
            <div>
              <label htmlFor="tox-osm-input" className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Measured Osmolality (Opsional)</label>
              <input
                id="tox-osm-input"
                type="number"
                value={measuredOsm}
                onChange={(e) => setMeasuredOsm(e.target.value)}
                placeholder="e.g. 310"
                className={`w-full border rounded-xl px-3 py-2.5 outline-none font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              />
            </div>
            <div>
              <label htmlFor="tox-bun-input" className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>BUN (mg/dL)</label>
              <input
                id="tox-bun-input"
                type="number"
                value={bun}
                onChange={(e) => setBun(e.target.value)}
                placeholder="e.g. 15"
                className={`w-full border rounded-xl px-3 py-2.5 outline-none font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              />
            </div>
            <div>
              <label htmlFor="tox-glu-input" className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Glukosa Darah (mg/dL)</label>
              <input
                id="tox-glu-input"
                type="number"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                placeholder="e.g. 100"
                className={`w-full border rounded-xl px-3 py-2.5 outline-none font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-lg">
            Hitung Anion Gap & Osmolar Gap ➔
          </button>

          {agResult && (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className={`block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Anion Gap: <strong>{agResult.ag} mEq/L</strong></span>
                  <span className="text-amber-500 font-bold">{agResult.agStatus}</span>
                </div>
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className={`block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Osmolar Gap: <strong>{agResult.osmGap !== null ? `${agResult.osmGap} mOsm/kg` : 'Data kurang'}</strong></span>
                  <span className="text-blue-500 font-bold">{agResult.osmStatus}</span>
                </div>
              </div>
              <div className="text-right pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveToHistory('Anion & Osmolar Gap', `AG: ${agResult.ag} mEq/L (${agResult.agStatus})`)}
                  className={`font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer border ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-blue-700 border-slate-300'
                  }`}
                >
                  📈 Simpan ke Outcome Tracker Pasien
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* KONTEN 3: WIDMARK BLOOD ALCOHOL */}
      {subTab === 'alcohol' && (
        <form onSubmit={calculateAlcohol} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tox-drink-select" className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Jenis Minuman Beralkohol</label>
              <select
                id="tox-drink-select"
                value={alcDrink}
                onChange={(e) => setAlcDrink(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 outline-none font-semibold cursor-pointer ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              >
                <option value="beer">Bir (~5% ABV)</option>
                <option value="wine">Wine / Anggur (~12% ABV)</option>
                <option value="spirit">Spirit / Hard Liquor (~40% ABV)</option>
              </select>
            </div>
            <div>
              <label htmlFor="tox-vol-input" className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Volume Total Dikonsumsi (mL)</label>
              <input
                id="tox-vol-input"
                type="number"
                value={volumeMl}
                onChange={(e) => setVolumeMl(e.target.value)}
                placeholder="Contoh: 500"
                className={`w-full border rounded-xl px-3 py-2.5 outline-none font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
                required
              />
            </div>
            <div>
              <label htmlFor="tox-wt-input" className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Berat Badan Pasien (kg)</label>
              <input
                id="tox-wt-input"
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="Contoh: 65"
                className={`w-full border rounded-xl px-3 py-2.5 outline-none font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
                required
              />
            </div>
            <div>
              <label htmlFor="tox-hrs-input" className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Waktu Berlalu Sejak Minum (Jam)</label>
              <input
                id="tox-hrs-input"
                type="number"
                value={hoursPassed}
                onChange={(e) => setHoursPassed(e.target.value)}
                placeholder="Contoh: 2"
                className={`w-full border rounded-xl px-3 py-2.5 outline-none font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-lg">
            Estimasi Kadar Alkohol Darah (BAC) ➔
          </button>

          {alcResult && (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className={`block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Alkohol Murni</span>
                  <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{alcResult.alcoholGrams} gram</span>
                </div>
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className={`block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Peak BAC (Puncak)</span>
                  <span className="text-sm font-bold text-amber-500">{alcResult.peakBac}%</span>
                </div>
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className={`block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Current BAC (Saat Ini)</span>
                  <span className="text-sm font-bold text-red-500">{alcResult.currentBac}%</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <span className={`block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Efek Klinis:</span>
                <p className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{alcResult.clinicalEffect}</p>
              </div>
              <div className="text-right pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveToHistory('Alkohol & BAC', `Current BAC: ${alcResult.currentBac}% (${alcResult.clinicalEffect})`)}
                  className={`font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer border ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-blue-700 border-slate-300'
                  }`}
                >
                  📈 Simpan ke Outcome Tracker Pasien
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* KONTEN 4: PANDUAN ANTIDOT IGD */}
      {subTab === 'antidote' && (
        <div className="space-y-3">
          <div className={`p-4 rounded-xl border space-y-2 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><span>💉</span> Nalokson (Antidot Opioid)</h3>
            <p className={isDark ? 'text-slate-300' : 'text-slate-700'}><strong>Dosis:</strong> 0.4 mg - 2 mg IV/IM/IN. Dapat diulang tiap 2-3 menit jika tidak ada respons (max 10 mg).</p>
          </div>
          <div className={`p-4 rounded-xl border space-y-2 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><span>🧪</span> N-Acetylcysteine / NAC (Antidot Parasetamol)</h3>
            <p className={isDark ? 'text-slate-300' : 'text-slate-700'}><strong>Dosis IV:</strong> Loading dose 150 mg/kg dalam 200 mL D5% selama 1 jam, dilanjutkan 50 mg/kg dalam 4 jam, lalu 100 mg/kg dalam 16 jam.</p>
          </div>
          <div className={`p-4 rounded-xl border space-y-2 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><span>🌿</span> Atropin Sulfat (Antidot Organofosfat / Karbamat)</h3>
            <p className={isDark ? 'text-slate-300' : 'text-slate-700'}><strong>Dosis:</strong> 1 - 2 mg IV setiap 5-10 menit sampai tanda-tanda sekresi bronkus berhenti (Atropinisasi penuh).</p>
          </div>
          <div className={`p-4 rounded-xl border space-y-2 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><span>🛡️</span> Natrium Bikarbonat (Toksisitas TCA / Salisilat / Asidosis)</h3>
            <p className={isDark ? 'text-slate-300' : 'text-slate-700'}><strong>Dosis:</strong> 1 - 2 mEq/kg bolus IV untuk alkalinisasi urin dan darah pada keracunan antidepresan trisiklik.</p>
          </div>
        </div>
      )}
    </div>
  );
}