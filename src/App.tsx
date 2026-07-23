import React, { useState, useEffect } from 'react';
import { Vistoria, EmpresaInfo } from './types';
import { dbService } from './services/api';
import { generateVistoriaPdf } from './services/pdfGenerator';
import { Header } from './components/Header';
import { InstallPwaBanner } from './components/InstallPwaBanner';
import { VistoriaList } from './components/VistoriaList';
import { VistoriaDetailModal } from './components/VistoriaDetailModal';
import { VistoriaFormModal } from './components/VistoriaFormModal';
import { ComparisonModal } from './components/ComparisonModal';
import { EmpresaConfigModal } from './components/EmpresaConfigModal';
import { DEFAULT_EMPRESA } from './data/seedData';

export default function App() {
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [empresa, setEmpresa] = useState<EmpresaInfo>(DEFAULT_EMPRESA);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [selectedVistoria, setSelectedVistoria] = useState<Vistoria | null>(null);
  const [editingVistoria, setEditingVistoria] = useState<Vistoria | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [isEmpresaConfigOpen, setIsEmpresaConfigOpen] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [vList, emp] = await Promise.all([
          dbService.getVistorias(),
          dbService.getEmpresaInfo(),
        ]);
        setVistorias(vList);
        setEmpresa(emp);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveVistoria = async (vistoriaToSave: Vistoria) => {
    const saved = await dbService.saveVistoria(vistoriaToSave);
    const updatedList = await dbService.getVistorias();
    setVistorias(updatedList);
    setIsFormOpen(false);
    setEditingVistoria(null);
    if (selectedVistoria && selectedVistoria.id === saved.id) {
      setSelectedVistoria(saved);
    }
  };

  const handleDeleteVistoria = async (id: string) => {
    await dbService.deleteVistoria(id);
    const updatedList = await dbService.getVistorias();
    setVistorias(updatedList);
    if (selectedVistoria && selectedVistoria.id === id) {
      setSelectedVistoria(null);
    }
  };

  const handleGerarPdf = async (vistoria: Vistoria) => {
    try {
      const doc = await generateVistoriaPdf(vistoria, empresa);
      doc.save(`Laudo_Vistoria_${vistoria.codigoVistoria}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Não foi possível gerar o PDF da vistoria.');
    }
  };

  const handleSaveEmpresa = async (updatedEmpresa: EmpresaInfo) => {
    const saved = await dbService.saveEmpresaInfo(updatedEmpresa);
    setEmpresa(saved);
  };

  const handleResetDb = async () => {
    if (confirm('Tem certeza que deseja restaurar o banco de dados para os dados padrão?')) {
      const resetList = await dbService.resetDatabase();
      setVistorias(resetList);
    }
  };

  const handleExportDb = () => {
    dbService.exportDatabaseJson(vistorias);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-500 selection:text-white flex flex-col">
      
      {/* PWA Mobile Install Banner */}
      <InstallPwaBanner logoUrl={empresa.logoUrl} />

      {/* Header Bar */}
      <Header
        empresa={empresa}
        onNovaVistoria={() => {
          setEditingVistoria(null);
          setIsFormOpen(true);
        }}
        onComparar={() => setIsComparisonOpen(true)}
        onConfigEmpresa={() => setIsEmpresaConfigOpen(true)}
        onExportarDb={handleExportDb}
        onResetDb={handleResetDb}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Conectando ao banco de dados de vistorias...</p>
          </div>
        ) : (
          <VistoriaList
            vistorias={vistorias}
            onSelectVistoria={(v) => setSelectedVistoria(v)}
            onEditarVistoria={(v) => {
              setEditingVistoria(v);
              setIsFormOpen(true);
            }}
            onDeletarVistoria={handleDeleteVistoria}
            onGerarPdf={handleGerarPdf}
            onNovaVistoria={() => {
              setEditingVistoria(null);
              setIsFormOpen(true);
            }}
          />
        )}

      </main>

      {/* Detail Modal */}
      {selectedVistoria && (
        <VistoriaDetailModal
          vistoria={selectedVistoria}
          empresa={empresa}
          onClose={() => setSelectedVistoria(null)}
          onEditar={() => {
            setEditingVistoria(selectedVistoria);
            setIsFormOpen(true);
          }}
          onAtualizarVistoria={(updated) => {
            setSelectedVistoria(updated);
            dbService.getVistorias().then(setVistorias);
          }}
        />
      )}

      {/* Form Wizard Modal */}
      {isFormOpen && (
        <VistoriaFormModal
          initialVistoria={editingVistoria}
          onSave={handleSaveVistoria}
          onClose={() => {
            setIsFormOpen(false);
            setEditingVistoria(null);
          }}
        />
      )}

      {/* Comparison Modal */}
      {isComparisonOpen && (
        <ComparisonModal
          vistorias={vistorias}
          onClose={() => setIsComparisonOpen(false)}
        />
      )}

      {/* Empresa Config Modal */}
      {isEmpresaConfigOpen && (
        <EmpresaConfigModal
          empresa={empresa}
          onSave={handleSaveEmpresa}
          onClose={() => setIsEmpresaConfigOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            VistoriaPro © 2026 • {empresa.nomeFantasia} (CRECI {empresa.creci})
          </p>
          <p className="text-[11px] text-slate-400">
            Sistema completo com banco de dados integrado, histórico e geração de laudos em PDF.
          </p>
        </div>
      </footer>

    </div>
  );
}
