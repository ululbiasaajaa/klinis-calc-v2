import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; // <-- Tambahkan import ini
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { usePatientStore } from '../store/usePatientStore';

export default function AiAssistantWidget({ currentInputs, activeTab }) {
  // ... (kode state dan fungsi lainnya biarkan sama persis)
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';

  const { patient, medications, getClinicalContext } = usePatientStore();
  const computedContext = getClinicalContext();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: lang === 'id' 
        ? 'Halo, Dok! Saya Clinical AI Assistant v4. Silakan tanyakan kasus klinis atau diskusi apa saja secara bebas.' 
        : 'Hello, Doctor! I am Clinical AI Assistant v4. Feel free to chat or ask any clinical questions.'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputVal.trim();
    if (!query) return;

    const newMessages = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    if (!textToSend) setInputVal('');
    setIsLoading(true);

    try {
      const backendUrl = 'https://klinis-calc-v2-production.up.railway.app/api/chat';

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          activeTab,
          patientContext: {
            patient,
            medications,
            clinicalContext: computedContext
          },
          history: messages
        })
      });

      const data = await response.json();
      const aiReply = data.reply || 'Maaf Dok, tidak ada respons dari server.';

      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (error) {
      console.error('AI API Error:', error);
      setMessages((prev) => [...prev, { sender: 'ai', text: '⚠️ Gagal terhubung ke server backend AI. Pastikan server lokal (node server.js) sudah aktif.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-2xl transition-all flex items-center justify-center gap-2 group hover:scale-105 cursor-pointer"
          title="Clinical AI Assistant v4"
        >
          <span className="text-xl">🤖</span>
          <span className="text-xs font-bold pr-1 hidden sm:inline">Clinical AI v4</span>
        </button>
      )}

      {isOpen && (
        <div className={`w-85 sm:w-96 h-[520px] rounded-3xl shadow-2xl border flex flex-col overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-5 ${
          isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          
          {/* Header */}
          <div className={`p-4 border-b flex justify-between items-center ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-blue-600 text-white'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="font-bold text-xs">Clinical AI Assistant</h3>
                <span className="text-[9px] opacity-80 block">🧠 Enterprise v4 • Live Backend Connected</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white font-bold text-sm px-2 py-1 cursor-pointer"
            >
              ✖
            </button>
          </div>

          {/* Quick Chips */}
          <div className={`px-3 py-2 border-b flex gap-1.5 overflow-x-auto text-[10px] whitespace-nowrap ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <button 
              onClick={() => handleSendMessage("Halo, tolong berikan analisis klinis menyeluruh untuk pasien saat ini")}
              className={`px-2 py-1 rounded-md border transition-all cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-white border-slate-300 text-blue-600 hover:bg-blue-50'}`}
            >
              📊 Analisis Kasus Komprehensif
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => {
              const isAi = m.sender === 'ai';
              return (
                <div key={idx} className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    isAi
                      ? isDark 
                        ? 'bg-slate-800 text-slate-200 rounded-bl-none' 
                        : 'bg-slate-100 text-slate-700 rounded-bl-none'
                      : 'bg-blue-600 text-white rounded-br-none shadow-md'
                  }`}>
                    {/* BAGIAN INI YANG DIUBAH: Gunakan ReactMarkdown untuk pesan AI */}
                    {isAi ? (
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    ) : (
                      m.text
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`p-3 rounded-2xl rounded-bl-none text-xs animate-pulse ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  🧠 AI sedang merumuskan analisis...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className={`p-3 border-t flex gap-2 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ketik pertanyaan atau kasus klinis..."
              className={`flex-1 p-2.5 rounded-xl text-xs outline-none border ${
                isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
              }`}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              ➤
            </button>
          </form>

        </div>
      )}
    </div>
  );
}