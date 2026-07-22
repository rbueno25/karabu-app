import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, FileText, CalendarCheck, Compass } from 'lucide-react';

export default function Steps() {
  const steps = [
    {
      id: 1,
      title: "Cuéntanos tu idea",
      description: "Llena el formulario de cotización o escríbenos directamente por WhatsApp compartiéndonos tu destino soñado e ideas de viaje.",
      icon: <MessageSquare className="w-5 h-5" />
    },
    {
      id: 2,
      title: "Recibe tu cotización",
      description: "En tiempo récord, te enviamos una propuesta a medida, detallada y totalmente personalizada según tus gustos, fechas y presupuesto.",
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: 3,
      title: "Confirma y reserva",
      description: "Una vez que la propuesta sea perfecta para ti, aseguramos tus reservas de vuelos, hoteles y traslados con absoluta transparencia y respaldo.",
      icon: <CalendarCheck className="w-5 h-5" />
    },
    {
      id: 4,
      title: "Disfruta tu aventura",
      description: "Viaja con total tranquilidad y desconexión absoluta. Nosotros nos encargamos de todo el soporte y logística antes y durante el trayecto.",
      icon: <Compass className="w-5 h-5" />
    }
  ];

  return (
    <section className="py-20 bg-slate-50 relative border-b border-slate-150/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 flex flex-col gap-3">
          <span className="text-sm font-bold text-brand-turquoise tracking-widest uppercase">
            ASÍ DE FÁCIL
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
            Tu viaje en 4 simples pasos
          </h2>
          <div className="h-1 w-16 bg-brand-turquoise mx-auto rounded-full mt-1" />
        </div>

        {/* Stepper Timeline */}
        <div className="relative">
          
          {/* Horizontal line connector for desktop */}
          <div className="hidden lg:block absolute top-10 left-[14%] right-[14%] h-0 border-t border-dashed border-brand-turquoise/30 pointer-events-none z-0" />

          {/* Stepper Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                
                {/* Step Circle with Icon & Number Badge */}
                <div className="relative mb-6">
                  {/* Outer circle glow */}
                  <div className="absolute inset-[-4px] bg-brand-turquoise/5 rounded-full scale-0 group-hover:scale-110 transition-transform duration-300" />
                  
                  {/* Core Circle */}
                  <div className="w-20 h-20 rounded-full bg-white border-2 border-brand-turquoise flex items-center justify-center text-brand-turquoise shadow-md group-hover:bg-brand-turquoise group-hover:text-white transition-all duration-300">
                    {step.icon}
                  </div>

                  {/* Top-Right Number Badge */}
                  <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-brand-orange text-white font-mono text-xs font-bold flex items-center justify-center shadow-md">
                    {step.id}
                  </div>
                </div>

                {/* Step text contents */}
                <div className="flex flex-col gap-2 px-4">
                  <h3 className="font-display font-extrabold text-lg sm:text-xl text-brand-navy group-hover:text-brand-turquoise transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 font-sans text-sm leading-relaxed max-w-xs mx-auto">
                    {step.description}
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
