import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-brand-turquoise hover:underline text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-brand-turquoise" />
          <h1 className="text-3xl font-bold text-brand-navy">Política de Privacidad</h1>
        </div>

        <p className="text-slate-500 text-sm mb-8">Última actualización: Agosto 2026</p>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8 text-slate-700 leading-relaxed">
          
          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">1. Información que recopilamos</h2>
            <p>Recopilamos la información que nos proporcionas al solicitar una cotización o registrarte en nuestra plataforma:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              <li>Nombre completo y apellidos</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono y/o WhatsApp</li>
              <li>Documento de identidad (cédula o pasaporte)</li>
              <li>Preferencias de viaje (destinos, fechas, presupuesto)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">2. Uso de la información</h2>
            <p>Utilizamos tus datos exclusivamente para:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              <li>Elaborar cotizaciones personalizadas de viajes</li>
              <li>Gestionar reservas y emitir comprobantes</li>
              <li>Brindar asesoría en trámites de visa</li>
              <li>Enviar información relevante sobre tus viajes</li>
              <li>Mejorar nuestros servicios y atención al cliente</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">3. Protección de datos</h2>
            <p className="text-sm">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción. Tus datos se almacenan en servidores seguros con cifrado SSL/TLS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">4. No compartimos tu información</h2>
            <p className="text-sm">
              Karabu Visas y Viajes <strong>no vende, alquila ni comparte</strong> tu información personal con terceros con fines comerciales. Solo compartimos datos con proveedores de servicios turísticos (aerolíneas, hoteles, aseguradoras) cuando es estrictamente necesario para completar tu reserva.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">5. Cookies</h2>
            <p className="text-sm">
              Utilizamos cookies esenciales para el funcionamiento de la plataforma (autenticación, preferencias de idioma). No utilizamos cookies de rastreo publicitario ni compartimos datos con redes publicitarias.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">6. Tus derechos</h2>
            <p className="text-sm">Tienes derecho a:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              <li>Acceder a tus datos personales</li>
              <li>Solicitar la rectificación de datos inexactos</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Oponerte al tratamiento de tus datos</li>
            </ul>
            <p className="text-sm mt-2">Para ejercer estos derechos, escríbenos a <a href="mailto:info@karabu.com.do" className="text-brand-turquoise hover:underline">info@karabu.com.do</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">7. Contacto</h2>
            <p className="text-sm">
              Si tienes preguntas sobre esta política, contáctanos:<br />
              📧 <a href="mailto:info@karabu.com.do" className="text-brand-turquoise hover:underline">info@karabu.com.do</a><br />
              📞 <a href="tel:8093062424" className="text-brand-turquoise hover:underline">809-306-2424</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
