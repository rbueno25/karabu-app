import React from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Logo from './Logo';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onSelectDestination: (destName: string) => void;
}

export default function Footer({ onNavigate, onSelectDestination }: FooterProps) {
  const quickLinks = [
    { label: 'Inicio', id: 'inicio' },
    { label: 'Destinos', id: 'destinos' },
    { label: 'Servicios', id: 'servicios' },
    { label: '¿Por qué elegirnos?', id: 'por-que-elegirnos' },
    { label: 'Contacto', id: 'contacto' }
  ];

  const popularDests = [
    'República Dominicana',
    'Punta Cana',
    'Santo Domingo',
    'Samaná',
    'México',
    'Europa',
    'Cruceros'
  ];

  const services = [
    'Paquetes Turísticos',
    'Reservas',
    'Circuitos y Tours',
    'Viajes Corporativos',
    'Lunas de Miel',
    'Asesoría de Visas'
  ];

  return (
    <footer className="bg-brand-navy-dark text-slate-300 border-t border-white/10 pt-16 pb-8 relative z-10">
      
      {/* Floating WhatsApp button */}
      <motion.a
        href="https://wa.me/18093062424?text=Hola%20Karabu!%20Estoy%20visitando%20su%20página%20web%20y%20me%20gustaría%20solicitar%20asesoría%20personalizada."
        target="_blank"
        rel="noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba59] text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-colors border border-white/10"
        title="Chatear con Karabu"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </motion.a>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-12 border-b border-white/10">
          
          {/* Column 1: Brand details & Social (4 columns span on large) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Logo light showText={true} />
            
            <p className="text-slate-400 font-sans text-xs leading-relaxed max-w-sm">
              Diseñamos experiencias de viaje únicas y personalizadas. Nos encargamos de toda la asesoría de visados y reservas logísticas para que solo te preocupes de disfrutar.
            </p>

            {/* Social Links Icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: <Facebook className="w-4 h-4" />, href: "https://facebook.com" },
                { icon: <Instagram className="w-4 h-4" />, href: "https://instagram.com" },
                { icon: <Twitter className="w-4 h-4" />, href: "https://twitter.com" },
                { icon: <Youtube className="w-4 h-4" />, href: "https://youtube.com" }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-turquoise hover:border-brand-turquoise hover:text-white transition-colors duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links (2 columns span) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Enlaces rápidos
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs font-sans">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className="text-slate-400 hover:text-brand-turquoise transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Destinations list (2 columns span) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Destinos populares
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs font-sans">
              {popularDests.map((dest) => (
                <li key={dest}>
                  <button
                    onClick={() => onSelectDestination(dest)}
                    className="text-slate-400 hover:text-brand-turquoise transition-colors text-left"
                  >
                    {dest}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Services list (2 columns span) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Servicios
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs font-sans text-slate-400">
              {services.map((srv) => (
                <li key={srv} className="hover:text-brand-turquoise transition-colors">
                  {srv}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact info (2 columns span on large) */}
          <div className="lg:col-span-2 flex flex-col gap-4 text-left">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Contacto
            </h4>
            
            <ul className="flex flex-col gap-4 text-xs font-sans">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-brand-turquoise flex-shrink-0 mt-0.5" />
                <a href="tel:8093062424" className="hover:text-brand-turquoise transition-colors font-mono">
                  809-306-2424
                </a>
              </li>

              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-brand-turquoise flex-shrink-0 mt-0.5" />
                <a href="mailto:info@karabu.com.do" className="hover:text-brand-turquoise transition-colors break-all">
                  info@karabu.com.do
                </a>
              </li>

              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-turquoise flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed text-slate-400">
                  Av. Winston Churchill 123, Torre Empresarial, Piso 5, Santo Domingo, Rep. Dom.
                </span>
              </li>

              <li className="flex items-start gap-2.5 border-t border-white/5 pt-3 mt-1">
                <Clock className="w-4 h-4 text-brand-turquoise flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5 text-slate-400">
                  <span className="font-semibold text-white">Horario:</span>
                  <span>Lun - Vie: 9:00 a.m. - 6:00 p.m.</span>
                  <span>Sáb: 9:00 a.m. - 1:00 p.m.</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-slate-500">
          <span>
            © 2026 Karabu Visas y Viajes. Todos los derechos reservados.
          </span>
          
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-400 transition-colors">
              Política de Privacidad
            </a>
            <a href="#terms" className="hover:text-slate-400 transition-colors">
              Términos y Condiciones
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
