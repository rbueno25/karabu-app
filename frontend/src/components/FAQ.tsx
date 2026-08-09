import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: '¿La cotización tiene costo?',
    answer: 'No, solicitar y recibir tu propuesta personalizada es totalmente gratuito y sin compromiso.',
  },
  {
    question: '¿En cuánto tiempo recibiré mi propuesta?',
    answer: 'Recibirás tu cotización detallada por WhatsApp y/o correo electrónico en un lapso de 24 a 48 horas hábiles.',
  },
  {
    question: '¿Puedo solicitar cambios en la cotización?',
    answer: '¡Por supuesto! Desde la misma propuesta web podrás solicitar ajustes en fechas, hoteles, presupuesto o vuelos con un solo clic.',
  },
  {
    question: '¿Cómo se protegen mis datos personales?',
    answer: 'Tus datos solo son utilizados por Karabu para elaborar tu cotización y gestionar tus reservas bajo estrictos protocolos de privacidad.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 lg:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-turquoise/10 border border-brand-turquoise/20 text-brand-turquoise text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" />
            Preguntas Frecuentes
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-brand-navy tracking-tight">
            Resolvemos tus dudas
          </h2>
          <p className="text-slate-500 text-base sm:text-lg mt-3 max-w-xl mx-auto">
            Todo lo que necesitas saber antes de solicitar tu cotización con Karabu.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="border border-slate-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <span className="font-semibold text-brand-navy text-base sm:text-lg pr-4">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-brand-turquoise" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-5 bg-white border-t border-slate-100">
                      <p className="text-slate-600 text-base leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
