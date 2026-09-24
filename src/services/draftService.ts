import { Vistoria } from '../types';

const DRAFT_KEY = 'vistoriapro_auto_draft_v1';
const DRAFT_TIME_KEY = 'vistoriapro_auto_draft_time_v1';

export interface VistoriaDraftInfo {
  vistoria: Vistoria;
  timestamp: string;
  dataHoraFormatada: string;
}

export const draftService = {
  /**
   * Salva o rascunho atual silenciosamente no localStorage
   */
  salvarRascunho(vistoria: Vistoria): boolean {
    try {
      if (!vistoria) return false;
      const json = JSON.stringify(vistoria);
      const now = new Date().toISOString();
      localStorage.setItem(DRAFT_KEY, json);
      localStorage.setItem(DRAFT_TIME_KEY, now);
      return true;
    } catch (err) {
      console.warn('Não foi possível salvar rascunho no localStorage (limite atingido):', err);
      return false;
    }
  },

  /**
   * Recupera o rascunho salvo, caso exista
   */
  obterRascunho(): VistoriaDraftInfo | null {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      const timeRaw = localStorage.getItem(DRAFT_TIME_KEY);
      if (!raw) return null;

      const vistoria = JSON.parse(raw) as Vistoria;
      if (!vistoria || !vistoria.ambientes) return null;

      let dataHoraFormatada = 'recente';
      if (timeRaw) {
        const d = new Date(timeRaw);
        dataHoraFormatada = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + 
          ' de ' + d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      }

      return {
        vistoria,
        timestamp: timeRaw || new Date().toISOString(),
        dataHoraFormatada,
      };
    } catch (err) {
      console.warn('Erro ao ler rascunho:', err);
      return null;
    }
  },

  /**
   * Verifica se há um rascunho válido pendente
   */
  temRascunho(): boolean {
    return !!localStorage.getItem(DRAFT_KEY);
  },

  /**
   * Remove o rascunho (chamado ao finalizar com sucesso ou ao descartar)
   */
  limparRascunho(): void {
    try {
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem(DRAFT_TIME_KEY);
    } catch (err) {
      console.warn('Erro ao limpar rascunho:', err);
    }
  },
};
