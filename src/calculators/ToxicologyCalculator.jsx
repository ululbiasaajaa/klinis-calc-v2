import React, { useState } from 'react';
import { usePatientStore } from '../store/usePatientStore';

export default function ToxicologyCalculator({ onSaveHistory }) {
  const { patient, setPatientData } = usePatientStore();

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
    let recommendations = ['Monitor tanda vital ketat (Airway, Breathing, Circulation).', 'Lakukan dekontaminasi gastrointestinal jika terindikasi dan dalam waktu < 1 jam ingestasi.'];
    let badgeColor = 'bg-slate-500/10 text-slate-400 border-slate-500/30';

    if (pupil === 'miosis' && hr === 'bradikardia' && temp === 'hipotermia' && (bowel === 'hiperaktif' || bowel === 'normal')) {
      detected = 'Opioid / Opiate Syndrome';
      recommendations = [
        '🚨 Indikasi Kuat Toksidrom Opioid (Depresi pernapasan, miosis, penurunan kesadaran).',
        '💊 Berikan Antidot: Nalokson IV/IM (Dosis awal 0.4 - 2 mg, titrasi sampai napas adekuat).'
      ];
      badgeColor = 'bg-red-500/10 text-red-400 border-red-500/30';
    } else if (pupil === 'midriasis' && hr === 'takikardia' && bp === 'hipertensi' && temp === 'hipertermia' && bowel === 'menurun') {
      detected = 'Anticholinergic Syndrome (Atropinic)';
      recommendations = [
        '⚠️ Toksidrom Antikolinergik ("Blind as a bat, mad as a hatter, red as a beet, hot as a hare, dry as a bone").',
        '💊 Manajemen suportif, pendinginan fisik jika hipertermia berat. Pertimbangkan Fisostigmin jika ada indikasi sistemik parah.'
      ];
      badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    } else if (pupil === 'midriasis' && hr === 'takikardia' && bp === 'hipertensi' && temp === 'hipertermia' && bowel === 'hiperaktif') {
      detected = 'Sympathomimetic Syndrome (Amphetamine / Kokain)';
      recommendations = [
        '⚠️ Toksidrom Simpatomimetik (Agitasi, takikardia, hipertensi, midriasis, diaforesis).',
        '💊 Berikan Benzodiazepin (Lorazepam/Diazepam) untuk mengontrol agitasi, hipertensi, dan takikardia.'
      ];
      badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    } else if (pupil === 'miosis' && hr === 'bradikardia' && bowel === 'hiperaktif') {
      detected = 'Cholinergic Syndrome (Organofosfat / Karbamat)';
      recommendations = [
        '🚨 Toksidrom Kolinergik ("DUMBELS": Diarrhea, Urination, Miosis, Bronchospasm, Emesis, Lacrimation, Salivation).',
        '💊 Berikan Atropin Sulfat IV dosis tinggi berulang + Pralidoksim (2-PAM) sebagai reaktivator kolinesterase.'
      ];
      badgeColor = 'bg-red-500/10 text-red-400 border-red-500/30';
    }

    const res = { detected, recommendations, badgeColor };
    setToxidromeResult(res);

    setPatientData({
      toxicology: { type: 'Toxidrome', status: detected }
    });
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
      // Calculated Osmolality = 2*Na + (Glucose / 18) + (BUN / 2.8) [Asumsi satuan mg/dL standar]
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

    // Kadar alkohol berdasarkan jenis minuman
    // Beer: ~5%, Wine: ~12%, Spirit: ~40%
    let abv = 0.05;
    if (alcDrink === 'wine') abv = 0.12;
    if (alcDrink === 'spirit') abv = 0.40;

    // Massa alkohol murni (gram) = Volume (mL) * ABV * Density of alcohol (~0.8 g/mL)
    const alcoholGrams = vol * abv * 0.8;

    // Widmark Factor (r) -> Pria: 0.68, Wanita: 0.55 (Kita pakai rata-rata klinis 0.6 atau standar umum)
    const r = 0.60;
    const bodyWeightGrams = wt * 1000;

    // BAC peak (%) = [Alkohol (g) / (BB (g) * r)] * 100
    let peakBac = (alcoholGrams / (bodyWeightGrams * r)) * 100;

    // Rata-rata metabolisme hati menurunkan BAC sebesar ~0.015% per jam
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
    if (bac < 0.05) return 'Efek ringan: Penurunan inhibisi, euporia ringan.';
    if (bac < 0.10) return 'Gangguan koordinasi motorik, bicara mulai pelo, penurunan kewaspadaan.';
    if (bac < 0.20) return 'Mabuk berat: Ataksia nyata, gangguan emosi, mual/muntah.';
    if (bac < 0.30) return 'Kondisi kebingungan berat (Confusion), risiko aspirasi & hipotermia.';
    return '🚨 Koma / Risiko Depresi Pernapasan Fatal (Gawat Darurat Medis!).';
  };

  const handleSaveToHistory = (title, summaryText) => {
    if (onSaveHistory) {
      onSaveHistory({ type: title, summary: summaryText });
      alert('✅ Berhasil disalin & disimpan ke Riwayat Pasien!');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl text-slate-100 space-y-6">
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>🧪</span> Kalkulator Toksikologi Klinis & Manajemen Keracunan
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluasi toksidrom, Anion/Osmolar Gap, estimasi kadar alkohol darah (BAC), dan panduan antidot IGD.
          </p>
        </div>
        <div className="text-right text-[11px] text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20">
          Pasien: <strong>{patient.patientName || 'Umum'}</strong>
        </div>
      </div>

      {/* SUB-TABS NAVIGASI */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4 text-xs font-semibold">
        <button
          onClick={() => setSubTab('toxidrome')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            subTab === 'toxidrome' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          🔍 Deteksi Toksidrom
        </button>
        <button
          onClick={() => setSubTab('anion_osmolar')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            subTab === 'anion_osmolar' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          🩸 Anion & Osmolar Gap
        </button>
        <button
          onClick={() => setSubTab('alcohol')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            subTab === 'alcohol' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          🍺 Alkohol & BAC (Widmark)
        </button>
        <button
          onClick={() => setSubTab('antidote')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            subTab === 'antidote' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          💊 Panduan Antidot IGD
        </button>
      </div>

      {/* KONTEN 1: TOXIDROME CHECKER */}
      {subTab === 'toxidrome' && (
        <form onSubmit={evaluateToxidrome} className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ukuran Pupil (Mata)</label>
              <select value={pupil} onChange={(e) => setPupil(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none">
                <option value="normal">Normal</option>
                <option value="miosis">Miosis (Kecil / Pinpoint)</option>
                <option value="midriasis">Midriasis (Melebar)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Denyut Jantung (HR)</label>
              <select value={hr} onChange={(e) => setHr(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none">
                <option value="normal">Normal</option>
                <option value="bradikardia">Bradikardia (&lt; 60 bpm)</option>
                <option value="takikardia">Takikardia (&gt; 100 bpm)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tekanan Darah (TD)</label>
              <select value={bp} onChange={(e) => setBp(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none">
                <option value="normal">Normal</option>
                <option value="hipotensi">Hipotensi</option>
                <option value="hipertensi">Hipertensi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Suhu Tubuh</label>
              <select value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none">
                <option value="normal">Normal</option>
                <option value="hipotermia">Hipotermia</option>
                <option value="hipertermia">Hipertermia</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bising Usus (GI Motility)</label>
              <select value={bowel} onChange={(e) => setBowel(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none">
                <option value="normal">Normal</option>
                <option value="menurun">Menurun / Hipoperistaltik</option>
                <option value="hiperaktif">Hiperaktif / Diare</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-blue-600/20">
            Analisis Toxidrome Klinis ➔
          </button>

          {toxidromeResult && (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-400">Hasil Deteksi:</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${toxidromeResult.badgeColor}`}>{toxidromeResult.detected}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {toxidromeResult.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
              <div className="text-right">
                <button
                  onClick={() => handleSaveToHistory('Toksidrom Klinis', `Deteksi: ${toxidromeResult.detected}`)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Salin & Simpan Riwayat 📋
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* KONTEN 2: ANION & OSMOLAR GAP */}
      {subTab === 'anion_osmolar' && (
        <form onSubmit={calculateAnionOsmolar} className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Natrium (Na⁺) mEq/L</label>
              <input type="number" value={na} onChange={(e) => setNa(e.target.value)} placeholder="e.g. 140" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Klorida (Cl⁻) mEq/L</label>
              <input type="number" value={cl} onChange={(e) => setCl(e.target.value)} placeholder="e.g. 104" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bikarbonat (HCO₃⁻)</label>
              <input type="number" value={hco3} onChange={(e) => setHco3(e.target.value)} placeholder="e.g. 22" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Measured Osmolality (Opsional)</label>
              <input type="number" value={measuredOsm} onChange={(e) => setMeasuredOsm(e.target.value)} placeholder="e.g. 310" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">BUN (mg/dL)</label>
              <input type="number" value={bun} onChange={(e) => setBun(e.target.value)} placeholder="e.g. 15" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Glukosa Darah (mg/dL)</label>
              <input type="number" value={glucose} onChange={(e) => setGlucose(e.target.value)} placeholder="e.g. 100" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-lg">
            Hitung Anion Gap & Osmolar Gap ➔
          </button>

          {agResult && (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Anion Gap: <strong>{agResult.ag} mEq/L</strong></span>
                  <span className="text-amber-400 font-bold">{agResult.agStatus}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Osmolar Gap: <strong>{agResult.osmGap !== null ? `${agResult.osmGap} mOsm/kg` : 'Data kurang'}</strong></span>
                  <span className="text-blue-400 font-bold">{agResult.osmStatus}</span>
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={() => handleSaveToHistory('Anion & Osmolar Gap', `AG: ${agResult.ag} mEq/L (${agResult.agStatus})`)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Salin & Simpan Riwayat 📋
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* KONTEN 3: WIDMARK BLOOD ALCOHOL */}
      {subTab === 'alcohol' && (
        <form onSubmit={calculateAlcohol} className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Jenis Minuman Beralkohol</label>
              <select value={alcDrink} onChange={(e) => setAlcDrink(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none">
                <option value="beer">Bir (~5% ABV)</option>
                <option value="wine">Wine / Anggur (~12% ABV)</option>
                <option value="spirit">Spirit / Hard Liquor (~40% ABV)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Volume Total Dikonsumsi (mL)</label>
              <input type="number" value={volumeMl} onChange={(e) => setVolumeMl(e.target.value)} placeholder="Contoh: 500" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Berat Badan Pasien (kg)</label>
              <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="Contoh: 65" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Waktu Berlalu Sejak Minum (Jam)</label>
              <input type="number" value={hoursPassed} onChange={(e) => setHoursPassed(e.target.value)} placeholder="Contoh: 2" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-lg">
            Estimasi Kadar Alkohol Darah (BAC) ➔
          </button>

          {alcResult && (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Total Alkohol Murni</span>
                  <span className="text-sm font-bold text-white">{alcResult.alcoholGrams} gram</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Peak BAC (Puncak)</span>
                  <span className="text-sm font-bold text-amber-400">{alcResult.peakBac}%</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Current BAC (Estimasi Saat Ini)</span>
                  <span className="text-sm font-bold text-red-400">{alcResult.currentBac}%</span>
                </div>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 block mb-1">Efek Klinis:</span>
                <p className="text-slate-200 font-medium">{alcResult.clinicalEffect}</p>
              </div>
              <div className="text-right">
                <button
                  onClick={() => handleSaveToHistory('Alkohol & BAC', `Current BAC: ${alcResult.currentBac}% (${alcResult.clinicalEffect})`)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Salin & Simpan Riwayat 📋
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* KONTEN 4: PANDUAN ANTIDOT IGD */}
      {subTab === 'antidote' && (
        <div className="space-y-3 text-xs animate-fadeIn">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2"><span>💉</span> Nalokson (Antidot Opioid)</h3>
            <p className="text-slate-300"><strong>Dosis:</strong> 0.4 mg - 2 mg IV/IM/IN. Dapat diulang tiap 2-3 menit jika tidak ada respons (max 10 mg).</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2"><span>🧪</span> N-Acetylcysteine / NAC (Antidot Parasetamol)</h3>
            <p className="text-slate-300"><strong>Dosis IV:</strong> Loading dose 150 mg/kg dalam 200 mL D5% selama 1 jam, dilanjutkan 50 mg/kg dalam 4 jam, lalu 100 mg/kg dalam 16 jam.</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2"><span>🌿</span> Atropin Sulfat (Antidot Organofosfat / Karbamat)</h3>
            <p className="text-slate-300"><strong>Dosis:</strong> 1 - 2 mg IV setiap 5-10 menit sampai tanda-tanda sekresi bronkus berhenti (Atropinisasi penuh).</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2"><span>🛡️</span> Natrium Bikarbonat (Toksisitas TCA / Salisilat / Asidosis)</h3>
            <p className="text-slate-300"><strong>Dosis:</strong> 1 - 2 mEq/kg bolus IV untuk alkalinisasi urin dan darah pada keracunan antidepresan trisiklik.</p>
          </div>
        </div>
      )}
    </div>
  );
}