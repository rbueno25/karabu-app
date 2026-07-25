import React from 'react';
import { motion } from 'motion/react';
import { Globe, Users, Smile, Headphones } from 'lucide-react';

export default function Stats() {
  const statsList = [
    { id: 1, value: "50+", label: "Destinos", icon: <Globe className="w-4 h-4 lg:w-6 lg:h-6 text-brand-turquoise" /> },
    { id: 2, value: "8K+", label: "Clientes", icon: <Users className="w-4 h-4 lg:w-6 lg:h-6 text-brand-turquoise" /> },
    { id: 3, value: "100%", label: "Personalizado", icon: <Smile className="w-4 h-4 lg:w-6 lg:h-6 text-brand-turquoise" /> },
    { id: 4, value: "24/7", label: "Soporte", icon: <Headphones className="w-4 h-4 lg:w-6 lg:h-6 text-brand-turquoise" /> }
  ];

  return (
    <section className="bg-brand-navy py-6 lg:py-12 border-t border-b border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-4 gap-2 lg:gap-4 items-center">
          {statsList.map((stat, idx) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col items-center gap-2 text-center px-2 border-r border-white/10 last:border-r-0"
            >
              <div className="p-2 lg:p-3 rounded-full bg-white/5 text-brand-turquoise">
                {stat.icon}
              </div>
              <div>
                <span className="block font-display text-lg lg:text-3xl font-extrabold text-white tracking-tight leading-none">
                  {stat.value}
                </span>
                <span className="block text-[10px] lg:text-sm text-white/70 font-sans mt-0.5">
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
