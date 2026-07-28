import React, { useState, useEffect } from 'react';
import { usePatientStore } from '../../store/usePatientStore';
import { validatePatientInput, ValidationError } from '../../utils/patientValidation';

interface Props {
  onClose: () => void;
}

export default function PatientFormModal({ onClose }: Props) {
  const { patient, setPatientData } = usePatientStore();
  const [formData, setFormData] = useState(patient);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    setFormData(patient);
  }, [patient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validatePatientInput(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setPatientData({
      ...formData,
      age: formData.age === '' ? '' : Number(formData.age),
      weightKg: formData.weightKg === '' ? '' : Number(formData.weightKg),
      heightCm: formData.heightCm === '' ? '' : Number(formData.heightCm),
      serumCreatinine: formData.serumCreatinine === '' ? '' : Number(formData.serumCreatinine),
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
      {errors.length > 0 && (
        <div className="col-span-full bg-red-950/60 border border-red-800 text-red-300 p-2.5 rounded-lg text-[11px]">
          <p className="font-bold mb-1">⚠️ Peringatan Validasi Fisiologis:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {errors.map((err, i) => (
              <li key={i}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label className="block text-[10px] text-slate-400 mb-1">Nama Pasien</label>
        <input 
          type="text" 
          placeholder="Contoh: Tn. Budi" 
          value={formData.patientName} 
          onChange={(e) => setFormData({...formData, patientName: e.target.value})}
          className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white outline-none" 
          required
        />
      </div>

      <div>
        <label className="block text-[10px] text-slate-400 mb-1">No. Rekam Medis (RM)</label>
        <input 
          type="text" 
          placeholder="Contoh: 99-28-12" 
          value={formData.patientId} 
          onChange={(e) => setFormData({...formData, patientId: e.target.value})}
          className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white outline-none" 
          required
        />
      </div>

      <div>
        <label className="block text-[10px] text-slate-400 mb-1">Usia (Tahun)</label>
        <input 
          type="number" 
          placeholder="65" 
          value={formData.age} 
          onChange={(e) => setFormData({...formData, age: e.target.value === '' ? '' : Number(e.target.value)})}
          className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white outline-none" 
        />
      </div>

      <div>
        <label className="block text-[10px] text-slate-400 mb-1">Jenis Kelamin</label>
        <select 
          value={formData.gender} 
          onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
          className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white outline-none"
        >
          <option value="">Pilih...</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
      </div>

      <div>
        <label className="block text-[10px] text-slate-400 mb-1">Berat Badan (kg)</label>
        <input 
          type="number" 
          step="any" 
          placeholder="60" 
          value={formData.weightKg} 
          onChange={(e) => setFormData({...formData, weightKg: e.target.value === '' ? '' : Number(e.target.value)})}
          className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white outline-none" 
        />
      </div>

      <div>
        <label className="block text-[10px] text-slate-400 mb-1">Tinggi Badan (cm)</label>
        <input 
          type="number" 
          step="any" 
          placeholder="165" 
          value={formData.heightCm} 
          onChange={(e) => setFormData({...formData, heightCm: e.target.value === '' ? '' : Number(e.target.value)})}
          className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white outline-none" 
        />
      </div>

      <div>
        <label className="block text-[10px] text-slate-400 mb-1">Serum Kreatinin (mg/dL)</label>
        <input 
          type="number" 
          step="any" 
          placeholder="1.2" 
          value={formData.serumCreatinine} 
          onChange={(e) => setFormData({...formData, serumCreatinine: e.target.value === '' ? '' : Number(e.target.value)})}
          className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white outline-none" 
        />
      </div>

      <div className="flex items-end">
        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2 rounded-lg transition-all">
          Simpan Pasien
        </button>
      </div>
    </form>
  );
}