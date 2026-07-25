import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Award, Headphones, ShieldCheck, Plane, Users, Check } from 'lucide-react';

interface HeroProps {
  onExploreDestinations: () => void;
  onContact: () => void;
}

export default function Hero({ onExploreDestinations, onContact }: HeroProps) {
  // URLs of high quality assets as displayed in the UI mockups
  const beachImage = "/hero-main.jpg";
  const veniceImage = "https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?auto=format&fit=crop&q=80&w=600&h=450";
  const cruiseImage = "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&q=80&w=600&h=450";

  return (
    <section id="inicio" className="relative overflow-hidden bg-white pt-8 pb-16 lg:py-24">
      
      {/* Decorative top-right grid layout background */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] opacity-[0.03] bg-[radial-gradient(#00A896_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Text Content, Key Badges, and Buttons */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-center lg:text-left">
            
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 self-center lg:self-start bg-brand-turquoise/10 text-brand-turquoise font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-full"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>VIAJES · VISAS · CERTIFICADOS</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-navy tracking-tight leading-tight"
            >
              Cotiza el viaje de<br />
              tus sueños <span className="text-brand-turquoise">en minutos</span>
            </motion.h1>

            {/* Description Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans"
            >
              Completa el formulario y recibe una propuesta personalizada con paquetes de viaje, asesoría de visas y acompañamiento en todo el proceso.
            </motion.p>

            {/* 3 Horizontally Aligned Badges with precise styles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-2 text-left"
            >
              {/* Item 1: Paquetes de viaje */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-turquoise/10 flex items-center justify-center text-brand-turquoise flex-shrink-0">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-extrabold text-[13px] text-brand-navy leading-tight">
                    Paquetes
                  </span>
                  <span className="font-sans text-xs text-slate-500 leading-tight">
                    de viaje
                  </span>
                </div>
              </div>

              {/* Item 2: Asesoría de visas */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-turquoise/10 flex items-center justify-center text-brand-turquoise flex-shrink-0">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-extrabold text-[13px] text-brand-navy leading-tight">
                    Asesoría
                  </span>
                  <span className="font-sans text-xs text-slate-500 leading-tight">
                    de visas
                  </span>
                </div>
              </div>

              {/* Item 3: Certificados de viaje */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-turquoise/10 flex items-center justify-center text-brand-turquoise flex-shrink-0">
                  <Headphones className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-extrabold text-[13px] text-brand-navy leading-tight">
                    Certificados
                  </span>
                  <span className="font-sans text-xs text-slate-500 leading-tight">
                    de viaje
                  </span>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mt-2"
            >
              <button
                onClick={onExploreDestinations}
                className="w-full sm:w-auto bg-brand-navy hover:bg-brand-navy/90 text-white font-bold px-8 py-4 rounded-md shadow-lg transition-all transform hover:scale-[1.03] active:scale-[0.97]"
              >
                Ver destinos
              </button>
              
              <button
                onClick={onContact}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold px-8 py-4 rounded-md shadow-lg transition-all transform hover:scale-[1.03] active:scale-[0.97]"
              >
                <span>Solicitar cotización</span>
              </button>
            </motion.div>

            {/* Trusted Stamp Badge - matching reference image */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-3 text-slate-700 self-center lg:self-start mt-4 max-w-sm"
            >
              <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-white flex-shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <span className="font-display font-extrabold text-xs text-brand-navy block leading-tight">
                  Agencia de viajes con acompañamiento personalizado
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight mt-0.5 font-sans">
                  Viaja con confianza — te guiamos en cada paso.
                </span>
              </div>
            </motion.div>

          </div>

          {/* Right Column: beach image — appears first on mobile, right side on desktop */}
          <div className="lg:col-span-6 relative h-auto sm:h-[580px] flex items-center justify-center lg:justify-end mt-6 sm:mt-12 lg:mt-0 z-10 order-first lg:order-none">
            
            {/* The Big Organic Wave Mask/Background Container as seen in the image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-[580px] h-[250px] sm:h-[440px] lg:h-[540px] overflow-hidden shadow-2xl z-0 rounded-3xl"
            >
              {/* Image inside */}
              <img
                src={beachImage}
                alt="Playa tropical espectacular"
                className="w-full h-full object-cover select-none pointer-events-none"
              />
              
              {/* Subtle glass overlay to blend with the white card edges */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy/10 via-transparent to-white/10 mix-blend-overlay pointer-events-none" />
            </motion.div>

            {/* Flight Curve / Dotted Path Path — hidden on mobile */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden sm:block"
              viewBox="0 0 500 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Dotted curve connecting the polaroids and flight path */}
              <path
                d="M 100 200 Q 220 90 320 190 T 450 350"
                stroke="#00A896"
                strokeWidth="2"
                strokeDasharray="4 6"
                opacity="0.6"
              />
            </svg>

            {/* Small decorative airplane traveling along the dotted path — hidden on mobile */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1, duration: 1, type: 'spring' }}
              className="absolute top-[18%] left-[42%] text-brand-turquoise z-20 items-center justify-center transform -rotate-12 hidden sm:flex"
            >
              <Plane className="w-5 h-5 fill-current" />
            </motion.div>

            {/* WHITE-BORDERED PICTURE 1: Venice Canal — hidden on mobile */}
            <motion.div
              initial={{ opacity: 0, x: -40, y: -20, rotate: -20 }}
              animate={{ opacity: 1, x: 0, y: 0, rotate: -6 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute top-[12%] left-[-4%] sm:left-[-2%] w-[160px] sm:w-[200px] bg-white p-2.5 sm:p-3 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.18)] border border-slate-100 z-30 transform transition-transform hover:scale-105 duration-300 hidden sm:block"
            >
              <div className="overflow-hidden rounded-xl aspect-[4/3]">
                <img
                  src={veniceImage}
                  alt="Canal de Venecia"
                  className="w-full h-full object-cover pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>

            {/* WHITE-BORDERED PICTURE 2: Cruise Ship — hidden on mobile */}
            <motion.div
              initial={{ opacity: 0, x: -30, y: 40, rotate: 20 }}
              animate={{ opacity: 1, x: 0, y: 0, rotate: 4 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute bottom-[8%] left-[2%] sm:left-[6%] w-[170px] sm:w-[220px] bg-white p-2.5 sm:p-3 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.22)] border border-slate-100 z-40 transform transition-transform hover:scale-105 duration-300 hidden sm:block"
            >
              <div className="overflow-hidden rounded-xl aspect-[4/3]">
                <img
                  src={cruiseImage}
                  alt="Crucero por el Caribe"
                  className="w-full h-full object-cover pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}
