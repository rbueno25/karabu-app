import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, ArrowLeft, Globe, Navigation } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image_url: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://karabu-srv.onrender.com';

export default function DestinationBrowser() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
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

  // Extract unique countries
  const countries = useMemo(() => {
    const set = new Set(destinations.map(d => d.country));
    return Array.from(set).sort();
  }, [destinations]);

  // Filter destinations by search and country
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

  // When user types a city name, try to auto-fill country
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
    navigate('/?dest=' + encodeURIComponent(dest.name));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-brand-turquoise transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-brand-turquoise" />
            Explorar destinos
          </h1>
          <div className="w-20" /> {/* spacer for centering */}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar ciudad o país..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-brand-turquoise focus:ring-1 focus:ring-brand-turquoise/30 transition-all text-sm"
            />
          </div>

          <select
            value={selectedCountry}
            onChange={e => setSelectedCountry(e.target.value)}
            className="px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand-turquoise min-w-[180px]"
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
            <span className="ml-3 text-zinc-500 text-sm">Cargando destinos...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">No se encontraron destinos</p>
            <p className="text-zinc-600 text-sm mt-1">Intenta con otra búsqueda</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-zinc-500 mb-4">
              {filtered.length} destino{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(dest => (
                <button
                  key={dest.id}
                  onClick={() => handleSelectDestination(dest)}
                  className="group text-left bg-zinc-900 border border-zinc-800 hover:border-brand-turquoise/50 rounded-2xl p-5 transition-all duration-200 hover:bg-zinc-800/80 hover:shadow-lg hover:shadow-brand-turquoise/5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-turquoise/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-turquoise/20 transition-colors">
                      <MapPin className="w-5 h-5 text-brand-turquoise" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-sm truncate group-hover:text-brand-turquoise transition-colors">
                        {dest.name}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">{dest.country}</p>
                      {dest.description && (
                        <p className="text-xs text-zinc-600 mt-2 line-clamp-2 leading-relaxed">
                          {dest.description}
                        </p>
                      )}
                    </div>
                    <Navigation className="w-4 h-4 text-zinc-700 group-hover:text-brand-turquoise flex-shrink-0 mt-1 transition-colors" />
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
