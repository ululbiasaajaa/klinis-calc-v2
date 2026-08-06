import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// RENTANG TERAPEUTIK STANDAR MEDIS
const DRUG_TARGETS = {
  vancomycin: { name: 'Vancomycin (Trough)', min: 15, max: 20, unit: 'mcg/mL' },
  phenytoin: { name: 'Phenytoin (Total Serum)', min: 10, max: 20, unit: 'mcg/mL' },
  digoxin: { name: 'Digoxin (Serum Level)', min: 0.8, max: 2.0, unit: 'ng/mL' },
  theophylline: { name: 'Theophylline', min: 10, max: 15, unit: 'mcg/mL' },
  gentamicin: { name: 'Gentamicin (Peak Target)', min: 5, max: 10, unit: 'mcg/mL' },
};

export default function TdmChartCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL DATA PASIEN GLOBAL DAN DISPATCHERS V3
  const { patient, addLabRecord, addMedication } = usePatientStore();

  const [selectedDrug, setSelectedDrug] = useState('vancomycin');
  const [dataPoints, setDataPoints] = useState([
    { label: 'Hari 1 (08:00)', value: '11.5' },
    { label: 'Hari 2 (08:00)', value: '14.8' },
    { label: 'Hari 3 (08:00)', value: '17.2' },
  ]);

  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  const target = DRUG_TARGETS[selectedDrug];

  // TAMBAH TITIK KADAR OBAT BARU
  const handleAddPoint = (e) => {
    e.preventDefault();
    if (!newLabel || !newValue) return;
    setDataPoints([...dataPoints, { label: newLabel, value: newValue }]);
    setNewLabel('');
    setNewValue('');
  };

  // HAPUS POINT
  const handleRemovePoint = (index) => {
    setDataPoints(dataPoints.filter((_, i) => i !== index));
  };

  // CHART DATA CONFIGURATION
  const chartData = {
    labels: dataPoints.map((p) => p.label),
    datasets: [
      {
        label: `Kadar Serum ${target.name} (${target.unit})`,
        data: dataPoints.map((p) => parseFloat(p.value) || 0),
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3,
      },
      {
        label: `Batas Maksimum Terapeutik (${target.max} ${target.unit})`,
        data: dataPoints.map(() => target.max),
        borderColor: '#ef4444',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
      {
        label: `Batas Minimum Terapeutik (${target.min} ${target.unit})`,
        data: dataPoints.map(() => target.min),
        borderColor: '#10b981',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: isDark ? '#94a3b8' : '#475569', font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw} ${target.unit}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: isDark ? '#94a3b8' : '#475569', font: { size: 10 } },
        grid: { color: isDark ? '#1e293b' : '#e2e8f0' },
      },
      y: {
        ticks: { color: isDark ? '#94a3b8' : '#475569', font: { size: 10 } },
        grid: { color: isDark ? '#1e293b' : '#e2e8f0' },
      },
    },
  };

  // ANALISIS TREN STATUS TERKINI
  const latestVal = dataPoints.length > 0 ? parseFloat(dataPoints[dataPoints.length - 1].value) : 0;
  let statusBadge = { 
    color: isDark ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800', 
    text: '✅ TERAPEUTIK (Aman & Efektif)' 
  };

  if (latestVal > 0) {
    if (latestVal < target.min) {
      statusBadge = { 
        color: isDark ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-800', 
        text: '⚠️ SUB-TERAPEUTIK (Kadar Terlalu Rendah / Kurang Efektif)' 
      };
    } else if (latestVal > target.max) {
      statusBadge = { 
        color: isDark ? 'bg-red-950/60 border-red-500/50 text-red-300' : 'bg-red-50 border-red-300 text-red-800', 
        text: '🚨 TOKSIK / OVERDOSE (Risiko Efek Samping Fatal)' 
      };
    }
  }

  // HANDLER AKSI V3 DISPATCHERS
  const handleSaveToTracker = () => {
    addLabRecord({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: `TDM Kurva ${target.name}`,
      value: `Kadar Terakhir: ${latestVal} ${target.unit} (${statusBadge.text})`,
      unit: target.unit,
      source: 'TDM Chart Calculator v3'
    });
    alert(`✅ Data Kurva TDM berhasil disimpan ke Outcome Tracker Pasien!`);
  };

  const handleAddTdmMedication = () => {
    let recDoseStr = 'Pertahankan dosis saat ini (Rentang Terapeutik)';
    if (latestVal < target.min) {
      recDoseStr = 'Naikkan dosis harian / perpendek interval (Sub-terapeutik)';
    } else if (latestVal > target.max) {
      recDoseStr = 'Hentikan sementara / turunkan dosis (Toksik/Overdose)';
    }

    addMedication({
      name: `Penyesuaian ${target.name}`,
      dose: `${recDoseStr} (Kadar Terakhir: ${latestVal} ${target.unit})`,
      category: 'Therapeutic Drug Monitoring (TDM)',
      source: `Target: ${target.min} - ${target.max} ${target.unit}`
    });
    alert(`✅ Rekomendasi TDM berhasil ditambahkan ke regimen obat aktif pasien!`);
  };

  return (
    <div className="space-y-6 text-xs">
      
      {patient?.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Pemantauan TDM (Therapeutic Drug Monitoring).</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">STORE V3 SYNCED</span>
        </div>
      )}

      {/* SELEKSI OBAT NTI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="drug-selection" className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Pilih Obat NTI Terapi:</label>
          <select
            id="drug-selection"
            value={selectedDrug}
            onChange={(e) => setSelectedDrug(e.target.value)}
            className={`w-full p-3 border rounded-xl outline-none text-xs font-semibold cursor-pointer ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          >
            {Object.keys(DRUG_TARGETS).map((key) => (
              <option key={key} value={key}>
                {DRUG_TARGETS[key].name} (Target: {DRUG_TARGETS[key].min} - {DRUG_TARGETS[key].max} {DRUG_TARGETS[key].unit})
              </option>
            ))}
          </select>
        </div>

        {/* STATUS BADGE */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-center ${statusBadge.color}`}>
          <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-80 block">Status Kadar Terakhir:</span>
          <span className="text-xs font-bold mt-0.5">{statusBadge.text}</span>
        </div>
      </div>

      {/* GRAFIK KURVA LINE CHART */}
      <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h4 className={`text-xs font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          <span>📈</span> Kurva Pemantauan Kadar Obat Dalam Serum (Time-Series):
        </h4>
        <div className="h-64 sm:h-80 w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* INPUT DATA POINT BARU */}
      <div className={`p-4 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h4 className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>➕ Tambah Hasil Sampling Kadar Obat Baru:</h4>
        <form onSubmit={handleAddPoint} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="sampling-label" className="sr-only">Waktu atau Hari Sampling</label>
            <input
              id="sampling-label"
              type="text"
              placeholder="Waktu/Hari (e.g. Hari 4 - 08:00)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className={`w-full p-3 border rounded-xl text-xs outline-none font-semibold ${
                isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
              }`}
            />
          </div>
          <div>
            <label htmlFor="sampling-value" className="sr-only">Nilai Kadar Serum</label>
            <input
              id="sampling-value"
              type="number"
              step="0.1"
              placeholder={`Kadar (${target.unit})`}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className={`w-full p-3 border rounded-xl text-xs outline-none font-semibold ${
                isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
              }`}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer"
          >
            + Simpan Point Kadar
          </button>
        </form>

        {/* DAFTAR DATA POINTS */}
        <div className={`border-t pt-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <span className={`text-[11px] font-bold block mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Riwayat Titik Sampling:</span>
          <div className="flex flex-wrap gap-2">
            {dataPoints.map((point, idx) => (
              <div
                key={idx}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{point.label}:</span>
                <strong className="text-blue-500">{point.value} {target.unit}</strong>
                <button
                  type="button"
                  onClick={() => handleRemovePoint(idx)}
                  className="text-slate-400 hover:text-red-500 font-bold ml-1 cursor-pointer"
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AKSI SIMPAN DAN DISTRIBUSI KE STORE V3 */}
      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={handleSaveToTracker}
          className={`font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-2 border ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-blue-700 border-slate-300'
          }`}
        >
          📈 Simpan Grafik & Hasil ke Outcome Tracker
        </button>
        <button
          type="button"
          onClick={handleAddTdmMedication}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          💊 Tambahkan Rekomendasi TDM ke Regimen Pasien
        </button>
      </div>
    </div>
  );
}