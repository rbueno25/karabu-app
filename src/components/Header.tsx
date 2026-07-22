import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Menu, X, MessageSquareCode } from 'lucide-react';
import Logo from './Logo';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export default function Header({ onNavigate, activeSection }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Inicio', id: 'inicio' },
    { label: 'Destinos', id: 'destinos' },
    { label: 'Servicios', id: 'servicios' },
    { label: '¿Por qué elegirnos?', id: 'por-que-elegirnos' },
    { label: 'Contacto', id: 'contacto' }
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-navy shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div className="cursor-pointer" onClick={() => handleLinkClick('inicio')}>
            <Logo light showText={true} />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex space-x-6">
            {menuItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  className={`text-sm font-medium transition-all relative py-2 ${
                    isActive 
                      ? 'text-brand-turquoise font-bold' 
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-turquoise rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls (Desktop) */}
          <div className="hidden lg:flex items-center gap-6">
            <a
              href="tel:8093062424"
              className="flex items-center gap-2 text-white/90 hover:text-brand-turquoise font-semibold transition-colors"
            >
              <Phone className="w-4 h-4 text-brand-turquoise" />
              <span className="text-sm font-mono">809-306-2424</span>
            </a>
            
            <button
              onClick={() => handleLinkClick('contacto')}
              className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold text-sm px-5 py-2.5 rounded-md shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Solicitar cotización
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-4">
            <a
              href="tel:8093062424"
              className="flex items-center justify-center p-2 rounded-full text-white hover:text-brand-turquoise bg-white/10 transition-colors"
            >
              <Phone className="w-5 h-5" />
            </a>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-white hover:text-brand-turquoise hover:bg-white/10 focus:outline-none transition-colors"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black lg:hidden"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-brand-navy shadow-xl p-6 flex flex-col justify-between lg:hidden"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <Logo light showText={true} />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-md text-white hover:text-brand-turquoise hover:bg-white/10 focus:outline-none transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <nav className="flex flex-col gap-4 mt-8">
                  {menuItems.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleLinkClick(item.id)}
                        className={`text-left text-lg font-medium py-2 px-3 rounded-md transition-colors ${
                          isActive
                            ? 'bg-brand-turquoise/20 text-brand-turquoise font-semibold'
                            : 'text-white/90 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-white/10 pt-6 mt-6 flex flex-col gap-4">
                <a
                  href="tel:8093062424"
                  className="flex items-center justify-center gap-3 text-white hover:text-brand-turquoise font-semibold p-3 rounded-md bg-white/5 transition-all"
                >
                  <Phone className="w-5 h-5 text-brand-turquoise" />
                  <span className="font-mono text-base">809-306-2424</span>
                </a>

                <button
                  onClick={() => handleLinkClick('contacto')}
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-base py-3 rounded-md shadow-md transition-all active:scale-[0.98]"
                >
                  Solicitar cotización
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
