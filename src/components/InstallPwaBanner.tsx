import React, { useState, useEffect } from 'react';
import { Smartphone, Share, PlusSquare, X, Check, Download } from 'lucide-react';

interface InstallPwaBannerProps {
  logoUrl?: string;
}

export const InstallPwaBanner: React.FC<InstallPwaBannerProps> = ({ logoUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const inStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsStandalone(!!inStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // Capture native PWA install prompt for Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setIsOpen(true);
    }
  };

  const [copied, setCopied] = useState(false);
  const isInIframe = window.self !== window.top;

  const directAppUrl = typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null'
    ? window.location.origin
    : 'https://ais-pre-g6cjlzozoq7ixweq3mv24q-494905315042.us-east1.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directAppUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const officialLogo = '/app-icon.svg';

  return (
    <>
      {/* Top Floating Prompt Bar */}
      <div className="bg-gradient-to-r from-[#0B2240] via-slate-900 to-[#0B2240] text-white py-2 px-4 shadow-md border-b border-amber-500/30 flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <img 
            src={officialLogo} 
            alt="AF App Icon" 
            className="w-7 h-7 rounded-lg object-contain bg-white p-0.5 shadow-sm"
          />
          <div>
            <span className="font-semibold text-amber-400">Instalar Aplicativo no Celular</span>
            <p className="text-[11px] text-slate-300 hidden sm:block">Acesse vistorias direto da tela inicial do seu celular com o ícone oficial</p>
          </div>
        </div>

        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all transform active:scale-95"
        >
          <Smartphone className="w-4 h-4" />
          <span>Instalar no Celular</span>
        </button>
      </div>

      {/* Instructional Modal for iOS & Manual Android */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative animate-in fade-in zoom-in-95">
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Icon */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 p-2 border border-amber-500/30 shadow-md mb-3 flex items-center justify-center">
                <img 
                  src={officialLogo} 
                  alt="Ícone do App" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-extrabold text-[#0B2240] dark:text-amber-400">
                Antonio Furtado App
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Como adicionar à tela de início do seu celular
              </p>
            </div>

            {/* Instructions list */}
            <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-300">
              <p className="font-bold mb-1">⚠️ Atenção para instalar no Celular:</p>
              <p className="mb-2">Você deve abrir o <strong>link direto do aplicativo</strong> no navegador do seu celular (Safari ou Chrome), fora da pré-visualização do editor.</p>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={directAppUrl} 
                  className="w-full text-[11px] p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs whitespace-nowrap transition-colors"
                >
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">1</span>
                  Toque no botão <Share className="w-4 h-4 text-blue-500 inline mx-1" /> <strong>Compartilhar</strong> no Safari
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">2</span>
                  Role para baixo e selecione <PlusSquare className="w-4 h-4 text-slate-700 dark:text-slate-300 inline mx-1" /> <strong>Adicionar à Tela de Início</strong>
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">3</span>
                  Toque em <strong>Adicionar</strong> no canto superior direito
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">1</span>
                  No Chrome, toque nos <strong>3 pontos (⋮)</strong> no canto superior direito
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">2</span>
                  Selecione <Download className="w-4 h-4 text-emerald-500 inline mx-1" /> <strong>Instalar Aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">3</span>
                  Confirme a instalação no seu celular
                </p>
              </div>
            )}

            <div className="mt-5 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 bg-[#0B2240] hover:bg-slate-800 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
              >
                Entendi
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
