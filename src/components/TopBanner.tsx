import React from 'react';
import { EmpresaInfo } from '../types';

interface TopBannerProps {
  empresa?: EmpresaInfo;
}

export const TopBanner: React.FC<TopBannerProps> = ({ empresa }) => {
  const logoSrc = empresa?.logoUrl || 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjQCg77zUT43bZxFpwtQv8VnbT6iNll_bgvVVG9xRlvSVzZ6IL25hl4cjtp0ZZZh3YwIlykgT0jn5SYPBIxjMSFzzmc1YwbUBmLCY8_9hVMFX6_UhlSAe_Zmmy52tkhPuFCIRUmEWccW6r493-6dX9k6lyHbXYvWieQ21xAzo59aryPb1mcvb6juDpp0Zo/s1600/logo.jpg';

  return (
    <div className="w-full bg-white text-slate-900 border-b border-slate-200 shadow-sm py-4 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
        
        {/* Official Logo Image */}
        <div className="relative mb-3 flex items-center justify-center">
          <img 
            src={logoSrc} 
            alt="Antonio Furtado Consultor Imobiliário Logo" 
            className="max-h-24 sm:max-h-28 md:max-h-32 w-auto object-contain transition-transform hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Subtitle with CRECI */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-bold tracking-wider text-[#0B2240] uppercase">
          <span>CONSULTOR IMOBILIÁRIO</span>
          <span>•</span>
          <span>CRECI {empresa?.creci || '208024'}</span>
        </div>

        {/* Website & Contact Info */}
        <div className="mt-2 text-xs sm:text-sm font-medium text-slate-600 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4">
          <a 
            href="https://www.antoniofurtado.com.br" 
            target="_blank" 
            rel="noreferrer"
            className="text-blue-900 hover:underline hover:text-blue-700 font-semibold transition-colors"
          >
            www.antoniofurtado.com.br
          </a>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="text-slate-800 font-medium">
            WhatsApp (11) 96904-3012
          </span>
        </div>

      </div>
    </div>
  );
};

