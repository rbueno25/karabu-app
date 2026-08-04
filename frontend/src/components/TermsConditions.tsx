import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-brand-turquoise hover:underline text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-brand-turquoise" />
          <h1 className="text-3xl font-bold text-brand-navy">Términos y Condiciones</h1>
        </div>

        <p className="text-slate-500 text-sm mb-8">Última actualización: Agosto 2026</p>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">1. Aceptación de los términos</h2>
            <p className="text-sm">
              Al utilizar el sitio web <strong>karabuviajes.com</strong> y los servicios de Karabu Visas y Viajes, aceptas estos Términos y Condiciones. Si no estás de acuerdo, por favor no utilices nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">2. Servicios ofrecidos</h2>
            <p className="text-sm">Karabu Visas y Viajes ofrece:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              <li>Cotización y reserva de paquetes turísticos</li>
              <li>Asesoría en trámites de visa</li>
              <li>Reservas de vuelos, hoteles y transporte</li>
              <li>Circuitos turísticos y experiencias personalizadas</li>
              <li>Seguros de viaje</li>
            </ul>
            <p className="text-sm mt-2">
              Actuamos como intermediarios entre el cliente y los proveedores de servicios turísticos (aerolíneas, hoteles, operadores). Las condiciones específicas de cada proveedor aplican a tu reserva.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">3. Cotizaciones y precios</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Las cotizaciones tienen una validez limitada, indicada en cada propuesta.</li>
              <li>Los precios están sujetos a disponibilidad y pueden cambiar hasta la confirmación del pago.</li>
              <li>Todos los precios se expresan en la moneda indicada (USD o DOP).</li>
              <li>Impuestos y tasas aeroportuarias están incluidos en el precio final cuando se indique.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">4. Pagos y reservas</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Las reservas se confirman una vez recibido el pago o anticipo acordado.</li>
              <li>El anticipo mínimo será del porcentaje indicado en la cotización (generalmente 30-50%).</li>
              <li>El saldo restante debe pagarse antes de la fecha límite indicada.</li>
              <li>Aceptamos transferencias bancarias, depósitos y efectivo.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">5. Cancelaciones y reembolsos</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Las políticas de cancelación dependen de cada proveedor (aerolínea, hotel, operador).</li>
              <li>Se informará al cliente de las condiciones específicas de cancelación antes de confirmar la reserva.</li>
              <li>Los gastos de gestión administrativa no son reembolsables.</li>
              <li>Para cambios de fecha o nombre, aplican las penalidades del proveedor más cargos administrativos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">6. Documentación de viaje</h2>
            <p className="text-sm">
              Es responsabilidad del viajero contar con la documentación vigente necesaria (pasaporte, visa, certificados de vacunación). Karabu ofrece asesoría en trámites de visa, pero la decisión final de aprobación corresponde a las autoridades consulares de cada país.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">7. Limitación de responsabilidad</h2>
            <p className="text-sm">
              Karabu Visas y Viajes actúa como intermediario y no se hace responsable por:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              <li>Cancelaciones o retrasos de aerolíneas</li>
              <li>Pérdida de equipaje</li>
              <li>Condiciones climáticas adversas</li>
              <li>Denegación de visa por parte de autoridades consulares</li>
              <li>Fuerza mayor o caso fortuito</li>
            </ul>
            <p className="text-sm mt-2">
              Recomendamos contratar un seguro de viaje para cubrir estas eventualidades.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">8. Propiedad intelectual</h2>
            <p className="text-sm">
              Todo el contenido de este sitio web (textos, imágenes, logotipos, diseño) es propiedad de Karabu Visas y Viajes. Queda prohibida su reproducción total o parcial sin autorización expresa.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">9. Legislación aplicable</h2>
            <p className="text-sm">
              Estos términos se rigen por las leyes de la República Dominicana. Cualquier disputa se resolverá ante los tribunales competentes del Distrito Nacional, Santo Domingo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">10. Contacto</h2>
            <p className="text-sm">
              📧 <a href="mailto:info@karabu.com.do" className="text-brand-turquoise hover:underline">info@karabu.com.do</a><br />
              📞 <a href="tel:8093062424" className="text-brand-turquoise hover:underline">809-306-2424</a><br />
              📍 Av. Winston Churchill 123, Torre Empresarial, Piso 5, Santo Domingo, Rep. Dom.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
