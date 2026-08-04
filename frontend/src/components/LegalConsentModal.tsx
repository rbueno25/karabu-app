import React, { useState, useEffect } from 'react';
import { Shield, FileText, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'karabu_legal_accepted';

export default function LegalConsentModal() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) {
      // Small delay so the modal animates in after page load
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAccept = () => {
    setClosing(true);
    localStorage.setItem(STORAGE_KEY, 'true');
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        closing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: 'rgba(9, 9, 11, 0.82)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto transition-all duration-300 ${
          closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-brand-turquoise/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand-turquoise" />
            </div>
            <h2 className="text-lg font-bold text-brand-navy">Aviso Legal</h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 text-sm text-slate-600 leading-relaxed">
          <p>
            Bienvenido a <strong className="text-brand-navy">Karabu Visas y Viajes</strong>. 
            Antes de continuar, lee nuestros términos legales. Al hacer clic en 
            <strong> "Aceptar y continuar"</strong>, confirmas que has leído y aceptas nuestros 
            documentos legales.
          </p>

          {/* Privacy summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-brand-turquoise" />
              <h3 className="font-bold text-brand-navy">Política de Privacidad</h3>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Explica cómo recopilamos, usamos y protegemos tu información personal. 
              No compartimos tus datos con terceros. Solo los usamos para elaborar 
              cotizaciones y gestionar tus viajes.
            </p>
            <Link
              to="/privacidad"
              target="_blank"
              className="text-xs text-brand-turquoise hover:underline font-medium"
            >
              Leer completa →
            </Link>
          </div>

          {/* Terms summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-brand-turquoise" />
              <h3 className="font-bold text-brand-navy">Términos y Condiciones</h3>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Establecen las reglas de uso de nuestro sitio web y servicios: cotizaciones, 
              pagos, cancelaciones, responsabilidades y legislación aplicable (Rep. Dom.).
            </p>
            <Link
              to="/terminos"
              target="_blank"
              className="text-xs text-brand-turquoise hover:underline font-medium"
            >
              Leer completos →
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 rounded-b-2xl">
          <button
            onClick={handleAccept}
            className="w-full py-3 rounded-xl bg-brand-turquoise hover:bg-brand-turquoise/90 text-white font-bold text-sm transition-colors duration-200 shadow-lg shadow-brand-turquoise/20"
          >
            Aceptar y continuar
          </button>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            Al continuar, aceptas nuestra{' '}
            <Link to="/privacidad" target="_blank" className="text-brand-turquoise hover:underline">Política de Privacidad</Link>
            {' '}y{' '}
            <Link to="/terminos" target="_blank" className="text-brand-turquoise hover:underline">Términos y Condiciones</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
