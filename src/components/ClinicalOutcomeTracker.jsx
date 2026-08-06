import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function ClinicalOutcomeTracker() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // MEMANGGIL STORE V3 SEBAGAI SINGLE SOURCE OF TRUTH
  const { patient, labsHistory, addLabRecord, setPatientData } = usePatientStore();
  const patientName = patient.patientName || 'Umum';
  const patientId = patient.patientId || '-';

  const [isOpen, setIsOpen] = useState(false);
  const [labInput, setLabInput] = useState({
    date: new Date().toLocaleDateString('id-ID'),
    parameter: 'Serum Kreatinin',
    value: '',
    unit: 'mg/dL'
  });

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!labInput.value || !labInput.date) return;

    // 1. Tambah ke labsHistory terpusat v3
    addLabRecord({
      date: labInput.date,
      parameter: labInput.parameter,
      value: labInput.value,
      unit: labInput.unit,
      scr: labInput.parameter === 'Serum Kreatinin' ? labInput.value : patient.serumCreatinine
    });

    // 2. Jika input berupa Serum Kreatinin, update data pasien utama agar eGFR/ClCr atas ikut terhitung ulang
    if (labInput.parameter === 'Serum Kreatinin') {
      setPatientData({ serumCreatinine: labInput.value });
    }

    setLabInput({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: 'Serum Kreatinin',
      value: '',
      unit: 'mg/dL'
    });
  };

  // Helper bikin koordinat SVG sederhana dari data nilai labsHistory
  const values = labsHistory.map(l => parseFloat(l.value) || 0);
  const maxVal = values.length > 0 ? Math.max(...values, 5) : 5;
  const minVal = values.length > 0 ? Math.min(...values, 0) : 0;
  const range = maxVal - minVal || 1;
  
  const svgWidth = 500;
  const svgHeight = 120;
  
  const points = labsHistory.map((l, index) => {
    const x = (index / (Math.max(labsHistory.length - 1, 1))) * (svgWidth - 40) + 20;
    const y = svgHeight - 20 - ((parseFloat(l.value) - minVal) / range) * (svgHeight - 40);
    return { x, y, ...l };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className={`mb-6 p-6 rounded-2xl border shadow-xl transition-all ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      <div className={`flex justify-between items-center mb-4 border-b pb-3 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">📈</span>
          <div>
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Clinical Outcome Tracker & Lab Trend (v3)
            </h3>
            <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Pasien: {patientName} (RM: {patientId})
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow"
        >
          {isOpen ? 'Tutup Panel' : '+ Catat Lab Baru'}
        </button>
      </div>

      {/* RENDER GRAFIK GARIS SVG INTERAKTIF */}
      {labsHistory.length > 0 && (
        <div className={`mb-6 p-4 rounded-xl border ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-blue-500">
              📊 Visualisasi Tren Riwayat Lab ({labsHistory[0]?.parameter || 'Lab'})
            </span>
            <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Min: {minVal} | Max: {maxVal}
            </span>
          </div>
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-28 overflow-visible">
              {/* Garis Grid Latar */}
              <line x1="20" y1="20" x2={svgWidth - 20} y2="20" stroke={isDark ? "#334155" : "#cbd5e1"} strokeDasharray="4" strokeWidth="0.5" />
              <line x1="20" y1="60" x2={svgWidth - 20} y2="60" stroke={isDark ? "#334155" : "#cbd5e1"} strokeDasharray="4" strokeWidth="0.5" />
              <line x1="20" y1="100" x2={svgWidth - 20} y2="100" stroke={isDark ? "#334155" : "#cbd5e1"} strokeDasharray="4" strokeWidth="0.5" />

              {/* Garis Tren Utama */}
              {points.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylinePoints}
                />
              )}

              {/* Titik Data (Nodes) & Label Nilai */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    className={`fill-emerald-500 stroke-2 transition-all hover:r-7 ${
                      isDark ? 'stroke-slate-900' : 'stroke-white'
                    }`}
                  />
                  <text x={p.x} y={p.y - 10} fill={isDark ? "#f8fafc" : "#0f172a"} fontSize="10" textAnchor="middle" fontWeight="bold">
                    {p.value}
                  </text>
                  <text x={p.x} y={svgHeight - 5} fill={isDark ? "#94a3b8" : "#64748b"} fontSize="8" textAnchor="middle">
                    {p.date}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* FORM INPUT CATATAN LAB BARU */}
      {isOpen && (
        <form onSubmit={handleAddLog} className={`grid grid-cols-1 sm:grid-cols-5 gap-2 mb-4 p-4 rounded-xl border text-xs animate-fadeIn ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <label htmlFor="tracker-date" className={`block text-[10px] mb-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Tanggal
            </label>
            <input 
              id="tracker-date"
              type="text" 
              placeholder="DD/MM/YYYY" 
              value={labInput.date} 
              onChange={(e) => setLabInput({...labInput, date: e.target.value})} 
              className={`w-full p-2 rounded-lg border outline-none font-semibold ${
                isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
              }`} 
              required 
            />
          </div>
          <div>
            <label htmlFor="tracker-parameter" className={`block text-[10px] mb-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Parameter
            </label>
            <select 
              id="tracker-parameter"
              value={labInput.parameter} 
              onChange={(e) => setLabInput({...labInput, parameter: e.target.value})} 
              className={`w-full p-2 rounded-lg border outline-none font-semibold cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
              }`}
            >
              <option value="Serum Kreatinin">Serum Kreatinin (mg/dL)</option>
              <option value="eGFR">eGFR (mL/min)</option>
              <option value="GDS">Gula Darah Sewaktu (mg/dL)</option>
              <option value="Hemoglobin">Hemoglobin (g/dL)</option>
              <option value="WBC">Sel Darah Putih / WBC (10^3/uL)</option>
              <option value="CRP">C-Reactive Protein / CRP (mg/L)</option>
            </select>
          </div>
          <div>
            <label htmlFor="tracker-value" className={`block text-[10px] mb-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Nilai Hasil
            </label>
            <input 
              id="tracker-value"
              type="number" 
              step="any" 
              placeholder="e.g. 1.2" 
              value={labInput.value} 
              onChange={(e) => setLabInput({...labInput, value: e.target.value})} 
              className={`w-full p-2 rounded-lg border outline-none font-semibold ${
                isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
              }`} 
              required 
            />
          </div>
          <div>
            <label htmlFor="tracker-unit" className={`block text-[10px] mb-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Satuan
            </label>
            <input 
              id="tracker-unit"
              type="text" 
              value={labInput.unit} 
              onChange={(e) => setLabInput({...labInput, unit: e.target.value})} 
              className={`w-full p-2 rounded-lg border outline-none font-semibold ${
                isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
              }`} 
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2 rounded-lg transition-all cursor-pointer shadow"
            >
              Simpan & Sync Context
            </button>
          </div>
        </form>
      )}

      {/* Tabel Riwayat Trend */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`border-b ${
              isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              <th className="p-2.5">Tanggal</th>
              <th className="p-2.5">Parameter Lab</th>
              <th className="p-2.5">Nilai Terukur</th>
              <th className="p-2.5 text-right">Status Store</th>
            </tr>
          </thead>
          <tbody>
            {labsHistory.length === 0 ? (
              <tr>
                <td colSpan="4" className={`p-4 text-center italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Belum ada data trend lab tercatat untuk pasien ini di Store v3.
                </td>
              </tr>
            ) : (
              labsHistory.map((item) => {
                const displayDate = item.date || (item.timestamp ? new Date(item.timestamp).toLocaleDateString('id-ID') : '-');

                return (
                  <tr key={item.id || item.timestamp} className={`border-b transition-colors ${
                    isDark ? 'border-slate-800/60 hover:bg-slate-950/40' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <td className={`p-2.5 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {displayDate}
                    </td>
                    <td className="p-2.5 font-bold text-blue-500">
                      {item.parameter || 'Serum Kreatinin'}
                    </td>
                    <td className="p-2.5 font-extrabold text-emerald-500">
                      {item.value || item.scr}{' '}
                      <span className={`text-[10px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {item.unit || 'mg/dL'}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-mono text-[10px] text-emerald-500 font-bold">
                      ✓ SYNCED
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}