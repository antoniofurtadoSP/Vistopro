import { Vistoria, EmpresaInfo, AnaliseIA } from '../types';
import { INITIAL_VISTORIAS, DEFAULT_EMPRESA } from '../data/seedData';

const LOCAL_STORAGE_KEY = 'vistoriapro_db_v1';
const EMPRESA_STORAGE_KEY = 'vistoriapro_empresa_v1';

// Helper to handle local fallback if server API is offline or slow
function getLocalVistorias(): Vistoria[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Erro ao ler localStorage', e);
  }
  return INITIAL_VISTORIAS;
}

function saveLocalVistorias(vistorias: Vistoria[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(vistorias));
  } catch (e) {
    console.warn('Erro ao salvar no localStorage', e);
  }
}

function getLocalEmpresa(): EmpresaInfo {
  try {
    const raw = localStorage.getItem(EMPRESA_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Erro ao ler empresa no localStorage', e);
  }
  return DEFAULT_EMPRESA;
}

function saveLocalEmpresa(empresa: EmpresaInfo) {
  try {
    localStorage.setItem(EMPRESA_STORAGE_KEY, JSON.stringify(empresa));
  } catch (e) {
    console.warn('Erro ao salvar empresa no localStorage', e);
  }
}

export const dbService = {
  async getVistorias(): Promise<Vistoria[]> {
    try {
      const res = await fetch('/api/vistorias');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          saveLocalVistorias(json.data);
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Backend API indisponível, usando armazenamento local:', err);
    }
    return getLocalVistorias();
  },

  async getVistoriaById(id: string): Promise<Vistoria | null> {
    try {
      const res = await fetch(`/api/vistorias/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('Erro buscando vistoria API, usando local:', err);
    }
    const list = getLocalVistorias();
    return list.find((v) => v.id === id) || null;
  },

  async saveVistoria(vistoria: Vistoria): Promise<Vistoria> {
    // Ensure IDs
    if (!vistoria.id) {
      vistoria.id = 'vis-' + Date.now();
    }
    if (!vistoria.codigoVistoria) {
      vistoria.codigoVistoria = `VIS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    }
    vistoria.dataCriacao = vistoria.dataCriacao || new Date().toISOString();
    vistoria.dataAtualizacao = new Date().toISOString();

    // Local update first
    const current = getLocalVistorias();
    const idx = current.findIndex((v) => v.id === vistoria.id);
    let updatedList: Vistoria[];
    if (idx >= 0) {
      current[idx] = vistoria;
      updatedList = [...current];
    } else {
      updatedList = [vistoria, ...current];
    }
    saveLocalVistorias(updatedList);

    // Sync with backend API
    try {
      const res = await fetch('/api/vistorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vistoria),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Falha na sincronização online com backend, dados salvos localmente.', err);
    }

    return vistoria;
  },

  async deleteVistoria(id: string): Promise<boolean> {
    const current = getLocalVistorias();
    const updated = current.filter((v) => v.id !== id);
    saveLocalVistorias(updated);

    try {
      await fetch(`/api/vistorias/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Erro apagando no backend API', err);
    }

    return true;
  },

  async getEmpresaInfo(): Promise<EmpresaInfo> {
    try {
      const res = await fetch('/api/empresa');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          saveLocalEmpresa(json.data);
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Erro lendo empresa API:', err);
    }
    return getLocalEmpresa();
  },

  async saveEmpresaInfo(empresa: EmpresaInfo): Promise<EmpresaInfo> {
    saveLocalEmpresa(empresa);
    try {
      await fetch('/api/empresa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empresa),
      });
    } catch (err) {
      console.warn('Erro salvando empresa no server:', err);
    }
    return empresa;
  },

  async analyzeWithAi(vistoria: Vistoria): Promise<AnaliseIA> {
    try {
      const res = await fetch('/api/vistorias/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vistoria),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Erro ao chamar API de análise por IA:', err);
    }

    // Default intelligent fallback
    const totalAvarias = vistoria.ambientes.reduce(
      (acc, amb) => acc + amb.itens.filter((i) => i.estado === 'Avaria').length,
      0
    );

    return {
      resumoExecutivo: `Laudo de vistoria de ${vistoria.tipo.toLowerCase()} do imóvel localizado em ${vistoria.imovel.endereco}, nº ${vistoria.imovel.numero}. Total de ${vistoria.ambientes.length} ambientes inspecionados.`,
      pontosCriticos: totalAvarias > 0
        ? vistoria.ambientes.flatMap((a) =>
            a.itens.filter((i) => i.estado === 'Avaria').map((i) => `${a.nome}: ${i.nome} (${i.observacoes || 'Avaria cadastrada'})`)
          )
        : ['Nenhuma avaria grave cadastrada nos ambientes.'],
      estimativaUrgencia: totalAvarias > 2 ? 'Alta' : totalAvarias > 0 ? 'Média' : 'Baixa',
      sugestoesContrato: [
        'Vistoria realizada com acompanhamento das partes.',
        'As fotos em anexo integram este laudo para fins de comprovação legal.',
      ],
      responsabilidadeSugerida: totalAvarias > 0 ? 'Analisar pendências conforme cláusula de pintura/conservação do contrato.' : 'Imóvel em perfeitas condições para habite-se/liberação.',
    };
  },

  async resetDatabase(): Promise<Vistoria[]> {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    saveLocalVistorias(INITIAL_VISTORIAS);
    try {
      await fetch('/api/db/reset', { method: 'POST' });
    } catch (err) {
      console.warn('Erro resetando db backend:', err);
    }
    return INITIAL_VISTORIAS;
  },

  exportDatabaseJson(vistorias: Vistoria[]) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(vistorias, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_vistorias_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },
};
