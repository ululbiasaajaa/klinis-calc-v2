import React, { useState, useEffect } from 'react';

export default function VoiceAssistantModal({ isOpen, onClose, onTranscriptionResult }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);

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
      alert('Browser Anda tidak Mendukung Web Speech API. Gunakan Google Chrome.');
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleApply = () => {
    if (onTranscriptionResult) {
      onTranscriptionResult(transcript);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl relative text-slate-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold">✖</button>
        
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl animate-pulse">🎙️</span>
          <div>
            <h3 className="font-bold text-base text-white">Asisten Suara Klinis (Voice-to-Text)</h3>
            <p className="text-xs text-slate-400">Ucapkan data klinis, misal: "Berat badan 60 kg, kreatinin 1.2"</p>
          </div>
        </div>

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
              className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg transition-all flex items-center justify-center text-xl"
              title="Mulai Rekam"
            >
              🎙️
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="bg-red-600 hover:bg-red-500 text-white p-4 rounded-full shadow-lg transition-all flex items-center justify-center text-xl animate-bounce"
              title="Berhenti Rekam"
            >
              ⏹️
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-all">
            Batal
          </button>
          <button 
            onClick={handleApply} 
            disabled={!transcript}
            className={`flex-1 font-bold py-2.5 rounded-xl text-xs transition-all ${
              transcript ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Gunakan Teks Ini
          </button>
        </div>
      </div>
    </div>
  );
}