import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function PatientDirectoryModal({ isOpen, onClose, onSelectPatient, currentPatientName, currentPatientId }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State daftar pasien tersimpan di localStorage
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('clinical_suite_patients_db');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Budi Santoso', rm: 'RM-998231', age: '56', gender: 'Laki-laki', room: 'ICU Bed 3', diagnosis: 'STEMI / CHF' },
      { id: '2', name: 'Siti Aminah', rm: 'RM-554102', age: '42', gender: 'Perempuan', room: 'Melati 201', diagnosis: 'DKA / Diabetes' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('clinical_suite_patients_db', JSON.stringify(patients));
  }, [patients]);

  // Form Input Pasien Baru
  const [nameInput, setNameInput] = useState('');
  const [rmInput, setRmInput] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [genderInput, setGenderInput] = useState('Laki-laki');
  const [roomInput, setRoomInput] = useState('');
  const [diagInput, setDiagInput] = useState('');

  const handleAddPatient = (e) => {
    e.preventDefault();
    if (!nameInput || !rmInput) {
      alert('Nama dan No. RM wajib diisi!');
      return;
    }

    const newPatient = {
      id: Date.now().toString(),
      name: nameInput,
      rm: rmInput,
      age: ageInput || '-',
      gender: genderInput,
      room: roomInput || 'IGD / Umum',
      diagnosis: diagInput || '-'
    };

    setPatients([newPatient, ...patients]);
    setNameInput('');
    setRmInput('');
    setAgeInput('');
    setRoomInput('');
    setDiagInput('');
  };

  const handleDeletePatient = (id) => {
    if (window.confirm('Hapus data pasien ini dari direktori?')) {
      setPatients(patients.filter(p => p.id !== id));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`border p-6 rounded-2xl max-w-2xl w-full shadow-2xl relative max-h-[90vh] flex flex-col ${
        isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
      }`}>
        
        {/* HEADER */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-700/50 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📁</span>
            <h3 className="font-bold text-base text-blue-500">Direktori Database Pasien Lokal</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✖</button>
        </div>

        <div className="overflow-y-auto space-y-6 pr-1 flex-1">
          
          {/* FORM TAMBAH PASIEN */}
          <form onSubmit={handleAddPatient} className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="font-bold text-xs text-blue-400 block">+ Tambah Pasien Baru ke Database</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <input type="text" placeholder="Nama Pasien" value={nameInput} onChange={(e) => setNameInput(e.target.value)} className={`p-2 rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} />
              <input type="text" placeholder="No. Rekam Medis (RM)" value={rmInput} onChange={(e) => setRmInput(e.target.value)} className={`p-2 rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} />
              <input type="number" placeholder="Usia (Thn)" value={ageInput} onChange={(e) => setAgeInput(e.target.value)} className={`p-2 rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} />
              <select value={genderInput} onChange={(e) => setGenderInput(e.target.value)} className={`p-2 rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              <input type="text" placeholder="Ruangan / Bangsal" value={roomInput} onChange={(e) => setRoomInput(e.target.value)} className={`p-2 rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} />
              <input type="text" placeholder="Diagnosa / Catatan" value={diagInput} onChange={(e) => setDiagInput(e.target.value)} className={`p-2 rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-xs transition-all">
              Simpan Pasien
            </button>
          </form>

          {/* DAFTAR PASIEN TERSIMPAN */}
          <div className="space-y-2">
            <span className="font-bold text-xs text-slate-400 block">Daftar Pasien Aktif ({patients.length}):</span>
            {patients.length === 0 ? (
              <p className="text-slate-500 italic text-center py-4">Belum ada data pasien tersimpan.</p>
            ) : (
              <div className="space-y-2">
                {patients.map((p) => {
                  const isSelected = currentPatientName === p.name && currentPatientId === p.rm;
                  return (
                    <div key={p.id} className={`p-3 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all ${
                      isSelected 
                        ? 'bg-blue-600/10 border-blue-500 shadow-md' 
                        : isDark ? 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50' : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-blue-500">{p.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">{p.rm}</span>
                          <span className="text-[10px] text-slate-400">({p.age} thn, {p.gender})</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">📍 Ruangan: <strong className="text-slate-300">{p.room}</strong> | 🩺 Diagnosa: <strong className="text-slate-300">{p.diagnosis}</strong></p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => {
                            onSelectPatient(p.name, p.rm);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {isSelected ? '✓ Sedang Dipilih' : 'Pilih Pasien'}
                        </button>
                        <button
                          onClick={() => handleDeletePatient(p.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold text-xs transition-all"
                          title="Hapus Pasien"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        <div className="pt-4 border-t border-slate-700/50 mt-4">
          <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 rounded-xl text-xs transition-all">
            Tutup Direktori
          </button>
        </div>

      </div>
    </div>
  );
}