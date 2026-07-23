import React, { useState } from 'react';
import { Camera, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';

export function DestinationGallery({ destination, images }) {
  const [activeModalIndex, setActiveModalIndex] = useState(null);
  if (!images || images.length === 0) return null;

  const openLightbox = (index) => setActiveModalIndex(index);
  const closeLightbox = () => setActiveModalIndex(null);
  const prevImage = () => { if (activeModalIndex !== null) setActiveModalIndex((activeModalIndex - 1 + images.length) % images.length); };
  const nextImage = () => { if (activeModalIndex !== null) setActiveModalIndex((activeModalIndex + 1) % images.length); };

  return (
    <div className="w-full my-8 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1B2A] border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/15 text-[#FF6B35] flex items-center justify-center font-bold">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Galería Visual del Destino</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Imágenes destacadas de {destination}</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{images.length} Fotos</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {images.map((img, idx) => (
          <div key={idx} onClick={() => openLightbox(idx)} className="group relative h-36 sm:h-44 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 cursor-pointer border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
            <img src={img} alt={`${destination} ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-white/20 backdrop-blur-md text-white"><Eye className="w-5 h-5" /></span>
            </div>
          </div>
        ))}
      </div>
      {activeModalIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button onClick={closeLightbox} className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"><X className="w-6 h-6" /></button>
          <button onClick={prevImage} className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"><ChevronLeft className="w-6 h-6" /></button>
          <div className="max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl">
            <img src={images[activeModalIndex]} alt={`${destination} lightbox`} className="w-full h-full object-contain" />
          </div>
          <button onClick={nextImage} className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"><ChevronRight className="w-6 h-6" /></button>
          <div className="absolute bottom-5 text-center text-xs text-slate-300 font-medium">{activeModalIndex + 1} de {images.length} — {destination}</div>
        </div>
      )}
    </div>
  );
}
