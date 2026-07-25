import React from 'react';
import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';

interface DestinationsProps {
  onSelectDestination: (destinationName: string) => void;
}

export default function Destinations({ onSelectDestination }: DestinationsProps) {
  const tallDestination = {
    name: 'República Dominicana',
    image: '/destinos/Republica-Dominicana.jpg',
    description: 'Paraíso cercano, experiencias inolvidables'
  };

  const topDestinations = [
    {
      id: 'punta-cana',
      name: 'Punta Cana',
      image: '/destinos/punta-cana.jpg',
      description: 'Playas infinitas y resorts de clase mundial'
    },
    {
      id: 'miami',
      name: 'Miami',
      image: '/destinos/Miami.jpg',
      description: 'Compras, playas y vida nocturna'
    },
    {
      id: 'new-york',
      name: 'New York',
      image: '/destinos/New York.jpg',
      description: 'La ciudad que nunca duerme'
    },
    {
      id: 'cancun',
      name: 'Cancún',
      image: '/destinos/Cancun.jpg',
      description: 'Mar Caribe y ruinas mayas'
    }
  ];

  const bottomDestinations = [
    {
      id: 'bogota',
      name: 'Bogotá',
      image: '/destinos/Bogotá.jpg',
      description: 'Cultura, gastronomía y montañas'
    },
    {
      id: 'paris',
      name: 'París',
      image: '/destinos/Paris.jpg',
      description: 'La ciudad del amor y la luz'
    },
    {
      id: 'orlando',
      name: 'Orlando',
      image: '/destinos/Orlando.jpg',
      description: 'Diversión sin límites en los parques'
    }
  ];

  return (
    <section id="destinos" className="py-20 bg-white relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block matching the design with Hand-drawn paper plane sketch */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-navy tracking-tight relative pb-1">
              Destinos destacados
              <div className="absolute bottom-0 left-0 w-12 h-1 bg-brand-orange rounded-full" />
            </h2>
            
            {/* Paper plane loop custom trail SVG */}
            <svg className="w-20 h-10 text-brand-turquoise/40 select-none pointer-events-none hidden sm:block" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 30 C 25 35, 45 10, 50 15 C 55 20, 48 30, 60 25 L 75 18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" />
              <g transform="translate(73, 16) rotate(-20)">
                <path d="M0 0 L10 4 L4 5 L3 9 Z" fill="currentColor" />
              </g>
            </svg>
          </div>

          <button
            onClick={() => onSelectDestination('Todos')}
            className="self-start sm:self-center border border-slate-300 hover:border-brand-turquoise text-slate-600 hover:text-brand-turquoise font-bold px-6 py-2.5 rounded-full text-xs sm:text-sm transition-all duration-300 shadow-sm hover:shadow active:scale-[0.98]"
          >
            Ver todos los destinos
          </button>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-stretch">
          
          {/* 1. Left Tall Column: República Dominicana */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onClick={() => onSelectDestination(tallDestination.name)}
            className="lg:col-span-3 group relative overflow-hidden rounded-3xl cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500 flex flex-col justify-end min-h-[220px] lg:min-h-full h-full transform hover:-translate-y-1"
          >
            {/* Background Zoom Image */}
            <div className="absolute inset-0 z-0">
              <img
                src={tallDestination.image}
                alt={tallDestination.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/40 to-transparent" />
            </div>

            {/* Content overlay */}
            <div className="relative z-10 p-6 sm:p-8 flex flex-col gap-6 w-full text-white">
              <div className="flex flex-col gap-1.5">
                <h3 className="font-display font-black text-2xl sm:text-3xl tracking-tight uppercase leading-tight">
                  REPÚBLICA<br />DOMINICANA
                </h3>
                <p className="font-sans text-xs sm:text-sm text-slate-200 opacity-95 leading-relaxed font-medium">
                  {tallDestination.description}
                </p>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between mt-2">
                <span className="bg-white hover:bg-slate-50 text-brand-navy font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-md transition-colors">
                  Ver destinos
                </span>
                
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/25">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. Right Grid Column containing 2 Rows (Top and Bottom) */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            
            {/* Top Row: 4 smaller cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-6">
              {topDestinations.map((dest, idx) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  onClick={() => onSelectDestination(dest.name)}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer h-[130px] sm:h-[150px] xl:h-[200px] shadow-sm hover:shadow-lg transition-all duration-500 transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 z-0">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/20 to-transparent" />
                  </div>

                  <div className="absolute inset-0 p-5 flex flex-col justify-end text-white z-10">
                    <h4 className="font-display font-black text-base tracking-wide">
                      {dest.name}
                    </h4>
                    <p className="font-sans text-[11px] sm:text-xs text-slate-200 mt-1 opacity-90 leading-tight">
                      {dest.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Row: 3 slightly wider cards */}
            <div className="grid grid-cols-3 gap-3 lg:gap-6">
              {bottomDestinations.map((dest, idx) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  onClick={() => onSelectDestination(dest.name)}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer h-[130px] sm:h-[150px] xl:h-[200px] shadow-sm hover:shadow-lg transition-all duration-500 transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 z-0">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/20 to-transparent" />
                  </div>

                  <div className="absolute inset-0 p-5 flex flex-col justify-end text-white z-10">
                    <h4 className="font-display font-black text-base tracking-wide">
                      {dest.name}
                    </h4>
                    <p className="font-sans text-[11px] sm:text-xs text-slate-200 mt-1 opacity-90 leading-tight">
                      {dest.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
