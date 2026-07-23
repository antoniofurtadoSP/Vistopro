import React, { useState } from 'react';
import { X, Building2, Save, Check } from 'lucide-react';
import { EmpresaInfo } from '../types';

interface EmpresaConfigModalProps {
  empresa: EmpresaInfo;
  onSave: (empresa: EmpresaInfo) => void;
  onClose: () => void;
}

export const EmpresaConfigModal: React.FC<EmpresaConfigModalProps> = ({ empresa, onSave, onClose }) => {
  const [formData, setFormData] = useState<EmpresaInfo>({ ...empresa });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold">Dados da Imobiliária / Vistoriadora</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome Fantasia</label>
            <input
              type="text"
              value={formData.nomeFantasia}
              onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">CNPJ</label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">CRECI</label>
              <input
                type="text"
                value={formData.creci}
                onChange={(e) => setFormData({ ...formData, creci: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Endereço Completo</label>
            <input
              type="text"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">URL do Logo (Banner / PDF)</label>
            <input
              type="text"
              value={formData.logoUrl || ''}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg font-medium">
              Cancelar
            </button>
            <button type="submit" className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold">
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
