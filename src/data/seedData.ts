import { Vistoria, EmpresaInfo } from '../types';

export const DEFAULT_EMPRESA: EmpresaInfo = {
  nomeFantasia: 'ANTONIO FURTADO - CONSULTOR IMOBILIÁRIO',
  razaoSocial: 'Antonio Furtado Consultoria Imobiliária',
  cnpj: '34.567.890/0001-12',
  creci: '208024',
  telefone: '(11) 96904-3012',
  email: 'contato@antoniofurtado.com.br',
  endereco: 'www.antoniofurtado.com.br - São Paulo - SP',
  logoUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjQCg77zUT43bZxFpwtQv8VnbT6iNll_bgvVVG9xRlvSVzZ6IL25hl4cjtp0ZZZh3YwIlykgT0jn5SYPBIxjMSFzzmc1YwbUBmLCY8_9hVMFX6_UhlSAe_Zmmy52tkhPuFCIRUmEWccW6r493-6dX9k6lyHbXYvWieQ21xAzo59aryPb1mcvb6juDpp0Zo/s1600/logo.jpg',
};

export const INITIAL_VISTORIAS: Vistoria[] = [
  {
    id: 'vis-001',
    codigoVistoria: 'VIS-2026-081',
    tipo: 'Entrada',
    status: 'Concluída',
    dataVistoria: '2026-07-15T10:30:00.000Z',
    dataCriacao: '2026-07-15T09:00:00.000Z',
    dataAtualizacao: '2026-07-15T12:00:00.000Z',
    imovel: {
      id: 'imv-101',
      codigoRef: 'APT-302',
      endereco: 'Rua das das Palmeiras',
      numero: '450',
      complemento: 'Apto 302 - Bloco B',
      bairro: 'Jardins',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01410-000',
      tipo: 'Apartamento',
      proprietarioNome: 'Dr. Roberto Mendonça',
      proprietarioContato: '(11) 98765-4321',
    },
    inquilinoNome: 'Carlos Eduardo Oliveira',
    inquilinoCpf: '321.654.987-00',
    inquilinoTelefone: '(11) 99123-8877',
    inquilinoEmail: 'carlos.oliveira@email.com',
    vistoriadorNome: 'Juliana Paes (Vistoriadora Sênior)',
    vistoriadorCreci: 'CRECI 198421-F',
    contadores: [
      {
        tipo: 'Energia',
        leitura: '04821 kWh',
        numeroContador: 'ENEL-883921',
        dataHora: '2026-07-15T10:35:00.000Z',
      },
      {
        tipo: 'Água',
        leitura: '01249 m³',
        numeroContador: 'SABESP-44102',
        dataHora: '2026-07-15T10:37:00.000Z',
      },
      {
        tipo: 'Gás',
        leitura: '00318 m³',
        numeroContador: 'COMGAS-9912',
        dataHora: '2026-07-15T10:40:00.000Z',
      },
    ],
    ambientes: [
      {
        id: 'amb-1',
        nome: 'Sala de Estar & Jantar',
        fotosGerais: [
          {
            id: 'ft-101',
            url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
            descricao: 'Visão geral da sala de estar e iluminação',
            dataHora: '2026-07-15T10:45:00.000Z',
          },
        ],
        observacoesGerais: 'Pintura nova em tom bege claro. Iluminação dicroica em pleno funcionamento.',
        itens: [
          {
            id: 'it-1',
            nome: 'Paredes & Pintura',
            estado: 'Novo',
            observacoes: 'Pintura Suvinil Toque de Seda recém-feita, sem manchas, trincas ou furos.',
            fotos: [
              {
                id: 'ft-it-1',
                url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
                descricao: 'Paredes da sala em perfeito estado',
                dataHora: '2026-07-15T10:46:00.000Z',
              }
            ],
          },
          {
            id: 'it-2',
            nome: 'Piso & Rodapés',
            estado: 'Bom',
            observacoes: 'Piso laminado de madeira em ótimo estado. Pequeno risco superficial perto do rodapé esquerdo da varanda.',
            fotos: [],
          },
          {
            id: 'it-3',
            nome: 'Janelas & Persiana',
            estado: 'Bom',
            observacoes: 'Vidros limpos e sem trincas. Esquadrias de alumínio preto correndo suavemente.',
            fotos: [],
          },
          {
            id: 'it-4',
            nome: 'Tomadas & Interruptores',
            estado: 'Bom',
            observacoes: 'Padrão ABNT novo. Todas testadas e energizadas.',
            fotos: [],
          },
        ],
      },
      {
        id: 'amb-2',
        nome: 'Cozinha Planejada',
        fotosGerais: [
          {
            id: 'ft-102',
            url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
            descricao: 'Bancada em granito São Gabriel e armários',
            dataHora: '2026-07-15T11:00:00.000Z',
          },
        ],
        observacoesGerais: 'Armários planejados em MDF branco. Sinais normais de uso.',
        itens: [
          {
            id: 'it-5',
            nome: 'Pia & Torneira Monocomando',
            estado: 'Bom',
            observacoes: 'Bancada em granito sem trincas. Torneira inox sem vazamento. Sifão novo.',
            fotos: [
              {
                id: 'ft-it-5',
                url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
                descricao: 'Pia de granito e torneira inox monocomando',
                dataHora: '2026-07-15T11:02:00.000Z',
              }
            ],
          },
          {
            id: 'it-6',
            nome: 'Armários & Gaveteiros',
            estado: 'Regular',
            observacoes: 'Dobradiças funcionais. Apenas a gaveta inferior de talheres possui leve descolamento de fita de bordo.',
            fotos: [],
          },
          {
            id: 'it-7',
            nome: 'Cooktop & Depurador',
            estado: 'Novo',
            observacoes: 'Cooktop Fischer 4 bocas a gás novo com acendimento automático operando perfeitamente.',
            fotos: [],
          },
        ],
      },
      {
        id: 'amb-3',
        nome: 'Suíte Principal (Dormitório 1)',
        fotosGerais: [
          {
            id: 'ft-103',
            url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
            descricao: 'Visão do Dormitório Principal',
            dataHora: '2026-07-15T11:15:00.000Z',
          }
        ],
        observacoesGerais: 'Acomoda cama King. Com guarda-roupas embutido com espelho.',
        itens: [
          {
            id: 'it-8',
            nome: 'Ar Condicionado Split',
            estado: 'Bom',
            observacoes: 'Inverter 12.000 BTUs Elgin. Controle remoto presente e pilhas novas. Gelando perfeitamente.',
            fotos: [
              {
                id: 'ft-it-8',
                url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
                descricao: 'Aparelho de ar condicionado instalado',
                dataHora: '2026-07-15T11:18:00.000Z',
              }
            ],
          },
          {
            id: 'it-9',
            nome: 'Guarda-roupa & Espelhos',
            estado: 'Bom',
            observacoes: 'Portas de correr com roldanas ajustadas. Espelho sem trincas nem descolamento.',
            fotos: [],
          },
        ],
      },
      {
        id: 'amb-4',
        nome: 'Dormitório 2',
        fotosGerais: [
          {
            id: 'ft-104',
            url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
            descricao: 'Visão do Dormitório 2',
            dataHora: '2026-07-15T11:25:00.000Z',
          }
        ],
        observacoesGerais: 'Quarto limpo, paredes pintadas de branco.',
        itens: [
          {
            id: 'it-10',
            nome: 'Paredes & Pintura',
            estado: 'Novo',
            observacoes: 'Pintura em excelente estado sem furos.',
            fotos: [],
          },
          {
            id: 'it-11',
            nome: 'Janela & Persiana Integrada',
            estado: 'Bom',
            observacoes: 'Persiana de enrolar funcionando perfeitamente.',
            fotos: [],
          },
        ],
      },
    ],
    assinaturas: [
      {
        papel: 'Vistoriador',
        nome: 'Juliana Paes',
        documento: 'CRECI 198421-F',
        dataHora: '2026-07-15T12:00:00.000Z',
      },
      {
        papel: 'Inquilino',
        nome: 'Carlos Eduardo Oliveira',
        documento: 'CPF 321.654.987-00',
        dataHora: '2026-07-15T12:05:00.000Z',
      },
    ],
    analiseIa: {
      resumoExecutivo: 'Imóvel em excelente estado geral de conservação. Entrada liberada com pintura recém-executada e eletrodomésticos novos na cozinha.',
      pontosCriticos: [
        'Registro de pequeno descolamento de fita de bordo na gaveta da cozinha.',
        'Pequeno risco superficial no piso laminado próximo à sacada.',
      ],
      estimativaUrgencia: 'Baixa',
      sugestoesContrato: [
        'Cláusula de isenção de responsabilidade do inquilino para os riscos pré-existentes registrados.',
        'Recomendação de manutenção preventiva no ar condicionado a cada 12 meses.',
      ],
    },
    observacoesFinais: 'Chaves entregues em mãos (2 conjuntos completos + 2 tags de acesso da portaria).',
  },
  {
    id: 'vis-002',
    codigoVistoria: 'VIS-2026-082',
    tipo: 'Saída',
    status: 'Em Andamento',
    dataVistoria: '2026-07-22T14:00:00.000Z',
    dataCriacao: '2026-07-22T13:30:00.000Z',
    dataAtualizacao: '2026-07-23T09:00:00.000Z',
    imovel: {
      id: 'imv-102',
      codigoRef: 'CS-012',
      endereco: 'Alameda dos Anpólios',
      numero: '120',
      complemento: 'Casa 12 - Condomínio Green Park',
      bairro: 'Granja Viana',
      cidade: 'Cotia',
      estado: 'SP',
      cep: '06700-000',
      tipo: 'Casa',
      proprietarioNome: 'Dona Maria Luiza Alencar',
      proprietarioContato: '(11) 97111-2233',
    },
    inquilinoNome: 'Fernanda Lima Rocha',
    inquilinoCpf: '111.222.333-44',
    inquilinoTelefone: '(11) 98877-6655',
    inquilinoEmail: 'fernanda.rocha@empresa.com.br',
    vistoriadorNome: 'Juliana Paes (Vistoriadora Sênior)',
    vistoriadorCreci: 'CRECI 198421-F',
    contadores: [
      {
        tipo: 'Energia',
        leitura: '12940 kWh',
        numeroContador: 'ENEL-332011',
      },
      {
        tipo: 'Água',
        leitura: '03890 m³',
        numeroContador: 'SABESP-11029',
      },
    ],
    ambientes: [
      {
        id: 'amb-201',
        nome: 'Área Externa & Churrasqueira',
        fotosGerais: [],
        observacoesGerais: 'Necessita repintura no muro dos fundos devido à marca de umidade.',
        itens: [
          {
            id: 'it-201',
            nome: 'Grelha e Pedras da Churrasqueira',
            estado: 'Regular',
            observacoes: 'Marca de fuligem acumulada, necessita limpeza pesada.',
            fotos: [],
          },
          {
            id: 'it-202',
            nome: 'Pintura Externa Muro',
            estado: 'Avaria',
            observacoes: 'Descascamento evidente da tinta acrílica próximo ao ralo de escoamento.',
            fotos: [],
          },
        ],
      },
      {
        id: 'amb-202',
        nome: 'Sala 2 Ambientes',
        fotosGerais: [],
        observacoesGerais: 'Paredes contêm furos de quadros não tapados.',
        itens: [
          {
            id: 'it-203',
            nome: 'Paredes & Pintura',
            estado: 'Avaria',
            observacoes: '4 furos de bucha 8mm para suporte de TV e 2 furos para quadros. Pintura necessita retoque.',
            fotos: [],
          },
          {
            id: 'it-204',
            nome: 'Piso Porcelanato',
            estado: 'Bom',
            observacoes: 'Sem trincas nem lascas.',
            fotos: [],
          },
        ],
      },
    ],
    assinaturas: [
      {
        papel: 'Vistoriador',
        nome: 'Juliana Paes',
        documento: 'CRECI 198421-F',
      },
    ],
    analiseIa: {
      resumoExecutivo: 'Vistoria de saída com avarias leves em pintura e furos de suportes de TV que devem ser reparados antes do encerramento do contrato.',
      pontosCriticos: [
        'Furos de bucha de suporte na sala sem fechamento.',
        'Muro da churrasqueira com tinta descascando.',
      ],
      estimativaUrgencia: 'Média',
      sugestoesContrato: [
        'Reter caução parcial até a execução do emassamento e pintura conforme laudo inicial.',
      ],
    },
    observacoesFinais: 'Inquilina agendou pintor para até o dia 28/07.',
  },
  {
    id: 'vis-003',
    codigoVistoria: 'VIS-2026-083',
    tipo: 'Periódica',
    status: 'Concluída',
    dataVistoria: '2026-06-10T09:00:00.000Z',
    dataCriacao: '2026-06-10T08:30:00.000Z',
    dataAtualizacao: '2026-06-10T11:00:00.000Z',
    imovel: {
      id: 'imv-103',
      codigoRef: 'SAL-801',
      endereco: 'Av. Brigadeiro Faria Lima',
      numero: '2200',
      complemento: 'Conjunto 801 - Ed. Corporate Tower',
      bairro: 'Itaim Bibi',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01451-000',
      tipo: 'Comercial',
      proprietarioNome: 'Fundo Imobiliário Prime Tech',
      proprietarioContato: 'adm@primetechfii.com.br',
    },
    inquilinoNome: 'Startup Nexus Soluções S/A',
    inquilinoCpf: '98.765.432/0001-10',
    inquilinoTelefone: '(11) 3003-9900',
    inquilinoEmail: 'facilities@nexus.com.br',
    vistoriadorNome: 'Marcos Vinicius Santos',
    vistoriadorCreci: 'CRECI 210943-F',
    contadores: [
      {
        tipo: 'Energia',
        leitura: '98120 kWh',
        numeroContador: 'ENEL-COM-991',
      },
    ],
    ambientes: [
      {
        id: 'amb-301',
        nome: 'Recepção e Open Space',
        fotosGerais: [],
        observacoesGerais: 'Espaço corporativo bem mantido. Ar condicionado central em operação.',
        itens: [
          {
            id: 'it-301',
            nome: 'Piso Vinílico',
            estado: 'Novo',
            observacoes: 'Tratamento de cera recente. Impecável.',
            fotos: [],
          },
          {
            id: 'it-302',
            nome: 'Teto Rebaixado em Gesso & Luminárias LED',
            estado: 'Bom',
            observacoes: 'Todas as placas LED acendendo sem oscilações.',
            fotos: [],
          },
        ],
      },
    ],
    assinaturas: [
      {
        papel: 'Vistoriador',
        nome: 'Marcos Vinicius Santos',
        documento: 'CRECI 210943-F',
      },
      {
        papel: 'Inquilino',
        nome: 'Lucas Mendes (Gerente de Facilities)',
        documento: 'RG 44.332.112-X',
      },
    ],
    observacoesFinais: 'Vistoria semestral preventiva sem apontamentos de avarias graves.',
  },
];
