import React from 'react';
import { motion } from 'framer-motion';
import './SurvivorCard.css';

interface SurvivorCardProps {
  survivors: { name: string; avatar: string }[];
  sessionDuration: string;
  onClose: () => void;
}

export const SurvivorCard: React.FC<SurvivorCardProps> = ({ survivors, sessionDuration, onClose }) => {
  const handleDownload = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const element = document.getElementById('survivor-card-exportable');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#141414',
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    const link = document.createElement('a');
    link.download = `lucasflix-sobreviventes-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleShare = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const element = document.getElementById('survivor-card-exportable');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#141414',
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], `lucasflix-sobreviventes.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'LucasFlix - Sobreviventes',
            text: `${survivors.length} guerreiro${survivors.length > 1 ? 's' : ''} resistiu${survivors.length > 1 ? 'ram' : ''} a sessão toda!`,
          });
        } catch (err) {
          handleDownload();
        }
      } else {
        handleDownload();
      }
    });
  };

  return (
    <motion.div
      className="survivor-card-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="survivor-card-container"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card exportável */}
        <div id="survivor-card-exportable" className="survivor-card-exportable">
          <div className="survivor-card-header">
            <div className="survivor-logo">LUCASFLIX</div>
            <div className="survivor-badge">🏆 SOBREVIVENTES</div>
          </div>

          <div className="survivor-card-content">
            <motion.div 
              className="survivor-trophy-big"
              animate={{ 
                rotate: [-5, 5, -5],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎉
            </motion.div>

            <h2 className="survivor-card-title">RESISTIRAM À SESSÃO!</h2>
            
            <div className="survivor-card-stats">
              <div className="survivor-stat-item">
                <div className="survivor-stat-icon">⏱️</div>
                <div className="survivor-stat-label">Duração</div>
                <div className="survivor-stat-value">{sessionDuration}</div>
              </div>
              <div className="survivor-stat-item">
                <div className="survivor-stat-icon">🦸</div>
                <div className="survivor-stat-label">Guerreiros</div>
                <div className="survivor-stat-value">{survivors.length}</div>
              </div>
            </div>

            <div className="survivor-avatars-grid">
              {survivors.map((survivor, idx) => (
                <motion.div
                  key={idx}
                  className="survivor-avatar-item"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1 * idx, type: 'spring' }}
                >
                  <img src={survivor.avatar} alt={survivor.name} />
                  <div className="survivor-avatar-name">{survivor.name.split(' ')[0]}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="survivor-card-footer">
            <div className="survivor-quote">"Café é para os fracos!" ☕</div>
            <div className="survivor-watermark">lucasflix.com</div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="survivor-card-actions">
          <button className="survivor-btn-share" onClick={handleShare}>
            📤 Compartilhar
          </button>
          <button className="survivor-btn-download" onClick={handleDownload}>
            💾 Baixar
          </button>
          <button className="survivor-btn-close" onClick={onClose}>
            ✕ Fechar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
