import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Eye, Edit3, Trash2, FileText, ArrowUpRight, 
  ArrowDownRight, AlertTriangle, CheckCircle2, Clock, Building2,
  Calendar, User, Plus
} from 'lucide-react';
import { Vistoria, VistoriaFiltros } from '../types';

interface VistoriaListProps {
  vistorias: Vistoria[];
  onSelectVistoria: (v: Vistoria) => void;
  onEditarVistoria: (v: Vistoria) => void;
  onDeletarVistoria: (id: string) => void;
  onGerarPdf: (v: Vistoria) => void;
  onNovaVistoria: () => void;
}

export const VistoriaList: React.FC<VistoriaListProps> = ({
  vistorias,
  onSelectVistoria,
  onEditarVistoria,
  onDeletarVistoria,
  onGerarPdf,
  onNovaVistoria,
}) => {
  const [filtros, setFiltros] = useState<VistoriaFiltros>({
    busca: '',
    tipo: 'Todos',
    status: 'Todos',
    cidade: 'Todas',
  });

  // Calculate stats
  const stats = useMemo(() => {
    const total = vistorias.length;
    const entradas = vistorias.filter((v) => v.tipo === 'Entrada').length;
    const saidas = vistorias.filter((v) => v.tipo === 'Saída').length;
    const emAndamento = vistorias.filter((v) => v.status === 'Em Andamento' || v.status === 'Rascunho').length;
    const avariasTotais = vistorias.reduce((acc, v) => {
      return acc + v.ambientes.reduce((a, amb) => a + amb.itens.filter((i) => i.estado === 'Avaria').length, 0);
    }, 0);

    return { total, entradas, saidas, emAndamento, avariasTotais };
  }, [vistorias]);

  // Unique cities list for filter dropdown
  const cidades = useMemo(() => {
    const set = new Set(vistorias.map((v) => v.imovel.cidade).filter(Boolean));
    return ['Todas', ...Array.from(set)];
  }, [vistorias]);

  // Filtered list
  const vistoriasFiltradas = useMemo(() => {
    return vistorias.filter((v) => {
      const query = filtros.busca.toLowerCase();
      const matchBusca =
        !query ||
        v.codigoVistoria.toLowerCase().includes(query) ||
        v.imovel.endereco.toLowerCase().includes(query) ||
        v.imovel.codigoRef.toLowerCase().includes(query) ||
        v.inquilinoNome.toLowerCase().includes(query) ||
        v.imovel.proprietarioNome.toLowerCase().includes(query);

      const matchTipo = filtros.tipo === 'Todos' || v.tipo === filtros.tipo;
      const matchStatus = filtros.status === 'Todos' || v.status === filtros.status;
      const matchCidade = filtros.cidade === 'Todas' || v.imovel.cidade === filtros.cidade;

      return matchBusca && matchTipo && matchStatus && matchCidade;
    });
  }, [vistorias, filtros]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Concluída':
      case 'Aprovada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      case 'Em Andamento':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" />
            Em Andamento
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Rascunho
          </span>
        );
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'Entrada':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
            Entrada
          </span>
        );
      case 'Saída':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
            <ArrowDownRight className="w-3.5 h-3.5 text-purple-600" />
            Saída
          </span>
        );
      case 'Periódica':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
            Periódica
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded">
            {tipo}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total no Banco de Dados</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
            <p className="text-xs text-slate-500 mt-1">Laudos cadastrados</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Vistorias de Entrada</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.entradas}</p>
            <p className="text-xs text-slate-500 mt-1">Check-in de inquilinos</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Vistorias de Saída</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.saidas}</p>
            <p className="text-xs text-slate-500 mt-1">Check-out de imóveis</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avarias Registradas</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.avariasTotais}</p>
            <p className="text-xs text-slate-500 mt-1">Itens danificados/furos</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-busca-vistoria"
              type="text"
              placeholder="Buscar por código, endereço do imóvel, inquilino ou proprietário..."
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Tipo Filter */}
            <select
              id="select-filtro-tipo"
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Todos">Todos os Tipos</option>
              <option value="Entrada">Entrada</option>
              <option value="Saída">Saída</option>
              <option value="Periódica">Periódica</option>
              <option value="Conferência">Conferência</option>
            </select>

            {/* Status Filter */}
            <select
              id="select-filtro-status"
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Concluída">Concluída</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Rascunho">Rascunho</option>
            </select>

            {/* Cidade Filter */}
            {cidades.length > 2 && (
              <select
                id="select-filtro-cidade"
                value={filtros.cidade}
                onChange={(e) => setFiltros({ ...filtros, cidade: e.target.value })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {cidades.map((c) => (
                  <option key={c} value={c}>
                    {c === 'Todas' ? 'Todas as Cidades' : c}
                  </option>
                ))}
              </select>
            )}

          </div>

        </div>

      </div>

      {/* Main Vistorias Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-500" />
            <h2 className="font-semibold text-slate-900 dark:text-white text-base">
              Histórico Completo de Vistorias ({vistoriasFiltradas.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Armazenamento em banco de dados ativo
          </span>
        </div>

        {vistoriasFiltradas.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Nenhuma vistoria encontrada
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tente ajustar os filtros de busca ou crie um novo laudo de vistoria.
              </p>
            </div>
            <button
              onClick={onNovaVistoria}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Criar Primeira Vistoria
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Código / Tipo</th>
                  <th className="px-4 py-3">Imóvel & Endereço</th>
                  <th className="px-4 py-3">Inquilino / Proprietário</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {vistoriasFiltradas.map((vistoria) => {
                  const numAvarias = vistoria.ambientes.reduce(
                    (acc, amb) => acc + amb.itens.filter((i) => i.estado === 'Avaria').length,
                    0
                  );
                  const dormsCount = vistoria.ambientes.filter(a => {
                    const l = a.nome.toLowerCase();
                    return l.includes('dormitório') || l.includes('dormitorio') || l.includes('quarto') || l.includes('suíte') || l.includes('suite');
                  }).length;

                  const photosCount = vistoria.ambientes.reduce(
                    (acc, amb) => acc + (amb.fotosGerais?.length || 0) + amb.itens.reduce((iAcc, item) => iAcc + (item.fotos?.length || 0), 0),
                    0
                  );

                  return (
                    <tr
                      key={vistoria.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectVistoria(vistoria)}
                    >
                      {/* Code & Type */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {vistoria.codigoVistoria}
                          </span>
                          <div>{getTipoBadge(vistoria.tipo)}</div>
                        </div>
                      </td>

                      {/* Property */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="font-medium text-slate-900 dark:text-white line-clamp-1">
                          {vistoria.imovel.endereco}, {vistoria.imovel.numero}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <span>{vistoria.imovel.bairro} - {vistoria.imovel.cidade}/{vistoria.imovel.estado} ({vistoria.imovel.tipo})</span>
                          {dormsCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                              🛏️ {dormsCount} qu.
                            </span>
                          )}
                          {photosCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                              📷 {photosCount} foto(s)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tenant / Owner */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5 text-xs">
                          <p className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            Inquilino: {vistoria.inquilinoNome}
                          </p>
                          <p className="text-slate-500">
                            Prop.: {vistoria.imovel.proprietarioNome}
                          </p>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(vistoria.dataVistoria || vistoria.dataCriacao).toLocaleDateString('pt-BR')}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div>{getStatusBadge(vistoria.status)}</div>
                          {numAvarias > 0 && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
                              ⚠️ {numAvarias} avaria(s)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* PDF Download */}
                          <button
                            id={`btn-pdf-${vistoria.id}`}
                            onClick={() => onGerarPdf(vistoria)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 dark:text-blue-400 transition-colors"
                            title="Gerar e Baixar Laudo PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* View Detail */}
                          <button
                            id={`btn-ver-${vistoria.id}`}
                            onClick={() => onSelectVistoria(vistoria)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors"
                            title="Visualizar Vistoria"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            id={`btn-editar-${vistoria.id}`}
                            onClick={() => onEditarVistoria(vistoria)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 dark:text-amber-400 transition-colors"
                            title="Editar Vistoria"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            id={`btn-deletar-${vistoria.id}`}
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja apagar a vistoria ${vistoria.codigoVistoria}?`)) {
                                onDeletarVistoria(vistoria.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 dark:text-rose-400 transition-colors"
                            title="Excluir Vistoria"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
