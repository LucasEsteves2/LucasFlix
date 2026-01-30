import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Toast } from '../components/Toast';
import './Backup.css';

export const Backup: React.FC = () => {
  const { exportData, importData, resetToSeed, clearAllData } = useData();
  const [importText, setImportText] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleCopyBackup = () => {
    const backup = exportData();
    navigator.clipboard.writeText(backup).then(() => {
      setToast({ message: 'Backup copiado para a área de transferência!', type: 'success' });
    }).catch(() => {
      setToast({ message: 'Erro ao copiar backup', type: 'error' });
    });
  };

  const handleImport = () => {
    try {
      if (!importText.trim()) {
        setToast({ message: 'Cole o JSON do backup na área de texto', type: 'error' });
        return;
      }
      
      importData(importText);
      setToast({ message: 'Backup restaurado com sucesso!', type: 'success' });
      setImportText('');
      
      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setToast({ message: 'Erro: JSON inválido ou estrutura incorreta', type: 'error' });
    }
  };

  const handleReset = () => {
    if (!confirm('Tem certeza? Isso irá apagar todos os dados e restaurar os dados de exemplo.')) {
      return;
    }
    
    resetToSeed();
    setToast({ message: 'Dados resetados para exemplo inicial!', type: 'success' });
    
    // Reload page after 2 seconds
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleClearAll = () => {
    if (!confirm('⚠️ TEM CERTEZA ABSOLUTA? Isso irá APAGAR TODOS OS DADOS (sessões, filmes, votos, mural) e começar do ZERO!')) {
      return;
    }
    
    if (!confirm('❗ Última chance! Esta ação NÃO pode ser desfeita. Continuar?')) {
      return;
    }
    
    // Limpa localStorage completamente
    localStorage.clear();
    
    clearAllData();
    setToast({ message: 'Todos os dados foram apagados! Começando do zero...', type: 'info' });
    
    // Reload page after 2 seconds
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="backup-page">
      <div className="page-header">
        <h1>💾 Backup</h1>
      </div>

      <div className="backup-section">
        <div className="backup-card">
          <h2>📋 Copiar Backup</h2>
          <p>Gera um JSON com todos os seus dados e copia para a área de transferência.</p>
          <button className="btn-primary" onClick={handleCopyBackup}>
            Copiar Backup
          </button>
        </div>

        <div className="backup-card">
          <h2>📥 Restaurar Backup</h2>
          <p>Cole o JSON do backup abaixo e clique em Restaurar.</p>
          <textarea 
            className="backup-textarea"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='{"version":1,"people":[...],...}'
            rows={10}
          />
          <button className="btn-primary" onClick={handleImport}>
            Restaurar Backup
          </button>
        </div>

        <div className="backup-card backup-danger">
          <h2>⚠️ Resetar para Dados de Exemplo</h2>
          <p>Apaga todos os dados atuais e restaura os dados de exemplo iniciais.</p>
          <button className="btn-danger" onClick={handleReset}>
            Resetar para Exemplo
          </button>
        </div>

        <div className="backup-card backup-danger">
          <h2>🗑️ Limpar Todos os Dados</h2>
          <p><strong>PERIGO:</strong> Apaga TUDO e começa do zero absoluto. Não há como desfazer!</p>
          <button className="btn-danger-extreme" onClick={handleClearAll}>
            🔥 Apagar Tudo
          </button>
        </div>
      </div>

      <div className="backup-info">
        <h3>ℹ️ Informações</h3>
        <ul>
          <li><strong>Copiar Backup:</strong> Use para fazer backup dos seus dados. Cole em um arquivo de texto ou nota no celular.</li>
          <li><strong>Restaurar Backup:</strong> Cole um backup anterior para recuperar seus dados.</li>
          <li><strong>Resetar:</strong> Útil para voltar aos dados de exemplo se algo der errado.</li>
          <li><strong>Compatibilidade:</strong> Funciona no celular! Use Ctrl+C/Ctrl+V ou toque longo para colar.</li>
        </ul>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
