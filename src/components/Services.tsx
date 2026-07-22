import React from 'react';
import { motion } from 'motion/react';
import { Luggage, CalendarDays, Map, Briefcase, Heart, FileCheck } from 'lucide-react';

export default function Services() {
  const servicesList = [
    {
      id: 1,
      title: "Paquetes Turísticos",
      description: "Diseñados a tu medida para vivir experiencias únicas.",
      icon: <Luggage className="w-10 h-10 text-[#00A896]" />
    },
    {
      id: 2,
      title: "Reservas",
      description: "Hoteles, vuelos, traslados y más, todo en un solo lugar.",
      icon: <CalendarDays className="w-10 h-10 text-[#00A896]" />
    },
    {
      id: 3,
      title: "Circuitos y Tours",
      description: "Rutas planificadas para descubrir lo mejor de cada destino.",
      icon: <Map className="w-10 h-10 text-[#00A896]" />
    },
    {
      id: 4,
      title: "Viajes Corporativos",
      description: "Soluciones eficientes para empresas y ejecutivos.",
      icon: <Briefcase className="w-10 h-10 text-[#00A896]" />
    },
    {
      id: 5,
      title: "Lunas de Miel",
      description: "Momentos inolvidables para comenzar su nueva historia juntos.",
      icon: <Heart className="w-10 h-10 text-[#00A896]" />
    },
    {
      id: 6,
      title: "Asesoría de Visas",
      description: "Te guiamos en todo el proceso de visado de forma segura y rápida.",
      icon: <FileCheck className="w-10 h-10 text-[#00A896]" />
    }
  ];

  return (
    <section id="servicios" className="py-20 bg-[#f9fbfd] relative scroll-mt-20">
      
      {/* Soft top border or subtle shadow transition */}
      <div className="absolute top-0 inset-x-0 h-px bg-slate-100" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching the layout of image.png exactly */}
        <div className="text-center max-w-3xl mx-auto mb-14 flex flex-col items-center gap-2">
          <span className="text-[11px] sm:text-xs font-black text-[#00A896] tracking-[0.2em] uppercase font-display">
            NUESTROS SERVICIOS
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-brand-navy tracking-tight">
            Todo lo que necesitas para viajar sin preocupaciones
          </h2>
          <div className="h-1 w-12 bg-[#00A896]/70 rounded-full mt-2" />
        </div>

        {/* 6 Services Row - Horizontal Layout as shown in image.png */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 xl:gap-5">
          {servicesList.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
              className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col items-center text-center group transform hover:-translate-y-1 h-full"
            >
              {/* Centered Large Turquoise Icon */}
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-5 group-hover:bg-[#00A896]/10 transition-colors duration-300">
                <div className="transform group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
              </div>

              {/* Title - Bold navy color with elegant tracking */}
              <h3 className="font-display font-extrabold text-sm sm:text-base text-brand-navy mb-3 group-hover:text-[#00A896] transition-colors duration-300 px-1 leading-tight">
                {service.title}
              </h3>
              
              {/* Short Description */}
              <p className="text-slate-500 font-sans text-xs leading-relaxed mt-auto">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
