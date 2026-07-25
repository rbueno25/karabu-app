import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, FileText, CalendarCheck, Compass } from 'lucide-react';

export default function Steps() {
  const steps = [
    { id: 1, title: "Cuéntanos", desc: "Llena el formulario con tu destino y fechas.", icon: <MessageSquare className="w-4 h-4" /> },
    { id: 2, title: "Cotización", desc: "Recibe una propuesta clara y detallada.", icon: <FileText className="w-4 h-4" /> },
    { id: 3, title: "Reserva", desc: "Confirma y aparta con un monto inicial.", icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 4, title: "Viaja", desc: "Disfruta con soporte 24/7.", icon: <Compass className="w-4 h-4" /> }
  ];

  return (
    <section className="py-12 lg:py-20 bg-slate-50 relative border-b border-slate-150/60">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-8 lg:mb-20 flex flex-col gap-2 lg:gap-3">
          <span className="text-xs lg:text-sm font-bold text-brand-turquoise tracking-widest uppercase">
            ASÍ DE FÁCIL
          </span>
          <h2 className="font-display text-xl lg:text-4xl font-extrabold text-brand-navy tracking-tight">
            Cotiza tu viaje en 4 pasos
          </h2>
          <div className="h-1 w-12 lg:w-16 bg-brand-turquoise mx-auto rounded-full mt-1" />
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-8 left-[14%] right-[14%] h-0 border-t border-dashed border-brand-turquoise/30 pointer-events-none z-0" />

          <div className="grid grid-cols-4 gap-2 lg:gap-8 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-2 lg:mb-6">
                  <div className="w-10 h-10 lg:w-20 lg:h-20 rounded-full bg-white border-2 border-brand-turquoise flex items-center justify-center text-brand-turquoise shadow-md group-hover:bg-brand-turquoise group-hover:text-white transition-all duration-300">
                    {step.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 lg:w-7 lg:h-7 rounded-full bg-brand-orange text-white font-mono text-[10px] lg:text-xs font-bold flex items-center justify-center shadow-md">
                    {step.id}
                  </div>
                </div>

                <div className="flex flex-col gap-1 px-0.5">
                  <h3 className="font-display font-extrabold text-[11px] lg:text-xl text-brand-navy group-hover:text-brand-turquoise transition-colors leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 font-sans text-[9px] lg:text-sm leading-tight max-w-xs mx-auto">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
