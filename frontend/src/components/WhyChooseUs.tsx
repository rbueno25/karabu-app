import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, DollarSign, Clock, Users, Star, Check } from 'lucide-react';

export default function WhyChooseUs() {
  const leftFeatures = [
    {
      id: 'asesoria',
      title: "Acompañamiento real",
      description: "Te guiamos antes, durante y después de tu viaje, sin soltarte.",
      icon: <Users className="w-6 h-6 text-brand-turquoise" />
    },
    {
      id: 'precios',
      title: "Precios claros",
      description: "Sin costos ocultos. Te explicamos cada detalle de tu cotización.",
      icon: <DollarSign className="w-6 h-6 text-brand-turquoise" />
    }
  ];

  const rightFeatures = [
    {
      id: 'seguridad',
      title: "Procesos seguros",
      description: "Manejo confidencial de tus documentos y datos personales.",
      icon: <ShieldCheck className="w-6 h-6 text-brand-turquoise" />
    },
    {
      id: 'soporte',
      title: "Respuesta rápida",
      description: "WhatsApp directo. Te respondemos en minutos, no en días.",
      icon: <Clock className="w-6 h-6 text-brand-turquoise" />
    }
  ];

  return (
    <section
      id="por-que-elegirnos"
      className="py-24 bg-brand-navy relative overflow-hidden scroll-mt-20 border-b border-white/5"
    >
      {/* Background radial glow for a premium feel */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,168,150,0.15)_0%,_transparent_60%)] pointer-events-none" />
      
      {/* Background abstract grid/shapes */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT & CENTER CONTENT: Title + Features + Dial Logo (8 columns on large screen) */}
          <div className="lg:col-span-8 flex flex-col gap-12">
            
            {/* Header Block */}
            <div className="flex flex-col text-left">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-brand-turquoise/80 font-display font-extrabold text-xs sm:text-sm tracking-[0.2em] uppercase"
              >
                ¿POR QUÉ ELEGIR KARABU?
              </motion.span>
              
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-3 tracking-tight"
              >
                Tu viaje, en manos <span className="text-brand-turquoise">expertas</span>
              </motion.h2>
            </div>

            {/* Features Sub-Grid (Left / Center / Right) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-center">
              
              {/* Left Column Features */}
              <div className="flex flex-col gap-8 order-2 md:order-1">
                {leftFeatures.map((feat, idx) => (
                  <motion.div
                    key={feat.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="flex items-start gap-4 p-2 rounded-xl hover:bg-white/5 transition-colors duration-300"
                  >
                    <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center flex-shrink-0 text-brand-turquoise shadow-md">
                      {feat.icon}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-display font-bold text-base text-white tracking-wide">
                        {feat.title}
                      </h3>
                      <p className="text-slate-400 font-sans text-xs sm:text-sm mt-1 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Center Column: Delicate Glowing Dial with Hummingbird Logo */}
              <div className="flex items-center justify-center order-1 md:order-2 py-4">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                  
                  {/* Delicate, soft glowing background aura */}
                  <div className="absolute inset-2 rounded-full bg-brand-turquoise/10 blur-2xl opacity-80" />
                  
                  {/* Inner ambient cyan glow */}
                  <div className="absolute w-36 h-36 rounded-full bg-brand-turquoise/5 blur-xl" />
                  
                  {/* Ultra-thin outer accent line */}
                  <div className="absolute inset-0 rounded-full border-[0.5px] border-brand-turquoise/15" />
                  
                  {/* Extremely fine rotating dashed ring with slow precision speed */}
                  <div className="absolute inset-2 rounded-full border-[0.5px] border-dashed border-brand-turquoise/30 animate-[spin_140s_linear_infinite]" />
                  
                  {/* Inner subtle concentric solid rings */}
                  <div className="absolute inset-5 rounded-full border-[0.5px] border-brand-turquoise/25 flex items-center justify-center">
                    <div className="absolute inset-2 rounded-full border-[1px] border-brand-turquoise/10" />
                  </div>

                  {/* Four delicate micro-indicator ticks (top, right, bottom, left) */}
                  <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none opacity-40">
                    <div className="w-1.5 h-[1px] bg-brand-turquoise" />
                    <div className="w-1.5 h-[1px] bg-brand-turquoise" />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-between py-1 pointer-events-none opacity-40">
                    <div className="w-[1px] h-1.5 bg-brand-turquoise" />
                    <div className="w-[1px] h-1.5 bg-brand-turquoise" />
                  </div>

                  {/* Premium White circle card */}
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 90, damping: 15, delay: 0.15 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] bg-white rounded-full shadow-[0_12px_40px_rgba(0,168,150,0.18)] border border-slate-50 z-10"
                  />

                  {/* Logo perfectly centered over the circle */}
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 90, damping: 15, delay: 0.15 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                  >
                    <img
                      src="/colibri-square.svg"
                      alt="Karabu"
                      className="w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] object-contain"
                    />
                  </motion.div>
                </div>
              </div>

              {/* Right Column Features */}
              <div className="flex flex-col gap-8 order-3">
                {rightFeatures.map((feat, idx) => (
                  <motion.div
                    key={feat.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="flex items-start gap-4 p-2 rounded-xl hover:bg-white/5 transition-colors duration-300"
                  >
                    <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center flex-shrink-0 text-brand-turquoise shadow-md">
                      {feat.icon}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-display font-bold text-base text-white tracking-wide">
                        {feat.title}
                      </h3>
                      <p className="text-slate-400 font-sans text-xs sm:text-sm mt-1 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>

          </div>

          {/* RIGHT SIDEBAR: Prominent White Stats/Reviews Card (4 columns on large screen) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-4 bg-white rounded-3xl p-8 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col gap-6 relative"
          >
            {/* Stat 1: 4.9/5 Rating */}
            <div className="flex flex-col">
              <span className="font-display font-black text-3xl sm:text-4xl text-brand-navy tracking-tight">
                4.9/5
              </span>
              <div className="flex items-center gap-0.5 mt-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-slate-500 font-sans text-xs mt-2 font-medium">
                Satisfacción de nuestros clientes
              </span>
            </div>

            <div className="h-[1px] bg-slate-100 w-full" />

            {/* Stat 2: +2,000 Travelers */}
            <div className="flex flex-col">
              <span className="font-display font-black text-3xl sm:text-4xl text-brand-navy tracking-tight">
                +2,000
              </span>
              <span className="text-slate-500 font-sans text-xs mt-1.5 font-medium">
                Viajeros felices
              </span>
            </div>

            <div className="h-[1px] bg-slate-100 w-full" />

            {/* Stat 3: 98% Recommendations */}
            <div className="flex flex-col">
              <span className="font-display font-black text-3xl sm:text-4xl text-brand-navy tracking-tight">
                98%
              </span>
              <span className="text-slate-500 font-sans text-xs mt-1.5 font-medium">
                Recomendaciones
              </span>
            </div>

            <div className="h-[1px] bg-slate-100 w-full" />

            {/* Bottom Badge: Asesoría integral */}
            <div className="flex items-center gap-3.5 mt-1 bg-brand-turquoise/5 p-3 sm:p-4 rounded-xl border border-brand-turquoise/15">
              <div className="w-10 h-10 rounded-full bg-brand-turquoise/10 flex items-center justify-center flex-shrink-0 text-brand-turquoise">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xs sm:text-sm text-brand-navy leading-tight">
                  Asesoría Integral
                </span>
                <span className="font-sans text-slate-500 text-[11px] mt-0.5">
                  De principio a fin
                </span>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
