import React, { useState } from 'react';
import { 
  X, FileText, Download, Building2, User, Calendar, 
  Sparkles, CheckCircle2, AlertTriangle, Image as ImageIcon,
  PenTool, ShieldCheck, Printer, RefreshCw, Bed, Bath, Sofa, Utensils, Car,
  ChevronLeft, ChevronRight, Maximize2, Camera, Eye
} from 'lucide-react';
import { Vistoria, EmpresaInfo } from '../types';
import { generateVistoriaPdf } from '../services/pdfGenerator';
import { dbService } from '../services/api';
import { getSafeLogoSrc, LOCAL_LOGO_URL } from '../assets/defaultLogo';

interface VistoriaDetailModalProps {
  vistoria: Vistoria;
  empresa: EmpresaInfo;
  onClose: () => void;
  onEditar: () => void;
  onAtualizarVistoria: (updated: Vistoria) => void;
}

export const VistoriaDetailModal: React.FC<VistoriaDetailModalProps> = ({
  vistoria,
  empresa,
  onClose,
  onEditar,
  onAtualizarVistoria,
}) => {
  const [activeTab, setActiveTab] = useState<'ambientes' | 'galeria' | 'imovel' | 'ia' | 'assinaturas'>('ambientes');
  const [isGerandoPdf, setIsGerandoPdf] = useState(false);
  const [isAnalisandoIa, setIsAnalisandoIa] = useState(false);
  const [galleryRoomFilter, setGalleryRoomFilter] = useState<string>('all');
  
  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleBaixarPdf = async () => {
    try {
      setIsGerandoPdf(true);
      const doc = await generateVistoriaPdf(vistoria, empresa);
      doc.save(`Laudo_Vistoria_${vistoria.codigoVistoria}.pdf`);
    } catch (err) {
      console.error('Erro gerando PDF:', err);
      alert('Ocorreu um erro ao gerar o PDF da vistoria.');
    } finally {
      setIsGerandoPdf(false);
    }
  };

  const handleGerarIa = async () => {
    try {
      setIsAnalisandoIa(true);
      const analise = await dbService.analyzeWithAi(vistoria);
      const updated = { ...vistoria, analiseIa: analise };
      await dbService.saveVistoria(updated);
      onAtualizarVistoria(updated);
      setActiveTab('ia');
    } catch (err) {
      console.error('Erro na IA:', err);
      alert('Erro ao processar análise inteligente.');
    } finally {
      setIsAnalisandoIa(false);
    }
  };

  const totalItens = vistoria.ambientes.reduce((acc, a) => acc + a.itens.length, 0);
  const totalAvarias = vistoria.ambientes.reduce((acc, a) => acc + a.itens.filter(i => i.estado === 'Avaria').length, 0);
  const totalDormitorios = vistoria.ambientes.filter(a => {
    const l = a.nome.toLowerCase();
    return l.includes('dormitório') || l.includes('dormitorio') || l.includes('quarto') || l.includes('suíte') || l.includes('suite');
  }).length;

  // Flatten all photos across rooms and items for gallery and lightbox
  const allPhotos = vistoria.ambientes.flatMap((a) => [
    ...(a.fotosGerais || []).map((f) => ({
      ...f,
      roomName: a.nome,
      tipo: 'Cômodo Geral',
      itemNome: undefined,
    })),
    ...a.itens.flatMap((i) =>
      (i.fotos || []).map((f) => ({
        ...f,
        roomName: a.nome,
        tipo: 'Item',
        itemNome: i.nome,
      }))
    ),
  ]);

  const filteredPhotos = galleryRoomFilter === 'all' 
    ? allPhotos 
    : allPhotos.filter(p => p.roomName === galleryRoomFilter);

  const getRoomIcon = (nome: string) => {
    const lower = nome.toLowerCase();
    if (lower.includes('dormitório') || lower.includes('dormitorio') || lower.includes('quarto') || lower.includes('suíte') || lower.includes('suite')) {
      return <Bed className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    }
    if (lower.includes('banheiro') || lower.includes('lavabo') || lower.includes('wc')) {
      return <Bath className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
    }
    if (lower.includes('sala') || lower.includes('estar') || lower.includes('jantar')) {
      return <Sofa className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
    if (lower.includes('cozinha') || lower.includes('copa')) {
      return <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
    if (lower.includes('garagem') || lower.includes('vaga')) {
      return <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
    return <Building2 className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
                {vistoria.tipo}
              </span>
              <h2 className="text-xl font-bold">{vistoria.codigoVistoria}</h2>
              <span className="text-xs text-slate-400">
                • {new Date(vistoria.dataVistoria || vistoria.dataCriacao).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {vistoria.imovel.endereco}, nº {vistoria.imovel.numero} {vistoria.imovel.complemento || ''} - {vistoria.imovel.bairro}, {vistoria.imovel.cidade}/{vistoria.imovel.estado}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBaixarPdf}
              disabled={isGerandoPdf}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isGerandoPdf ? 'Gerando PDF...' : 'Baixar Laudo PDF'}
            </button>

            <button
              onClick={onEditar}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700"
            >
              Editar
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-5 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('ambientes')}
            className={`py-3 border-b-2 font-semibold transition-colors ${
              activeTab === 'ambientes'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Cômodos & Checklist ({vistoria.ambientes.length} Ambientes / {totalItens} Itens)
          </button>

          <button
            onClick={() => setActiveTab('galeria')}
            className={`py-3 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'galeria'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-blue-500" />
            Galeria do Laudo ({allPhotos.length} Fotos)
          </button>

          <button
            onClick={() => setActiveTab('imovel')}
            className={`py-3 border-b-2 font-semibold transition-colors ${
              activeTab === 'imovel'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Imóvel, Partes & Medidores
          </button>

          <button
            onClick={() => setActiveTab('ia')}
            className={`py-3 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'ia'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Análise Inteligente por IA
          </button>

          <button
            onClick={() => setActiveTab('assinaturas')}
            className={`py-3 border-b-2 font-semibold transition-colors ${
              activeTab === 'assinaturas'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Assinaturas ({vistoria.assinaturas?.length || 0})
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Header Banner com Logo Oficial do Laudo */}
          <div className="bg-white dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 text-center sm:text-left">
              <img 
                src={getSafeLogoSrc(empresa?.logoUrl)}
                alt={empresa?.nomeFantasia || 'Antonio Furtado Consultor Imobiliário'}
                className="max-h-12 sm:max-h-14 w-auto object-contain"
                onError={(e) => { e.currentTarget.src = LOCAL_LOGO_URL; }}
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#0B2240] dark:text-amber-400">
                  {empresa?.nomeFantasia || 'Antonio Furtado Consultor Imobiliário'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  CRECI: {empresa?.creci || '208024'} • CNPJ: {empresa?.cnpj || 'Não informado'}
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Contato & Agendamentos:</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {empresa?.telefone || '(11) 96904-3012'}
              </span>
            </div>
          </div>
          
          {/* TAB 1: AMBIENTES */}
          {activeTab === 'ambientes' && (
            <div className="space-y-6">
              
              {/* Summary stats bar */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Status Geral: </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{vistoria.status}</span>
                </div>
                <div>
                  <span className="text-slate-500">Total de Cômodos: </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{vistoria.ambientes.length}</span>
                </div>
                <div>
                  <span className="text-slate-500">Dormitórios: </span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{totalDormitorios} quarto(s)</span>
                </div>
                <div>
                  <span className="text-slate-500">Itens Verificados: </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{totalItens}</span>
                </div>
                <div>
                  <span className="text-slate-500">Avarias Identificadas: </span>
                  <span className={`font-bold ${totalAvarias > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {totalAvarias}
                  </span>
                </div>
              </div>

              {/* Room Accordions / Blocks */}
              {vistoria.ambientes.map((ambiente, idx) => (
                <div
                  key={ambiente.id}
                  className="bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm"
                >
                  <div className="bg-slate-100 dark:bg-slate-800/80 p-3.5 px-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getRoomIcon(ambiente.nome)}
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {idx + 1}. {ambiente.nome}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500">
                      {ambiente.itens.length} itens checados
                    </span>
                  </div>

                  <div className="p-4 space-y-4">
                    {ambiente.observacoesGerais && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        💬 Obs. do Cômodo: {ambiente.observacoesGerais}
                      </p>
                    )}

                    {/* Items table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 font-semibold text-slate-500 uppercase text-[10px]">
                          <tr>
                            <th className="p-2.5">Item</th>
                            <th className="p-2.5">Estado</th>
                            <th className="p-2.5">Apontamento / Observação</th>
                            <th className="p-2.5">Fotos</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {ambiente.itens.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="p-2.5 font-medium text-slate-900 dark:text-white">
                                {item.nome}
                              </td>
                              <td className="p-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                    item.estado === 'Novo'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : item.estado === 'Bom'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                      : item.estado === 'Regular'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                      : item.estado === 'Avaria'
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {item.estado}
                                </span>
                              </td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-300">
                                {item.observacoes || 'Sem observações'}
                              </td>
                              <td className="p-2.5">
                                {item.fotos && item.fotos.length > 0 ? (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {item.fotos.map((f) => {
                                      const photoIndex = allPhotos.findIndex(p => p.id === f.id);
                                      return (
                                        <button
                                          key={f.id}
                                          type="button"
                                          onClick={() => setLightboxIndex(photoIndex >= 0 ? photoIndex : 0)}
                                          className="group relative w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all flex-shrink-0 bg-slate-900"
                                          title={f.descricao || 'Ver foto ampliada'}
                                        >
                                          <img
                                            src={f.url}
                                            alt={f.descricao || item.nome}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                            referrerPolicy="no-referrer"
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                                            <Maximize2 className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </div>
                                        </button>
                                      );
                                    })}
                                    <span className="text-[10px] text-slate-500 font-medium">({item.fotos.length})</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">Sem foto</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Room & Item Photos Organized Horizontally */}
                    {(() => {
                      const roomPhotos = [
                        ...(ambiente.fotosGerais || []).map(f => ({ ...f, origin: 'Visão Geral' })),
                        ...ambiente.itens.flatMap(i => (i.fotos || []).map(f => ({ ...f, origin: `Item: ${i.nome}` })))
                      ];

                      if (roomPhotos.length === 0) return null;

                      return (
                        <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <Camera className="w-3.5 h-3.5 text-blue-500" />
                              Fotos do Cômodo Organizadas Horizontais ({roomPhotos.length} foto(s))
                            </p>
                            <span className="text-[10px] text-slate-500">Deslize lateralmente para ver todas</span>
                          </div>
                          <div className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-thin">
                            {roomPhotos.map((ft) => {
                              const photoIndex = allPhotos.findIndex(p => p.id === ft.id);
                              return (
                                <button
                                  key={ft.id}
                                  type="button"
                                  onClick={() => setLightboxIndex(photoIndex >= 0 ? photoIndex : 0)}
                                  className="group flex-shrink-0 w-44 sm:w-52 text-left rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm flex flex-col justify-between"
                                >
                                  <div className="relative aspect-video w-full overflow-hidden">
                                    <img
                                      src={ft.url}
                                      alt={ft.descricao || ft.origin}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                      <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-white font-semibold text-[9px] border border-white/20">
                                      {ft.origin}
                                    </span>
                                  </div>
                                  <div className="p-2 bg-slate-900 text-slate-200 text-[10px] space-y-0.5">
                                    <p className="font-medium line-clamp-1">{ft.descricao || 'Sem legenda'}</p>
                                    {ft.dataHora && (
                                      <p className="text-[9px] text-slate-400">Registrado em: {new Date(ft.dataHora).toLocaleDateString('pt-BR')}</p>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                </div>
              ))}

            </div>
          )}

          {/* TAB: GALERIA DO LAUDO */}
          {activeTab === 'galeria' && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-500" />
                    Galeria Fotográfica do Laudo de Vistoria
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Exibição em alta resolução de todas as fotos dos cômodos e componentes.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs">
                    {allPhotos.length} fotos salvas
                  </span>
                </div>
              </div>

              {/* Room Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setGalleryRoomFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    galleryRoomFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Todas as Fotos ({allPhotos.length})
                </button>
                {vistoria.ambientes.map((a) => {
                  const roomPhotoCount = allPhotos.filter(p => p.roomName === a.nome).length;
                  if (roomPhotoCount === 0) return null;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setGalleryRoomFilter(a.nome)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                        galleryRoomFilter === a.nome
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {getRoomIcon(a.nome)}
                      <span>{a.nome}</span>
                      <span className="opacity-75 text-[10px]">({roomPhotoCount})</span>
                    </button>
                  );
                })}
              </div>

              {/* Photos Grid */}
              {filteredPhotos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredPhotos.map((photo) => {
                    const originalIndex = allPhotos.findIndex(p => p.id === photo.id);
                    return (
                      <div
                        key={photo.id}
                        onClick={() => setLightboxIndex(originalIndex >= 0 ? originalIndex : 0)}
                        className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
                      >
                        <div className="relative aspect-video bg-slate-900 overflow-hidden">
                          <img
                            src={photo.url}
                            alt={photo.descricao || photo.roomName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                            <span className="px-3 py-1.5 bg-black/70 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" />
                              Ampliar Foto
                            </span>
                          </div>
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-sm text-white font-semibold text-[10px] border border-white/20">
                            {photo.roomName}
                          </span>
                        </div>
                        <div className="p-3 space-y-1 flex-1 flex flex-col justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-xs">
                              {photo.itemNome ? `Item: ${photo.itemNome}` : photo.tipo}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                              {photo.descricao || 'Foto sem descrição adicional'}
                            </p>
                          </div>
                          {photo.dataHora && (
                            <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                              Data: {new Date(photo.dataHora).toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Nenhuma foto cadastrada para este filtro de cômodo.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMÓVEL E PARTES */}
          {activeTab === 'imovel' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Imóvel info */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    Dados do Imóvel Inspecionado
                  </h3>
                  <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                    <p><strong className="text-slate-900 dark:text-white">Código/Ref:</strong> {vistoria.imovel.codigoRef}</p>
                    <p><strong className="text-slate-900 dark:text-white">Tipo:</strong> {vistoria.imovel.tipo}</p>
                    <p><strong className="text-slate-900 dark:text-white">Endereço:</strong> {vistoria.imovel.endereco}, {vistoria.imovel.numero} {vistoria.imovel.complemento || ''}</p>
                    <p><strong className="text-slate-900 dark:text-white">Bairro:</strong> {vistoria.imovel.bairro}</p>
                    <p><strong className="text-slate-900 dark:text-white">Cidade/UF:</strong> {vistoria.imovel.cidade}/{vistoria.imovel.estado} (CEP: {vistoria.imovel.cep})</p>
                  </div>
                </div>

                {/* Envolvidos */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-500" />
                    Partes Envolvidas
                  </h3>
                  <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                    <div>
                      <strong className="text-slate-900 dark:text-white">Inquilino (Locatário):</strong> {vistoria.inquilinoNome}
                      {vistoria.inquilinoCpf && <p className="text-[11px] text-slate-500">CPF: {vistoria.inquilinoCpf}</p>}
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white">Proprietário (Locador):</strong> {vistoria.imovel.proprietarioNome}
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white">Vistoriador Perito:</strong> {vistoria.vistoriadorNome}
                      {vistoria.vistoriadorCreci && <p className="text-[11px] text-slate-500">Registro: {vistoria.vistoriadorCreci}</p>}
                    </div>
                  </div>
                </div>

              </div>

              {/* Contadores */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  ⚡ Medidores / Leitura de Contadores
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {vistoria.contadores.map((c, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-white text-xs">{c.tipo}</p>
                      <p className="text-xs text-slate-500">Medidor: {c.numeroContador || 'Não especificado'}</p>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{c.leitura}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ANÁLISE IA */}
          {activeTab === 'ia' && (
            <div className="space-y-6">
              
              <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 p-5 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    Diagnóstico Inteligente por IA (Gemini)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Geração de síntese técnica, sugestões contratuais e identificação de pontos de atenção.
                  </p>
                </div>
                <button
                  onClick={handleGerarIa}
                  disabled={isAnalisandoIa}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isAnalisandoIa ? 'animate-spin' : ''}`} />
                  {isAnalisandoIa ? 'Analisando Vistoria...' : 'Regerar Análise IA'}
                </button>
              </div>

              {vistoria.analiseIa ? (
                <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
                  
                  {/* Resumo Executivo */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Resumo Executivo do Laudo:</h4>
                    <p className="leading-relaxed text-slate-600 dark:text-slate-300">{vistoria.analiseIa.resumoExecutivo}</p>
                  </div>

                  {/* Pontos Críticos */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="font-bold text-rose-600 dark:text-rose-400 text-sm flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Pontos de Atenção / Avarias Identificadas:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                      {vistoria.analiseIa.pontosCriticos?.map((ponto, i) => (
                        <li key={i}>{ponto}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Sugestões de Contrato */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Recomendações Contratuais:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                      {vistoria.analiseIa.sugestoesContrato?.map((sug, i) => (
                        <li key={i}>{sug}</li>
                      ))}
                    </ul>
                  </div>

                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <Sparkles className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Nenhuma análise de IA gerada ainda para esta vistoria.
                  </p>
                  <p className="text-xs text-slate-500">
                    Clique no botão acima para sintetizar os apontamentos automaticamente com Gemini.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: ASSINATURAS */}
          {activeTab === 'assinaturas' && (
            <div className="space-y-6">
              
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  ✍️ Registro de Assinaturas e Aceites
                </h3>
                <p className="text-xs text-slate-500">
                  Validação legal e aceite das partes referente às fotos e estado dos itens.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vistoria.assinaturas?.map((ass, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {ass.papel}
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{ass.nome}</p>
                    <p className="text-xs text-slate-500">{ass.documento || 'Sem documento informado'}</p>
                    {ass.dataHora && (
                      <p className="text-[10px] text-slate-400">
                        Assinado em: {new Date(ass.dataHora).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Última atualização: {new Date(vistoria.dataAtualizacao || vistoria.dataCriacao).toLocaleString('pt-BR')}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium"
          >
            Fechar
          </button>
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && allPhotos[lightboxIndex] && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in">
          {/* Header Bar */}
          <div className="flex items-center justify-between text-white border-b border-white/10 pb-3">
            <div>
              <span className="px-2 py-0.5 rounded bg-blue-600 text-[10px] font-bold uppercase tracking-wider">
                {allPhotos[lightboxIndex].roomName}
              </span>
              <h3 className="text-sm sm:text-base font-bold mt-1">
                {allPhotos[lightboxIndex].itemNome ? `Item: ${allPhotos[lightboxIndex].itemNome}` : allPhotos[lightboxIndex].tipo}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                Foto {lightboxIndex + 1} de {allPhotos.length}
              </span>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Image Container with Prev / Next */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            {lightboxIndex > 0 && (
              <button
                type="button"
                onClick={() => setLightboxIndex(lightboxIndex - 1)}
                className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/20 transition-transform active:scale-95"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={allPhotos[lightboxIndex].url}
              alt={allPhotos[lightboxIndex].descricao || 'Foto ampliada'}
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
            />

            {lightboxIndex < allPhotos.length - 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex(lightboxIndex + 1)}
                className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/20 transition-transform active:scale-95"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Caption Bar */}
          <div className="bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4 text-white text-xs space-y-1 max-w-3xl mx-auto w-full">
            {allPhotos[lightboxIndex].descricao ? (
              <p className="font-medium text-slate-200">
                💬 {allPhotos[lightboxIndex].descricao}
              </p>
            ) : (
              <p className="text-slate-400 italic">Sem descrição adicional registrada para esta foto.</p>
            )}
            {allPhotos[lightboxIndex].dataHora && (
              <p className="text-[10px] text-slate-400">
                Data do Registro: {new Date(allPhotos[lightboxIndex].dataHora!).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
