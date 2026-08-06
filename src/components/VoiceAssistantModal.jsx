import React, { useState, useEffect } from 'react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function VoiceAssistantModal({ isOpen, onClose, onTranscriptionResult }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { patient, setPatientData } = usePatientStore();

  // EVENT LISTENER TOMBOL ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    // Cek dan minta izin mikrofon saat modal dibuka di HP
    const checkPermissions = async () => {
      try {
        const status = await SpeechRecognition.checkPermissions();
        if (status.speechRecognition !== 'granted') {
          await SpeechRecognition.requestPermissions();
        }
      } catch (err) {
        console.error('Gagal meminta izin mic native:', err);
      }
    };

    if (isOpen) {
      checkPermissions();
    }
    
    return () => {
      if (isListening) {
        SpeechRecognition.stop().catch(() => {});
      }
    };
  }, [isOpen, isListening]);

  const startListening = async () => {
    setTranscript('');
    setErrorMessage('');
    try {
      setIsListening(true);
      
      // Mulai mendengar suara secara native
      const { matches } = await SpeechRecognition.start({
        language: 'id-ID',
        maxResults: 1,
        prompt: 'Ucapkan data klinis pasien...',
        partialResults: true,
        popup: true, // Memunculkan dialog native bawaan Android jika didukung
      });

      if (matches && matches.length > 0) {
        setTranscript(matches[0]);
      }
      setIsListening(false);
    } catch (err) {
      console.error('Error speech recognition native:', err);
      setIsListening(false);
      setErrorMessage('Gagal merekam suara. Pastikan izin mikrofon diaktifkan.');
    }
  };

  const stopListening = async () => {
    try {
      await SpeechRecognition.stop();
    } catch (e) {
      console.error(e);
    }
    setIsListening(false);
  };

  const parseAndSyncToStore = (text) => {
    if (!text) return;
    const lower = text.toLowerCase();
    const updates = {};

    const weightMatch = lower.match(/(?:berat badan|berat|bb)\s*(\d+(?:[.,]\d+)?)/);
    if (weightMatch) updates.weightKg = weightMatch[1].replace(',', '.');

    const heightMatch = lower.match(/(?:tinggi badan|tinggi|tb)\s*(\d+(?:[.,]\d+)?)/);
    if (heightMatch) updates.heightCm = heightMatch[1].replace(',', '.');

    const scrMatch = lower.match(/(?:kreatinin|serum kreatinin|scr)\s*(\d+(?:[.,]\d+)?)/);
    if (scrMatch) updates.serumCreatinine = scrMatch[1].replace(',', '.');

    const ageMatch = lower.match(/(?:usia|umur)\s*(\d+)/);
    if (ageMatch) updates.age = ageMatch[1];

    if (Object.keys(updates).length > 0) {
      setPatientData(updates);
    }
  };

  const handleApply = () => {
    parseAndSyncToStore(transcript);
    if (onTranscriptionResult) {
      onTranscriptionResult(transcript);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-assistant-title"
    >
      <div className={`border p-6 rounded-2xl max-w-md w-full shadow-2xl relative transition-all ${
        isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
      }`}>
        <button 
          type="button"
          onClick={onClose} 
          className={`absolute top-4 right-4 text-lg font-bold cursor-pointer transition-colors ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-label="Tutup Asisten Suara"
        >
          ✖
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl animate-pulse">🎙️</span>
          <div>
            <h3 id="voice-assistant-title" className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Asisten Suara Klinis (Native Engine)
            </h3>
            <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Pasien Aktif: <strong className="text-blue-600 dark:text-blue-400">{patient.patientName || 'Umum'}</strong> ({patient.patientId || 'RM: -'})
            </p>
          </div>
        </div>

        <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Ucapkan data klinis, misal: <em>"Berat badan 60 kg, kreatinin 1.2"</em>
        </p>

        {errorMessage && (
          <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
            ⚠️ {errorMessage}
          </div>
        )}

        <div className={`p-4 rounded-xl min-h-[100px] mb-4 flex items-center justify-center text-center border ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          {transcript ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium italic">"{transcript}"</p>
          ) : (
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              {isListening ? "Mendengarkan suara Anda..." : "Tekan tombol mikrofon untuk mulai merekam."}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 mb-4">
          {!isListening ? (
            <button
              type="button"
              onClick={startListening}
              className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg transition-all flex items-center justify-center text-xl cursor-pointer"
              title="Mulai Rekam"
              aria-label="Mulai Merekam Suara"
            >
              🎙️
            </button>
          ) : (
            <button
              type="button"
              onClick={stopListening}
              className="bg-red-600 hover:bg-red-500 text-white p-4 rounded-full shadow-lg transition-all flex items-center justify-center text-xl animate-bounce cursor-pointer"
              title="Berhenti Rekam"
              aria-label="Berhenti Merekam Suara"
            >
              ⏹️
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button 
            type="button"
            onClick={onClose} 
            className={`flex-1 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            Batal
          </button>
          <button 
            type="button"
            onClick={handleApply} 
            disabled={!transcript}
            className={`flex-1 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
              transcript ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            Gunakan Teks & Auto-Sync
          </button>
        </div>
      </div>
    </div>
  );
}