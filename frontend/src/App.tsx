/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Destinations from './components/Destinations';
import Services from './components/Services';
import WhyChooseUs from './components/WhyChooseUs';
import Steps from './components/Steps';
import QuoteForm from './components/QuoteForm';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';

// Admin — .jsx files, allowJs is enabled
import { AuthProvider } from './admin/AuthContext';
// @ts-ignore
import { useAuth } from './admin/AuthContext';
// @ts-ignore
import { ThemeProvider } from './admin/ThemeContext';
import Login from './admin/Login';
import ProtectedRoute from './admin/ProtectedRoute';
import AdminLayout from './admin/Layout';

const Dashboard = lazy(() => import('./admin/Dashboard'));
const Clients = lazy(() => import('./admin/Clients'));
const ClientDetail = lazy(() => import('./admin/ClientDetail'));
const Quotations = lazy(() => import('./admin/Quotations'));
const QuotationSheet = lazy(() => import('./admin/QuotationSheet'));
const ClientQuotationView = lazy(() => import('./client-view/ClientQuotationView'));
const Reservations = lazy(() => import('./admin/Reservations'));
const ReservationDetail = lazy(() => import('./admin/ReservationDetail'));
const Payments = lazy(() => import('./admin/Payments'));
const AdminDestinations = lazy(() => import('./admin/Destinations'));
const UsersPage = lazy(() => import('./admin/Users'));
const Settings = lazy(() => import('./admin/Settings'));

function AdminLoader() {
  return (
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 p-8">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      Cargando módulo...
    </div>
  );
}

function LandingPage() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [preselectedDestination, setPreselectedDestination] = useState('');

  const handleNavigate = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const handleSelectDestination = (destName: string) => {
    setPreselectedDestination(destName);
    handleNavigate('cotizacion');
  };

  useEffect(() => {
    const sections = ['inicio', 'destinos', 'servicios', 'por-que-elegirnos', 'cotizacion', 'contacto'];
    const observerOptions = { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    sections.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => { sections.forEach((id) => { const el = document.getElementById(id); if (el) observer.unobserve(el); }); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-brand-turquoise/20 selection:text-brand-navy antialiased">
      <Header activeSection={activeSection} onNavigate={handleNavigate} />
      <main>
        <Hero onExploreDestinations={() => handleNavigate('destinos')} onContact={() => handleNavigate('cotizacion')} />
        <Stats />
        <Destinations onSelectDestination={handleSelectDestination} />
        <Services />
        <WhyChooseUs />
        <Steps />
        <QuoteForm preselectedDestination={preselectedDestination} onClearPreselected={() => setPreselectedDestination('')} />
        <Testimonials />
        <CTA onContactClick={() => handleNavigate('cotizacion')} />
      </main>
      <Footer onNavigate={handleNavigate} onSelectDestination={handleSelectDestination} />
    </div>
  );
}

function LoginRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/admin" replace />;
  return <Login />;
}

export default function App() {
  return (
    <HashRouter>
      <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Suspense fallback={<AdminLoader />}><Dashboard /></Suspense>} />
            <Route path="clientes" element={<Suspense fallback={<AdminLoader />}><Clients /></Suspense>} />
            <Route path="clientes/:id" element={<Suspense fallback={<AdminLoader />}><ClientDetail /></Suspense>} />
            <Route path="cotizaciones" element={<Suspense fallback={<AdminLoader />}><Quotations /></Suspense>} />
            <Route path="cotizaciones/:id" element={<Suspense fallback={<AdminLoader />}><QuotationSheet /></Suspense>} />
            <Route path="reservas" element={<Suspense fallback={<AdminLoader />}><Reservations /></Suspense>} />
            <Route path="reservas/:id" element={<Suspense fallback={<AdminLoader />}><ReservationDetail /></Suspense>} />
            <Route path="pagos" element={<Suspense fallback={<AdminLoader />}><Payments /></Suspense>} />
            <Route path="destinos" element={<Suspense fallback={<AdminLoader />}><AdminDestinations /></Suspense>} />
            <Route path="usuarios" element={<Suspense fallback={<AdminLoader />}><UsersPage /></Suspense>} />
            <Route path="configuracion" element={<Suspense fallback={<AdminLoader />}><Settings /></Suspense>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
          {/* Public client quotation view — no auth required */}
          <Route path="/cotizacion/:id" element={<Suspense fallback={<AdminLoader />}><ClientQuotationView /></Suspense>} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
}
