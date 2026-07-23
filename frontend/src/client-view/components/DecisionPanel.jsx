import React, { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Send, Loader2, Sparkles, MessageSquare, HeartHandshake, AlertCircle } from 'lucide-react';

export function DecisionPanel({ quotationId, currentStatus, currentNotes, onUpdateStatus }) {
  const [mode, setMode] = useState('idle');
  const [rejectionComment, setRejectionComment] = useState('');
  const [loadingAction, setLoadingAction] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleAcceptClick = () => {
    setShowConfirmModal(true);
  };

  const confirmAccept = async () => {
    setShowConfirmModal(false);
    try {
      setLoadingAction('accept');
      setFeedbackMessage(null);
      await onUpdateStatus({ status: 'aceptada' });
      setFeedbackMessage('Propuesta Aceptada. Tu asesor te contactará.');
    } catch {
      setFeedbackMessage('Error al actualizar. Intenta de nuevo.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSendChanges = async (e) => {
    e.preventDefault();
    if (!rejectionComment.trim()) return;
    try {
      setLoadingAction('reject');
      setFeedbackMessage(null);
      const combinedNotes = currentNotes
        ? `${currentNotes}\n\n[Comentario de rechazo]: ${rejectionComment.trim()}`
        : `[Comentario de rechazo]: ${rejectionComment.trim()}`;
      await onUpdateStatus({ status: 'rechazada', notes: combinedNotes });
      setFeedbackMessage('Comentarios enviados. Tu asesor ajustará la propuesta.');
      setMode('idle');
      setRejectionComment('');
    } catch {
      setFeedbackMessage('Error al enviar comentarios. Intenta nuevamente.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancelRequest = () => {
    setMode('idle');
    setRejectionComment('');
    setFeedbackMessage(null);
  };

  return (
    <div id="decision-panel" className="w-full my-10 p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-white via-white to-slate-50 dark:from-[#0D1B2A] dark:via-[#0D1B2A] dark:to-[#070F1E] border-2 border-[#00A896]/30 dark:border-[#00A896]/40 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#00A896] via-[#FF6B35] to-[#0F2A4A]" />
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00A896]/10 text-[#00A896] dark:bg-[#00A896]/20 dark:text-[#02C39A] mb-3">
            <Sparkles className="w-3.5 h-3.5" />Panel de Decisión
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">¿Qué deseas hacer con esta propuesta?</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-2 leading-relaxed">
            Revisa los detalles y elige una opción. Tu asesor recibirá la confirmación en tiempo real.
          </p>
        </div>

        {feedbackMessage && (
          <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border ${
            currentStatus === 'aceptada' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/30'
          }`}>
            {currentStatus === 'aceptada' ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" /> : <AlertCircle className="w-5 h-5 shrink-0 text-[#FF6B35]" />}
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Accepted state */}
        {currentStatus === 'aceptada' && mode === 'idle' && (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center"><CheckCircle2 className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold">¡Propuesta Aceptada con Éxito!</h3>
            <p className="text-xs sm:text-sm max-w-md mx-auto text-emerald-800 dark:text-emerald-200">
              Hemos registrado tu aceptación. Tu asesor se pondrá en contacto contigo muy pronto para coordinar los detalles finales.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button onClick={() => setMode('requesting_changes')} className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:underline flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />¿Necesitas agregar algún cambio posterior?
              </button>
            </div>
          </div>
        )}

        {/* Rejected state */}
        {currentStatus === 'rechazada' && mode === 'idle' && (
          <div className="p-6 rounded-2xl bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FF6B35] text-white flex items-center justify-center"><AlertCircle className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold">Solicitud de Cambios Enviada</h3>
            <p className="text-xs sm:text-sm max-w-md mx-auto text-slate-700 dark:text-slate-300">
              Tus comentarios han sido notificados a tu asesor. Revisará tus preferencias y te enviará una propuesta ajustada.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button onClick={handleAcceptClick} disabled={loadingAction === 'accept'} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#00A896] hover:bg-[#008F80] transition shadow-md">
                {loadingAction === 'accept' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Cambiar de opinión y Aceptar Propuesta
              </button>
            </div>
          </div>
        )}

        {/* IDLE: 2 buttons closer together */}
        {mode === 'idle' && currentStatus !== 'aceptada' && currentStatus !== 'rechazada' && (
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3">
            <button onClick={handleAcceptClick} disabled={loadingAction !== null}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-4 rounded-2xl font-extrabold text-base text-white bg-gradient-to-r from-[#00A896] to-[#02C39A] hover:from-[#008F80] hover:to-[#00A896] shadow-lg shadow-[#00A896]/25 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50">
              {loadingAction === 'accept' ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Procesando...</span></> : <><CheckCircle2 className="w-5 h-5" /><span>ACEPTAR PROPUESTA</span></>}
            </button>
            <button onClick={() => setMode('requesting_changes')} disabled={loadingAction !== null}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-4 rounded-2xl font-bold text-sm text-[#FF6B35] bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 border border-[#FF6B35]/30 transition-all active:scale-[0.98] disabled:opacity-50">
              <XCircle className="w-5 h-5" /><span>SOLICITAR CAMBIOS</span>
            </button>
          </div>
        )}

        {/* Requesting changes form */}
        {mode === 'requesting_changes' && (
          <form onSubmit={handleSendChanges} className="pt-2 text-left space-y-4 max-w-xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#FF6B35]" />¿Qué cambios deseas realizar en tu cotización?
              </label>
              <textarea value={rejectionComment} onChange={(e) => setRejectionComment(e.target.value)}
                placeholder="Escribe aquí tus observaciones (ej. ajustar fechas, cambiar de hotel, agregar o quitar excursiones)..."
                rows={4} required
                className="w-full p-3 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#070F1E] text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition" />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <button type="button" onClick={handleCancelRequest}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 transition">
                  <RotateCcw className="w-3.5 h-3.5" />Volver / Cancelar
                </button>
                <button type="submit" disabled={loadingAction === 'reject' || !rejectionComment.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF6B35] hover:bg-[#E85A24] shadow-md transition disabled:opacity-50">
                  {loadingAction === 'reject' ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Enviando...</span></> : <><Send className="w-4 h-4" /><span>Enviar Comentarios de Cambio</span></>}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-[#00A896]" />
            Al aceptar o solicitar cambios, tu asesor recibirá una notificación instantánea sin compromisos ocultos.
          </p>
        </div>
      </div>

      {/* Confirmation Modal — ¿Está seguro? */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0D1B2A] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-brand-turquoise/10 text-brand-turquoise flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirmar Aceptación</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ¿Está seguro de que desea aceptar esta propuesta de viaje?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAccept}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#00A896] to-[#02C39A] hover:from-[#008F80] hover:to-[#00A896] shadow-lg transition"
              >
                Sí, Aceptar Propuesta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
