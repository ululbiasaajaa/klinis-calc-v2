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
  const [selectedDrug, setSelectedDrug] = useState('vancomycin');
  const [dataPoints, setDataPoints] = useState([
    { label: 'Hari 1 (08:00)', value: '11.5' },
    { label: 'Hari 2 (08:00)', value: '14.8' },
    { label: 'Hari 3 (08:00)', value: '17.2' },
  ]);

  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  const target = DRUG_TARGETS[selectedDrug];

  // TAMBAH TIPIK KADAR OBAT BARU
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
        labels: { color: '#94a3b8', font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw} ${target.unit}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 10 } },
        grid: { color: '#1e293b' },
      },
      y: {
        ticks: { color: '#94a3b8', font: { size: 10 } },
        grid: { color: '#1e293b' },
      },
    },
  };

  // ANALISIS TREN STATUS TERKINI
  const latestVal = dataPoints.length > 0 ? parseFloat(dataPoints[dataPoints.length - 1].value) : 0;
  let statusBadge = { color: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300', text: '✅ TERAPEUTIK (Aman & Efektif)' };

  if (latestVal > 0) {
    if (latestVal < target.min) {
      statusBadge = { color: 'bg-amber-950/60 border-amber-500/50 text-amber-300', text: '⚠️ SUB-TERAPEUTIK (Kadar Terlalu Rendah / Kurang Efektif)' };
    } else if (latestVal > target.max) {
      statusBadge = { color: 'bg-red-950/60 border-red-500/50 text-red-300', text: '🚨 TOKSIK / OVERDOSE (Risiko Efek Samping Fatal)' };
    }
  }

  return (
    <div className="space-y-6">
      {/* SELEKSI OBAT NTI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-bold">Pilih Obat NTI Terapi:</label>
          <select
            value={selectedDrug}
            onChange={(e) => setSelectedDrug(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs font-semibold"
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
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
        <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
          <span>📈</span> Kurva Pemantauan Kadar Obat Dalam Serum (Time-Series):
        </h4>
        <div className="h-64 sm:h-80 w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* INPUT DATA POINT BARU */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
        <h4 className="text-xs font-bold text-slate-300 mb-3">➕ Tambah Hasil Sampling Kadar Obat Baru:</h4>
        <form onSubmit={handleAddPoint} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Waktu/Hari (e.g. Hari 4 - 08:00)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
          />
          <input
            type="number"
            step="0.1"
            placeholder={`Kadar (${target.unit})`}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all"
          >
            + Simpan Point Kadar
          </button>
        </form>

        {/* DAFTAR DATA POINTS */}
        <div className="mt-4 border-t border-slate-800 pt-3">
          <span className="text-[11px] font-bold text-slate-400 block mb-2">Riwayat Titik Sampling:</span>
          <div className="flex flex-wrap gap-2">
            {dataPoints.map((point, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs"
              >
                <span className="text-slate-300 font-medium">{point.label}:</span>
                <strong className="text-blue-400">{point.value} {target.unit}</strong>
                <button
                  onClick={() => handleRemovePoint(idx)}
                  className="text-slate-500 hover:text-red-400 font-bold ml-1"
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}