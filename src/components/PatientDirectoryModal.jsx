import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function PatientDirectoryModal({ isOpen, onClose, onSelectPatient }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // INTEGRASI LANGSUNG KE SINGLE SOURCE OF TRUTH (STORE V3)
  const { patient: activePatient, setPatientData } = usePatientStore();

  // State daftar pasien database lokal Enterprise v3
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('clinical_suite_patients_db_v3');
    return saved ? JSON.parse(saved) : [
      { 
        id: '1', 
        name: 'Budi Santoso', 
        rm: 'RM-998231', 
        age: '56', 
        gender: 'Laki-laki', 
        weightKg: '68',
        heightCm: '170',
        serumCreatinine: '1.4',
        room: 'ICU Bed 3', 
        diagnosis: 'STEMI / CHF / Sepsis' 
      },
      { 
        id: '2', 
        name: 'Siti Aminah', 
        rm: 'RM-554102', 
        age: '42', 
        gender: 'Perempuan', 
        weightKg: '55',
        heightCm: '158',
        serumCreatinine: '0.9',
        room: 'Melati 201', 
        diagnosis: 'DKA / Diabetes Mellitus' 
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('clinical_suite_patients_db_v3', JSON.stringify(patients));
  }, [patients]);

  // Form Input Pasien Baru Enterprise
  const [nameInput, setNameInput] = useState('');
  const [rmInput, setRmInput] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [genderInput, setGenderInput] = useState('Laki-laki');
  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [scrInput, setScrInput] = useState('');
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
      age: ageInput || '',
      gender: genderInput,
      weightKg: weightInput || '',
      heightCm: heightInput || '',
      serumCreatinine: scrInput || '',
      room: roomInput || 'IGD / Umum',
      diagnosis: diagInput || '-'
    };

    setPatients([newPatient, ...patients]);
    setNameInput('');
    setRmInput('');
    setAgeInput('');
    setWeightInput('');
    setHeightInput('');
    setScrInput('');
    setRoomInput('');
    setDiagInput('');
  };

  const handleDeletePatient = (id) => {
    if (window.confirm('Hapus data pasien ini dari direktori?')) {
      setPatients(patients.filter(p => p.id !== id));
    }
  };

  // AKSI UTAMA: LOAD PATIENT OBJECT UTUH KE STORE V3
  const handleSelectAndSync = (p) => {
    setPatientData({
      patientId: p.rm,
      patientName: p.name,
      age: p.age,
      gender: p.gender,
      weightKg: p.weightKg || '',
      heightCm: p.heightCm || '',
      serumCreatinine: p.serumCreatinine || '',
      primaryDiagnosis: `${p.diagnosis} (${p.room})`
    });

    if (onSelectPatient) {
      onSelectPatient(p.name, p.rm);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`border p-6 rounded-2xl max-w-3xl w-full shadow-2xl relative max-h-[90vh] flex flex-col ${
        isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
      }`}>
        
        {/* HEADER */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-700/50 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📁</span>
            <div>
              <h3 className="font-bold text-base text-blue-500">Database Pasien Enterprise (v3 Store Sync)</h3>
              <p className="text-[10px] text-slate-400">Pilih pasien untuk memuat profil organ & parameter klinis lengkap secara otomatis.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer">✖</button>
        </div>

        <div className="overflow-y-auto space-y-6 pr-1 flex-1">
          
          {/* FORM TAMBAH PASIEN */}
          <form onSubmit={handleAddPatient} className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="font-bold text-xs text-blue-400 block">+ Registrasi Pasien Baru ke Store</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <input type="text" placeholder="Nama Pasien *" value={nameInput} onChange={(e) => setNameInput(e.target.value)} className={`p-2 rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} required />
              <input type="text" placeholder="No. RM *" value={rmInput} onChange={(e) => setRmInput(e.target.value)} className={`p-2 rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} required />
              <input type="number" placeholder="Usia (Thn)" value={ageInput} onChange={(e) => setAgeInput(e.target.value)} className={`p-2 rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} />
              <select value={genderInput} onChange={(e) => setGenderInput(e.target.value)} className={`p-2 rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              <input type="number" placeholder="BB (kg)" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} className={`p-2 rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} />
              <input type="number" placeholder="TB (cm)" value={heightInput} onChange={(e) => setHeightInput(e.target.value)} className={`p-2 rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} />
              <input type="number" step="any" placeholder="SCr (mg/dL)" value={scrInput} onChange={(e) => setScrInput(e.target.value)} className={`p-2 rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} />
              <input type="text" placeholder="Ruangan / Bed" value={roomInput} onChange={(e) => setRoomInput(e.target.value)} className={`p-2 rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} />
            </div>
            <input type="text" placeholder="Diagnosa Utama / Catatan Klinis" value={diagInput} onChange={(e) => setDiagInput(e.target.value)} className={`w-full p-2 rounded-lg border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-xs transition-all cursor-pointer">
              Simpan & Daftarkan Pasien
            </button>
          </form>

          {/* DAFTAR PASIEN TERSIMPAN */}
          <div className="space-y-2">
            <span className="font-bold text-xs text-slate-400 block">Daftar Pasien Aktif ({patients.length}):</span>
            {patients.length === 0 ? (
              <p className="text-slate-500 italic text-center py-4 text-xs">Belum ada data pasien tersimpan.</p>
            ) : (
              <div className="space-y-2">
                {patients.map((p) => {
                  const isSelected = activePatient.patientName === p.name && activePatient.patientId === p.rm;
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
                        <p className="text-[11px] text-slate-400 mt-1">
                          📍 Ruangan: <strong className="text-slate-300">{p.room}</strong> | 🩺 Diagnosa: <strong className="text-slate-300">{p.diagnosis}</strong>
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          BB: {p.weightKg || '-'} kg • TB: {p.heightCm || '-'} cm • SCr: {p.serumCreatinine || '-'} mg/dL
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => handleSelectAndSync(p)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {isSelected ? '✓ Aktif di Store' : 'Pilih & Load Context'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePatient(p.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold text-xs transition-all cursor-pointer"
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
          <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 rounded-xl text-xs transition-all cursor-pointer">
            Tutup Direktori
          </button>
        </div>

      </div>
    </div>
  );
}