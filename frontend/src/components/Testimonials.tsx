import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote, ShieldCheck } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      id: 1,
      quote: "Cotizamos nuestro viaje a Punta Cana y en menos de 24 horas teníamos una propuesta completa. Todo salió perfecto.",
      name: "María G.",
      destination: "Punta Cana",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120"
    },
    {
      id: 2,
      quote: "Gracias a su asesoría de visas preparamos nuestros documentos sin errores. El proceso fue mucho más fácil de lo que esperábamos.",
      name: "Carlos R.",
      destination: "Viaje a España",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120"
    },
    {
      id: 3,
      quote: "Organizaron nuestro crucero familiar con un precio increíble. Desde la reserva hasta el regreso, todo impecable.",
      name: "Laura M.",
      destination: "Crucero por el Caribe",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120&h=120"
    }
  ];

  const partners = [
    { name: "Club Viajemos", sub: "B2B", logo: "/certificaciones/clubviajemos.jpg", url: "https://clubviajemos.com" },
    { name: "Dividelo", sub: "PAGOS", logo: "/certificaciones/dividelo.png", url: "https://dividelo.com" },
    { name: "American Airlines", sub: "AEROLÍNEA", logo: "/certificaciones/american-airlines.webp", url: "https://aa.com" },
    { name: "Bedsonline", sub: "HOTELES", logo: "/certificaciones/bedsonline.webp", url: "https://bedsonline.com" },
    { name: "Ratehawk", sub: "HOTELES B2B", logo: "/certificaciones/ratehawk.png", url: "https://ratehawk.com" },
    { name: "Certiviajes", sub: "CERTIFICACIÓN", logo: "/certificaciones/certiviajes.svg", url: "https://certiviajes.com" }
  ];

  return (
    <section className="py-20 bg-white relative border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">
          
          {/* Left Column: Testimonials (LO QUE DICEN NUESTROS VIAJEROS) */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="mb-12 flex flex-col gap-2.5 text-center lg:text-left">
              <span className="text-sm font-bold text-brand-turquoise tracking-widest uppercase">
                LO QUE DICEN NUESTROS VIAJEROS
              </span>
              <h2 className="font-display text-3xl font-extrabold text-brand-navy tracking-tight">
                Experiencias que inspiran
              </h2>
              <div className="h-1 w-12 bg-brand-turquoise rounded-full mt-1 mx-auto lg:mx-0" />
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
              {reviews.map((rev, idx) => (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm relative flex flex-col justify-between h-full hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Top quote icon & stars */}
                    <div className="flex items-center justify-between mb-4">
                      <Quote className="w-8 h-8 text-brand-turquoise/20 stroke-[3]" />
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: rev.stars }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-brand-orange text-brand-orange" />
                        ))}
                      </div>
                    </div>

                    <p className="text-slate-600 font-sans text-sm leading-relaxed italic mb-6">
                      "{rev.quote}"
                    </p>
                  </div>

                  {/* Profile details */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200/50">
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="w-10 h-10 rounded-full object-cover border border-brand-turquoise/30"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col text-left">
                      <span className="font-display font-bold text-sm text-brand-navy">{rev.name}</span>
                      <span className="text-slate-400 text-xs font-medium font-sans">{rev.destination}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Partners/Accreditation (RESPALDADOS POR) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div className="mb-8 flex flex-col gap-2.5 text-center lg:text-left">
              <span className="text-sm font-bold text-brand-turquoise tracking-widest uppercase">
                RESPALDADOS POR
              </span>
              <h2 className="font-display text-3xl font-extrabold text-brand-navy tracking-tight">
                Confianza institucional
              </h2>
              <div className="h-1 w-12 bg-brand-turquoise rounded-full mt-1 mx-auto lg:mx-0" />
            </div>

            {/* Grid of stylized, ultra-crisp vector-like logo cards */}
            <div className="grid grid-cols-2 gap-4 flex-grow justify-center items-center">
              {partners.map((partner, idx) => (
                <motion.a
                  key={idx}
                  href={partner.url}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="bg-white border border-slate-200/60 rounded-xl p-3 flex flex-col items-center justify-end text-center h-24 hover:border-brand-turquoise/40 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                  style={{ backgroundImage: `url(${partner.logo})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
                >
                  <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-white/80 px-2 py-0.5 rounded-full">
                    {partner.sub}
                  </span>
                </motion.a>
              ))}
              
              {/* Trust stamp */}
              <div className="bg-brand-navy text-white rounded-xl p-4 flex items-center gap-3 h-24 col-span-2 shadow-sm border border-brand-navy-light">
                <ShieldCheck className="w-8 h-8 text-brand-turquoise flex-shrink-0" />
                <div className="text-left">
                  <span className="text-[10px] font-mono text-brand-turquoise font-extrabold block uppercase tracking-wider leading-none">Agencia Certificada</span>
                  <span className="font-display font-bold text-xs text-white block mt-1 leading-tight">Cumplimiento de estándares</span>
                  <span className="text-[9px] text-slate-300 block leading-tight font-sans mt-0.5">Operaciones registradas y seguras.</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
