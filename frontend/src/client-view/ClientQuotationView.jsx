import React, { useEffect, useState } from 'react';
import { getQuotation, updateQuotationStatus } from './api-adapter';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MetricsCards } from './components/MetricsCards';
import { FormDataDetails } from './components/FormDataDetails';
import { ItinerarySection } from './components/ItinerarySection';
import { DestinationGallery } from './components/DestinationGallery';
import { BrokerCard } from './components/BrokerCard';
import { DecisionPanel } from './components/DecisionPanel';
import { PriceComparison } from './components/PriceComparison';
import { Compass, Loader2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

export default function ClientQuotationView() {
  const getInitialId = () => {
    const path = window.location.pathname;
    const match = path.match(/\/cotizacion\/(.+)/);
    if (match && match[1]) return match[1];
    return '';
  };

  const [currentId, setCurrentId] = useState(getInitialId());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const handleSelectId = (newId) => {
    setCurrentId(newId);
    if (window.history.pushState) {
      window.history.pushState({ path: `/cotizacion/${newId}` }, '', `/cotizacion/${newId}`);
    }
  };

  const loadQuotationData = async (idToFetch) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getQuotation(idToFetch);
      setData(result);
    } catch (err) {
      setError(err.message || 'Error al cargar la propuesta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentId) loadQuotationData(currentId);
  }, [currentId]);

  const handleUpdateStatus = async (payload) => {
    if (!data) return;
    await updateQuotationStatus(currentId, payload);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        quotation: { ...prev.quotation, status: payload.status, notes: payload.notes || prev.quotation.notes }
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070F1E] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar id={currentId} status={data?.quotation.status || 'enviada'} darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)} onSelectQuotation={handleSelectId} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="min-h-[500px] flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#00A896]/10 text-[#00A896] flex items-center justify-center animate-pulse">
              <Compass className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Cargando tu propuesta de viaje...</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Obteniendo detalles de Karabu Viajes para #{currentId}</p>
            </div>
          </div>
        ) : error ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-center my-10 p-8 rounded-3xl bg-red-500/5 border border-red-500/20">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No pudimos cargar la cotización #{currentId}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1">{error}</p>
            </div>
            <button onClick={() => loadQuotationData(currentId)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#00A896] hover:bg-[#008F80] transition shadow-md">
              <RefreshCw className="w-4 h-4" />Reintentar
            </button>
          </div>
        ) : data ? (
          <div className="space-y-6">
            <HeroBanner data={data} />
            <MetricsCards quotation={data.quotation} formData={data.quotation.form_data} />
            <FormDataDetails formData={data.quotation.form_data} />
            <PriceComparison quotation={data.quotation} />
            <ItinerarySection quotation={data.quotation} />
            <DestinationGallery destination={data.quotation.destination} images={data.quotation.gallery_images} />
            <BrokerCard broker={data.broker} quotationId={data.quotation.id} />
            <DecisionPanel quotationId={data.quotation.id} currentStatus={data.quotation.status}
              currentNotes={data.quotation.notes} onUpdateStatus={handleUpdateStatus} />
          </div>
        ) : null}
      </main>

      <footer className="w-full border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#070F1E] py-8 px-4 text-center text-xs text-slate-500 dark:text-slate-400 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-white">KARABU <span className="text-[#00A896]">VIAJES</span></span>
            <span>— Propuesta Digital de Viaje</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#00A896]" />
            <span>Documento seguro emitido para cliente en Karabu Cloud</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
