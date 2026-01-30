import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAchievements } from '../hooks/useAchievements';
import { ACHIEVEMENTS, RARITY_COLORS, RARITY_GLOW } from '../data/achievements';
import { Card } from '../components/Card';
import './Achievements.css';

// Avatar imports
import DiegoAvatar from '../imgs/DiegoAvatar.png';
import LucasAvatar from '../imgs/LucasAvatar.png';
import MentaAvatar from '../imgs/MentaAvatar.png';
import ThiagoAvatar from '../imgs/ThiagoAvatar.png';
import LucaVitoriaAvatar from '../imgs/lucaVitoriaAvatar.png';

const getAvatar = (name: string) => {
  const firstName = name.split(' ')[0].toLowerCase();
  const avatars: Record<string, string> = {
    'diego': DiegoAvatar,
    'lucas': LucasAvatar,
    'menta': MentaAvatar,
    'thiago': ThiagoAvatar,
    'lucca': LucaVitoriaAvatar,
  };
  return avatars[firstName] || LucasAvatar;
};

export const Achievements: React.FC = () => {
  const { people } = useData();
  const { getAllAchievementsWithStatus, calculatePersonStats } = useAchievements();
  const [viewMode, setViewMode] = useState<'individual' | 'global'>('global');
  const [selectedPersonId, setSelectedPersonId] = useState<string>(
    people.filter(p => !p.isAlternative)[0]?.id || ''
  );

  const selectedPerson = people.find(p => p.id === selectedPersonId);
  const achievementsWithStatus = getAllAchievementsWithStatus(selectedPersonId);
  const stats = calculatePersonStats(selectedPersonId);

  const unlockedCount = achievementsWithStatus.filter(a => a.unlocked).length;
  const totalCount = ACHIEVEMENTS.length;
  const progress = (unlockedCount / totalCount) * 100;

  // Agrupar conquistas globalmente
  const getGlobalAchievements = () => {
    // Pega achievements de todas as pessoas
    const allAchievements = people.flatMap(person => 
      person.achievements.map(a => ({ ...a, personId: person.id }))
    );
    
    const grouped = new Map<string, string[]>();
    
    allAchievements.forEach(unlocked => {
      if (!grouped.has(unlocked.achievementId)) {
        grouped.set(unlocked.achievementId, []);
      }
      grouped.get(unlocked.achievementId)!.push(unlocked.personId);
    });
    
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlockedBy: grouped.get(achievement.id) || [],
      unlocked: grouped.has(achievement.id),
    }));
  };

  const globalAchievements = viewMode === 'global' ? getGlobalAchievements() : [];
  const activeAchievements = viewMode === 'global' ? globalAchievements : achievementsWithStatus;

  // Agrupa por categoria
  const categoryNames = {
    endurance: '💪 Resistência',
    participation: '🎬 Participação',
    warmup: '🎮 Aquecimento',
    recovery: '😴 Recuperação',
    legendary: '👑 Legendárias',
  };

  return (
    <div className="achievements-page">
      <motion.div 
        className="page-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1>🏆 Conquistas</h1>
        <p>Desbloqueie conquistas e mostre sua dedicação!</p>
        
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'global' ? 'active' : ''}`}
            onClick={() => setViewMode('global')}
          >
            🌎 Global
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'individual' ? 'active' : ''}`}
            onClick={() => setViewMode('individual')}
          >
            👤 Individual
          </button>
        </div>
      </motion.div>

      {/* Person Selector - only in individual mode */}
      {viewMode === 'individual' && (
      <motion.div 
        className="person-selector"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {people.filter(p => !p.isAlternative).map((person, index) => (
          <motion.button
            key={person.id}
            className={`person-btn ${selectedPersonId === person.id ? 'active' : ''}`}
            onClick={() => setSelectedPersonId(person.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {person.name.split(' ')[0]}
          </motion.button>
        ))}
      </motion.div>
      )}

      {/* Progress Bar - only in individual mode */}
      {viewMode === 'individual' && (
      <motion.div 
        className="achievement-progress"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="progress-header">
          <h3>{selectedPerson?.name}</h3>
          <span className="progress-text">
            {unlockedCount} / {totalCount} Conquistas
          </span>
        </div>
        <div className="progress-bar">
          <motion.div 
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
        <div className="stats-mini">
          <span>📊 {stats.totalSessions} sessões</span>
          <span>✅ {stats.totalSurvived} sobrevivências</span>
          <span>😴 {stats.totalNaps} cochilos</span>
        </div>
      </motion.div>
      )}

      {/* Achievements Grid */}
      {Object.entries({
        endurance: activeAchievements.filter(a => a.category === 'endurance'),
        participation: activeAchievements.filter(a => a.category === 'participation'),
        warmup: activeAchievements.filter(a => a.category === 'warmup'),
        recovery: activeAchievements.filter(a => a.category === 'recovery'),
        legendary: activeAchievements.filter(a => a.category === 'legendary'),
      }).map(([category, achievements]) => {
        if (achievements.length === 0) return null;
        
        return (
          <div key={category} className="achievement-category">
            <h2 className="category-title">{categoryNames[category as keyof typeof categoryNames]}</h2>
            <div className="achievements-grid">
              {achievements.map((achievement, index) => {
                const rarityColor = RARITY_COLORS[achievement.rarity];
                const rarityGlow = RARITY_GLOW[achievement.rarity];

                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
                  >
                    <Card>
                      <div 
                        className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                        style={{
                          borderColor: achievement.unlocked ? rarityColor : '#333',
                          boxShadow: achievement.unlocked 
                            ? `0 0 20px ${rarityGlow}` 
                            : 'none',
                        }}
                      >
                        <motion.div 
                          className="achievement-icon-large"
                          animate={achievement.unlocked ? {
                            rotate: [0, -5, 5, 0],
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                          style={{
                            filter: achievement.unlocked 
                              ? `drop-shadow(0 0 10px ${rarityGlow})` 
                              : 'grayscale(100%) opacity(0.3)',
                          }}
                        >
                          {achievement.icon}
                        </motion.div>
                        
                        <div className="achievement-details">
                          <div className="achievement-header-card">
                            <h4 
                              className="achievement-name"
                              style={{ 
                                color: achievement.unlocked ? rarityColor : '#666' 
                              }}
                            >
                              {achievement.title}
                            </h4>
                            <span 
                              className="rarity-badge"
                              style={{ 
                                color: achievement.unlocked ? rarityColor : '#666',
                                borderColor: achievement.unlocked ? rarityColor : '#666',
                              }}
                            >
                              {achievement.rarity}
                            </span>
                          </div>
                          <p className="achievement-desc">
                            {achievement.description}
                          </p>
                          
                          {achievement.unlocked && (
                            <motion.div 
                              className="unlocked-badge"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring' }}
                            >
                              ✓ DESBLOQUEADO
                            </motion.div>
                          )}
                          
                          {/* Avatares no modo global */}
                          {viewMode === 'global' && achievement.unlocked && 'unlockedBy' in achievement && (achievement as any).unlockedBy.length > 0 && (
                            <div className="unlocked-avatars">
                              {(achievement as any).unlockedBy.map((personId: string) => {
                                const person = people.find(p => p.id === personId);
                                if (!person || person.isAlternative) return null;
                                return (
                                  <motion.img
                                    key={personId}
                                    src={getAvatar(person.name)}
                                    alt={person.name}
                                    className="avatar-mini"
                                    title={person.name}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    whileHover={{ scale: 1.2 }}
                                  />
                                );
                              })}
                            </div>
                          )}
                          
                          {!achievement.unlocked && (
                            <div className="locked-overlay">
                              🔒 Bloqueado
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
