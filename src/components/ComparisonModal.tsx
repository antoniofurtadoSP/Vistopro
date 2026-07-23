import React, { useState, useMemo } from 'react';
import { X, GitCompare, AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Vistoria } from '../types';

interface ComparisonModalProps {
  vistorias: Vistoria[];
  onClose: () => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({ vistorias, onClose }) => {
  const [selectedEntradaId, setSelectedEntradaId] = useState<string>('');
  const [selectedSaidaId, setSelectedSaidaId] = useState<string>('');

  const entradasList = useMemo(() => vistorias.filter((v) => v.tipo === 'Entrada'), [vistorias]);
  const saidasList = useMemo(() => vistorias.filter((v) => v.tipo === 'Saída'), [vistorias]);

  const vistoriaEntrada = useMemo(() => vistorias.find((v) => v.id === selectedEntradaId) || entradasList[0] || null, [vistorias, selectedEntradaId, entradasList]);
  const vistoriaSaida = useMemo(() => vistorias.find((v) => v.id === selectedSaidaId) || saidasList[0] || null, [vistorias, selectedSaidaId, saidasList]);

  // Comparison logic
  const comparacao = useMemo(() => {
    if (!vistoriaEntrada || !vistoriaSaida) return null;

    const avariasNovas: Array<{ ambiente: string; item: string; entradaObs: string; saidaObs: string }> = [];

    vistoriaSaida.ambientes.forEach((ambSaida) => {
      const ambEntrada = vistoriaEntrada.ambientes.find((a) => a.nome.toLowerCase() === ambSaida.nome.toLowerCase());
      ambSaida.itens.forEach((itemSaida) => {
        if (itemSaida.estado === 'Avaria') {
          const itemEntrada = ambEntrada?.itens.find((i) => i.nome.toLowerCase() === itemSaida.nome.toLowerCase());
          if (!itemEntrada || itemEntrada.estado !== 'Avaria') {
            avariasNovas.push({
              ambiente: ambSaida.nome,
              item: itemSaida.nome,
              entradaObs: itemEntrada ? `Estado Inicial: ${itemEntrada.estado} (${itemEntrada.observacoes || 'Sem obs'})` : 'Item não constava na entrada',
              saidaObs: `Avaria na Saída: ${itemSaida.observacoes || 'Com avaria'}`,
            });
          }
        }
      });
    });

    return { avariasNovas };
  }, [vistoriaEntrada, vistoriaSaida]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">Comparador Técnico: Vistoria de Entrada vs. Saída</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selectors */}
        <div className="p-5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Select Entrada */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              1. Selecionar Vistoria de Entrada (Laudo Inicial)
            </label>
            <select
              value={vistoriaEntrada?.id || ''}
              onChange={(e) => setSelectedEntradaId(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
            >
              {entradasList.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.codigoVistoria} - {v.imovel.endereco}, {v.imovel.numero} ({v.inquilinoNome})
                </option>
              ))}
            </select>
          </div>

          {/* Select Saida */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              2. Selecionar Vistoria de Saída (Laudo Final)
            </label>
            <select
              value={vistoriaSaida?.id || ''}
              onChange={(e) => setSelectedSaidaId(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
            >
              {saidasList.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.codigoVistoria} - {v.imovel.endereco}, {v.imovel.numero} ({v.inquilinoNome})
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Comparison Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {vistoriaEntrada && vistoriaSaida ? (
            <>
              {/* Summary of new damages */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  Divergências Encontradas ({comparacao?.avariasNovas.length || 0} novas avarias na saída)
                </h3>

                {comparacao && comparacao.avariasNovas.length > 0 ? (
                  <div className="space-y-3">
                    {comparacao.avariasNovas.map((av, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-rose-200 dark:border-rose-900/50 text-xs space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white">
                          📍 {av.ambiente} - {av.item}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                          <p className="text-slate-500">
                            Entrada: <span className="text-slate-700 dark:text-slate-300">{av.entradaObs}</span>
                          </p>
                          <p className="text-rose-600 font-semibold">
                            Saída: <span>{av.saidaObs}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Nenhuma nova avaria detectada entre o laudo de entrada e o laudo de saída!</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-center text-xs text-slate-500 py-8">
              Selecione uma vistoria de entrada e uma de saída para comparar os laudos.
            </p>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-right">
          <button onClick={onClose} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold">
            Fechar Comparador
          </button>
        </div>

      </div>
    </div>
  );
};
