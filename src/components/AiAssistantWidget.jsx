import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { usePatientStore } from '../store/usePatientStore';

export default function AiAssistantWidget({ currentInputs, activeTab }) {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';

  // Koneksi ke Single Source of Truth (Store Pasien v3)
  const { patient, medications, getClinicalContext } = usePatientStore();
  const computedContext = getClinicalContext();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: lang === 'id' 
        ? 'Halo, Dok! Saya Clinical AI Assistant v3. Saya siap mendampingi analisis parameter klinis, perhitungan dosis, maupun diskusi kasus secara real-time. Ada yang bisa didiskusikan?' 
        : 'Hello, Doctor! I am your Clinical AI Assistant v3. Ready to help analyze clinical parameters and cases.'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);

  // Mapping nama modul agar lebih human-readable
  const activeModuleNames = {
    dashboard: 'Dashboard Analitik',
    pk: 'Farmakokinetik (Loading & Maintenance)',
    drip: 'Dosis Drip / Syringe Pump',
    abx_dose: 'Penyesuaian Dosis Antibiotik (ClCr)',
    peds_geri: 'Pediatrik & Geriatri',
    stopp_start: 'Screening Geriatri STOPP/START',
    crrt: 'Dosis ICU & CRRT',
    framingham: 'Risiko Jantung (Framingham 10-Yr)',
    gcs: 'Neurologi IGD (GCS & Kesadaran)',
    triage: 'Australasian Triage Scale (Triase)',
    fluid: 'Terapi Cairan & Luka Bakar (Parkland)',
    electro: 'Koreksi Elektrolit Darurat',
    ards: 'Evaluasi ARDS & AGD',
    pregnancy: 'Usia Kehamilan & HPL',
    renal_dose: 'Auto-Checker Dosis Ginjal',
    label_print: 'Cetak Etiket & Resep Obat',
    hd_dose: 'Dosis Pasien Cuci Darah (HD)',
    hepar: 'Evaluasi Hepar (Child-Pugh & MELD)',
    diabetes: 'Manajemen Diabetes & Insulin',
    steroid: 'Konversi Dosis Steroid',
    nti: 'Obat Terapi Sempit (NTI / TDM)',
    tdm_chart: 'Grafik Trend Monitoring TDM',
    ddi: 'Cek Interaksi Obat (DDI High-Risk)',
    renal: 'Fungsi Ginjal (ClCr & eGFR)',
    anthro: 'Antropometri (BSA, BMI)',
    kalori: 'Kalori Harian & Diet Plan'
  };

  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputVal.trim();
    if (!query) return;

    // Simpan pesan user ke history chat
    const updatedMessages = [...messages, { sender: 'user', text: query }];
    setMessages(updatedMessages);
    if (!textToSend) setInputVal('');
    setIsLoading(true);

    // Simulasi proses berpikir AI yang natural dengan mempertimbangkan Konteks Pasien & Chat History
    setTimeout(() => {
      const moduleName = activeModuleNames[activeTab] || activeTab;
      const patientName = patient.patientName || 'Tanpa Nama';
      const patientId = patient.patientId || '-';
      const egfrVal = computedContext.egfr || '-';
      const clcrVal = computedContext.clcr || '-';
      const lowerQuery = query.toLowerCase();

      let reply = '';

      // Logika pemahaman kontekstual yang lebih luwes & mengalir
      if (lowerQuery.includes('analisis') || lowerQuery.includes('data') || lowerQuery.includes('pasien')) {
        reply = lang === 'id'
          ? `📊 **Ringkasan Analisis Live Pasien:**\n- **Nama / RM:** ${patientName} (${patientId})\n- **Demografi:** ${patient.gender || 'L/P'}, ${patient.age || '-'} thn | BB: ${patient.weightKg || '-'} kg\n- **Fungsi Ginjal:** eGFR ${egfrVal} | ClCr ${clcrVal} mL/min\n- **Modul Aktif:** ${moduleName}\n\n💡 *Catatan AI:* Seluruh parameter di atas sudah otomatis disinkronkan dari Store. Silakan tanyakan hal spesifik terkait penyesuaian dosis atau evaluasi klinisnya!`
          : `📊 Live summary for ${patientName}: eGFR ${egfrVal}, Module: ${moduleName}.`;
      } 
      else if (lowerQuery.includes('dosis') || lowerQuery.includes('obat') || lowerQuery.includes('antibiotik') || lowerQuery.includes('renalis')) {
        const isRenalRisk = egfrVal !== '-' && Number(egfrVal) < 60;
        reply = lang === 'id'
          ? `💊 **Evaluasi Farmakoterapi & Ginjal [${moduleName}]:**\nBerdasarkan data pasien **${patientName}** dengan nilai eGFR **${egfrVal} mL/min**:\n${isRenalRisk ? '🚨 *Perhatian:* Nilai eGFR < 60 mL/min terdeteksi. Pastikan melakukan penyesuaian dosis (*renal dose adjustment*) untuk obat-obatan yang diekskresi melalui ginjal guna menghindari akumulasi toksik.' : '✅ Fungsi ginjal relatif aman, namun tetap perhatikan parameter lab berkala.'}\n\nAda obat spesifik yang ingin dihitung dosisnya di modul ini, Dok?`
          : `💊 Pharmacotherapy review for ${patientName}: eGFR is ${egfrVal}.`;
      }
      else if (lowerQuery.includes('terima kasih') || lowerQuery.includes('makasih') || lowerQuery.includes('thanks') || lowerQuery.includes('oke') || lowerQuery.includes('siap')) {
        reply = lang === 'id'
          ? 'Sama-sama, Dok! Senang bisa membantu. Kabari lagi ya kalau ada parameter atau perhitungan kasus klinis lain yang perlu dicek. Semangat bertugas! 🩺✨'
          : 'You are welcome, Doctor! Let me know if you need anything else.';
      }
      else {
        // Respon natural asisten klinis interaktif
        reply = lang === 'id'
          ? `🤖 Baik Dok, terkait *"Pesan Anda"*, saya mencatat bahwa saat ini kita sedang berada di modul **${moduleName}** untuk pasien **${patientName}** (eGFR: ${egfrVal} mL/min).\n\nSebagai asisten klinis, saran saya pastikan variabel input dan data penunjang (seperti SCr atau TTV) sudah diinput akurat pada form di layar. Apakah ada detail klinis spesifik yang ingin kita bedah bersama?`
          : `🤖 Noted regarding your query on ${moduleName} for ${patientName}. How would you like to proceed?`;
        
        // Memodifikasi sedikit balasan agar menyertakan esensi pertanyaan user secara natural
        reply = reply.replace('"Pesan Anda"', `"${query}"`);
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-2xl transition-all flex items-center justify-center gap-2 group hover:scale-105 cursor-pointer"
          title="Clinical AI Assistant v3"
        >
          <span className="text-xl">🤖</span>
          <span className="text-xs font-bold pr-1 hidden sm:inline">Clinical AI v3</span>
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
                <span className="text-[9px] opacity-80 block">🧠 Enterprise v3 • Real-time Store Context</span>
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
              onClick={() => handleSendMessage("Tolong analisis data pasien saat ini")}
              className={`px-2 py-1 rounded-md border transition-all cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-white border-slate-300 text-blue-600 hover:bg-blue-50'}`}
            >
              📊 Analisis Data Pasien
            </button>
            <button 
              onClick={() => handleSendMessage("Bagaimana evaluasi dosis obat dan fungsi ginjalnya?")}
              className={`px-2 py-1 rounded-md border transition-all cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-white border-slate-300 text-amber-600 hover:bg-amber-50'}`}
            >
              💊 Cek Dosis & Ginjal
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
                    {m.text}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`p-3 rounded-2xl rounded-bl-none text-xs animate-pulse ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  🧠 AI sedang merumuskan analisis klinis...
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
              placeholder={lang === 'id' ? "Diskusikan kasus atau tanya data klinis..." : "Discuss case or query clinical data..."}
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