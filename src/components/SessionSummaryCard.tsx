import React from 'react';
import { motion } from 'framer-motion';
import './SessionSummaryCard.css';

interface SessionSummaryCardProps {
  sessionDuration: string;
  totalParticipants: number;
  sleepKing?: { name: string; avatar: string; time: string; naps: number };
  napKing?: { name: string; avatar: string; naps: number };
  recordHolder?: { name: string; avatar: string; awakeTime: string };
  survivors: { name: string; avatar: string }[];
  awards: {
    fastest?: { name: string; stat: string };
    longest?: { name: string; stat: string };
    flexoes?: { name: string; stat: string };
    coruja?: { name: string };
  };
  onClose: () => void;
}

export const SessionSummaryCard: React.FC<SessionSummaryCardProps> = ({
  sessionDuration,
  totalParticipants,
  sleepKing,
  napKing,
  recordHolder,
  survivors,
  awards,
  onClose
}) => {
  const handleDownload = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const element = document.getElementById('session-summary-card-exportable');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#141414',
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    const link = document.createElement('a');
    link.download = `lucasflix-resumo-sessao-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleShare = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const element = document.getElementById('session-summary-card-exportable');
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

      const file = new File([blob], `lucasflix-resumo-sessao.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'LucasFlix - Resumo da Sessão',
            text: `Resumo completo da sessão LucasFlix com ${totalParticipants} participantes!`,
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
      className="session-summary-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="session-summary-container"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card exportável */}
        <div id="session-summary-card-exportable" className="session-summary-exportable">
          <div className="session-summary-header">
            <div className="session-summary-logo">LUCASFLIX</div>
            <div className="session-summary-badge">📊 RESUMO DA SESSÃO</div>
          </div>

          <div className="session-summary-content">
            {/* Info principal */}
            <div className="session-info-grid">
              <div className="session-info-item">
                <div className="session-info-icon">⏱️</div>
                <div className="session-info-value">{sessionDuration}</div>
                <div className="session-info-label">Duração</div>
              </div>
              <div className="session-info-item">
                <div className="session-info-icon">👥</div>
                <div className="session-info-value">{totalParticipants}</div>
                <div className="session-info-label">Participantes</div>
              </div>
            </div>

            {/* Rei do Sono */}
            {sleepKing && (
              <div className="summary-section">
                <h3 className="summary-section-title">👑 Rei do Sono</h3>
                <div className="summary-king-row">
                  <img src={sleepKing.avatar} alt={sleepKing.name} className="summary-avatar-small" />
                  <div className="summary-king-info">
                    <div className="summary-king-name">{sleepKing.name}</div>
                    <div className="summary-king-stats">
                      {sleepKing.time} • {sleepKing.naps} cochilo{sleepKing.naps > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rei do Cochilo */}
            {napKing && napKing.name !== sleepKing?.name && (
              <div className="summary-section">
                <h3 className="summary-section-title">😴 Rei do Cochilo</h3>
                <div className="summary-king-row">
                  <img src={napKing.avatar} alt={napKing.name} className="summary-avatar-small" />
                  <div className="summary-king-info">
                    <div className="summary-king-name">{napKing.name}</div>
                    <div className="summary-king-stats">
                      {napKing.naps} cochilo{napKing.naps > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recordista de Resistência */}
            {recordHolder && (
              <div className="summary-section">
                <h3 className="summary-section-title">🏆 Recordista de Resistência</h3>
                <div className="summary-king-row">
                  <img src={recordHolder.avatar} alt={recordHolder.name} className="summary-avatar-small" />
                  <div className="summary-king-info">
                    <div className="summary-king-name">{recordHolder.name}</div>
                    <div className="summary-king-stats">
                      {recordHolder.awakeTime} acordado
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Awards */}
            {Object.keys(awards).length > 0 && (
              <div className="summary-section">
                <h3 className="summary-section-title">🏆 Cerimônia do Cochilo</h3>
                <div className="summary-awards-list">
                  {awards.fastest && (
                    <div className="summary-award-item">
                      <span className="summary-award-icon">🛌</span>
                      <span className="summary-award-text">{awards.fastest.name} - {awards.fastest.stat}</span>
                    </div>
                  )}
                  {awards.longest && (
                    <div className="summary-award-item">
                      <span className="summary-award-icon">🏃</span>
                      <span className="summary-award-text">{awards.longest.name} - {awards.longest.stat}</span>
                    </div>
                  )}
                  {awards.flexoes && (
                    <div className="summary-award-item">
                      <span className="summary-award-icon">💪</span>
                      <span className="summary-award-text">{awards.flexoes.name} - {awards.flexoes.stat}</span>
                    </div>
                  )}
                  {awards.coruja && (
                    <div className="summary-award-item">
                      <span className="summary-award-icon">🦉</span>
                      <span className="summary-award-text">{awards.coruja.name} - Resistência Total</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sobreviventes */}
            {survivors.length > 0 && (
              <div className="summary-section">
                <h3 className="summary-section-title">🎉 Sobreviventes ({survivors.length})</h3>
                <div className="summary-survivors-row">
                  {survivors.slice(0, 6).map((survivor, idx) => (
                    <div key={idx} className="summary-survivor-item">
                      <img src={survivor.avatar} alt={survivor.name} className="summary-avatar-tiny" />
                      <div className="summary-survivor-name">{survivor.name.split(' ')[0]}</div>
                    </div>
                  ))}
                  {survivors.length > 6 && (
                    <div className="summary-survivor-more">+{survivors.length - 6}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="session-summary-footer">
            <div className="summary-quote">"Mais uma sessão épica no LucasFlix!" 🎬</div>
            <div className="summary-watermark">lucasflix.com</div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="session-summary-actions">
          <button className="summary-btn-share" onClick={handleShare}>
            📤 Compartilhar Resumo
          </button>
          <button className="summary-btn-download" onClick={handleDownload}>
            💾 Baixar
          </button>
          <button className="summary-btn-close" onClick={onClose}>
            ✕ Fechar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
