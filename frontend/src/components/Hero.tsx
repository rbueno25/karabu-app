import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Award, Headphones, ShieldCheck, Plane, Users, Check } from 'lucide-react';

interface HeroProps {
  onExploreDestinations: () => void;
  onContact: () => void;
}

export default function Hero({ onExploreDestinations, onContact }: HeroProps) {
  const beachImage = "/hero-main.jpg";
  const veniceImage = "https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?auto=format&fit=crop&q=80&w=600&h=450";
  const cruiseImage = "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&q=80&w=600&h=450";

  return (
    <section id="inicio" className="relative overflow-hidden bg-white pt-8 pb-16 lg:py-0 min-h-screen lg:min-h-0">

      {/* Mobile-only: full background image with dark overlay */}
      <div className="absolute inset-0 z-0 lg:hidden">
        <img
          src={beachImage}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/65 via-brand-navy/55 to-brand-navy/75" />
      </div>

      {/* Desktop-only: decorative grid pattern */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] opacity-[0.03] bg-[radial-gradient(#00A896_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0 hidden lg:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:pl-8 lg:pr-0 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-center lg:items-stretch">

          {/* Text Content */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-center lg:text-left lg:justify-center lg:py-24">

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 self-center lg:self-start bg-brand-turquoise/20 lg:bg-brand-turquoise/10 text-brand-turquoise font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-full"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>VIAJES · VISAS · CERTIFICADOS</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white lg:text-brand-navy tracking-tight leading-tight"
            >
              Cotiza el viaje de<br />
              tus sueños <span className="text-brand-turquoise">en minutos</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/80 lg:text-slate-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans"
            >
              Completa el formulario y recibe una propuesta personalizada con paquetes de viaje, asesoría de visas y acompañamiento en todo el proceso.
            </motion.p>

            {/* 3 Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-3 gap-3 my-2 text-left"
            >
              {[
                { icon: Users, title: 'Paquetes', sub: 'de viaje' },
                { icon: Award, title: 'Asesoría', sub: 'de visas' },
                { icon: Headphones, title: 'Certificados', sub: 'de viaje' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 lg:gap-3">
                  <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-brand-turquoise/20 lg:bg-brand-turquoise/10 flex items-center justify-center text-brand-turquoise flex-shrink-0">
                    <item.icon className="w-3 h-3 lg:w-4.5 lg:h-4.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-extrabold text-[11px] lg:text-[13px] text-white lg:text-brand-navy leading-tight">
                      {item.title}
                    </span>
                    <span className="font-sans text-[9px] lg:text-xs text-white/60 lg:text-slate-500 leading-tight">
                      {item.sub}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-row items-center gap-3 justify-center lg:justify-start mt-2"
            >
              <button
                onClick={onExploreDestinations}
                className="flex-1 lg:flex-none bg-white lg:bg-brand-navy text-brand-navy lg:text-white hover:bg-white/90 lg:hover:bg-brand-navy/90 font-bold text-sm lg:text-base px-4 lg:px-8 py-3 lg:py-4 rounded-md shadow-lg transition-all transform hover:scale-[1.03] active:scale-[0.97] text-center"
              >
                Ver destinos
              </button>

              <button
                onClick={onContact}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-sm lg:text-base px-4 lg:px-8 py-3 lg:py-4 rounded-md shadow-lg transition-all transform hover:scale-[1.03] active:scale-[0.97]"
              >
                <span>Solicitar cotización</span>
              </button>
            </motion.div>

            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-3 self-center lg:self-start mt-4 max-w-sm"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 lg:bg-brand-navy flex items-center justify-center text-white flex-shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <span className="font-display font-extrabold text-xs text-white lg:text-brand-navy block leading-tight">
                  Agencia de viajes con acompañamiento personalizado
                </span>
                <span className="text-[10px] text-white/60 lg:text-slate-500 block leading-tight mt-0.5 font-sans">
                  Viaja con confianza — te guiamos en cada paso.
                </span>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Desktop only — full-bleed image */}
          <div className="lg:col-span-6 relative hidden lg:flex min-h-[500px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 overflow-hidden"
            >
              <img
                src={beachImage}
                alt="Playa tropical espectacular"
                className="w-full h-full object-cover select-none pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy/20 via-transparent to-white/5 mix-blend-overlay pointer-events-none" />
            </motion.div>

            {/* Flight Curve */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 500 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 100 200 Q 220 90 320 190 T 450 350"
                stroke="#00A896"
                strokeWidth="2"
                strokeDasharray="4 6"
                opacity="0.6"
              />
            </svg>

            {/* Airplane */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1, duration: 1, type: 'spring' }}
              className="absolute top-[18%] left-[42%] text-brand-turquoise z-20 flex items-center justify-center transform -rotate-12"
            >
              <Plane className="w-5 h-5 fill-current" />
            </motion.div>

            {/* Polaroid 1: Venice */}
            <motion.div
              initial={{ opacity: 0, x: -40, y: -20, rotate: -20 }}
              animate={{ opacity: 1, x: 0, y: 0, rotate: -6 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute top-[12%] left-[-2%] w-[200px] bg-white p-3 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.18)] border border-slate-100 z-30 transform transition-transform hover:scale-105 duration-300"
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

            {/* Polaroid 2: Cruise */}
            <motion.div
              initial={{ opacity: 0, x: -30, y: 40, rotate: 20 }}
              animate={{ opacity: 1, x: 0, y: 0, rotate: 4 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute bottom-[8%] left-[6%] w-[220px] bg-white p-3 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.22)] border border-slate-100 z-40 transform transition-transform hover:scale-105 duration-300"
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
