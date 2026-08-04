import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, ArrowLeft, Globe, Navigation, Phone, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image_url: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://karabu-srv.onrender.com';

const menuItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Destinos', href: '/destinos' },
  { label: 'Servicios', href: '/#servicios' },
  { label: 'Cotizar', href: '/#cotizacion' },
  { label: 'Contacto', href: '/#contacto' },
];

export default function DestinationBrowser() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(API_BASE + '/api/destinations')
      .then(r => r.json())
      .then(data => {
        setDestinations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const countries = useMemo(() => {
    const set = new Set(destinations.map(d => d.country));
    return Array.from(set).sort();
  }, [destinations]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return destinations.filter(d => {
      const matchSearch = !q ||
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q);
      const matchCountry = !selectedCountry || d.country === selectedCountry;
      return matchSearch && matchCountry;
    });
  }, [destinations, search, selectedCountry]);

  // Auto-fill country when user types a matching city name
  useEffect(() => {
    if (search.trim().length >= 3) {
      const match = destinations.find(d =>
        d.name.toLowerCase() === search.toLowerCase().trim()
      );
      if (match && match.country !== selectedCountry) {
        setSelectedCountry(match.country);
      }
    }
  }, [search]);

  const handleSelectDestination = (dest: Destination) => {
    const params = new URLSearchParams();
    params.set('dest', dest.name);
    params.set('destCountry', dest.country);
    navigate('/?' + params.toString());
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header — matches landing navbar style */}
      <header className="sticky top-0 z-50 bg-brand-navy shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="cursor-pointer">
              <Logo light showText={true} />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex space-x-6">
              {menuItems.map(item => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`text-sm font-medium transition-all py-2 ${
                    item.href === '/destinos'
                      ? 'text-brand-turquoise font-bold'
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* CTA + Mobile toggle */}
            <div className="flex items-center gap-3">
              <a
                href="tel:8093062424"
                className="hidden sm:inline-flex items-center gap-2 bg-brand-turquoise text-white font-bold text-xs px-4 py-2.5 rounded-full hover:bg-brand-turquoise/90 transition-colors shadow-lg shadow-brand-turquoise/20"
              >
                <Phone className="w-3.5 h-3.5" />
                809-306-2424
              </a>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 text-white hover:text-brand-turquoise transition-colors"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="lg:hidden border-t border-white/10 py-4 space-y-2">
              {menuItems.map(item => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.href === '/destinos'
                      ? 'bg-brand-turquoise/10 text-brand-turquoise'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href="tel:8093062424"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-brand-turquoise hover:bg-brand-turquoise/5 transition-colors"
              >
                📞 809-306-2424
              </a>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Page title */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-turquoise transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <span className="text-slate-300">|</span>
          <h1 className="text-2xl font-extrabold text-brand-navy flex items-center gap-2">
            <Globe className="w-6 h-6 text-brand-turquoise" />
            Explorar destinos
          </h1>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar ciudad o país..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-turquoise focus:ring-1 focus:ring-brand-turquoise/30 transition-all text-sm shadow-sm"
            />
          </div>

          <select
            value={selectedCountry}
            onChange={e => setSelectedCountry(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-brand-turquoise min-w-[180px] shadow-sm"
          >
            <option value="">Todos los países</option>
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-turquoise border-t-transparent" />
            <span className="ml-3 text-slate-400 text-sm">Cargando destinos...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No se encontraron destinos</p>
            <p className="text-slate-400 text-sm mt-1">Intenta con otra búsqueda</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 mb-4">
              {filtered.length} destino{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(dest => (
                <button
                  key={dest.id}
                  onClick={() => handleSelectDestination(dest)}
                  className="group text-left bg-white border border-slate-200 hover:border-brand-turquoise/50 rounded-2xl p-5 transition-all duration-200 hover:bg-brand-turquoise/[0.02] hover:shadow-md shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-turquoise/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-turquoise/20 transition-colors">
                      <MapPin className="w-5 h-5 text-brand-turquoise" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-brand-navy text-sm truncate group-hover:text-brand-turquoise transition-colors">
                        {dest.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{dest.country}</p>
                      {dest.description && (
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {dest.description}
                        </p>
                      )}
                    </div>
                    <Navigation className="w-4 h-4 text-slate-300 group-hover:text-brand-turquoise flex-shrink-0 mt-1 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
