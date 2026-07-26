import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function AiAssistantWidget({ currentInputs, activeTab, patientName, patientId }) {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: lang === 'id' 
        ? 'Halo, Dok/Farmasis! Saya Clinical AI Assistant (Smart Context Active). Saya dapat membaca data pasien dan parameter kalkulator yang sedang aktif di layar secara real-time. Ada yang bisa dibantu?' 
        : 'Hello, Doctor/Pharmacist! I am your Smart Context Clinical AI Assistant, capable of reading live screen parameters.'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputVal.trim();
    if (!query) return;

    const newMessages = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    if (!textToSend) setInputVal('');
    setIsLoading(true);

    setTimeout(() => {
      let reply = lang === 'id'
        ? 'Maaf, untuk pertanyaan klinis yang lebih spesifik, pastikan selalu merujuk pada pedoman rumah sakit dan keputusan DPJP ya.'
        : 'I apologize, for specific clinical queries, always refer to institutional guidelines.';

      const lower = query.toLowerCase();

      // RANGKUMAN SMART CONTEXT DARI LAYAR
      const activeModuleNames = {
        pk: 'Farmakokinetik (Loading & Maintenance)',
        drip: 'Dosis Drip / Syringe Pump',
        peds_geri: 'Pediatrik & Geriatri',
        stopp_start: 'Screening Geriatri STOPP/START',
        crrt: 'Dosis ICU & CRRT',
        electro: 'Koreksi Elektrolit Darurat',
        ards: 'Evaluasi ARDS & AGD',
        pregnancy: 'Usia Kehamilan & HPL (Obgin)',
        renal_dose: 'Auto-Checker Dosis Ginjal',
        label_print: 'Cetak Etiket & Resep',
        hd_dose: 'Dosis Hemodialisis (HD)',
        steroid: 'Konversi Dosis Steroid',
        nti: 'Obat Terapi Sempit (NTI / TDM)',
        tdm_chart: 'Grafik Trend TDM',
        ddi: 'Cek Interaksi Obat (DDI)',
        renal: 'Fungsi Ginjal (ClCr & eGFR)',
        anthro: 'Antropometri (BSA, BMI, Parkland)',
        kalori: 'Kalori Harian & Diet Plan'
      };

      const moduleName = activeModuleNames[activeTab] || activeTab;
      const inputsString = JSON.stringify(currentInputs || {});
      const hasInputs = currentInputs && Object.keys(currentInputs).length > 0 && Object.values(currentInputs).some(val => val !== '');

      // Tombol Cepat / Analisis Konteks Layar
      if (lower.includes('analisis parameter data saat ini') || lower.includes('analisis') || lower.includes('hitung')) {
        reply = lang === 'id'
          ? `📊 **Analisis Live Context Layar:**\n- **Pasien:** ${patientName || 'Tanpa Nama'} (RM: ${patientId || '-'})\n- **Modul Aktif:** ${moduleName}\n- **Data Parameter Input:** ${hasInputs ? inputsString : 'Belum ada data input yang dimasukkan ke form.'}\n\n*Saran AI:* Pastikan seluruh variabel parameter di atas telah diisi dengan akurat sesuai rekam medis / hasil laboratorium terbaru sebelum dijadikan acuan klinis.`
          : `📊 **Live Screen Analysis:** Module: ${moduleName}, Inputs: ${inputsString}`;
      } else if (lower.includes('safety alert') || lower.includes('peringatan') || lower.includes('efek samping')) {
        reply = lang === 'id'
          ? `⚠️ **Clinical Safety Alert untuk Modul [${moduleName}]:**\n- Selalu validasi ulang perhitungan dengan kondisi hemodinamik pasien secara langsung.\n- Perhatikan risiko interaksi obat, penyesuaian fungsi ginjal, dan rentang terapeutik sempit.\n- Data input aktif saat ini: ${inputsString}`
          : `⚠️ Safety alert generated based on active module: ${moduleName}`;
      } else if (lower.includes('soap') || lower.includes('ringkasan')) {
        reply = lang === 'id'
          ? `📋 **Draft SOAP Sembari Konteks Layar (${patientName || 'Pasien'}):**\n- **S (Subjective):** Evaluasi klinis & pemantauan terapi aktif.\n- **O (Objective):** Modul: ${moduleName} | Parameter Input: ${inputsString}.\n- **A (Assessment):** Parameter kalkulasi dalam pengawasan klinis.\n- **P (Plan):** Lanjutkan monitoring berkala & sesuaikan regimen dosis jika diindikasikan.`
          : `📋 **SOAP Draft Generated** for patient ${patientName || 'Patient'}.`;
      } 
      // Deteksi Pertanyaan Umum Terkait Data Aktif
      else if (lower.includes('aman') || lower.includes('sesuai') || lower.includes('gimana') || lower.includes('bagaimana') || lower.includes('ini')) {
        reply = lang === 'id'
          ? `🤖 Berdasarkan layar aktif Anda di **${moduleName}** ${patientName ? `untuk pasien **${patientName}**` : ''} dengan parameter \`${inputsString}\`:\n\nPastikan perhitungan ini sudah diverifikasi dengan kondisi klinis riil (seperti fungsi ginjal, tanda vital, atau kadar elektrolit). Jika ada keraguan dosis, selalu konsultasikan dengan DPJP atau Apoteker penanggung jawab!`
          : `🤖 Analyzing your active inputs on ${moduleName}: ${inputsString}. Please verify with clinical conditions.`;
      }
      // Kasus Demam & Gangguan Ginjal
      else if (lower.includes('demam') || lower.includes('panas')) {
        reply = lang === 'id'
          ? '🌡️ Untuk penanganan demam, pilihan utama antipiretik adalah **Parasetamol** (maks 4g/hari dewasa). **Hindari NSAID** (seperti Ibuprofen/Ketorolac) pada pasien dengan risiko gangguan fungsi ginjal.'
          : '🌡️ Manage fever with Paracetamol. Avoid NSAIDs if renal impairment is present.';
      } 
      // Small talk / Casual response
      else if (lower.includes('hahaha') || lower.includes('wkwk') || lower.includes('oke') || lower.includes('siap') || lower.includes('terima kasih') || lower.includes('makasih')) {
        reply = lang === 'id'
          ? 'Haha siap! Ada parameter atau kalkulator lain di Clinical Suite yang mau kita bedah bareng? Silakan ketik atau klik tombol analisis di atas ya! 😎'
          : 'Haha alright! Let me know if you need any other clinical calculations or data analysis!';
      }
      // Sapaan
      else if (lower.includes('halo') || lower.includes('hai') || lower.includes('hi')) {
        reply = lang === 'id'
          ? `Halo! Saya sedang memantau layar Anda di modul **${moduleName}**. Ada yang bisa saya bantu analisis dari data tersebut?`
          : `Hello! I'm monitoring your screen on ${moduleName}. How can I help you analyze it?`;
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-2xl transition-all flex items-center justify-center gap-2 group hover:scale-105 cursor-pointer"
          title="Clinical AI Assistant (Smart Context)"
        >
          <span className="text-xl">🤖</span>
          <span className="text-xs font-bold pr-1 hidden sm:inline">Clinical AI Assistant</span>
        </button>
      )}

      {isOpen && (
        <div className={`w-85 sm:w-96 h-[520px] rounded-3xl shadow-2xl border flex flex-col overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-5 ${
          isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          
          <div className={`p-4 border-b flex justify-between items-center ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-blue-600 text-white'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="font-bold text-xs">Clinical AI Assistant</h3>
                <span className="text-[9px] opacity-80 block">🧠 Smart Context Active • Live Screen Sync</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white font-bold text-sm px-2 py-1 cursor-pointer"
            >
              ✖
            </button>
          </div>

          {/* CHIPS QUICK ACTION SMART CONTEXT */}
          <div className={`px-3 py-2 border-b flex gap-1.5 overflow-x-auto text-[10px] whitespace-nowrap ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <button 
              onClick={() => handleSendMessage("Analisis parameter data saat ini")}
              className={`px-2 py-1 rounded-md border transition-all cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-white border-slate-300 text-blue-600 hover:bg-blue-50'}`}
            >
              🔍 Analisis Layar Aktif
            </button>
            <button 
              onClick={() => handleSendMessage("Cek safety alert")}
              className={`px-2 py-1 rounded-md border transition-all cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-white border-slate-300 text-amber-600 hover:bg-amber-50'}`}
            >
              ⚠️ Cek Safety Alert
            </button>
            <button 
              onClick={() => handleSendMessage("Ringkasan SOAP")}
              className={`px-2 py-1 rounded-md border transition-all cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700' : 'bg-white border-slate-300 text-emerald-600 hover:bg-emerald-50'}`}
            >
              📋 Ringkasan SOAP
            </button>
          </div>

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
                    {m.text}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`p-3 rounded-2xl rounded-bl-none text-xs animate-pulse ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  🧠 Membaca data layar & parameter aktif...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className={`p-3 border-t flex gap-2 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={lang === 'id' ? "Tanya soal data di layar..." : "Ask query about screen data..."}
              className={`flex-1 p-2.5 rounded-xl text-xs outline-none border ${
                isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
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