import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function QuotationDemoBar({ currentId, onSelectId }) {
  const [customInput, setCustomInput] = useState('');
  const samples = [
    { id: 'Q-78421', label: 'Cancún (con Form Web completo)' },
    { id: 'Q-90123', label: 'Japón Lujo (Momiji & Ryokan)' },
    { id: 'Q-55210', label: 'París & Alpes (Sin Form Web)' }
  ];

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customInput.trim()) { onSelectId(customInput.trim()); setCustomInput(''); }
  };

  return (
    <div className="w-full bg-[#0F2A4A] text-white py-2.5 px-4 text-xs border-b border-[#00A896]/30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-[#00A896]/20 text-[#00A896]"><Sparkles className="w-3.5 h-3.5" /></span>
          <span className="font-semibold text-slate-200">Probador de Cotizaciones:</span>
          <span className="text-slate-400 hidden md:inline">Abre distintas cotizaciones para probar la vista pública y el backend.</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          {samples.map((item) => (
            <button key={item.id} onClick={() => onSelectId(item.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${currentId === item.id ? 'bg-[#00A896] text-white shadow-sm' : 'bg-white/10 hover:bg-white/20 text-slate-300'}`}>
              {item.id} — {item.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleCustomSubmit} className="flex items-center gap-1.5">
          <input type="text" value={customInput} onChange={(e) => setCustomInput(e.target.value)}
            placeholder="ID personalizado..."
            className="w-28 sm:w-32 px-2 py-0.5 text-[11px] rounded bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00A896]" />
          <button type="submit" className="p-1 rounded bg-[#00A896] hover:bg-[#008F80] text-white transition" title="Buscar cotización por ID">
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
