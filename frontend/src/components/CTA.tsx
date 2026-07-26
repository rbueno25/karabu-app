import React from 'react';
import { motion } from 'motion/react';
import { Calendar } from 'lucide-react';

interface CTAProps {
  onContactClick: () => void;
}

export default function CTA({ onContactClick }: CTAProps) {
  return (
    <section className="relative py-16 lg:py-24 overflow-hidden text-white">
      {/* Background image with deep brand-navy overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1600&h=600"
          alt="Paisaje de viaje espectacular"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-brand-navy/85 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center gap-6">
        
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-brand-turquoise font-display font-extrabold text-xs sm:text-sm uppercase tracking-widest block"
        >
          ¿LISTO PARA VIAJAR SIN COMPLICACIONES?
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight"
        >
          Cotiza tu viaje hoy y viaja con confianza
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-slate-300 font-sans text-base sm:text-lg max-w-2xl leading-relaxed mt-2"
        >
          Contáctanos hoy y recibe una cotización personalizada con paquetes de viaje, asesoría de visas y acompañamiento en cada paso.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6"
        >
          <button
            onClick={onContactClick}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold px-8 py-4 rounded-md shadow-lg transition-all transform hover:scale-[1.03] active:scale-[0.97] inline-flex items-center gap-2.5"
          >
            <Calendar className="w-4.5 h-4.5" />
            <span>Solicitar cotización</span>
          </button>
        </motion.div>

      </div>
    </section>
  );
}
