export type TipoVistoria = 'Entrada' | 'Saída' | 'Periódica' | 'Conferência';

export type StatusVistoria = 'Rascunho' | 'Em Andamento' | 'Concluída' | 'Aprovada';

export type EstadoItem = 'Novo' | 'Bom' | 'Regular' | 'Avaria' | 'NA';

export interface FotoItem {
  id: string;
  url: string; // Base64 or object URL
  descricao?: string;
  dataHora: string;
  categoria?: string;
}

export interface ItemAmbiente {
  id: string;
  nome: string; // ex: Paredes, Pintura, Teto, Piso, Janelas, Portas, Tomadas, Iluminação, Ar Condicionado, Torneira, Armário
  estado: EstadoItem;
  observacoes: string;
  fotos: FotoItem[];
}

export interface Ambiente {
  id: string;
  nome: string; // ex: Sala de Estar, Cozinha, Suíte Principal, Banheiro Social, Varanda, Garagem
  itens: ItemAmbiente[];
  fotosGerais: FotoItem[];
  observacoesGerais?: string;
}

export interface MedicaoContador {
  tipo: 'Água' | 'Energia' | 'Gás';
  leitura: string;
  numeroContador?: string;
  fotoUrl?: string;
  dataHora?: string;
}

export interface Imovel {
  id: string;
  codigoRef: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  tipo: 'Apartamento' | 'Casa' | 'Comercial' | 'Sobrado' | 'Terreno';
  qtdDormitorios?: number;
  proprietarioNome: string;
  proprietarioContato?: string;
}

export interface Assinatura {
  papel: 'Vistoriador' | 'Inquilino' | 'Proprietário' | 'Testemunha';
  nome: string;
  documento?: string; // CPF or RG
  dataHora?: string;
  assinaturaBase64?: string;
}

export interface EmpresaInfo {
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  creci: string;
  telefone: string;
  email: string;
  endereco: string;
  logoUrl?: string;
}

export interface AnaliseIA {
  resumoExecutivo: string;
  pontosCriticos: string[];
  estimativaUrgencia: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  sugestoesContrato: string[];
  responsabilidadeSugerida?: string;
}

export interface Vistoria {
  id: string;
  codigoVistoria: string;
  tipo: TipoVistoria;
  status: StatusVistoria;
  dataVistoria: string;
  dataCriacao: string;
  dataAtualizacao: string;
  
  // Imóvel & Partes
  imovel: Imovel;
  inquilinoNome: string;
  inquilinoCpf?: string;
  inquilinoTelefone?: string;
  inquilinoEmail?: string;
  
  vistoriadorNome: string;
  vistoriadorCreci?: string;
  
  // Medições
  contadores: MedicaoContador[];
  
  // Ambientes
  ambientes: Ambiente[];
  
  // Assinaturas
  assinaturas: Assinatura[];
  
  // Análise IA
  analiseIa?: AnaliseIA;
  
  // Notas Finais
  observacoesFinais?: string;
}

export interface VistoriaFiltros {
  busca: string;
  tipo: string;
  status: string;
  cidade: string;
  dataInicio?: string;
  dataFim?: string;
}
