import React from 'react';
import { motion } from 'framer-motion';
import './KingCard.css';

interface KingCardProps {
  kingName: string;
  kingAvatar: string;
  kingType: 'sleep' | 'nap'; // Rei do Sono ou Rei do Cochilo
  totalSleepTime: number; // em minutos
  napCount: number;
  onClose: () => void;
}

export const KingCard: React.FC<KingCardProps> = ({
  kingName,
  kingAvatar,
  kingType,
  totalSleepTime,
  napCount,
  onClose
}) => {
  const formatSleepTime = (minutes: number) => {
    if (minutes < 1) {
      const seconds = Math.round(minutes * 60);
      return `${seconds}s`;
    }
    const mins = Math.round(minutes);
    return `${mins}min`;
  };

  const getTitle = () => kingType === 'sleep' ? '👑 REI DO SONO' : '😴 REI DO COCHILO';
  const getPhrase = () => {
    if (kingType === 'sleep') {
      return [
        '"Só vou fechar o olho um pouquinho..."',
        '"Acordado? Eu tô ouvindo tudo!"',
        '"Era só um cochilo estratégico!"',
        '"O sofá me chamou..."'
      ][Math.floor(Math.random() * 4)];
    } else {
      return [
        '"Vou ali e já volto!"',
        '"É que o filme tava chato..."',
        '"Tava só descansando os olhos!"',
        '"Quantas vezes eu cochilei?"'
      ][Math.floor(Math.random() * 4)];
    }
  };

  const handleDownload = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const element = document.getElementById('king-card-exportable');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#141414',
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    const link = document.createElement('a');
    link.download = `lucasflix-rei-${kingType}-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleShare = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const element = document.getElementById('king-card-exportable');
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

      const file = new File([blob], `lucasflix-rei-${kingType}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `LucasFlix - ${getTitle()}`,
            text: `${kingName} foi coroado${kingName.toLowerCase().includes('a') ? 'a' : ''} ${getTitle()}!`,
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
      className="king-card-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="king-card-container"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card exportável */}
        <div id="king-card-exportable" className="king-card-exportable">
          <div className="king-card-header">
            <div className="king-logo">LUCASFLIX</div>
            <div className={`king-badge ${kingType === 'sleep' ? 'king-badge-sleep' : 'king-badge-nap'}`}>
              {getTitle()}
            </div>
          </div>

          <div className="king-card-content">
            <motion.div 
              className="king-crown-big"
              animate={{ 
                rotate: [-10, 10, -10],
                y: [0, -10, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {kingType === 'sleep' ? '👑' : '😴'}
            </motion.div>

            <div className="king-avatar-container">
              <motion.img 
                src={kingAvatar} 
                alt={kingName}
                className="king-avatar-img"
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="king-avatar-overlay">💤</div>
            </div>

            <h2 className="king-name">{kingName}</h2>

            <div className="king-stats-grid">
              <div className="king-stat-item">
                <div className="king-stat-icon">⏰</div>
                <div className="king-stat-label">Tempo Dormindo</div>
                <div className="king-stat-value">{formatSleepTime(totalSleepTime)}</div>
              </div>
              <div className="king-stat-item">
                <div className="king-stat-icon">💤</div>
                <div className="king-stat-label">Cochilos</div>
                <div className="king-stat-value">{napCount}</div>
              </div>
              <div className="king-stat-item">
                <div className="king-stat-icon">💪</div>
                <div className="king-stat-label">Flexões</div>
                <div className="king-stat-value">{napCount * 5}</div>
              </div>
            </div>
          </div>

          <div className="king-card-footer">
            <div className="king-quote">{getPhrase()}</div>
            <div className="king-watermark">lucasflix.com</div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="king-card-actions">
          <button className="king-btn-share" onClick={handleShare}>
            📤 Compartilhar
          </button>
          <button className="king-btn-download" onClick={handleDownload}>
            💾 Baixar
          </button>
          <button className="king-btn-close" onClick={onClose}>
            ✕ Fechar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
