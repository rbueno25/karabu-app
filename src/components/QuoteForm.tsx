import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Send, 
  Calendar, 
  Users, 
  Compass, 
  Check, 
  Info,
  Plane,
  Hotel,
  Car,
  Shield,
  FileText,
  Ship,
  Ticket,
  Minus,
  Plus,
  Star,
  MapPin,
  HelpCircle,
  Lock
} from 'lucide-react';
import { ContactFormInput } from '../types';

interface QuoteFormProps {
  preselectedDestination: string;
  onClearPreselected: () => void;
}

export default function QuoteForm({ preselectedDestination, onClearPreselected }: QuoteFormProps) {
  const [formData, setFormData] = useState<ContactFormInput>({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    departureDate: '',
    returnDate: '',
    flexibleDates: 'No',
    adultsCount: 2,
    childrenCount: 0,
    babiesCount: 0,
    budgetRange: 'US$1,000–2,000',
    additionalServices: [],
    travelType: 'Vacaciones',
    hotelCategory: '4 estrellas',
    comments: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormInput, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync preselected destination from other components to the "country" field
  useEffect(() => {
    if (preselectedDestination && preselectedDestination !== 'Todos' && preselectedDestination !== 'Todas') {
      setFormData((prev) => ({ ...prev, country: preselectedDestination }));
      onClearPreselected();
    }
  }, [preselectedDestination, onClearPreselected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCounterChange = (field: 'adultsCount' | 'childrenCount' | 'babiesCount', direction: 'inc' | 'dec') => {
    setFormData((prev) => {
      const val = prev[field];
      const minVal = field === 'adultsCount' ? 1 : 0;
      const newVal = direction === 'inc' ? val + 1 : Math.max(minVal, val - 1);
      return { ...prev, [field]: newVal };
    });
  };

  const handleSelectPill = (field: 'budgetRange' | 'travelType' | 'hotelCategory' | 'flexibleDates', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof ContactFormInput]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => {
      const current = prev.additionalServices;
      const updated = current.includes(service)
        ? current.filter((s) => s !== service)
        : [...current, service];
      return { ...prev, additionalServices: updated };
    });
  };

  const validate = (): boolean => {
    const tempErrors: Partial<Record<keyof ContactFormInput, string>> = {};
    if (!formData.fullName.trim()) tempErrors.fullName = 'El nombre completo es obligatorio';
    if (!formData.email.trim()) {
      tempErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Introduce un email válido';
    }
    if (!formData.phone.trim()) tempErrors.phone = 'El teléfono es obligatorio';
    if (!formData.country.trim()) tempErrors.country = 'El país de destino es obligatorio';
    if (!formData.departureDate) tempErrors.departureDate = 'Selecciona fecha de salida';
    if (!formData.returnDate) tempErrors.returnDate = 'Selecciona fecha de regreso';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  // Helper to generate a prefilled WhatsApp link with the customer's detailed quote
  const getWhatsAppHandoffLink = () => {
    const servicesText = formData.additionalServices.length > 0 
      ? `\n🔌 Servicios extra: ${formData.additionalServices.join(', ')}` 
      : '';
    const text = `¡Hola Karabu! Acabo de enviar mi cotización en la web:
👤 Nombre: ${formData.fullName}
📧 Email: ${formData.email}
📞 WhatsApp: ${formData.phone}

🌎 Destino: ${formData.country}${formData.city ? `, ${formData.city}` : ''}
📅 Fechas: del ${formData.departureDate} al ${formData.returnDate} (${formData.flexibleDates === 'Sí' ? 'Fechas flexibles' : 'Fechas exactas'})
👥 Viajeros: ${formData.adultsCount} Adulto(s), ${formData.childrenCount} Niño(s), ${formData.babiesCount} Bebé(s)
💰 Presupuesto: ${formData.budgetRange}
🏨 Categoría de Hotel: ${formData.hotelCategory}
🗺️ Tipo de viaje: ${formData.travelType}${servicesText}
📝 Comentarios: ${formData.comments || 'Sin comentarios'}`;

    return `https://wa.me/18093062424?text=${encodeURIComponent(text)}`;
  };

  // Services list mapping to Lucide Icons
  const servicesConfig = [
    { name: 'Vuelos', icon: <Plane className="w-5 h-5" /> },
    { name: 'Hotel', icon: <Hotel className="w-5 h-5" /> },
    { name: 'Transporte', icon: <Car className="w-5 h-5" /> },
    { name: 'Seguro de viaje', icon: <Shield className="w-5 h-5" /> },
    { name: 'Visa', icon: <FileText className="w-5 h-5" /> },
    { name: 'Crucero', icon: <Ship className="w-5 h-5" /> },
    { name: 'Excursiones', icon: <Ticket className="w-5 h-5" /> },
  ];

  const budgetOptions = ['US$500–1,000', 'US$1,000–2,000', 'US$2,000–5,000', 'Más de US$5,000'];
  const travelTypeOptions = ['Vacaciones', 'Luna de miel', 'Negocios', 'Familiar', 'Estudiantes', 'Grupal'];
  const hotelCategoryOptions = ['3 estrellas', '4 estrellas', '5 estrellas', 'Todo incluido'];

  return (
    <section id="contacto" className="py-20 bg-slate-100 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Full Split Container Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200">
          
          {/* Left Column - Brand Info & Trust Seals (Navy Blue with Travel Background Overlay) */}
          <div className="lg:col-span-4 relative p-8 sm:p-12 text-white flex flex-col justify-between overflow-hidden group min-h-[400px] lg:min-h-full">
            
            {/* Background Travel Scene Image with smooth slow zoom effect */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800"
                alt="Fondo de viajes Karabu"
                className="w-full h-full object-cover transition-transform duration-[10000ms] ease-out group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              {/* Premium dark gradient overlay blending navy and turquoise with a hint of warm sunset */}
              <div className="absolute inset-0 bg-gradient-to-b from-brand-navy-dark/95 via-brand-navy/90 to-brand-turquoise/80 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-dark via-transparent to-transparent opacity-90" />
            </div>

            {/* Glowing neon accent for high-end depth */}
            <div className="absolute -top-12 -right-12 w-72 h-72 bg-brand-turquoise/20 rounded-full blur-3xl pointer-events-none z-10" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none z-10" />
            
            <div className="flex flex-col gap-6 relative z-10">
              <span className="text-brand-turquoise text-xs font-extrabold uppercase tracking-[0.15em]">
                SOLICITA TU COTIZACIÓN
              </span>
              <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Tu próximo viaje comienza aquí
              </h3>
              <p className="text-slate-200 font-sans text-sm leading-relaxed opacity-95">
                Completa el formulario con tus planes de viaje y uno de nuestros expertos en visas y destinos diseñará una experiencia premium a tu medida.
              </p>
              
              {/* Trust checklist */}
              <div className="flex flex-col gap-4 mt-6">
                {[
                  'Respuesta rápida y personalizada',
                  'Asesoría integral sin compromiso',
                  'La mejor opción para tu presupuesto',
                  'Atención por expertos en viajes y visas'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-turquoise/20 flex items-center justify-center text-brand-turquoise border border-brand-turquoise/30">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="font-sans text-sm text-slate-100 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer notice within left card */}
            <div className="mt-12 pt-6 border-t border-white/15 flex items-start gap-3 relative z-10">
              <Info className="w-5 h-5 text-brand-turquoise flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-200 leading-relaxed font-sans opacity-90">
                La información enviada será recibida en el correo del propietario del proyecto para brindarte una atención personalizada de inmediato.
              </p>
            </div>
          </div>

          {/* Right Column - Interactive Form Panel (White) */}
          <div className="lg:col-span-8 p-6 sm:p-10 md:p-12 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form
                  key="quote-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-8"
                >
                  
                  {/* --- SECTION 1: DATOS PERSONALES --- */}
                  <div className="flex flex-col gap-4 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-5 bg-brand-turquoise rounded-full" />
                      <h4 className="font-display font-bold text-base text-brand-navy">
                        Datos Personales
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Full Name */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="fullName" className="font-display font-bold text-[11px] text-slate-500 uppercase tracking-wide">
                          Nombre completo *
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Ej: Juan Pérez"
                          className={`font-sans text-sm px-3.5 py-2.5 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none transition-colors ${
                            errors.fullName ? 'border-red-500 ring-1 ring-red-200' : 'border-slate-200 focus:border-brand-turquoise'
                          }`}
                        />
                        {errors.fullName && <span className="text-[10px] text-red-500 font-sans">{errors.fullName}</span>}
                      </div>

                      {/* Phone (WhatsApp) */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="phone" className="font-display font-bold text-[11px] text-slate-500 uppercase tracking-wide">
                          Teléfono (WhatsApp) *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="809-306-2424"
                          className={`font-sans text-sm px-3.5 py-2.5 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none transition-colors ${
                            errors.phone ? 'border-red-500 ring-1 ring-red-200' : 'border-slate-200 focus:border-brand-turquoise'
                          }`}
                        />
                        {errors.phone && <span className="text-[10px] text-red-500 font-sans">{errors.phone}</span>}
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="font-display font-bold text-[11px] text-slate-500 uppercase tracking-wide">
                          Correo electrónico *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="juan@ejemplo.com"
                          className={`font-sans text-sm px-3.5 py-2.5 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none transition-colors ${
                            errors.email ? 'border-red-500 ring-1 ring-red-200' : 'border-slate-200 focus:border-brand-turquoise'
                          }`}
                        />
                        {errors.email && <span className="text-[10px] text-red-500 font-sans">{errors.email}</span>}
                      </div>
                    </div>
                  </div>

                  {/* --- SECTION 2: DESTINO Y FECHAS --- */}
                  <div className="flex flex-col gap-4 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-5 bg-brand-turquoise rounded-full" />
                      <h4 className="font-display font-bold text-base text-brand-navy">
                        Destino y Fechas
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Country */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="country" className="font-display font-bold text-[11px] text-slate-500 uppercase tracking-wide">
                          País de destino *
                        </label>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="Ej: República Dominicana, España, etc."
                          className={`font-sans text-sm px-3.5 py-2.5 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none transition-colors ${
                            errors.country ? 'border-red-500 ring-1 ring-red-200' : 'border-slate-200 focus:border-brand-turquoise'
                          }`}
                        />
                        {errors.country && <span className="text-[10px] text-red-500 font-sans">{errors.country}</span>}
                      </div>

                      {/* City */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="city" className="font-display font-bold text-[11px] text-slate-500 uppercase tracking-wide">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Ej: Punta Cana, Madrid, etc."
                          className="font-sans text-sm px-3.5 py-2.5 rounded-lg border bg-slate-50 border-slate-200 focus:border-brand-turquoise focus:bg-white focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                      {/* Departure Date */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="departureDate" className="font-display font-bold text-[11px] text-slate-500 uppercase tracking-wide">
                          Fecha de salida *
                        </label>
                        <input
                          type="date"
                          id="departureDate"
                          name="departureDate"
                          value={formData.departureDate}
                          onChange={handleInputChange}
                          className={`font-sans text-sm px-3.5 py-2.5 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none transition-colors ${
                            errors.departureDate ? 'border-red-500 ring-1 ring-red-200' : 'border-slate-200 focus:border-brand-turquoise'
                          }`}
                        />
                        {errors.departureDate && <span className="text-[10px] text-red-500 font-sans">{errors.departureDate}</span>}
                      </div>

                      {/* Return Date */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="returnDate" className="font-display font-bold text-[11px] text-slate-500 uppercase tracking-wide">
                          Fecha de regreso *
                        </label>
                        <input
                          type="date"
                          id="returnDate"
                          name="returnDate"
                          value={formData.returnDate}
                          onChange={handleInputChange}
                          className={`font-sans text-sm px-3.5 py-2.5 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none transition-colors ${
                            errors.returnDate ? 'border-red-500 ring-1 ring-red-200' : 'border-slate-200 focus:border-brand-turquoise'
                          }`}
                        />
                        {errors.returnDate && <span className="text-[10px] text-red-500 font-sans">{errors.returnDate}</span>}
                      </div>

                      {/* ¿Fechas flexibles? */}
                      <div className="flex flex-col gap-1.5">
                        <span className="font-display font-bold text-[11px] text-slate-500 uppercase tracking-wide">
                          ¿Fechas flexibles?
                        </span>
                        <div className="grid grid-cols-2 gap-2 h-[42px]">
                          {['Sí', 'No'].map((val) => {
                            const isSelected = formData.flexibleDates === val;
                            return (
                              <button
                                type="button"
                                key={val}
                                onClick={() => handleSelectPill('flexibleDates', val)}
                                className={`rounded-lg font-sans text-xs font-semibold border transition-all flex items-center justify-center ${
                                  isSelected 
                                    ? 'bg-brand-turquoise/10 border-brand-turquoise text-brand-navy' 
                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                                }`}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- SECTION 3: VIAJEROS Y PRESUPUESTO --- */}
                  <div className="flex flex-col gap-4 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-5 bg-brand-turquoise rounded-full" />
                      <h4 className="font-display font-bold text-base text-brand-navy">
                        Viajeros y Presupuesto
                      </h4>
                    </div>

                    {/* Numeric Counters for Travelers */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Adults */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-display font-bold text-xs text-brand-navy">Adultos</span>
                          <span className="text-[10px] text-slate-400 font-sans font-medium">Mayor de 12 años</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleCounterChange('adultsCount', 'dec')}
                            className="w-7 h-7 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-90 transition-all shadow-sm"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                          <span className="font-display font-extrabold text-sm text-brand-navy w-4 text-center">
                            {formData.adultsCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCounterChange('adultsCount', 'inc')}
                            className="w-7 h-7 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-90 transition-all shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-display font-bold text-xs text-brand-navy">Niños</span>
                          <span className="text-[10px] text-slate-400 font-sans font-medium">De 2 a 12 años</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleCounterChange('childrenCount', 'dec')}
                            className="w-7 h-7 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-90 transition-all shadow-sm"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                          <span className="font-display font-extrabold text-sm text-brand-navy w-4 text-center">
                            {formData.childrenCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCounterChange('childrenCount', 'inc')}
                            className="w-7 h-7 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-90 transition-all shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </div>
                      </div>

                      {/* Babies */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-display font-bold text-xs text-brand-navy">Bebés</span>
                          <span className="text-[10px] text-slate-400 font-sans font-medium">Menores de 2 años</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleCounterChange('babiesCount', 'dec')}
                            className="w-7 h-7 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-90 transition-all shadow-sm"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                          <span className="font-display font-extrabold text-sm text-brand-navy w-4 text-center">
                            {formData.babiesCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCounterChange('babiesCount', 'inc')}
                            className="w-7 h-7 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-90 transition-all shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Presupuesto aproximado */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      <label htmlFor="budgetRange" className="font-display font-bold text-[11px] text-slate-500 uppercase tracking-wide">
                        Presupuesto aproximado
                      </label>
                      <div className="relative">
                        <select
                          id="budgetRange"
                          name="budgetRange"
                          value={formData.budgetRange}
                          onChange={handleInputChange}
                          className="w-full font-sans text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-turquoise transition-all cursor-pointer appearance-none pr-10"
                        >
                          {budgetOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- SECTION 4: TIPO DE VIAJE Y PREFERENCIA DE HOTEL --- */}
                  <div className="flex flex-col gap-4 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-5 bg-brand-turquoise rounded-full" />
                      <h4 className="font-display font-bold text-base text-brand-navy">
                        Preferencia de Viaje y Alojamiento
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Tipo de Viaje */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="travelType" className="font-display font-bold text-[11px] text-slate-500 uppercase tracking-wide">
                          Tipo de viaje
                        </label>
                        <div className="relative">
                          <select
                            id="travelType"
                            name="travelType"
                            value={formData.travelType}
                            onChange={handleInputChange}
                            className="w-full font-sans text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-turquoise transition-all cursor-pointer appearance-none pr-10"
                          >
                            {travelTypeOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Hotel Category */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="hotelCategory" className="font-display font-bold text-[11px] text-slate-500 uppercase tracking-wide">
                          Alojamiento preferido (Hotel)
                        </label>
                        <div className="relative">
                          <select
                            id="hotelCategory"
                            name="hotelCategory"
                            value={formData.hotelCategory}
                            onChange={handleInputChange}
                            className="w-full font-sans text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-turquoise transition-all cursor-pointer appearance-none pr-10"
                          >
                            {hotelCategoryOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- SECTION 5: SERVICIOS REQUERIDOS --- */}
                  <div className="flex flex-col gap-4 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-5 bg-brand-turquoise rounded-full" />
                      <h4 className="font-display font-bold text-base text-brand-navy">
                        Servicios Requeridos
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {servicesConfig.map((srv) => {
                        const isChecked = formData.additionalServices.includes(srv.name);
                        return (
                          <button
                            type="button"
                            key={srv.name}
                            onClick={() => handleServiceToggle(srv.name)}
                            className={`flex items-center gap-2.5 p-3 border rounded-xl text-left transition-all ${
                              isChecked
                                ? 'bg-brand-turquoise/10 border-brand-turquoise text-brand-navy font-bold shadow-sm'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg transition-colors duration-300 ${
                              isChecked ? 'bg-brand-turquoise text-white' : 'bg-slate-200/70 text-slate-500 group-hover:bg-slate-300'
                            }`}>
                              {srv.icon}
                            </div>
                            <span className="text-xs font-sans font-semibold select-none leading-tight">{srv.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comments / Details */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="comments" className="font-display font-bold text-[11px] text-slate-500 uppercase tracking-wide">
                      Comentarios adicionales
                    </label>
                    <textarea
                      id="comments"
                      name="comments"
                      rows={3}
                      value={formData.comments}
                      onChange={handleInputChange}
                      placeholder="Cuéntanos más sobre tus solicitudes especiales o detalles de viaje..."
                      className="font-sans text-sm px-4 py-3 rounded-lg border bg-slate-50 border-slate-200 focus:border-brand-turquoise focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Action Submit Button */}
                  <div className="mt-2 flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-brand-orange hover:bg-brand-orange/95 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Enviando solicitud...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Solicitar cotización ahora</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              ) : (
                // Success Confirmation Handoff Box
                <motion.div
                  key="success-box"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="flex flex-col items-center text-center py-8 px-4"
                >
                  <div className="w-16 h-16 rounded-full bg-brand-turquoise/10 text-brand-turquoise flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>

                  <h3 className="font-display text-2xl font-black text-brand-navy mb-3">
                    ¡Solicitud Recibida con Éxito!
                  </h3>
                  
                  <p className="text-slate-600 font-sans text-sm leading-relaxed max-w-md mb-8">
                    Muchas gracias <strong className="text-brand-navy">{formData.fullName}</strong>. Hemos registrado tu interés para viajar a <strong className="text-brand-turquoise">{formData.country}</strong>. Uno de nuestros expertos de Karabu revisará tu propuesta y se contactará contigo por email o WhatsApp.
                  </p>

                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 w-full max-w-md text-left flex flex-col gap-3.5 mb-8">
                    <span className="font-display font-extrabold text-xs text-brand-navy uppercase tracking-wider block border-b border-slate-200 pb-2">
                      Resumen de tu Cotización
                    </span>
                    <div className="grid grid-cols-2 gap-4 text-xs font-sans text-slate-600">
                      <div>
                        <span className="text-slate-400 block font-medium">Destino</span>
                        <span className="font-semibold text-brand-navy">{formData.country}{formData.city ? `, ${formData.city}` : ''}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Salida / Regreso</span>
                        <span className="font-semibold text-brand-navy">{formData.departureDate} al {formData.returnDate} ({formData.flexibleDates === 'Sí' ? 'Flexibles' : 'Exactas'})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Viajeros</span>
                        <span className="font-semibold text-brand-navy">{formData.adultsCount} Ad, {formData.childrenCount} Ni, {formData.babiesCount} Be</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Presupuesto</span>
                        <span className="font-semibold text-brand-navy">{formData.budgetRange}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Hotel</span>
                        <span className="font-semibold text-brand-navy">{formData.hotelCategory}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Tipo de Viaje</span>
                        <span className="font-semibold text-brand-navy">{formData.travelType}</span>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp handoff button to expedite */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
                    <a
                      href={getWhatsAppHandoffLink()}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 px-6 rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02]"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12.001 2c-5.514 0-10 4.486-10 10 0 1.956.57 3.779 1.554 5.316L2 22l4.814-1.48C8.28 21.411 9.982 22 11.999 22c5.514 0 10-4.486 10-10s-4.486-10-10-10zm5.405 14.154c-.217.61-1.246 1.15-1.812 1.205-.5.05-1.153.228-3.353-.684-2.809-1.164-4.577-4.02-4.718-4.208-.14-.189-1.148-1.529-1.148-2.914 0-1.385.727-2.067 1.011-2.35.284-.284.62-.355.827-.355.207 0 .414.002.595.01.189.008.441-.073.689.526.255.618.871 2.126.946 2.277.075.151.125.327.025.528-.099.201-.15.327-.299.502-.15.176-.316.392-.451.527-.151.151-.309.316-.134.618.176.302.783 1.285 1.68 2.083.156.14.292.203.468.203.176 0 .327-.083.428-.203.1-.121.428-.503.541-.679.113-.176.226-.151.377-.095.151.055.955.451 1.118.532.163.081.272.121.312.189.04.068.04.397-.177 1.007z"/>
                      </svg>
                      <span>Acelerar por WhatsApp</span>
                    </a>

                    <button
                      onClick={() => {
                        setIsSuccess(false);
                        setFormData({
                          fullName: '',
                          email: '',
                          phone: '',
                          country: '',
                          city: '',
                          departureDate: '',
                          returnDate: '',
                          flexibleDates: 'No',
                          adultsCount: 2,
                          childrenCount: 0,
                          babiesCount: 0,
                          budgetRange: 'US$1,000–2,000',
                          additionalServices: [],
                          travelType: 'Vacaciones',
                          hotelCategory: '4 estrellas',
                          comments: ''
                        });
                      }}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all font-sans text-sm"
                    >
                      Enviar otra cotización
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
