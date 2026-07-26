import React from 'react';

export default function NtiCalculator({
  ntiSubTab,
  setNtiSubTab,
  ntiPhenytoin,
  setNtiPhenytoin,
  phenytoinAdj,
  ntiVanco,
  setNtiVanco,
  vancoAuc,
  ntiTheo,
  setNtiTheo,
  theoDoseRec,
  ntiWarfarin,
  setNtiWarfarin,
  warfarinRec,
  ntiAmino,
  setNtiAmino,
  aminoDose,
}) {
  return (
    <div>
      {/* SUBTAB SWITCHER */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 mb-6 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setNtiSubTab('phenytoin')}
          className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${
            ntiSubTab === 'phenytoin' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Phenytoin
        </button>
        <button
          onClick={() => setNtiSubTab('vanco')}
          className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${
            ntiSubTab === 'vanco' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Vancomycin
        </button>
        <button
          onClick={() => setNtiSubTab('theo')}
          className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${
            ntiSubTab === 'theo' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Teofilin
        </button>
        <button
          onClick={() => setNtiSubTab('warfarin')}
          className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${
            ntiSubTab === 'warfarin' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Warfarin (INR)
        </button>
        <button
          onClick={() => setNtiSubTab('amino')}
          className={`col-span-2 md:col-span-1 py-2 text-[11px] font-semibold rounded-lg transition-all ${
            ntiSubTab === 'amino' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Amikasin/Gentamisin
        </button>
      </div>

      {/* 1. PHENYTOIN */}
      {ntiSubTab === 'phenytoin' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phenytoin Kadar Terukur / Total (mcg/mL)
              </label>
              <input
                type="number"
                value={ntiPhenytoin.phenytoinObs}
                onChange={(e) => setNtiPhenytoin({ ...ntiPhenytoin, phenytoinObs: e.target.value })}
                placeholder="e.g. 8.5"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kadar Albumin Pasien (g/dL)
              </label>
              <input
                type="number"
                value={ntiPhenytoin.albumin}
                onChange={(e) => setNtiPhenytoin({ ...ntiPhenytoin, albumin: e.target.value })}
                placeholder="e.g. 2.5"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div className="bg-blue-950/40 border border-blue-800/50 p-5 rounded-2xl text-center mb-4">
            <span className="text-xs font-bold text-blue-400 block mb-1">
              Kadar Phenytoin Terkoreksi Albumin (Winter-Tozer)
            </span>
            <span className="text-4xl font-extrabold text-white">
              {phenytoinAdj} <span className="text-base font-normal text-slate-400">mcg/mL</span>
            </span>
          </div>

          {/* KETERANGAN KLINIS */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
            <p className="text-slate-300 font-bold">💡 Interpretasi Klinis Winter-Tozer:</p>
            <p className="text-slate-400 leading-relaxed">
              • <strong>Rentang Terapeutik Ideal:</strong> 10 – 20 mcg/mL.<br />
              • Phenytoin terikat kuat pada albumin (90%). Pada kondisi hypoalbuminemia (&lt;3.5 g/dL), kadar obat bebas meningkat sehingga kadar total terukur tampak lebih rendah dari kondisi sebenarnya.
            </p>
            {phenytoinAdj > 0 && phenytoinAdj < 10 && (
              <p className="text-amber-400 font-medium">⚠️ Sub-terapeutuik (&lt;10 mcg/mL): Risiko kejang berulang. Pertimbangkan penyesuaian dosis naik.</p>
            )}
            {phenytoinAdj >= 10 && phenytoinAdj <= 20 && (
              <p className="text-emerald-400 font-medium">✅ Kadar Terapeutik Aman (10 - 20 mcg/mL). Pertahankan dosis saat ini.</p>
            )}
            {phenytoinAdj > 20 && (
              <p className="text-red-400 font-medium">🚨 TOKSIK (&gt;20 mcg/mL): Risiko nistagmus, ataksia, dan penurunan kesadaran. Turunkan dosis!</p>
            )}
          </div>
        </div>
      )}

      {/* 2. VANCOMYCIN */}
      {ntiSubTab === 'vanco' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dosis Total 24 Jam (mg)</label>
              <input
                type="number"
                value={ntiVanco.dailyDoseMg}
                onChange={(e) => setNtiVanco({ ...ntiVanco, dailyDoseMg: e.target.value })}
                placeholder="e.g. 2000"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Serum Creatinine (mg/dL)</label>
              <input
                type="number"
                value={ntiVanco.scr}
                onChange={(e) => setNtiVanco({ ...ntiVanco, scr: e.target.value })}
                placeholder="e.g. 1.0"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">BB Pasien (kg)</label>
              <input
                type="number"
                value={ntiVanco.weight}
                onChange={(e) => setNtiVanco({ ...ntiVanco, weight: e.target.value })}
                placeholder="e.g. 60"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Usia Pasien (Tahun)</label>
              <input
                type="number"
                value={ntiVanco.age}
                onChange={(e) => setNtiVanco({ ...ntiVanco, age: e.target.value })}
                placeholder="e.g. 50"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div className="bg-blue-950/40 border border-blue-800/50 p-5 rounded-2xl text-center mb-4">
            <span className="text-xs font-bold text-blue-400 block mb-1">Estimasi AUC24 / MIC Ratio</span>
            <span className="text-4xl font-extrabold text-white">
              {vancoAuc} <span className="text-base font-normal text-slate-400">mg·hr/L</span>
            </span>
          </div>

          {/* KETERANGAN KLINIS */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
            <p className="text-slate-300 font-bold">💡 Guideline TDM Vancomycin (IDSA Guideline):</p>
            <p className="text-slate-400 leading-relaxed">
              • <strong>Target AUC24 / MIC:</strong> 400 – 600 mg·hr/L (asumsi MIC MRSA = 1 mg/L).<br />
              • Target AUC/MIC memberikan efikasi klinis maksimal serta menurunkan risiko Acute Kidney Injury (AKI) dibandingkan monitoring Trough kuno.
            </p>
            {vancoAuc > 0 && vancoAuc < 400 && (
              <p className="text-amber-400 font-medium">⚠️ AUC/MIC &lt; 400: Risiko kegagalan terapi infeksi MRSA. Naikkan dosis harian.</p>
            )}
            {vancoAuc >= 400 && vancoAuc <= 600 && (
              <p className="text-emerald-400 font-medium">✅ Target Terapeutik Optimal (400 - 600). Aman untuk ginjal & efektif membunuh bakteri!</p>
            )}
            {vancoAuc > 600 && (
              <p className="text-red-400 font-medium">🚨 AUC/MIC &gt; 600: Risiko Nefrotoksisitas (Gagal Ginjal Akut) meningkat signifikan!</p>
            )}
          </div>
        </div>
      )}

      {/* 3. TEOFILIN */}
      {ntiSubTab === 'theo' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kadar Teofilin Terukur Saat Ini (mcg/mL)
              </label>
              <input
                type="number"
                value={ntiTheo.currentLevel}
                onChange={(e) => setNtiTheo({ ...ntiTheo, currentLevel: e.target.value })}
                placeholder="e.g. 6.0"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Dosis Harian Saat Ini (mg/hari)
              </label>
              <input
                type="number"
                value={ntiTheo.currentDoseMg}
                onChange={(e) => setNtiTheo({ ...ntiTheo, currentDoseMg: e.target.value })}
                placeholder="e.g. 600"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div className="bg-blue-950/40 border border-blue-800/50 p-5 rounded-2xl text-center mb-4">
            <span className="text-xs font-bold text-blue-400 block mb-1">Rekomendasi Dosis Baru (Target 12.5 mcg/mL)</span>
            <span className="text-4xl font-extrabold text-white">
              {theoDoseRec} <span className="text-base font-normal text-slate-400">mg/hari</span>
            </span>
          </div>

          {/* KETERANGAN KLINIS */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
            <p className="text-slate-300 font-bold">💡 Rentang Kadar Terapeutik Teofilin:</p>
            <p className="text-slate-400 leading-relaxed">
              • <strong>Target Terapeutik:</strong> 10 – 15 mcg/mL (Dulu 10–20, dimodifikasi untuk cegah aritmia/mual).<br />
              • Toksisitas teofilin dapat menyebabkan mual, takikardia, aritmia jantung, hingga kejang fatal.
            </p>
          </div>
        </div>
      )}

      {/* 4. WARFARIN */}
      {ntiSubTab === 'warfarin' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nilai Terukur INR Pasien Saat Ini</label>
              <input
                type="number"
                value={ntiWarfarin.currentInr}
                onChange={(e) => setNtiWarfarin({ ...ntiWarfarin, currentInr: e.target.value })}
                placeholder="e.g. 3.8"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div className="bg-blue-950/40 border border-blue-800/50 p-5 rounded-2xl mb-4">
            <span className="text-xs font-bold text-blue-400 block mb-1">EVALUASI STATISTIK INR PASIEN:</span>
            <p className="text-lg font-bold text-white mb-2">{warfarinRec.status}</p>
            <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800">
              {warfarinRec.action}
            </p>
          </div>

          {/* KETERANGAN KLINIS */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
            <p className="text-slate-300 font-bold">💡 Guideline Antikoagulan (CHEST 2012/2021):</p>
            <p className="text-slate-400 leading-relaxed">
              • <strong>Target INR Standar:</strong> 2.0 – 3.0 (Atrial Fibrilasi, DVT/PE).<br />
              • <strong>Katup Jantung Mekanik:</strong> Target INR 2.5 – 3.5.
            </p>
          </div>
        </div>
      )}

      {/* 5. AMINOGLIKOSIDA */}
      {ntiSubTab === 'amino' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Pilihan Obat</label>
              <select
                value={ntiAmino.drugType}
                onChange={(e) => setNtiAmino({ ...ntiAmino, drugType: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              >
                <option value="amikacin">Amikasin (15 mg/kg)</option>
                <option value="gentamicin">Gentamisin / Tobramisin (5 mg/kg)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">BB Aktual Pasien (kg)</label>
              <input
                type="number"
                value={ntiAmino.weight}
                onChange={(e) => setNtiAmino({ ...ntiAmino, weight: e.target.value })}
                placeholder="e.g. 85"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tinggi Badan (cm)</label>
              <input
                type="number"
                value={ntiAmino.height}
                onChange={(e) => setNtiAmino({ ...ntiAmino, height: e.target.value })}
                placeholder="e.g. 165"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Serum Creatinine (mg/dL)</label>
              <input
                type="number"
                value={ntiAmino.scr}
                onChange={(e) => setNtiAmino({ ...ntiAmino, scr: e.target.value })}
                placeholder="e.g. 1.1"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Usia Pasien (Tahun)</label>
              <input
                type="number"
                value={ntiAmino.age}
                onChange={(e) => setNtiAmino({ ...ntiAmino, age: e.target.value })}
                placeholder="e.g. 45"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-950/40 border border-blue-800/50 p-5 rounded-2xl mb-4">
            <div>
              <span className="text-xs font-bold text-blue-400 block mb-1">Dosis Dosis Sekali Pemberian</span>
              <span className="text-3xl font-extrabold text-white">
                {aminoDose.doseMg} <span className="text-sm font-normal text-slate-400">mg</span>
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Didasarkan: {aminoDose.weightLabel}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-blue-400 block mb-1">Interval Infus Dosis Tinggi</span>
              <span className="text-2xl font-bold text-emerald-400">Setiap {aminoDose.interval}</span>
            </div>
          </div>

          {/* KETERANGAN KLINIS */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
            <p className="text-slate-300 font-bold">💡 High-Dose Extended-Interval Aminoglycoside Dosing:</p>
            <p className="text-slate-400 leading-relaxed">
              • Metode pemberian sekali sehari (dosis tinggi) mengoptimalkan <i>concentration-dependent killing</i> dan meminimalisir risiko akumulasi obat pada tubulus ginjal & telinga dalam.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}