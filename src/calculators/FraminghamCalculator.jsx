import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function FraminghamCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Ambil data pasien global dari store atas
  const { patient } = usePatientStore();

  const [gender, setGender] = useState('male'); // 'male' atau 'female'
  const [age, setAge] = useState('50');
  const [smoke, setSmoke] = useState('no');     // 'yes' atau 'no'
  const [diabetes, setDiabetes] = useState('no'); // 'yes' atau 'no'
  const [hdl, setHdl] = useState('50');         // mg/dL
  const [totalChol, setTotalChol] = useState('200'); // mg/dL
  const [sbp, setSbp] = useState('130');        // Tekanan Darah Sistolik
  const [treatedBp, setTreatedBp] = useState('no'); // 'yes' atau 'no'

  // Auto-sync data usia dan jenis kelamin dari Patient Context Bar
  useEffect(() => {
    if (patient) {
      if (patient.age !== '') {
        setAge(String(patient.age));
      }
      if (patient.gender !== '') {
        const isFemale = patient.gender === 'Perempuan';
        setGender(isFemale ? 'female' : 'male');
      }
    }
  }, [patient]);

  // Algoritma Estimasi Framingham Risk Score 10-Year PVD/CHD Risk (%)
  const riskResult = (() => {
    const a = parseInt(age) || 50;
    const h = parseFloat(hdl) || 50;
    const tc = parseFloat(totalChol) || 200;
    const s = parseFloat(sbp) || 120;

    if (gender === 'male') {
      // Pria (Estimasi Poin Framingham Sederhana)
      let points = 0;
      if (a >= 30 && a <= 34) points += 0;
      else if (a <= 39) points += 2;
      else if (a <= 44) points += 5;
      else if (a <= 49) points += 6;
      else if (a <= 54) points += 8;
      else if (a <= 59) points += 10;
      else if (a <= 64) points += 11;
      else if (a <= 69) points += 12;
      else if (a <= 74) points += 14;
      else points += 15;

      if (smoke === 'yes') points += 4;
      if (diabetes === 'yes') points += 3;

      if (tc < 160) points += 0;
      else if (tc < 200) points += 4;
      else if (tc < 240) points += 7;
      else if (tc < 280) points += 9;
      else points += 11;

      if (hdl >= 60) points -= 1;
      else if (hdl >= 50) points += 0;
      else if (hdl >= 40) points += 1;
      else points += 2;

      if (s < 120) points += 0;
      else if (s < 130) points += treatedBp === 'yes' ? 2 : 0;
      else if (s < 140) points += treatedBp === 'yes' ? 3 : 1;
      else if (s < 160) points += treatedBp === 'yes' ? 4 : 2;
      else points += treatedBp === 'yes' ? 5 : 3;

      // Konversi poin kasar pria ke risiko 10 tahun (%)
      let riskPercent = '< 1%';
      let category = 'Risiko Rendah (< 10%)';
      let colorBadge = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';

      if (points >= 0 && points <= 4) { riskPercent = '1%'; category = 'Risiko Rendah'; }
      else if (points === 5 || points === 6) { riskPercent = '2%'; category = 'Risiko Rendah'; }
      else if (points === 7) { riskPercent = '3%'; category = 'Risiko Rendah'; }
      else if (points === 8) { riskPercent = '4%'; category = 'Risiko Rendah'; }
      else if (points === 9) { riskPercent = '5%'; category = 'Risiko Rendah'; }
      else if (points === 10) { riskPercent = '6%'; category = 'Risiko Rendah'; }
      else if (points === 11) { riskPercent = '8%'; category = 'Risiko Rendah'; }
      else if (points === 12) { riskPercent = '10%'; category = 'Risiko Sedang (10 - 20%)'; colorBadge = 'text-amber-500 bg-amber-500/10 border-amber-500/30'; }
      else if (points === 13) { riskPercent = '12%'; category = 'Risiko Sedang (10 - 20%)'; colorBadge = 'text-amber-500 bg-amber-500/10 border-amber-500/30'; }
      else if (points === 14) { riskPercent = '16%'; category = 'Risiko Sedang (10 - 20%)'; colorBadge = 'text-amber-500 bg-amber-500/10 border-amber-500/30'; }
      else if (points === 15) { riskPercent = '20%'; category = 'Risiko Sedang (10 - 20%)'; colorBadge = 'text-amber-500 bg-amber-500/10 border-amber-500/30'; }
      else if (points === 16) { riskPercent = '25%'; category = 'Risiko Tinggi (> 20%)'; colorBadge = 'text-red-500 bg-red-500/10 border-red-500/30'; }
      else if (points >= 17) { riskPercent = '> 30%'; category = 'Risiko Tinggi (> 20%)'; colorBadge = 'text-red-500 bg-red-500/10 border-red-500/30'; }

      return { points, riskPercent, category, colorBadge };

    } else {
      // Wanita
      let points = 0;
      if (a >= 30 && a <= 34) points -= 9;
      else if (a <= 39) points -= 4;
      else if (a <= 44) points += 0;
      else if (a <= 49) points += 3;
      else if (a <= 54) points += 6;
      else if (a <= 59) points += 7;
      else if (a <= 64) points += 8;
      else if (a <= 69) points += 9;
      else if (a <= 74) points += 10;
      else points += 11;

      if (smoke === 'yes') points += 2;
      if (diabetes === 'yes') points += 4;

      if (tc < 160) points += 0;
      else if (tc < 200) points += 1;
      else if (tc < 240) points += 3;
      else if (tc < 280) points += 4;
      else points += 5;

      if (hdl >= 60) points -= 1;
      else if (hdl >= 50) points += 0;
      else if (hdl >= 40) points += 1;
      else points += 2;

      if (s < 120) points += 0;
      else if (s < 130) points += treatedBp === 'yes' ? 3 : 1;
      else if (s < 140) points += treatedBp === 'yes' ? 4 : 2;
      else if (s < 160) points += treatedBp === 'yes' ? 5 : 3;
      else points += treatedBp === 'yes' ? 6 : 4;

      let riskPercent = '< 1%';
      let category = 'Risiko Rendah (< 10%)';
      let colorBadge = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';

      if (points < 9) { riskPercent = '< 1%'; category = 'Risiko Rendah'; }
      else if (points === 9 || points === 10 || points === 11 || points === 12) { riskPercent = '1%'; category = 'Risiko Rendah'; }
      else if (points === 13 || points === 14) { riskPercent = '2%'; category = 'Risiko Rendah'; }
      else if (points === 15) { riskPercent = '3%'; category = 'Risiko Rendah'; }
      else if (points === 16) { riskPercent = '4%'; category = 'Risiko Rendah'; }
      else if (points === 17) { riskPercent = '5%'; category = 'Risiko Rendah'; }
      else if (points === 18) { riskPercent = '6%'; category = 'Risiko Rendah'; }
      else if (points === 19) { riskPercent = '8%'; category = 'Risiko Rendah'; }
      else if (points === 20) { riskPercent = '11%'; category = 'Risiko Sedang (10 - 20%)'; colorBadge = 'text-amber-500 bg-amber-500/10 border-amber-500/30'; }
      else if (points === 21) { riskPercent = '14%'; category = 'Risiko Sedang (10 - 20%)'; colorBadge = 'text-amber-500 bg-amber-500/10 border-amber-500/30'; }
      else if (points === 22) { riskPercent = '17%'; category = 'Risiko Sedang (10 - 20%)'; colorBadge = 'text-amber-500 bg-amber-500/10 border-amber-500/30'; }
      else if (points === 23) { riskPercent = '22%'; category = 'Risiko Tinggi (> 20%)'; colorBadge = 'text-red-500 bg-red-500/10 border-red-500/30'; }
      else if (points >= 24) { riskPercent = '> 30%'; category = 'Risiko Tinggi (> 20%)'; colorBadge = 'text-red-500 bg-red-500/10 border-red-500/30'; }

      return { points, riskPercent, category, colorBadge };
    }
  })();

  return (
    <div className="space-y-6 text-xs">
      
      {patient.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Usia & jenis kelamin tersinkronisasi otomatis.</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">Synced</span>
        </div>
      )}

      {/* HEADER */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="font-bold text-blue-500 mb-2">❤️ Framingham Risk Score (Risiko PJK 10 Tahun)</h3>
        <p className="text-slate-400 text-[11px] mb-4">
          Menilai persentase risiko seseorang terkena Penyakit Jantung Koroner (PJK) dalam kurun waktu 10 tahun ke depan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Jenis Kelamin</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            >
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Usia (Tahun)</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 50"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Riwayat Merokok</label>
            <select
              value={smoke}
              onChange={(e) => setSmoke(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            >
              <option value="no">Tidak Merokok</option>
              <option value="yes">Ya (Perokok Aktif)</option>
            </select>
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Riwayat Diabetes Mellitus</label>
            <select
              value={diabetes}
              onChange={(e) => setDiabetes(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            >
              <option value="no">Tidak Ada</option>
              <option value="yes">Ya (Pasien Diabetes)</option>
            </select>
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Kolesterol Total (mg/dL)</label>
            <input
              type="number"
              value={totalChol}
              onChange={(e) => setTotalChol(e.target.value)}
              placeholder="e.g. 200"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Kolesterol HDL (mg/dL)</label>
            <input
              type="number"
              value={hdl}
              onChange={(e) => setHdl(e.target.value)}
              placeholder="e.g. 50"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Tekanan Darah Sistolik (mmHg)</label>
            <input
              type="number"
              value={sbp}
              onChange={(e) => setSbp(e.target.value)}
              placeholder="e.g. 130"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Sedang Minum Obat Hipertensi?</label>
            <select
              value={treatedBp}
              onChange={(e) => setTreatedBp(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            >
              <option value="no">Tidak</option>
              <option value="yes">Ya</option>
            </select>
          </div>
        </div>
      </div>

      {/* HASIL KELUARAN */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-center gap-4 ${
        isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'
      }`}>
        <div>
          <span className="text-xs text-blue-500 font-bold block mb-1">ESTIMASI RISIKO PJK 10 TAHUN</span>
          <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{riskResult.riskPercent}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold block mb-1">KATEGORI RISIKO KLINIS</span>
          <span className={`px-3 py-1.5 rounded-xl font-extrabold text-xs border inline-block ${riskResult.colorBadge}`}>
            {riskResult.category}
          </span>
        </div>
      </div>

    </div>
  );
}