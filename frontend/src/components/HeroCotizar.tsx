import React from 'react';
import { motion } from 'motion/react';
import { MapPin, ArrowDown, ShieldCheck, Clock, DollarSign } from 'lucide-react';

interface HeroCotizarProps {
  onComenzar: () => void;
}

export default function HeroCotizar({ onComenzar }: HeroCotizarProps) {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-[#0F2A4A]">
      {/* Background image */}
      <img
        src="https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&q=80&w=1920"
        alt="Viaje"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F2A4A]/80 via-[#0F2A4A]/50 to-[#0F2A4A]/90" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-300 text-sm font-medium mb-6">
            <MapPin className="w-4 h-4 text-[#0D9387]" />
            Agencia oficial · República Dominicana
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-4">
            Cotiza tu próximo<br />
            <span className="text-[#0D9387]">viaje con confianza</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Solicita tu cotización de forma sencilla, compara opciones claras y recibe acompañamiento humano<br />
            hasta completar tu viaje o proceso de visa.
          </p>

          <button
            onClick={onComenzar}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#0D9387] hover:bg-[#0b7d72] text-white font-bold text-lg shadow-xl shadow-[#0D9387]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Cotizar ahora
            <ArrowDown className="w-5 h-5 group-hover:animate-bounce" />
          </button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-12"
        >
          {[
            { icon: <ShieldCheck className="w-4 h-4" />, text: "Cotización 100% gratuita" },
            { icon: <Clock className="w-4 h-4" />, text: "Respuesta en 24h" },
            { icon: <DollarSign className="w-4 h-4" />, text: "Sin compromiso" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <span className="text-[#0D9387]">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 pb-8"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="w-1.5 h-3 rounded-full bg-[#0D9387]"
          />
        </div>
      </motion.div>
    </section>
  );
}
