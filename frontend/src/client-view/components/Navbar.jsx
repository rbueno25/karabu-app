import React, { useState } from 'react';
import { Sun, Moon, Share2, CheckCircle2, AlertCircle, Clock, FileCheck2, Sparkles, Check } from 'lucide-react';
import Logo from '../../components/Logo';

export function Navbar({ id, status, darkMode, onToggleDarkMode }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'aceptada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Propuesta Aceptada
          </span>
        );
      case 'rechazada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF6B35]/10 dark:bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30">
            <AlertCircle className="w-3.5 h-3.5" /> Cambios Solicitados
          </span>
        );
      case 'expirada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-500 border border-slate-500/30">
            <Clock className="w-3.5 h-3.5" /> Cotización Expirada
          </span>
        );
      case 'enviada':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#00A896]/10 dark:bg-[#00A896]/20 text-[#00A896] border border-[#00A896]/30 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> Propuesta Lista
          </span>
        );
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[#0F2A4A] shadow-lg border-b border-[#0D9387]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand — usa el mismo Logo de la página principal */}
        <div className="flex items-center gap-3">
          <Logo light={darkMode} showText={true} className="scale-[0.7] origin-left" />
          <div className="hidden sm:block">
            <p className="text-[11px] text-white/70 font-medium">
              Cotización Personalizada #{id}
            </p>
          </div>
        </div>

        {/* Center / Status */}
        <div className="hidden md:flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-white/50" />
          <span className="text-xs text-white/70 font-medium">Estado:</span>
          {getStatusBadge()}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/80 bg-white/10 hover:bg-white/20 border border-white/10 transition"
            title="Copiar enlace de cotización"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? '¡Copiado!' : 'Compartir'}</span>
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-white/70 bg-white/10 hover:bg-white/20 border border-white/10 transition"
            aria-label="Cambiar tema"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>
    </header>
  );
}
