import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import './ShameCard.css';

interface ShameCardProps {
  personName: string;
  personAvatar: string;
  totalSleepTime: number;
  napCount: number;
  sleepTime: string;
  isKing?: boolean;
  onClose: () => void;
}

export const ShameCard: React.FC<ShameCardProps> = ({
  personName,
  personAvatar,
  totalSleepTime,
  napCount,
  sleepTime,
  isKing = false,
  onClose
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const formatSleepTime = (minutes: number) => {
    if (minutes < 1) {
      const seconds = Math.round(minutes * 60);
      return `${seconds}s`;
    }
    const mins = Math.round(minutes);
    return `${mins}min`;
  };

  const getShamePhrase = () => {
    const phrases = [
      'Dormiu no Filme! 😴',
      'Cochilo Profissional 💤',
      'Rei(nha) da Soneca 👑',
      'Modo Descanso Ativado 🛌',
      'Expert em Cochilos 🏆',
      'Mestre do Ronco 😪',
      'Vencido pelo Sono 😵',
      'Apagou no Sofá 🔌'
    ];
    
    if (isKing) return 'REI(NHA) DO SONO 👑';
    if (napCount >= 3) return phrases[4];
    if (totalSleepTime > 30) return phrases[5];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      // Dynamically import html2canvas only when needed
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#141414',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.download = `lucasflix-shame-${personName.replace(' ', '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      alert('Erro ao gerar imagem. Tente novamente!');
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#141414',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], `lucasflix-shame-${personName}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'LucasFlix - Cartão da Vergonha',
              text: `${personName} dormiu durante a sessão! 😴`,
            });
          } catch (err) {
            console.log('Compartilhamento cancelado');
          }
        } else {
          // Fallback: download
          handleDownload();
        }
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      handleDownload();
    }
  };

  return (
    <motion.div
      className="shame-card-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="shame-card-modal"
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0.5, rotate: 10 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card que será exportado como imagem */}
        <div className="shame-card-exportable" ref={cardRef}>
          <div className="shame-card-header">
            <div className="shame-card-logo">LUCASFLIX</div>
            <div className="shame-card-badge">{getShamePhrase()}</div>
          </div>

          <div className="shame-card-content">
            <div className="shame-card-avatar">
              <img src={personAvatar} alt={personName} />
              <div className="shame-card-sleep-icon">😴</div>
            </div>

            <h2 className="shame-card-name">{personName}</h2>

            <div className="shame-card-stats">
              <div className="shame-stat-item">
                <div className="shame-stat-icon">⏰</div>
                <div className="shame-stat-label">Dormiu às</div>
                <div className="shame-stat-value">{sleepTime}</div>
              </div>

              <div className="shame-stat-item">
                <div className="shame-stat-icon">💤</div>
                <div className="shame-stat-label">Cochilos</div>
                <div className="shame-stat-value">{napCount}x</div>
              </div>

              <div className="shame-stat-item">
                <div className="shame-stat-icon">⏱️</div>
                <div className="shame-stat-label">Tempo Total</div>
                <div className="shame-stat-value">{formatSleepTime(totalSleepTime)}</div>
              </div>
            </div>

            <div className="shame-card-footer">
              <div className="shame-card-quote">
                "{napCount > 2 ? 'Eu juro que não vou dormir dessa vez!' : 'Vou ali e já volto...'}"
              </div>
              <div className="shame-card-watermark">🍿 LucasFlix © 2026</div>
            </div>
          </div>
        </div>

        {/* Botões de ação (não aparecem na imagem) */}
        <div className="shame-card-actions">
          <motion.button
            className="shame-btn shame-btn-share"
            onClick={handleShare}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📤 Compartilhar Vergonha
          </motion.button>
          <motion.button
            className="shame-btn shame-btn-download"
            onClick={handleDownload}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            💾 Baixar Imagem
          </motion.button>
          <motion.button
            className="shame-btn shame-btn-close"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✕ Fechar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
