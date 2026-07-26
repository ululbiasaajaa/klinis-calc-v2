import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('pk');

  // State Input
  const [pkInputs, setPkInputs] = useState({ targetConc: '', vd: '', weight: '', bioavailability: '1', clearance: '', interval: '8' });
  const [dripInputs, setDripInputs] = useState({ dose: '', weight: '', drugMg: '', volumeMl: '100' });
  const [renalInputs, setRenalInputs] = useState({ age: '', weight: '', scr: '', gender: 'male' });
  const [anthroInputs, setAnthroInputs] = useState({ height: '', weight: '', gender: 'male', tbsaBurn: '' });
  const [tdeeInputs, setTdeeInputs] = useState({ weight: '', height: '', age: '', gender: 'male', activityLevel: '1.2' });

  // Handle Input
  const handlePk = (e) => setPkInputs({ ...pkInputs, [e.target.name]: e.target.value });
  const handleDrip = (e) => setDripInputs({ ...dripInputs, [e.target.name]: e.target.value });
  const handleRenal = (e) => setRenalInputs({ ...renalInputs, [e.target.name]: e.target.value });
  const handleAnthro = (e) => setAnthroInputs({ ...anthroInputs, [e.target.name]: e.target.value });
  const handleTdee = (e) => setTdeeInputs({ ...tdeeInputs, [e.target.name]: e.target.value });

  // 1. Logika PK
  const ld = (() => {
    const { targetConc, vd, weight = 1, bioavailability = 1 } = pkInputs;
    if (!targetConc || !vd || bioavailability <= 0) return 0;
    return Number(((targetConc * (vd * (weight || 1))) / bioavailability).toFixed(2));
  })();

  const md = (() => {
    const { targetConc, clearance, interval, bioavailability = 1 } = pkInputs;
    if (!targetConc || !clearance || !interval || bioavailability <= 0) return 0;
    return Number(((targetConc * clearance * interval) / bioavailability).toFixed(2));
  })();

  // 2. Logika Drip
  const drip = (() => {
    const { dose, weight, drugMg, volumeMl } = dripInputs;
    if (!dose || !weight || !drugMg || !volumeMl) return 0;
    const conc = (drugMg * 1000) / volumeMl;
    return Number(((dose * weight * 60) / conc).toFixed(1));
  })();

  // 3. Logika Renal
  const clcr = (() => {
    const { age, weight, scr, gender } = renalInputs;
    if (!age || !weight || !scr || scr <= 0) return 0;
    let res = ((140 - age) * weight) / (72 * scr);
    if (gender === 'female') res *= 0.85;
    return Number(res.toFixed(1));
  })();

  const egfr = (() => {
    const { age, scr, gender } = renalInputs;
    if (!age || !scr || scr <= 0) return 0;
    const kappa = gender === 'female' ? 0.7 : 0.9;
    const alpha = gender === 'female' ? -0.241 : -0.302;
    const genderFactor = gender === 'female' ? 1.012 : 1.0;
    const res = 142 * Math.pow(Math.min(scr / kappa, 1), alpha) * Math.pow(Math.max(scr / kappa, 1), -1.2) * Math.pow(0.9938, age) * genderFactor;
    return Number(res.toFixed(1));
  })();

  // 4. Logika Body & Cairan
  const bsa = (() => {
    const { height, weight } = anthroInputs;
    if (!height || !weight) return 0;
    return Number(Math.sqrt((height * weight) / 3600).toFixed(2));
  })();

  const { bmi, ibw } = (() => {
    const { height, weight, gender } = anthroInputs;
    if (!height || !weight) return { bmi: 0, ibw: 0 };
    const hM = height / 100;
    const bmiVal = weight / (hM * hM);
    const hInches = height / 2.54;
    const ibwVal = hInches > 60 ? (gender === 'female' ? 45.5 : 50) + 2.3 * (hInches - 60) : (gender === 'female' ? 45.5 : 50);
    return { bmi: Number(bmiVal.toFixed(1)), ibw: Number(ibwVal.toFixed(1)) };
  })();

  const parkland = (() => {
    const { weight, tbsaBurn } = anthroInputs;
    if (!weight || !tbsaBurn) return { totalMl: 0, first8: 0, next16: 0 };
    const totalMl = 4 * weight * tbsaBurn;
    return { totalMl: Number(totalMl.toFixed(0)), first8: Number((totalMl / 2).toFixed(0)), next16: Number((totalMl / 2).toFixed(0)) };
  })();

  // 5. Logika TDEE
  const { bmr, tdee } = (() => {
    const { weight, height, age, gender, activityLevel } = tdeeInputs;
    if (!weight || !height || !age) return { bmr: 0, tdee: 0 };
    let bmrVal = (10 * weight) + (6.25 * height) - (5 * age) + (gender === 'female' ? -161 : 5);
    return { bmr: Number(bmrVal.toFixed(0)), tdee: Number((bmrVal * (parseFloat(activityLevel) || 1.2)).toFixed(0)) };
  })();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-xl bg-slate-800 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-700">
        
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-blue-400">Clinical Suite</h1>
          <p className="text-slate-400 text-sm mt-1">Kalkulator Medis & Farmasi Klinis</p>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-1 bg-slate-900/80 p-1 rounded-xl mb-6 border border-slate-700/50">
          <button onClick={() => setActiveTab('pk')} className={`py-2 text-[11px] md:text-xs font-semibold rounded-lg transition-all ${activeTab === 'pk' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Dosis PK</button>
          <button onClick={() => setActiveTab('drip')} className={`py-2 text-[11px] md:text-xs font-semibold rounded-lg transition-all ${activeTab === 'drip' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Dosis Drip</button>
          <button onClick={() => setActiveTab('renal')} className={`py-2 text-[11px] md:text-xs font-semibold rounded-lg transition-all ${activeTab === 'renal' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Fungsi Ginjal</button>
          <button onClick={() => setActiveTab('anthro')} className={`py-2 text-[11px] md:text-xs font-semibold rounded-lg transition-all ${activeTab === 'anthro' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Body & Cairan</button>
          <button onClick={() => setActiveTab('kalori')} className={`py-2 text-[11px] md:text-xs font-semibold rounded-lg transition-all ${activeTab === 'kalori' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Kalori Harian</button>
        </div>

        {/* TAB 1: DOSIS PK */}
        {activeTab === 'pk' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Target Conc (mg/L)</label><input type="number" name="targetConc" value={pkInputs.targetConc} onChange={handlePk} placeholder="e.g. 15" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Vd (L/kg)</label><input type="number" name="vd" value={pkInputs.vd} onChange={handlePk} placeholder="e.g. 0.7" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">BB Pasien (kg)</label><input type="number" name="weight" value={pkInputs.weight} onChange={handlePk} placeholder="e.g. 60" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Bioavailabilitas (F)</label><select name="bioavailability" value={pkInputs.bioavailability} onChange={handlePk} className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none"><option value="1">1.0 (IV / Intravena)</option><option value="0.8">0.8 (Oral 80%)</option></select></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Clearance (L/jam)</label><input type="number" name="clearance" value={pkInputs.clearance} onChange={handlePk} placeholder="e.g. 3.0" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Interval (Jam)</label><input type="number" name="interval" value={pkInputs.interval} onChange={handlePk} placeholder="e.g. 8" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-950/40 border border-blue-800/50 p-4 rounded-xl">
              <div><span className="text-xs font-bold text-blue-400 block mb-1">Loading Dose</span><span className="text-3xl font-extrabold text-white">{ld} <span className="text-sm font-normal text-slate-400">mg</span></span></div>
              <div><span className="text-xs font-bold text-blue-400 block mb-1">Maintenance Dose</span><span className="text-3xl font-extrabold text-white">{md} <span className="text-sm font-normal text-slate-400">mg / {pkInputs.interval || 0}j</span></span></div>
            </div>
          </div>
        )}

        {/* TAB 2: DOSIS DRIP */}
        {activeTab === 'drip' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Dosis (mcg/kg/min)</label><input type="number" name="dose" value={dripInputs.dose} onChange={handleDrip} placeholder="e.g. 5" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">BB Pasien (kg)</label><input type="number" name="weight" value={dripInputs.weight} onChange={handleDrip} placeholder="e.g. 60" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Jumlah Obat (mg)</label><input type="number" name="drugMg" value={dripInputs.drugMg} onChange={handleDrip} placeholder="e.g. 250" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Volume Cairan (mL)</label><input type="number" name="volumeMl" value={dripInputs.volumeMl} onChange={handleDrip} placeholder="e.g. 100" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none" /></div>
            </div>
            <div className="bg-blue-950/40 border border-blue-800/50 p-4 rounded-xl text-center">
              <span className="text-xs font-bold text-blue-400 block mb-1">Kecepatan Infus / Syringe Pump</span>
              <span className="text-4xl font-extrabold text-white">{drip} <span className="text-base font-normal text-slate-400">mL/jam</span></span>
            </div>
          </div>
        )}

        {/* TAB 3: FUNGSI GINJAL */}
        {activeTab === 'renal' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Usia (Tahun)</label><input type="number" name="age" value={renalInputs.age} onChange={handleRenal} placeholder="e.g. 55" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">BB Pasien (kg)</label><input type="number" name="weight" value={renalInputs.weight} onChange={handleRenal} placeholder="e.g. 65" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Serum Creatinine (mg/dL)</label><input type="number" name="scr" value={renalInputs.scr} onChange={handleRenal} placeholder="e.g. 1.2" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Jenis Kelamin</label><select name="gender" value={renalInputs.gender} onChange={handleRenal} className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none"><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-950/40 border border-blue-800/50 p-4 rounded-xl">
              <div><span className="text-xs font-bold text-blue-400 block mb-1">ClCr (Cockcroft-Gault)</span><span className="text-3xl font-extrabold text-white">{clcr} <span className="text-sm font-normal text-slate-400">mL/menit</span></span></div>
              <div><span className="text-xs font-bold text-blue-400 block mb-1">eGFR (CKD-EPI 2021)</span><span className="text-3xl font-extrabold text-white">{egfr} <span className="text-sm font-normal text-slate-400">mL/min/1.73m²</span></span></div>
            </div>
          </div>
        )}

        {/* TAB 4: BODY & CAIRAN */}
        {activeTab === 'anthro' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Tinggi Badan (cm)</label><input type="number" name="height" value={anthroInputs.height} onChange={handleAnthro} placeholder="e.g. 170" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">BB Pasien (kg)</label><input type="number" name="weight" value={anthroInputs.weight} onChange={handleAnthro} placeholder="e.g. 70" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Jenis Kelamin</label><select name="gender" value={anthroInputs.gender} onChange={handleAnthro} className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none"><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Luka Bakar / TBSA (%)</label><input type="number" name="tbsaBurn" value={anthroInputs.tbsaBurn} onChange={handleAnthro} placeholder="e.g. 30" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3 bg-blue-950/40 border border-blue-800/50 p-4 rounded-xl text-center mb-4">
              <div><span className="text-[10px] font-bold text-blue-400 block mb-1">BSA</span><span className="text-xl font-extrabold text-white">{bsa} m²</span></div>
              <div><span className="text-[10px] font-bold text-blue-400 block mb-1">BMI</span><span className="text-xl font-extrabold text-white">{bmi} kg/m²</span></div>
              <div><span className="text-[10px] font-bold text-blue-400 block mb-1">IBW</span><span className="text-xl font-extrabold text-white">{ibw} kg</span></div>
            </div>
            {anthroInputs.tbsaBurn > 0 && (
              <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl">
                <span className="text-xs font-bold text-amber-400 block mb-2">🔥 Parkland Resusitasi</span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-800 p-2 rounded"><p className="text-slate-400">Total RL</p><p className="text-lg font-bold text-white">{parkland.totalMl} mL</p></div>
                  <div className="bg-slate-800 p-2 rounded"><p className="text-slate-400">8 Jam I</p><p className="text-lg font-bold text-amber-300">{parkland.first8} mL</p></div>
                  <div className="bg-slate-800 p-2 rounded"><p className="text-slate-400">16 Jam Sisa</p><p className="text-lg font-bold text-amber-300">{parkland.next16} mL</p></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: KALORI HARIAN */}
        {activeTab === 'kalori' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Usia (Tahun)</label><input type="number" name="age" value={tdeeInputs.age} onChange={handleTdee} placeholder="e.g. 25" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Tinggi Badan (cm)</label><input type="number" name="height" value={tdeeInputs.height} onChange={handleTdee} placeholder="e.g. 170" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">BB Pasien (kg)</label><input type="number" name="weight" value={tdeeInputs.weight} onChange={handleTdee} placeholder="e.g. 65" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-300 mb-1">Jenis Kelamin</label><select name="gender" value={tdeeInputs.gender} onChange={handleTdee} className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none"><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></div>
              <div className="md:col-span-2"><label className="block text-xs font-semibold text-slate-300 mb-1">Aktivitas Harian</label><select name="activityLevel" value={tdeeInputs.activityLevel} onChange={handleTdee} className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none"><option value="1.2">Istirahat Total (x1.2)</option><option value="1.375">Ringan (x1.375)</option><option value="1.55">Sedang (x1.55)</option><option value="1.725">Berat (x1.725)</option></select></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-950/40 border border-blue-800/50 p-4 rounded-xl">
              <div><span className="text-xs font-bold text-blue-400 block mb-1">BMR</span><span className="text-3xl font-extrabold text-white">{bmr} <span className="text-sm font-normal text-slate-400">kcal/hari</span></span></div>
              <div><span className="text-xs font-bold text-blue-400 block mb-1">TDEE</span><span className="text-3xl font-extrabold text-emerald-400">{tdee} <span className="text-sm font-normal text-slate-400">kcal/hari</span></span></div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}