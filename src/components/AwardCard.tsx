import React from 'react';
import { motion } from 'framer-motion';
import './AwardCard.css';

interface AwardCardProps {
  awardType: 'fastest' | 'longest' | 'flexoes' | 'coruja';
  winnerName: string;
  winnerAvatar: string;
  statValue: string; // "5 minutos", "20 flexões", etc
  onClose: () => void;
}

export const AwardCard: React.FC<AwardCardProps> = ({
  awardType,
  winnerName,
  winnerAvatar,
  statValue,
  onClose
}) => {
  const getAwardInfo = () => {
    switch (awardType) {
      case 'fastest':
        return {
          icon: '🛌',
          title: 'Melhor Atuação em Cena de Sono',
          description: 'Dormiu mais rápido',
          color: '#ff6b6b',
          quote: '"Nem liguei o filme e já tava no mundo dos sonhos!"'
        };
      case 'longest':
        return {
          icon: '🏃',
          title: 'Fuga Mais Épica',
          description: 'Cochilo mais longo',
          color: '#4ade80',
          quote: '"Vou ali e já volto... (spoiler: não voltou)"'
        };
      case 'flexoes':
        return {
          icon: '💪',
          title: 'Ressurreição do Ano',
          description: 'Mais flexões realizadas',
          color: '#ffd700',
          quote: '"Academia de madrugada é diferente!"'
        };
      case 'coruja':
        return {
          icon: '🦉',
          title: 'Coruja de Ouro',
          description: 'Resistiu a sessão toda',
          color: '#60a5fa',
          quote: '"Café é pra os fracos!"'
        };
      default:
        return {
          icon: '🏆',
          title: 'Prêmio Especial',
          description: 'Desempenho incrível',
          color: '#ffd700',
          quote: '"Lendário!"'
        };
    }
  };

  const award = getAwardInfo();

  const handleDownload = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const element = document.getElementById('award-card-exportable');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#141414',
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    const link = document.createElement('a');
    link.download = `lucasflix-award-${awardType}-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleShare = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const element = document.getElementById('award-card-exportable');
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

      const file = new File([blob], `lucasflix-award-${awardType}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `LucasFlix - ${award.title}`,
            text: `${winnerName} ganhou ${award.title}!`,
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
      className="award-card-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="award-card-container"
        initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card exportável */}
        <div id="award-card-exportable" className="award-card-exportable" style={{ borderColor: award.color }}>
          <div className="award-card-header">
            <div className="award-logo" style={{ color: award.color }}>LUCASFLIX</div>
            <div className="award-badge" style={{ background: `linear-gradient(135deg, ${award.color}, ${award.color}dd)` }}>
              🏆 AWARDS
            </div>
          </div>

          <div className="award-card-content">
            <motion.div 
              className="award-trophy-big"
              style={{ filter: `drop-shadow(0 0 30px ${award.color}88)` }}
              animate={{ 
                rotate: [-10, 10, -10],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {award.icon}
            </motion.div>

            <h2 className="award-title" style={{ color: award.color }}>{award.title}</h2>
            <p className="award-description">{award.description}</p>

            <div className="award-winner-section">
              <motion.div
                className="award-avatar-container"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <img 
                  src={winnerAvatar} 
                  alt={winnerName}
                  className="award-avatar-img"
                  style={{ borderColor: award.color }}
                />
                <div className="award-avatar-glow" style={{ boxShadow: `0 0 40px ${award.color}88` }} />
              </motion.div>

              <h3 className="award-winner-name">{winnerName}</h3>

              <div className="award-stat-box" style={{ borderColor: award.color }}>
                <div className="award-stat-value" style={{ color: award.color }}>{statValue}</div>
              </div>
            </div>
          </div>

          <div className="award-card-footer">
            <div className="award-quote" style={{ color: award.color }}>{award.quote}</div>
            <div className="award-watermark">lucasflix.com • Cerimônia do Cochilo</div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="award-card-actions">
          <button 
            className="award-btn-share" 
            onClick={handleShare}
            style={{ background: `linear-gradient(135deg, ${award.color}, ${award.color}dd)` }}
          >
            📤 Compartilhar
          </button>
          <button className="award-btn-download" onClick={handleDownload}>
            💾 Baixar
          </button>
          <button className="award-btn-close" onClick={onClose}>
            ✕ Fechar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
