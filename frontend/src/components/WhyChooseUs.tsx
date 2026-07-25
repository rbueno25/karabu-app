import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, DollarSign, Clock, Users, Star, Check } from 'lucide-react';

export default function WhyChooseUs() {
  const allFeatures = [
    { id: 'asesoria', title: "Acompañamiento real", description: "Te guiamos antes, durante y después de tu viaje.", icon: <Users className="w-4 h-4 lg:w-6 lg:h-6 text-brand-turquoise" /> },
    { id: 'precios', title: "Precios claros", description: "Sin costos ocultos. Todo explicado.", icon: <DollarSign className="w-4 h-4 lg:w-6 lg:h-6 text-brand-turquoise" /> },
    { id: 'seguridad', title: "Procesos seguros", description: "Manejo confidencial de tus documentos.", icon: <ShieldCheck className="w-4 h-4 lg:w-6 lg:h-6 text-brand-turquoise" /> },
    { id: 'soporte', title: "Respuesta rápida", description: "WhatsApp directo, respondemos en minutos.", icon: <Clock className="w-4 h-4 lg:w-6 lg:h-6 text-brand-turquoise" /> }
  ];

  return (
    <section id="por-que-elegirnos" className="py-16 lg:py-24 bg-brand-navy relative overflow-hidden scroll-mt-20 border-b border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,168,150,0.15)_0%,_transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10 lg:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-brand-turquoise/80 font-display font-extrabold text-xs lg:text-sm tracking-[0.2em] uppercase"
          >
            ¿POR QUÉ ELEGIR KARABU?
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-2xl lg:text-5xl font-black text-white mt-2 lg:mt-3 tracking-tight"
          >
            Tu viaje, en manos <span className="text-brand-turquoise">expertas</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Features: 2x2 grid on mobile, 3-col with center logo on desktop */}
          <div className="lg:col-span-8">
            
            {/* Desktop: 3-col layout with center logo */}
            <div className="hidden lg:grid grid-cols-3 gap-4 items-center">
              {/* Left features */}
              <div className="flex flex-col gap-8">
                {allFeatures.slice(0,2).map((feat, idx) => (
                  <motion.div key={feat.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="flex items-start gap-4 p-2 rounded-xl hover:bg-white/5 transition-colors duration-300">
                    <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center flex-shrink-0 text-brand-turquoise shadow-md">{feat.icon}</div>
                    <div className="flex flex-col">
                      <h3 className="font-display font-bold text-base text-white tracking-wide">{feat.title}</h3>
                      <p className="text-slate-400 font-sans text-sm mt-1 leading-relaxed">{feat.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Center Logo */}
              <div className="flex items-center justify-center py-4">
                <div className="relative w-56 h-56 flex items-center justify-center">
                  <div className="absolute inset-2 rounded-full bg-brand-turquoise/10 blur-2xl opacity-80" />
                  <div className="absolute inset-0 rounded-full border-[0.5px] border-brand-turquoise/15" />
                  <div className="absolute inset-2 rounded-full border-[0.5px] border-dashed border-brand-turquoise/30 animate-[spin_140s_linear_infinite]" />
                  <motion.div initial={{ scale: 0.85, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 90, damping: 15, delay: 0.15 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-white rounded-full shadow-[0_12px_40px_rgba(0,168,150,0.18)] border border-slate-50 z-10" />
                  <motion.div initial={{ scale: 0.85, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 90, damping: 15, delay: 0.15 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <img src="/colibri-square.svg" alt="Karabu" className="w-[200px] h-[200px] object-contain" />
                  </motion.div>
                </div>
              </div>

              {/* Right features */}
              <div className="flex flex-col gap-8">
                {allFeatures.slice(2,4).map((feat, idx) => (
                  <motion.div key={feat.id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="flex items-start gap-4 p-2 rounded-xl hover:bg-white/5 transition-colors duration-300">
                    <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center flex-shrink-0 text-brand-turquoise shadow-md">{feat.icon}</div>
                    <div className="flex flex-col">
                      <h3 className="font-display font-bold text-base text-white tracking-wide">{feat.title}</h3>
                      <p className="text-slate-400 font-sans text-sm mt-1 leading-relaxed">{feat.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mobile logo — centered above features */}
            <div className="lg:hidden flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 90, damping: 15 }}
                className="w-24 h-24 rounded-full bg-white/10 p-2"
              >
                <img src="/colibri-square.svg" alt="Karabu" className="w-full h-full object-contain" />
              </motion.div>
            </div>

            {/* Mobile: 2x2 grid */}
            <div className="lg:hidden grid grid-cols-2 gap-3">
              {allFeatures.map((feat, idx) => (
                <motion.div key={feat.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="flex flex-col items-center text-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors duration-300">
                  <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center flex-shrink-0 text-brand-turquoise">
                    {feat.icon}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-display font-bold text-xs text-white tracking-wide">{feat.title}</h3>
                    <p className="text-slate-400 font-sans text-[10px] mt-1 leading-tight">{feat.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>

          {/* Stats Card — compact on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-4 bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-row lg:flex-col gap-4 lg:gap-6 flex-wrap lg:flex-nowrap"
          >
            <div className="flex-1 lg:flex-none flex flex-col items-center lg:items-start">
              <span className="font-display font-black text-2xl lg:text-4xl text-brand-navy tracking-tight">4.9/5</span>
              <div className="flex items-center gap-0.5 mt-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 lg:w-4 lg:h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <span className="text-slate-500 font-sans text-[10px] lg:text-xs mt-1 text-center lg:text-left">Satisfacción de clientes</span>
            </div>
            <div className="hidden lg:block h-[1px] bg-slate-100 w-full" />
            <div className="flex-1 lg:flex-none flex flex-col items-center lg:items-start">
              <span className="font-display font-black text-2xl lg:text-4xl text-brand-navy tracking-tight">+2K</span>
              <span className="text-slate-500 font-sans text-[10px] lg:text-xs mt-1">Viajeros felices</span>
            </div>
            <div className="hidden lg:block h-[1px] bg-slate-100 w-full" />
            <div className="flex-1 lg:flex-none flex flex-col items-center lg:items-start">
              <span className="font-display font-black text-2xl lg:text-4xl text-brand-navy tracking-tight">98%</span>
              <span className="text-slate-500 font-sans text-[10px] lg:text-xs mt-1">Recomendaciones</span>
            </div>
            <div className="hidden lg:block h-[1px] bg-slate-100 w-full" />
            <div className="w-full lg:flex-none flex items-center gap-3 mt-0 bg-brand-turquoise/5 p-2.5 lg:p-4 rounded-xl border border-brand-turquoise/15">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-brand-turquoise/10 flex items-center justify-center flex-shrink-0 text-brand-turquoise">
                <Check className="w-4 h-4 lg:w-5 lg:h-5 stroke-[3]" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xs lg:text-sm text-brand-navy leading-tight">Asesoría Integral</span>
                <span className="font-sans text-slate-500 text-[10px] mt-0.5">De principio a fin</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
