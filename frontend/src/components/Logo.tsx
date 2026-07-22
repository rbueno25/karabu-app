import React from 'react';

interface LogoProps {
  light?: boolean;
  className?: string;
  showText?: boolean;
}

export default function Logo({ light = false, className = '', showText = true }: LogoProps) {
  const textColor = light ? 'text-white' : 'text-[#0B2545]';
  const subtitleColor = light ? 'text-[#0D9387]/90' : 'text-[#0D9387]';

  return (
    <div className={`flex items-center gap-1.5 select-none nav-brand ${className}`}>
      {/* 1. Colibrí SVG arriba */}
      <img
        src={light ? "/colibri-light.svg" : "/colibri.svg"}
        alt="Karabu"
        className="w-[80px] h-[80px] flex-shrink-0"
      />

      {/* 2. Texto debajo */}
      {showText && (
        <div className="flex flex-col items-start">
          {/* KΛRΛBU */}
          <span className={`font-display text-base font-black tracking-[0.14em] leading-none uppercase ${textColor}`}>
            K<span className="font-sans font-extrabold">Λ</span>R<span className="font-sans font-extrabold">Λ</span>BU
          </span>
          {/* — VISAS Y VIAJES — */}
          <div className={`flex items-center gap-1 mt-0.5 ${subtitleColor}`}>
            <div className="h-[1px] w-1.5 bg-current opacity-70"></div>
            <span className="font-sans text-[7px] font-bold tracking-[0.15em] uppercase whitespace-nowrap leading-none">
              Visas y Viajes
            </span>
            <div className="h-[1px] w-1.5 bg-current opacity-70"></div>
          </div>
        </div>
      )}
    </div>
  );
}
