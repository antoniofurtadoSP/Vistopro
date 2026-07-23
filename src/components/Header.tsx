import React from 'react';
import { ClipboardCheck, Plus, GitCompare, Building2, Download } from 'lucide-react';
import { EmpresaInfo } from '../types';
import { TopBanner } from './TopBanner';

interface HeaderProps {
  empresa: EmpresaInfo;
  onNovaVistoria: () => void;
  onComparar: () => void;
  onConfigEmpresa: () => void;
  onExportarDb: () => void;
  onResetDb: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  empresa,
  onNovaVistoria,
  onComparar,
  onConfigEmpresa,
  onExportarDb,
}) => {
  return (
    <header id="header-main" className="w-full">
      {/* Official Top Banner */}
      <TopBanner empresa={empresa} />

      {/* Sticky Action Navigation Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* System Status & Brand Subtitle */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">VistoriaPro</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Laudos Imobiliários
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              <button
                id="btn-comparar-vistorias"
                onClick={onComparar}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Comparar Vistoria de Entrada x Saída"
              >
                <GitCompare className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Comparar Entrada x Saída</span>
              </button>

              <button
                id="btn-config-empresa"
                onClick={onConfigEmpresa}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Dados da Imobiliária / CRECI"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden lg:inline">Dados do Consultor</span>
              </button>

              <button
                id="btn-export-db"
                onClick={onExportarDb}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Exportar Backup em JSON"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden xl:inline">Backup</span>
              </button>

              <button
                id="btn-nova-vistoria"
                onClick={onNovaVistoria}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Vistoria</span>
              </button>

            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
