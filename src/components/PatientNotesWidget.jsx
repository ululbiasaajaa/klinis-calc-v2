import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function PatientNotesWidget({ onSaveNote }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // BACA DARI SINGLE SOURCE OF TRUTH (STORE V3)
  const { patient, getClinicalContext } = usePatientStore();
  const patientName = patient.patientName || 'Pasien Umum';
  const patientId = patient.patientId || '-';
  const { egfr } = getClinicalContext();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('sbar'); // 'sbar' | 'tasks' | 'memo'

  // State untuk SBAR & Memo
  const [sbarText, setSbarText] = useState('');
  const [memoText, setMemoText] = useState('');

  // State untuk Task Tracker (Checklist Harian)
  const [tasks, setTasks] = useState([]);
  const [newTaskInput, setNewTaskInput] = useState('');

  // Storage Key unik berdasarkan No RM Pasien
  const sbarStorageKey = `clinical_suite_sbar_v3_${patientId}`;
  const memoStorageKey = `clinical_suite_memo_v3_${patientId}`;
  const taskStorageKey = `clinical_suite_tasks_v3_${patientId}`;

  // EVENT LISTENER TOMBOL ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Load data dari LocalStorage pas pasien / modal dibuka
  useEffect(() => {
    const savedSbar = localStorage.getItem(sbarStorageKey);
    const savedMemo = localStorage.getItem(memoStorageKey);
    const savedTasks = localStorage.getItem(taskStorageKey);

    // Default SBAR jika belum ada
    if (savedSbar) {
      setSbarText(savedSbar);
    } else {
      setSbarText(`[SBAR - ${patientName} / RM: ${patientId}]\nS (Situation): Kondisi umum stabil, evaluasi klinis berjalan.\nB (Background): Usia ${patient.age || '-'} thn, BB ${patient.weightKg || '-'} kg, eGFR: ${egfr || '-'} mL/min.\nA (Assessment): Fungsi ginjal & parameter dosis obat terpantau.\nR (Recommendation): Lanjutkan terapi, monitor lab berkala.`);
    }

    setMemoText(savedMemo || '');
    setTasks(savedTasks ? JSON.parse(savedTasks) : [
      { id: 1, text: 'Cek ulang kadar kreatinin / TDM', completed: false },
      { id: 2, text: 'Evaluasi ulang dosis antibiotik', completed: false }
    ]);
  }, [patientId, sbarStorageKey, memoStorageKey, taskStorageKey, patientName, patient.age, patient.weightKg, egfr]);

  // Fungsi Simpan Semua Data
  const handleSaveAll = () => {
    localStorage.setItem(sbarStorageKey, sbarText);
    localStorage.setItem(memoStorageKey, memoText);
    localStorage.setItem(taskStorageKey, JSON.stringify(tasks));
    if (onSaveNote) onSaveNote(sbarText);
    setIsOpen(false);
  };

  // Tambah Task Baru
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const updatedTasks = [...tasks, { id: Date.now(), text: newTaskInput.trim(), completed: false }];
    setTasks(updatedTasks);
    setNewTaskInput('');
    localStorage.setItem(taskStorageKey, JSON.stringify(updatedTasks));
  };

  // Toggle Check Task
  const handleToggleTask = (id) => {
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updatedTasks);
    localStorage.setItem(taskStorageKey, JSON.stringify(updatedTasks));
  };

  // Hapus Task
  const handleDeleteTask = (id) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem(taskStorageKey, JSON.stringify(updatedTasks));
  };

  return (
    // DIUBAH POSISINYA JADI LEBIH KE ATAS (bottom-36) AGAR TIDAK DEMPET DENGAN AI ASSISTANT
    <div className="fixed bottom-36 right-4 sm:right-6 z-[999]">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-3.5 sm:p-4 rounded-full shadow-2xl flex items-center justify-center text-xl sm:text-2xl transition-all transform hover:scale-105 border-2 border-white/20 cursor-pointer"
          title="Clinical Action & Handover Hub"
          aria-label="Buka Clinical Handover Hub"
        >
          📋
        </button>
      ) : (
        <div className={`border rounded-2xl w-80 sm:w-96 shadow-2xl overflow-hidden flex flex-col max-h-[500px] transition-all animate-fadeIn ${
          isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
        }`}>
          
          {/* HEADER HUB */}
          <div className={`p-3.5 border-b flex justify-between items-center ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <div>
              <h4 className="font-bold text-xs flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <span>🏥</span> Clinical Handover & Hub
              </h4>
              <span className={`text-[10px] block truncate max-w-[200px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {patientName} (RM: {patientId})
              </span>
            </div>
            <button 
              type="button"
              onClick={() => setIsOpen(false)} 
              className={`font-bold text-base leading-none cursor-pointer p-1 transition-all ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
              aria-label="Tutup Handover Hub"
            >
              ✕
            </button>
          </div>

          {/* TAB NAVIGATION */}
          <div className={`grid grid-cols-3 p-1 border-b text-[10px] font-bold text-center ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab('sbar')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'sbar' 
                  ? 'bg-blue-600 text-white shadow' 
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💬 SBAR Operan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'tasks' 
                  ? 'bg-emerald-600 text-white shadow' 
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✅ To-Do ({tasks.filter(t => !t.completed).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('memo')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'memo' 
                  ? 'bg-amber-600 text-white shadow' 
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📝 Catatan
            </button>
          </div>

          {/* TAB CONTENT AREA */}
          <div className="p-3.5 overflow-y-auto flex-1 space-y-3 text-xs">
            
            {/* 1. SBAR TAB */}
            {activeTab === 'sbar' && (
              <div className="space-y-2">
                <div className={`flex justify-between items-center text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span>Format Standar Operan Jaga Shift:</span>
                  <button 
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(sbarText);
                      alert('✅ Format SBAR berhasil disalin ke clipboard!');
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                  >
                    📋 Salin SBAR
                  </button>
                </div>
                <textarea
                  value={sbarText}
                  onChange={(e) => setSbarText(e.target.value)}
                  className={`w-full h-44 p-2.5 rounded-xl text-[11px] outline-none resize-none font-mono leading-relaxed border ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                  aria-label="Format SBAR Operan"
                />
              </div>
            )}

            {/* 2. TASK TRACKER TAB */}
            {activeTab === 'tasks' && (
              <div className="space-y-3">
                <form onSubmit={handleAddTask} className="flex gap-1.5">
                  <input
                    type="text"
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    placeholder="Tambah tugas/instruksi baru..."
                    className={`flex-1 px-3 py-1.5 rounded-xl text-xs outline-none border ${
                      isDark 
                        ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
                    }`}
                    aria-label="Input tugas baru"
                  />
                  <button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer shadow-sm"
                  >
                    +
                  </button>
                </form>

                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {tasks.length === 0 ? (
                    <div className="text-center text-slate-500 py-4 text-[11px]">Belum ada tugas tercatat.</div>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className={`flex items-center justify-between p-2 rounded-xl border ${
                        isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <label className="flex items-center gap-2 cursor-pointer flex-1 mr-2">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTask(task.id)}
                            className="rounded accent-emerald-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className={`text-[11px] ${
                            task.completed 
                              ? 'line-through text-slate-400 dark:text-slate-500' 
                              : isDark ? 'text-slate-200' : 'text-slate-800'
                          }`}>
                            {task.text}
                          </span>
                        </label>
                        <button 
                          type="button"
                          onClick={() => handleDeleteTask(task.id)} 
                          className="text-slate-400 hover:text-red-500 text-xs px-1 cursor-pointer"
                          title="Hapus Tugas"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. QUICK MEMO TAB */}
            {activeTab === 'memo' && (
              <div className="space-y-2">
                <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Catatan bebas / alergi / instruksi khusus:
                </span>
                <textarea
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  placeholder="Tulis catatan klinis bebas di sini..."
                  className={`w-full h-44 p-2.5 rounded-xl text-xs outline-none resize-none leading-relaxed border ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-600'
                  }`}
                  aria-label="Catatan bebas klinis"
                />
              </div>
            )}

          </div>

          {/* FOOTER ACTION */}
          <div className={`p-3 border-t ${
            isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-100'
          }`}>
            <button
              type="button"
              onClick={handleSaveAll}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-lg cursor-pointer"
            >
              Simpan Semua Perubahan
            </button>
          </div>

        </div>
      )}
    </div>
  );
}