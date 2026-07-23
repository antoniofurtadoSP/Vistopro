import React, { useState } from 'react';
import { 
  X, Plus, Trash2, Camera, Check, ChevronRight, ChevronLeft, 
  Building2, User, FileText, CheckCircle2, ShieldCheck, Upload,
  Bed, Bath, Sofa, Utensils, Car, Copy, PlusCircle, Layers
} from 'lucide-react';
import { Vistoria, TipoVistoria, StatusVistoria, Ambiente, ItemAmbiente, EstadoItem } from '../types';

interface VistoriaFormModalProps {
  initialVistoria?: Vistoria | null;
  onSave: (vistoria: Vistoria) => void;
  onClose: () => void;
}

const DEFAULT_ROOMS_PRESETS = [
  'Sala de Estar',
  'Cozinha',
  'Suíte Principal',
  'Dormitório 1',
  'Dormitório 2',
  'Banheiro Social',
  'Varanda / Sacada',
  'Área de Serviço',
  'Garagem',
];

const DEFAULT_ITEMS_PRESETS = [
  'Paredes & Pintura',
  'Teto & Gesso',
  'Piso & Rodapés',
  'Portas & Fechaduras',
  'Janelas & Vidros',
  'Tomadas & Iluminação',
  'Pia & Torneira',
];

const DORMITORIO_ITEMS_PRESET = [
  'Paredes & Pintura',
  'Teto & Gesso',
  'Piso & Rodapés',
  'Porta, Fechadura & Chaves',
  'Janela, Vidros & Persiana',
  'Tomadas, Interruptores & Iluminação',
  'Guarda-Roupa / Armário Embutido',
  'Ar Condicionado / Ventilador',
];

export const VistoriaFormModal: React.FC<VistoriaFormModalProps> = ({
  initialVistoria,
  onSave,
  onClose,
}) => {
  const [step, setStep] = useState<number>(1);
  const [customRoomName, setCustomRoomName] = useState<string>('');
  const [showCustomRoomInput, setShowCustomRoomInput] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<Vistoria>(() => {
    if (initialVistoria) return { ...initialVistoria };
    return {
      id: '',
      codigoVistoria: `VIS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      tipo: 'Entrada',
      status: 'Concluída',
      dataVistoria: new Date().toISOString(),
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      imovel: {
        id: 'imv-' + Date.now(),
        codigoRef: 'APT-101',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '',
        tipo: 'Apartamento',
        qtdDormitorios: 3,
        proprietarioNome: '',
      },
      inquilinoNome: '',
      inquilinoCpf: '',
      inquilinoTelefone: '',
      inquilinoEmail: '',
      vistoriadorNome: 'Vistoriador Perito',
      vistoriadorCreci: 'CRECI 123456-F',
      contadores: [
        { tipo: 'Energia', leitura: '', numeroContador: '' },
        { tipo: 'Água', leitura: '', numeroContador: '' },
        { tipo: 'Gás', leitura: '', numeroContador: '' },
      ],
      ambientes: DEFAULT_ROOMS_PRESETS.map((nome, idx) => ({
        id: `amb-${idx + 1}`,
        nome,
        fotosGerais: [],
        itens: (nome.toLowerCase().includes('dormitório') || nome.toLowerCase().includes('suíte')
          ? DORMITORIO_ITEMS_PRESET
          : DEFAULT_ITEMS_PRESETS
        ).map((itemNome, itemIdx) => ({
          id: `it-${idx + 1}-${itemIdx + 1}`,
          nome: itemNome,
          estado: 'Bom' as EstadoItem,
          observacoes: 'Em bom estado de conservação.',
          fotos: [],
        })),
      })),
      assinaturas: [
        { papel: 'Vistoriador', nome: 'Vistoriador Perito', documento: 'CRECI 123456-F' },
        { papel: 'Inquilino', nome: '', documento: '' },
      ],
      observacoesFinais: '',
    };
  });

  // Count current dormitories/suites
  const totalDormitoriosCount = formData.ambientes.filter(a => {
    const lower = a.nome.toLowerCase();
    return lower.includes('dormitório') || lower.includes('dormitorio') || lower.includes('quarto') || lower.includes('suíte') || lower.includes('suite');
  }).length;

  // Handle Photo File Upload
  const handlePhotoUpload = (ambienteId: string, itemId?: string, e?: React.ChangeEvent<HTMLInputElement>) => {
    const files = e?.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        setFormData((prev) => {
          const updatedAmbientes = prev.ambientes.map((amb) => {
            if (amb.id !== ambienteId) return amb;

            if (itemId) {
              const updatedItens = amb.itens.map((it) => {
                if (it.id !== itemId) return it;
                return {
                  ...it,
                  fotos: [
                    ...it.fotos,
                    {
                      id: 'ft-' + Date.now() + Math.random(),
                      url,
                      descricao: file.name,
                      dataHora: new Date().toISOString(),
                    },
                  ],
                };
              });
              return { ...amb, itens: updatedItens };
            } else {
              return {
                ...amb,
                fotosGerais: [
                  ...amb.fotosGerais,
                  {
                    id: 'ft-' + Date.now() + Math.random(),
                    url,
                    descricao: file.name,
                    dataHora: new Date().toISOString(),
                  },
                ],
              };
            }
          });
          return { ...prev, ambientes: updatedAmbientes };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Add Room with preset or custom items
  const handleAddAmbiente = (nomeRoom: string, isDorm: boolean = false) => {
    if (!nomeRoom.trim()) return;
    const itemsList = isDorm || nomeRoom.toLowerCase().includes('dormitório') || nomeRoom.toLowerCase().includes('suíte') || nomeRoom.toLowerCase().includes('quarto')
      ? DORMITORIO_ITEMS_PRESET
      : DEFAULT_ITEMS_PRESETS;

    const newRoom: Ambiente = {
      id: 'amb-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      nome: nomeRoom,
      fotosGerais: [],
      itens: itemsList.map((itemNome, i) => ({
        id: `it-${Date.now()}-${i}`,
        nome: itemNome,
        estado: 'Bom',
        observacoes: 'Em bom estado de conservação.',
        fotos: [],
      })),
    };
    setFormData((prev) => ({
      ...prev,
      ambientes: [...prev.ambientes, newRoom],
    }));
  };

  // Add Dormitorio sequentially
  const handleAddDormitorio = (tipo: 'Dormitório' | 'Suíte') => {
    setFormData((prev) => {
      let roomName = '';
      if (tipo === 'Suíte') {
        const suiteCount = prev.ambientes.filter(a => a.nome.toLowerCase().includes('suíte') || a.nome.toLowerCase().includes('suite')).length;
        roomName = suiteCount === 0 ? 'Suíte Principal' : `Suíte ${suiteCount + 1}`;
      } else {
        const dormCount = prev.ambientes.filter(a => 
          a.nome.toLowerCase().includes('dormitório') || 
          a.nome.toLowerCase().includes('dormitorio') ||
          a.nome.toLowerCase().includes('quarto')
        ).length;
        roomName = `Dormitório ${dormCount + 1}`;
      }

      const newRoom: Ambiente = {
        id: 'amb-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        nome: roomName,
        fotosGerais: [],
        itens: DORMITORIO_ITEMS_PRESET.map((itemNome, i) => ({
          id: `it-${Date.now()}-${i}`,
          nome: itemNome,
          estado: 'Bom',
          observacoes: 'Em bom estado de conservação.',
          fotos: [],
        })),
      };

      const updatedCount = (prev.imovel.qtdDormitorios || 0) + 1;

      return {
        ...prev,
        imovel: {
          ...prev.imovel,
          qtdDormitorios: updatedCount,
        },
        ambientes: [...prev.ambientes, newRoom],
      };
    });
  };

  // Set exact quantity of dormitories for the property
  const handleSetQtdDormitorios = (targetCount: number) => {
    setFormData((prev) => {
      const existingDormRooms = prev.ambientes.filter(a => {
        const l = a.nome.toLowerCase();
        return l.includes('dormitório') || l.includes('dormitorio') || l.includes('quarto') || l.includes('suíte') || l.includes('suite');
      });

      let updatedAmbientes = [...prev.ambientes];

      if (existingDormRooms.length < targetCount) {
        const needed = targetCount - existingDormRooms.length;
        for (let i = 0; i < needed; i++) {
          const currentTotal = existingDormRooms.length + i + 1;
          const name = currentTotal === 1 && !existingDormRooms.some(r => r.nome.includes('Suíte'))
            ? 'Suíte Principal'
            : `Dormitório ${currentTotal}`;

          updatedAmbientes.push({
            id: 'amb-' + Date.now() + '-' + i,
            nome: name,
            fotosGerais: [],
            itens: DORMITORIO_ITEMS_PRESET.map((itemNome, itemIdx) => ({
              id: `it-${Date.now()}-${i}-${itemIdx}`,
              nome: itemNome,
              estado: 'Bom',
              observacoes: 'Em bom estado de conservação.',
              fotos: [],
            })),
          });
        }
      }

      return {
        ...prev,
        imovel: {
          ...prev.imovel,
          qtdDormitorios: targetCount,
        },
        ambientes: updatedAmbientes,
      };
    });
  };

  // Duplicate an existing room
  const handleDuplicateAmbiente = (ambienteId: string) => {
    setFormData((prev) => {
      const target = prev.ambientes.find(a => a.id === ambienteId);
      if (!target) return prev;

      const timestamp = Date.now();
      const cloned: Ambiente = {
        id: 'amb-' + timestamp,
        nome: `${target.nome} (Cópia)`,
        fotosGerais: [],
        itens: target.itens.map((it, i) => ({
          ...it,
          id: `it-${timestamp}-${i}`,
          fotos: [],
        })),
      };

      return {
        ...prev,
        ambientes: [...prev.ambientes, cloned],
      };
    });
  };

  // Add Item to Room
  const handleAddItemToRoom = (ambienteId: string, itemNome: string) => {
    if (!itemNome.trim()) return;
    setFormData((prev) => {
      const ambList = prev.ambientes.map((amb) => {
        if (amb.id !== ambienteId) return amb;
        return {
          ...amb,
          itens: [
            ...amb.itens,
            {
              id: 'it-' + Date.now(),
              nome: itemNome,
              estado: 'Bom' as EstadoItem,
              observacoes: '',
              fotos: [],
            },
          ],
        };
      });
      return { ...prev, ambientes: ambList };
    });
  };

  // Get Room Icon
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

  const handleFinish = () => {
    if (!formData.imovel.endereco || !formData.inquilinoNome) {
      alert('Por favor, preencha ao menos o endereço do imóvel e o nome do inquilino.');
      setStep(1);
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold">
              {initialVistoria ? 'Editar Laudo de Vistoria' : 'Nova Vistoria de Imóvel'}
            </h2>
            <p className="text-xs text-slate-400">
              Passo {step} de 3 • {step === 1 ? 'Dados do Imóvel & Dormitórios' : step === 2 ? 'Inspecionar Cômodos & Checklist' : 'Finalizar & Salvar'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps indicator */}
        <div className="bg-slate-100 dark:bg-slate-800/60 px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-semibold">
          <div className={`flex items-center gap-2 ${step === 1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-[10px]">1</span>
            Imóvel e Dormitórios
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <div className={`flex items-center gap-2 ${step === 2 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-[10px]">2</span>
            Cômodos ({formData.ambientes.length})
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <div className={`flex items-center gap-2 ${step === 3 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-[10px]">3</span>
            Assinaturas & Concluir
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: DADOS GERAIS E ESTRUTURA DO IMÓVEL */}
          {step === 1 && (
            <div className="space-y-6">
              
              {/* Tipo e Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Vistoria *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoVistoria })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
                  >
                    <option value="Entrada">Vistoria de Entrada</option>
                    <option value="Saída">Vistoria de Saída</option>
                    <option value="Periódica">Vistoria Periódica</option>
                    <option value="Conferência">Vistoria de Conferência</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status do Laudo
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusVistoria })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
                  >
                    <option value="Concluída">Concluída</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Rascunho">Rascunho</option>
                  </select>
                </div>
              </div>

              {/* Endereço do Imóvel */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  Dados do Imóvel Inspecionado
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Endereço *</label>
                    <input
                      type="text"
                      placeholder="Ex: Rua das Flores"
                      value={formData.imovel.endereco}
                      onChange={(e) => setFormData({ ...formData, imovel: { ...formData.imovel, endereco: e.target.value } })}
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Número *</label>
                    <input
                      type="text"
                      placeholder="Ex: 500"
                      value={formData.imovel.numero}
                      onChange={(e) => setFormData({ ...formData, imovel: { ...formData.imovel, numero: e.target.value } })}
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Complemento</label>
                    <input
                      type="text"
                      placeholder="Apto 32"
                      value={formData.imovel.complemento || ''}
                      onChange={(e) => setFormData({ ...formData, imovel: { ...formData.imovel, complemento: e.target.value } })}
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Bairro</label>
                    <input
                      type="text"
                      placeholder="Jardins"
                      value={formData.imovel.bairro}
                      onChange={(e) => setFormData({ ...formData, imovel: { ...formData.imovel, bairro: e.target.value } })}
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Cidade / UF</label>
                    <input
                      type="text"
                      placeholder="São Paulo / SP"
                      value={`${formData.imovel.cidade}/${formData.imovel.estado}`}
                      onChange={(e) => {
                        const parts = e.target.value.split('/');
                        setFormData({
                          ...formData,
                          imovel: {
                            ...formData.imovel,
                            cidade: parts[0] || 'São Paulo',
                            estado: parts[1] || 'SP',
                          },
                        });
                      }}
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Código Ref.</label>
                    <input
                      type="text"
                      placeholder="APT-302"
                      value={formData.imovel.codigoRef}
                      onChange={(e) => setFormData({ ...formData, imovel: { ...formData.imovel, codigoRef: e.target.value } })}
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO DORMITÓRIOS & TIPO DO IMÓVEL */}
              <div className="bg-purple-50/70 dark:bg-purple-950/30 p-4 rounded-xl border border-purple-200 dark:border-purple-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-purple-950 dark:text-purple-300 uppercase tracking-wider flex items-center gap-2">
                    <Bed className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Dormitórios & Quartos do Imóvel
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold">
                    {totalDormitoriosCount} Dormitório(s) Configurado(s)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-purple-900 dark:text-purple-300 mb-1.5">
                      Tipo de Imóvel
                    </label>
                    <select
                      value={formData.imovel.tipo}
                      onChange={(e) => setFormData({
                        ...formData,
                        imovel: { ...formData.imovel, tipo: e.target.value as any }
                      })}
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800/80 rounded text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Apartamento">Apartamento</option>
                      <option value="Casa">Casa Residencial</option>
                      <option value="Sobrado">Sobrado</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Terreno">Terreno / Galpão</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-purple-900 dark:text-purple-300 mb-1.5">
                      Quantidade de Dormitórios (Quartos)
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => handleSetQtdDormitorios(n)}
                          className={`flex-1 py-1.5 rounded text-xs font-bold transition-all border ${
                            (formData.imovel.qtdDormitorios === n || (n === 5 && (formData.imovel.qtdDormitorios || 0) >= 5))
                              ? 'bg-purple-600 text-white border-purple-600 shadow'
                              : 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40'
                          }`}
                        >
                          {n === 5 ? '5+' : `${n}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-purple-200/60 dark:border-purple-800/40 text-xs">
                  <span className="text-purple-800 dark:text-purple-300 text-[11px]">
                    💡 Altere a quantidade acima para adicionar automaticamente os dormitórios com a lista técnica de vistoria completa.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddDormitorio('Dormitório')}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Adicionar 1 Dormitório
                  </button>
                </div>
              </div>

              {/* Partes Envolvidas */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-500" />
                  Inquilino, Proprietário e Vistoriador
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Nome do Inquilino (Locatário) *</label>
                    <input
                      type="text"
                      placeholder="Ex: Carlos Eduardo Oliveira"
                      value={formData.inquilinoNome}
                      onChange={(e) => setFormData({ ...formData, inquilinoNome: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">CPF do Inquilino</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.inquilinoCpf || ''}
                      onChange={(e) => setFormData({ ...formData, inquilinoCpf: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Proprietário (Locador)</label>
                    <input
                      type="text"
                      placeholder="Dr. Roberto Mendonça"
                      value={formData.imovel.proprietarioNome}
                      onChange={(e) => setFormData({ ...formData, imovel: { ...formData.imovel, proprietarioNome: e.target.value } })}
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Nome do Vistoriador</label>
                    <input
                      type="text"
                      placeholder="Juliana Paes"
                      value={formData.vistoriadorNome}
                      onChange={(e) => setFormData({ ...formData, vistoriadorNome: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: AMBIENTES E CHECKLIST */}
          {step === 2 && (
            <div className="space-y-6">
              
              {/* Quick Add Bar for Rooms */}
              <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-500" />
                      Adicionar Cômodos Rapidamente
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Escolha um cômodo pré-configurado com lista de checagem técnica ou crie um personalizado:
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    Total: {formData.ambientes.length} cômodo(s)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* Dedicated Dormitorio & Suite buttons */}
                  <button
                    type="button"
                    onClick={() => handleAddDormitorio('Dormitório')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                  >
                    <Bed className="w-3.5 h-3.5" />
                    + Adicionar Dormitório
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddDormitorio('Suíte')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                  >
                    <Bed className="w-3.5 h-3.5" />
                    + Adicionar Suíte
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddAmbiente('Banheiro Social')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
                  >
                    <Bath className="w-3.5 h-3.5 text-cyan-500" />
                    + Banheiro
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddAmbiente('Sala de Estar')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
                  >
                    <Sofa className="w-3.5 h-3.5 text-amber-500" />
                    + Sala
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddAmbiente('Cozinha')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
                  >
                    <Utensils className="w-3.5 h-3.5 text-emerald-500" />
                    + Cozinha
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddAmbiente('Garagem / Vaga')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
                  >
                    <Car className="w-3.5 h-3.5 text-blue-500" />
                    + Garagem
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCustomRoomInput(!showCustomRoomInput)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Outro Cômodo...
                  </button>
                </div>

                {/* Inline Custom Room Name */}
                {showCustomRoomInput && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <input
                      type="text"
                      placeholder="Nome do cômodo (ex: Escritório, Varanda Gourmet, Closet...)"
                      value={customRoomName}
                      onChange={(e) => setCustomRoomName(e.target.value)}
                      className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-900 dark:text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customRoomName) {
                          handleAddAmbiente(customRoomName);
                          setCustomRoomName('');
                          setShowCustomRoomInput(false);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customRoomName) {
                          handleAddAmbiente(customRoomName);
                          setCustomRoomName('');
                          setShowCustomRoomInput(false);
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-500"
                    >
                      Adicionar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomRoomInput(false)}
                      className="px-2 py-2 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              {/* List of Rooms */}
              <div className="space-y-6">
                {formData.ambientes.map((amb) => (
                  <div key={amb.id} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                    
                    {/* Room Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 flex-1">
                        {getRoomIcon(amb.nome)}
                        <input
                          type="text"
                          value={amb.nome}
                          onChange={(e) => {
                            const updated = formData.ambientes.map((a) => (a.id === amb.id ? { ...a, nome: e.target.value } : a));
                            setFormData({ ...formData, ambientes: updated });
                          }}
                          className="font-bold text-slate-900 dark:text-white text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none flex-1 max-w-xs"
                        />
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                          {amb.itens.length} itens
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Duplicate Room */}
                        <button
                          type="button"
                          onClick={() => handleDuplicateAmbiente(amb.id)}
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          title="Duplicar este cômodo com toda sua lista de itens"
                        >
                          <Copy className="w-3 h-3" />
                          Duplicar Cômodo
                        </button>

                        <span className="text-slate-300 dark:text-slate-700">|</span>

                        {/* Add Item to this room */}
                        <button
                          type="button"
                          onClick={() => {
                            const itemName = prompt(`Adicionar item ao cômodo "${amb.nome}":`);
                            if (itemName) handleAddItemToRoom(amb.id, itemName);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                        >
                          <Plus className="w-3 h-3" />
                          + Item
                        </button>

                        <span className="text-slate-300 dark:text-slate-700">|</span>

                        {/* Remove Room */}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, ambientes: formData.ambientes.filter((a) => a.id !== amb.id) });
                          }}
                          className="text-rose-600 text-[11px] hover:underline font-medium"
                        >
                          Remover
                        </button>
                      </div>
                    </div>

                    {/* Room items checklist */}
                    <div className="space-y-3">
                      {amb.itens.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <input
                              type="text"
                              value={item.nome}
                              onChange={(e) => {
                                const ambList = formData.ambientes.map((a) => {
                                  if (a.id !== amb.id) return a;
                                  return {
                                    ...a,
                                    itens: a.itens.map((it) => (it.id === item.id ? { ...it, nome: e.target.value } : it)),
                                  };
                                });
                                setFormData({ ...formData, ambientes: ambList });
                              }}
                              className="font-semibold text-xs text-slate-800 dark:text-slate-200 bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none"
                            />

                            {/* State Radio Buttons */}
                            <div className="flex items-center gap-1">
                              {(['Novo', 'Bom', 'Regular', 'Avaria', 'NA'] as EstadoItem[]).map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => {
                                    const ambList = formData.ambientes.map((a) => {
                                      if (a.id !== amb.id) return a;
                                      return {
                                        ...a,
                                        itens: a.itens.map((it) => (it.id === item.id ? { ...it, estado: st } : it)),
                                      };
                                    });
                                    setFormData({ ...formData, ambientes: ambList });
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                                    item.estado === st
                                      ? st === 'Avaria'
                                        ? 'bg-rose-600 text-white'
                                        : st === 'Novo'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-blue-600 text-white'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Observação e Foto input */}
                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <input
                              type="text"
                              placeholder="Observações do item (ex: furos, riscos, manchas, trincas...)"
                              value={item.observacoes}
                              onChange={(e) => {
                                const ambList = formData.ambientes.map((a) => {
                                  if (a.id !== amb.id) return a;
                                  return {
                                    ...a,
                                    itens: a.itens.map((it) => (it.id === item.id ? { ...it, observacoes: e.target.value } : it)),
                                  };
                                });
                                setFormData({ ...formData, ambientes: ambList });
                              }}
                              className="flex-1 p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                            />

                            {/* Photo Upload for Item */}
                            <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              <Camera className="w-3.5 h-3.5 text-blue-500" />
                              <span>{item.fotos.length > 0 ? `${item.fotos.length} Foto(s)` : 'Foto'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                multiple
                                onChange={(e) => handlePhotoUpload(amb.id, item.id, e)}
                                className="hidden"
                              />
                            </label>

                            {/* Remove Item */}
                            <button
                              type="button"
                              onClick={() => {
                                const ambList = formData.ambientes.map((a) => {
                                  if (a.id !== amb.id) return a;
                                  return {
                                    ...a,
                                    itens: a.itens.filter((it) => it.id !== item.id),
                                  };
                                });
                                setFormData({ ...formData, ambientes: ambList });
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Excluir item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* STEP 3: FINALIZAR E ASSINATURA */}
          {step === 3 && (
            <div className="space-y-6">
              
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                <h3 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Pronto para Gerar Laudo de Vistoria
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-400">
                  Resumo: Imóvel com <strong>{totalDormitoriosCount} dormitório(s)</strong> e <strong>{formData.ambientes.length} cômodo(s)</strong> cadastrados no laudo de vistoria.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Observações Finais & Entrega de Chaves
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Entregues 2 pares de chaves do imóvel e 2 tags de garagem. Inquilino cientificado do laudo."
                  value={formData.observacoesFinais || ''}
                  onChange={(e) => setFormData({ ...formData, observacoesFinais: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                />
              </div>

            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
          ) : (
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-500">
              Cancelar
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-900/30"
            >
              <Check className="w-4 h-4" />
              Salvar Laudo no Banco
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
