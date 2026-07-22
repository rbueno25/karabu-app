import React from 'react';
import { motion } from 'motion/react';
import { PhoneCall, Calendar } from 'lucide-react';

interface CTAProps {
  onContactClick: () => void;
}

export default function CTA({ onContactClick }: CTAProps) {
  return (
    <section className="relative py-24 overflow-hidden text-white">
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
          ¿LISTO PARA VIVIR TU PRÓXIMA AVENTURA?
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight"
        >
          Permítenos diseñar el viaje perfecto para ti
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-slate-300 font-sans text-base sm:text-lg max-w-2xl leading-relaxed mt-2"
        >
          Contáctanos hoy mismo y empieza a crear recuerdos imborrables junto a tu familia, pareja o colegas de trabajo. Asesoría de visados y paquetes vacacionales completos.
        </motion.p>

        {/* CTA Buttons Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-6 w-full sm:w-auto"
        >
          {/* Solicitar cotización Button */}
          <a
            href="https://wa.me/18093062424?text=Hola!%20Estoy%20listo%20para%20organizar%20mi%20viaje%20con%20Karabu.%20Me%20interesa%20recibir%20asesoría."
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold px-8 py-4 rounded-md shadow-lg transition-all transform hover:scale-[1.03] active:scale-[0.97]"
          >
            <Calendar className="w-4.5 h-4.5" />
            <span>Solicitar cotización</span>
          </a>

          {/* Llamar ahora Button */}
          <a
            href="tel:8093062424"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-brand-navy hover:bg-brand-navy/90 text-white font-bold px-8 py-4 rounded-md shadow-lg transition-all transform hover:scale-[1.03] active:scale-[0.97]"
          >
            <PhoneCall className="w-4.5 h-4.5" />
            <span>Llamar ahora</span>
          </a>
        </motion.div>

      </div>
    </section>
  );
}
