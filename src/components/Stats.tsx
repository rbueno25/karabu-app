import React from 'react';
import { motion } from 'motion/react';
import { Globe, Users, Smile, Headphones } from 'lucide-react';

export default function Stats() {
  const statsList = [
    {
      id: 1,
      value: "50+",
      label: "Destinos increíbles",
      icon: <Globe className="w-6 h-6 text-brand-turquoise" />
    },
    {
      id: 2,
      value: "8,000+",
      label: "Clientes satisfechos",
      icon: <Users className="w-6 h-6 text-brand-turquoise" />
    },
    {
      id: 3,
      value: "100%",
      label: "Atención personalizada",
      icon: <Smile className="w-6 h-6 text-brand-turquoise" />
    },
    {
      id: 4,
      value: "24/7",
      label: "Soporte en viaje",
      icon: <Headphones className="w-6 h-6 text-brand-turquoise" />
    }
  ];

  return (
    <section className="bg-brand-navy py-8 sm:py-12 border-t border-b border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 items-center">
          {statsList.map((stat, idx) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left justify-center border-r last:border-r-0 border-white/10 px-2 last:border-none"
            >
              <div className="p-3 rounded-full bg-white/5 text-brand-turquoise">
                {stat.icon}
              </div>
              <div>
                <span className="block font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
                  {stat.value}
                </span>
                <span className="block text-xs sm:text-sm text-white/70 font-sans mt-1">
                  {stat.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
