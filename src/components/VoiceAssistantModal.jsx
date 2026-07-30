import React, { useState, useEffect } from 'react';
import { usePatientStore } from '../store/usePatientStore';

export default function VoiceAssistantModal({ isOpen, onClose, onTranscriptionResult }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);

  // INTEGRASI LANGSUNG KE SINGLE SOURCE OF TRUTH (STORE V3)
  const { patient, setPatientData } = usePatientStore();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = 'id-ID'; // Bahasa Indonesia

      recog.onresult = (event) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recog.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, []);

  const startListening = () => {
    setTranscript('');
    if (recognition) {
      recognition.start();
      setIsListening(true);
    } else {
      alert('Browser Anda tidak mendukung Web Speech API. Gunakan Google Chrome.');
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  // SMART AUTO-PARSER PARAMETER KLINIS KE STORE V3
  const parseAndSyncToStore = (text) => {
    if (!text) return;
    const lower = text.toLowerCase();
    const updates = {};

    // 1. Deteksi Berat Badan (e.g. "berat badan 60 kg" / "bb 65")
    const weightMatch = lower.match(/(?:berat badan|berat|bb)\s*(\d+(?:[.,]\d+)?)/);
    if (weightMatch) updates.weightKg = weightMatch[1].replace(',', '.');

    // 2. Deteksi Tinggi Badan (e.g. "tinggi 170" / "tb 165 cm")
    const heightMatch = lower.match(/(?:tinggi badan|tinggi|tb)\s*(\d+(?:[.,]\d+)?)/);
    if (heightMatch) updates.heightCm = heightMatch[1].replace(',', '.');

    // 3. Deteksi Serum Kreatinin (e.g. "kreatinin 1.2" / "scr 0.9")
    const scrMatch = lower.match(/(?:kreatinin|serum kreatinin|scr)\s*(\d+(?:[.,]\d+)?)/);
    if (scrMatch) updates.serumCreatinine = scrMatch[1].replace(',', '.');

    // 4. Deteksi Usia (e.g. "usia 55" / "umur 40 tahun")
    const ageMatch = lower.match(/(?:usia|umur)\s*(\d+)/);
    if (ageMatch) updates.age = ageMatch[1];

    if (Object.keys(updates).length > 0) {
      setPatientData(updates);
    }
  };

  const handleApply = () => {
    // Parsing data klinis & sync ke store v3
    parseAndSyncToStore(transcript);

    if (onTranscriptionResult) {
      onTranscriptionResult(transcript);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl relative text-slate-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✖</button>
        
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl animate-pulse">🎙️</span>
          <div>
            <h3 className="font-bold text-base text-white">Asisten Suara Klinis (v3 Engine)</h3>
            <p className="text-[10px] text-slate-400">
              Pasien Aktif: <strong className="text-blue-400">{patient.patientName || 'Umum'}</strong> ({patient.patientId || 'RM: -'})
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          Ucapkan data klinis, misal: <em>"Berat badan 60 kg, kreatinin 1.2, tinggi 165 cm"</em>
        </p>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl min-h-[100px] mb-4 flex items-center justify-center text-center">
          {transcript ? (
            <p className="text-sm text-emerald-400 font-medium italic">"{transcript}"</p>
          ) : (
            <p className="text-xs text-slate-500">
              {isListening ? "Mendengarkan suara Anda... Silakan bicara." : "Tekan tombol mikrofon di bawah untuk mulai merekam."}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 mb-4">
          {!isListening ? (
            <button
              onClick={startListening}
              className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg transition-all flex items-center justify-center text-xl cursor-pointer"
              title="Mulai Rekam"
            >
              🎙️
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="bg-red-600 hover:bg-red-500 text-white p-4 rounded-full shadow-lg transition-all flex items-center justify-center text-xl animate-bounce cursor-pointer"
              title="Berhenti Rekam"
            >
              ⏹️
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer">
            Batal
          </button>
          <button 
            onClick={handleApply} 
            disabled={!transcript}
            className={`flex-1 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
              transcript ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Gunakan Teks & Auto-Sync
          </button>
        </div>
      </div>
    </div>
  );
}