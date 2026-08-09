import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Header from './components/Header';
import HeroCotizar from './components/HeroCotizar';
import Steps from './components/Steps';
import QuoteForm from './components/QuoteForm';
import CTA from './components/CTA';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

function CotizacionApp() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-brand-turquoise/20 selection:text-brand-navy antialiased">
      <Header onNavigate={scrollTo} activeSection="" />
      <main>
        <HeroCotizar onComenzar={() => scrollTo('cotizacion')} />
        <FAQ />
        <Steps />
        <div id="cotizacion">
          <QuoteForm preselectedDestination="" onClearPreselected={() => {}} />
        </div>
        <CTA onContactClick={() => scrollTo('cotizacion')} />
      </main>
      <Footer onNavigate={scrollTo} onSelectDestination={() => scrollTo('cotizacion')} />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CotizacionApp />
  </React.StrictMode>
);
