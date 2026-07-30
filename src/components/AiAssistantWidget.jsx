import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { usePatientStore } from '../store/usePatientStore';

export default function AiAssistantWidget({ currentInputs, activeTab }) {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';

  // MENAMBUNG KONEKSI LANGSUNG KE SINGLE SOURCE OF TRUTH (STORE V3)
  const { patient, vitals, ventilator, medications, getClinicalContext } = usePatientStore();
  const computedContext = getClinicalContext();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: lang === 'id' 
        ? 'Halo, Dok/Farmasis! Saya Clinical AI Assistant (Enterprise v3 Engine). Saya terhubung langsung dengan Patient Store & Parameter Layar secara real-time. Ada yang bisa dibantu?' 
        : 'Hello, Doctor/Pharmacist! I am your Enterprise v3 Clinical AI Assistant connected directly to live Patient Store data.'
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

      // MAPPING MODUL AKTIFF
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
        triage: 'Triase IGD (Australasian Triage Scale)',
        fluid: 'Terapi Cairan & Luka Bakar (Parkland)',
        electro: 'Koreksi Elektrolit Darurat (IGD)',
        ards: 'Evaluasi ARDS & AGD (ICU)',
        pregnancy: 'Usia Kehamilan & HPL (Obgin)',
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
        anthro: 'Antropometri (BSA, BMI, Parkland)',
        kalori: 'Kalori Harian & Diet Plan'
      };

      const moduleName = activeModuleNames[activeTab] || activeTab;
      const inputsString = JSON.stringify(currentInputs || {});
      const patientName = patient.patientName || 'Tanpa Nama';
      const patientId = patient.patientId || '-';

      // 1. ANALISIS PARAMETER & STORE PASIEN V3
      if (lower.includes('analisis parameter data saat ini') || lower.includes('analisis') || lower.includes('hitung')) {
        reply = lang === 'id'
          ? `📊 **Analisis Live Context Pasien (Enterprise v3):**\n- **Pasien:** ${patientName} (RM: ${patientId})\n- **Demografi:** ${patient.gender || '-'}, ${patient.age || '-'} thn | BB: ${patient.weightKg || '-'} kg, TB: ${patient.heightCm || '-'} cm\n- **Diagnosis:** ${patient.primaryDiagnosis || 'Belum diisi'}\n- **Fungsi Ginjal Auto:** eGFR ${computedContext.egfr || '-'} | ClCr ${computedContext.clcr || '-'} mL/min\n- **Modul Aktif:** ${moduleName}\n- **Input Form Layar:** ${inputsString}\n\n💡 *Rekomendasi AI:* Data pasien tersinkronisasi otomatis. Pastikan nilai lab terbaru (seperti SCr) telah diperbarui di Patient Context Bar atas.`
          : `📊 **Live Patient Context Analysis:** Patient: ${patientName} (RM: ${patientId}), eGFR: ${computedContext.egfr}, Module: ${moduleName}.`;
      } 
      // 2. CEK SAFETY ALERT
      else if (lower.includes('safety alert') || lower.includes('peringatan') || lower.includes('efek samping')) {
        const isRenalImpaired = computedContext.egfr > 0 && computedContext.egfr < 60;
        reply = lang === 'id'
          ? `⚠️ **Clinical Safety Alert [${moduleName}]:**\n- **Status Pasien:** ${patientName} (RM: ${patientId})\n- **Evaluasi Ginjal:** ${isRenalImpaired ? `🚨 eGFR Rendah (${computedContext.egfr} mL/min) - Perlunya penyesuaian dosis obat renal!` : 'eGFR dalam batas normal/cukup.'}\n- **Obat Aktif Disimpan:** ${medications.length > 0 ? medications.map(m => m.name).join(', ') : 'Belum ada obat terdaftar'}\n- **Input Layar:** ${inputsString}`
          : `⚠️ Safety alert generated for ${patientName} on module: ${moduleName}`;
      } 
      // 3. GENERATE DRAFT SOAP
      else if (lower.includes('soap') || lower.includes('ringkasan')) {
        reply = lang === 'id'
          ? `📋 **Draft SOAP Clinical Suite v3 (${patientName} - RM: ${patientId}):**\n- **S (Subjective):** Pasien ${patient.gender || ''}, usia ${patient.age || '-'} tahun. Diagnosis: ${patient.primaryDiagnosis || '-'}.\n- **O (Objective):** BB: ${patient.weightKg || '-'} kg | SCr: ${patient.serumCreatinine || '-'} mg/dL | eGFR: ${computedContext.egfr || '-'} mL/min | ClCr: ${computedContext.clcr || '-'} mL/min.\n  • Evaluasi Modul ${moduleName}: ${inputsString}\n- **A (Assessment):** Monitoring terapi dan penyesuaian dosis berbasis fungsi organ.\n- **P (Plan):** Lanjutkan pemantauan berkala dan evaluasi ulang jika ada perubahan lab.`
          : `📋 **SOAP Draft Generated** for patient ${patientName}.`;
      } 
      // 4. DETEKSI UMUM
      else if (lower.includes('aman') || lower.includes('sesuai') || lower.includes('gimana') || lower.includes('bagaimana')) {
        reply = lang === 'id'
          ? `🤖 Berdasarkan data terpadu pasien **${patientName}** (eGFR: ${computedContext.egfr || '-'}, ClCr: ${computedContext.clcr || '-'} mL/min) pada modul **${moduleName}**:\n\nSistem mengonfirmasi parameter telah terhubung. Pastikan seluruh variabel tanda vital dan lab riil sudah sesuai dengan rekam medis!`
          : `🤖 Analyzing inputs for ${patientName} on ${moduleName}. Please verify with clinical conditions.`;
      }
      // 5. SMALL TALK
      else if (lower.includes('hahaha') || lower.includes('wkwk') || lower.includes('oke') || lower.includes('siap') || lower.includes('terima kasih') || lower.includes('makasih')) {
        reply = lang === 'id'
          ? 'Siap, Komandan! Seluruh data pasien sudah tersimpan di Shared Context v3. Ada yang mau dianalisis lagi? 😎'
          : 'Alright! Let me know if you need any other clinical calculations or data analysis!';
      }
      // 6. SAPAAN
      else if (lower.includes('halo') || lower.includes('hai') || lower.includes('hi')) {
        reply = lang === 'id'
          ? `Halo! Saya memantau data pasien **${patientName}** di modul **${moduleName}**. Ada yang bisa saya bantu?`
          : `Hello! Monitoring active data for ${patientName} on ${moduleName}. How can I help you?`;
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
          title="Clinical AI Assistant (Enterprise v3)"
        >
          <span className="text-xl">🤖</span>
          <span className="text-xs font-bold pr-1 hidden sm:inline">Clinical AI v3</span>
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
                <span className="text-[9px] opacity-80 block">🧠 Enterprise v3 • Shared Store Sync</span>
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
              🔍 Analisis Pasien & Layar
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
              📋 Draft SOAP v3
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
                  🧠 Membaca Patient Store & parameter aktif...
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
              placeholder={lang === 'id' ? "Tanya soal data pasien di layar..." : "Ask query about patient data..."}
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