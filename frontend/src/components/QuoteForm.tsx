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
  Lock,
  Mail,
  Smartphone
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
    preferredHotel: '',
    departureDate: '',
    returnDate: '',
    flexibleDates: 'No',
    adultsCount: 2,
    childrenCount: 0,
    babiesCount: 0,
    budgetRange: 'US$1,000–2,000',
    additionalServices: [],
    preferredContact: 'ambos',
    travelType: 'Vacaciones',
    hotelCategory: '4 estrellas',
    comments: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormInput, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Map destination names to country + city for auto-fill
  const destinationMap: Record<string, { country: string; city: string }> = {
    'República Dominicana': { country: 'República Dominicana', city: '' },
    'Punta Cana': { country: 'República Dominicana', city: 'Punta Cana' },
    'Miami': { country: 'Estados Unidos', city: 'Miami' },
    'New York': { country: 'Estados Unidos', city: 'New York' },
    'Cancún': { country: 'México', city: 'Cancún' },
    'Bogotá': { country: 'Colombia', city: 'Bogotá' },
    'París': { country: 'Francia', city: 'París' },
    'Orlando': { country: 'Estados Unidos', city: 'Orlando' },
  };

  // Sync preselected destination: fills country AND city
  useEffect(() => {
    if (preselectedDestination && preselectedDestination !== 'Todos' && preselectedDestination !== 'Todas') {
      const mapped = destinationMap[preselectedDestination];
      if (mapped) {
        setFormData((prev) => ({ ...prev, country: mapped.country, city: mapped.city }));
      } else {
        // Unknown destination — fill as country
        setFormData((prev) => ({ ...prev, country: preselectedDestination }));
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        preferredHotel: formData.preferredHotel,
        departureDate: formData.departureDate,
        returnDate: formData.returnDate,
        flexibleDates: formData.flexibleDates,
        adultsCount: formData.adultsCount,
        childrenCount: formData.childrenCount,
        babiesCount: formData.babiesCount,
        budgetRange: formData.budgetRange,
        additionalServices: formData.additionalServices,
        travelType: formData.travelType,
        hotelCategory: formData.hotelCategory,
        preferredContact: formData.preferredContact,
        comments: formData.comments,
      };

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_BASE}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Error al enviar');

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err) {
      setIsSubmitting(false);
      alert('Hubo un error al enviar tu cotización. Intenta de nuevo o escríbenos por WhatsApp.');
    }
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

🌎 Destino: ${formData.country}${formData.city ? `, ${formData.city}` : ''}${formData.preferredHotel ? `\n🏨 Preferencia: ${formData.preferredHotel}` : ''}
📅 Fechas: del ${formData.departureDate} al ${formData.returnDate} (${formData.flexibleDates === 'Sí' ? 'Fechas flexibles' : 'Fechas exactas'})
👥 Viajeros: ${formData.adultsCount} Adulto(s), ${formData.childrenCount} Niño(s), ${formData.babiesCount} Bebé(s)
💰 Presupuesto: ${formData.budgetRange}
🏨 Categoría de Hotel: ${formData.hotelCategory}
🗺️ Tipo de viaje: ${formData.travelType}${servicesText}
📬 Recibir cotización por: ${formData.preferredContact === 'ambos' ? 'Email y WhatsApp' : formData.preferredContact === 'email' ? 'Email' : 'WhatsApp'}
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
    <section id="cotizacion" className="py-20 bg-slate-100 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Full Split Container Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200">
          
          {/* Left Column - Brand Info & Trust Seals (Navy Blue with Travel Background Overlay) */}
          <div className="lg:col-span-4 relative p-8 sm:p-12 text-white flex flex-col justify-between overflow-hidden group min-h-[400px] lg:min-h-full">
            
            {/* Background Travel Scene Image with smooth slow zoom effect */}
            <div className="absolute inset-0 z-0">
              <img
                src="/hero-main.jpg"
                alt="Fondo de viajes Karabu"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Light overlay to keep text readable */}
              <div className="absolute inset-0 bg-brand-navy/40" />
            </div>

            {/* Glowing neon accent for high-end depth */}
            <div className="absolute -top-12 -right-12 w-72 h-72 bg-brand-turquoise/20 rounded-full blur-3xl pointer-events-none z-10" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none z-10" />
            
            <div className="flex flex-col gap-6 relative z-10">
              <span className="text-brand-turquoise text-xs font-extrabold uppercase tracking-[0.15em]">
                SOLICITA TU COTIZACIÓN
              </span>
              <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Cotiza tu viaje en minutos
              </h3>
              <p className="text-slate-200 font-sans text-sm leading-relaxed opacity-95">
                Completa el formulario y recibe una propuesta personalizada con paquetes de viaje, asesoría de visas y acompañamiento en cada paso.
              </p>
              
              {/* Trust checklist */}
              <div className="flex flex-col gap-4 mt-6">
                {[
                  'Cotización clara y sin compromiso',
                  'Precios transparentes, sin letra pequeña',
                  'La mejor opción para tu presupuesto',
                  'Acompañamiento antes y durante tu viaje'
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
            <motion.form
              key="quote-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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

                    {/* Preferred Hotel / Destination */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="preferredHotel" className="font-display font-bold text-[11px] text-slate-500 uppercase tracking-wide">
                        ¿Tiene algún hotel o destino de preferencia?
                      </label>
                      <input
                        type="text"
                        id="preferredHotel"
                        name="preferredHotel"
                        value={formData.preferredHotel}
                        onChange={handleInputChange}
                        placeholder="Ej: Hotel Riu, Bahía Príncipe, etc."
                        className="font-sans text-sm px-3.5 py-2.5 rounded-lg border bg-slate-50 border-slate-200 focus:border-brand-turquoise focus:bg-white focus:outline-none transition-colors"
                      />
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

                  {/* --- SECTION 6: PREFERENCIA DE CONTACTO --- */}
                  <div className="flex flex-col gap-4 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-5 bg-brand-turquoise rounded-full" />
                      <h4 className="font-display font-bold text-base text-brand-navy">
                        ¿Por dónde recibes tu cotización?
                      </h4>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
                        { value: 'whatsapp', label: 'WhatsApp', icon: (
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                          </svg>
                        ) },
                        { value: 'ambos', label: 'Ambos', icon: <Smartphone className="w-4 h-4" /> },
                      ].map((opt) => {
                        const isSelected = formData.preferredContact === opt.value;
                        return (
                          <button
                            type="button"
                            key={opt.value}
                            onClick={() => setFormData((prev) => ({ ...prev, preferredContact: opt.value }))}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-sans font-semibold transition-all ${
                              isSelected
                                ? 'bg-brand-turquoise/10 border-brand-turquoise text-brand-navy'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <span className={isSelected ? 'text-brand-turquoise' : 'text-slate-400'}>
                              {opt.icon}
                            </span>
                            {opt.label}
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
          </div>

        </div>

      </div>

      {/* Success Modal — full screen overlay */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            key="success-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/60 backdrop-blur-sm"
            onClick={() => setIsSuccess(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center text-center max-w-md mx-4"
            >
              <div className="w-16 h-16 rounded-full bg-brand-turquoise/10 text-brand-turquoise flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <h3 className="font-display text-2xl font-black text-brand-navy mb-3">
                ¡Gracias por tu solicitud!
              </h3>
              
              <p className="text-slate-600 font-sans text-sm leading-relaxed mb-8">
                Hemos recibido tu información. Un asesor de Karabú Viajes y Visas preparará una cotización personalizada y te contactará por WhatsApp o correo electrónico en menos de 24 horas.
              </p>

              <button
                onClick={() => {
                  setIsSuccess(false);
                  setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    country: '',
                    city: '',
                    preferredHotel: '',
                    departureDate: '',
                    returnDate: '',
                    flexibleDates: 'No',
                    adultsCount: 2,
                    childrenCount: 0,
                    babiesCount: 0,
                    budgetRange: 'US$1,000–2,000',
                    additionalServices: [],
                    preferredContact: 'ambos',
                    travelType: 'Vacaciones',
                    hotelCategory: '4 estrellas',
                    comments: ''
                  });
                }}
                className="bg-brand-navy hover:bg-brand-navy/90 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all transform hover:scale-[1.03] active:scale-[0.97]"
              >
                Enviar otra cotización
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
