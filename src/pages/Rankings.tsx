import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { Row } from '../components/Row';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Rankings.css';

// Avatar imports
import DiegoAvatar from '../imgs/DiegoAvatar.png';
import LucasAvatar from '../imgs/LucasAvatar.png';
import MentaAvatar from '../imgs/MentaAvatar.png';
import ThiagoAvatar from '../imgs/ThiagoAvatar.png';
import JuliaAvatar from '../imgs/JuliaAvatar.png';
import ValescaAvatar from '../imgs/ValescaAvatar.png';
import VitoriaAvatar from '../imgs/VitoriaAvatar.png';
import LucaVitoriaAvatar from '../imgs/lucaVitoriaAvatar.png';

const getAvatar = (name: string) => {
  const firstName = name.split(' ')[0].toLowerCase();
  const avatars: Record<string, string> = {
    'diego': DiegoAvatar,
    'lucas': LucasAvatar,
    'menta': MentaAvatar,
    'thiago': ThiagoAvatar,
    'julia': JuliaAvatar,
    'valesca': ValescaAvatar,
    'vitória': VitoriaAvatar,
    'lucca': LucaVitoriaAvatar,
    'luca': LucaVitoriaAvatar,
  };
  return avatars[firstName] || LucasAvatar;
};

export const Rankings: React.FC = () => {
  const { people: contextPeople } = useData();
  const [people, setPeople] = useState(contextPeople);
  const [activeTab, setActiveTab] = useState<'awake' | 'warmup'>('awake');
  
  // Recarrega dados frescos do localStorage quando componente monta
  useEffect(() => {
    const freshData = JSON.parse(localStorage.getItem('lucasflix_data') || '{}');
    if (freshData.people) setPeople(freshData.people);
  }, []);
  
  // ESCUTA evento global de atualização de dados
  useEffect(() => {
    const handleDataUpdate = () => {
      const freshData = JSON.parse(localStorage.getItem('lucasflix_data') || '{}');
      if (freshData.people) setPeople(freshData.people);
    };
    
    window.addEventListener('lucasflix-data-updated', handleDataUpdate);
    return () => window.removeEventListener('lucasflix-data-updated', handleDataUpdate);
  }, []);
  
  // Atualiza quando contexto muda
  useEffect(() => {
    setPeople(contextPeople);
  }, [contextPeople]);

  const COLORS = ['#e50914', '#ff3838', '#ff6b6b', '#ffaa00'];

  // Helper para formatar tempo
  const formatSleepTime = (minutes: number) => {
    if (minutes < 1) {
      const seconds = Math.round(minutes * 60);
      return `${seconds}s`;
    }
    const mins = Math.round(minutes);
    return `${mins}min`;
  };

  // Calculate most awake ranking (filtra alternativos)
  const awakeRanking = people
    .filter(person => !person.isAlternative)
    .map(person => ({
      person,
      survived: person.stats.totalSurvived,
      participated: person.stats.totalSessions,
      sleptFirst: person.stats.timesSleptFirst,
      rate: person.stats.totalSessions > 0 
        ? ((person.stats.totalSurvived / person.stats.totalSessions) * 100).toFixed(0) 
        : '0'
    }))
    .sort((a, b) => b.survived - a.survived);

  // Calculate sleepers ranking (Dorminhocos) (filtra alternativos)
  const sleepersRanking = people
    .filter(person => !person.isAlternative)
    .map(person => ({
      person,
      totalNaps: person.stats.totalNaps,
      totalSleepMinutes: person.stats.totalSleepMinutes,
      avgNapsPerSession: person.stats.totalNaps > 0 && person.stats.totalSlept > 0
        ? (person.stats.totalNaps / person.stats.totalSlept).toFixed(1)
        : '0'
    }))
    .sort((a, b) => {
      if (b.totalSleepMinutes !== a.totalSleepMinutes) {
        return b.totalSleepMinutes - a.totalSleepMinutes;
      }
      return b.totalNaps - a.totalNaps;
    });

  // Calculate warm-up king ranking (Aquecimento) (filtra alternativos)
  const warmUpRanking = people
    .filter(person => !person.isAlternative)
    .map(person => {
      const wins = person.stats.warmupWins;
      const total = person.stats.warmupGames;
      const draws = 0; // não temos esse dado separado ainda
      const losses = total - wins;
      const points = wins * 3 + draws * 1;
      const winRate = total > 0 ? ((wins / total) * 100).toFixed(0) : '0';
      return { person, wins, draws, losses, points, total, winRate };
    })
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.wins - a.wins;
    });

  return (
    <div className="rankings-page">
      <motion.div 
        className="page-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          animate={{ 
            textShadow: [
              '0 0 20px rgba(229, 9, 20, 0.5)',
              '0 0 40px rgba(229, 9, 20, 0.8)',
              '0 0 20px rgba(229, 9, 20, 0.5)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🏆 Rankings
        </motion.h1>
      </motion.div>

      <div className="tabs">
        <motion.button 
          className={`tab ${activeTab === 'awake' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('awake')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          😴 Mais Acordados
        </motion.button>
        <motion.button 
          className={`tab ${activeTab === 'warmup' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('warmup')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🎮 Rei do Aquecimento
        </motion.button>
      </div>

      {activeTab === 'awake' && (
        <>
          {/* Chart Section */}
          <div className="charts-section">
            <Card>
              <h3 style={{ marginBottom: '1.5rem' }}>📊 Análise de Desempenho</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={awakeRanking}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="person.name" 
                    stroke="#b3b3b3"
                    style={{ fontSize: '0.85rem' }}
                  />
                  <YAxis stroke="#b3b3b3" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid rgba(229, 9, 20, 0.5)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="survived" name="Sobrevivências" fill="#e50914" />
                  <Bar dataKey="sleptFirst" name="Dormiu Primeiro" fill="#ff6b6b" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 style={{ marginBottom: '1.5rem' }}>🥧 Taxa de Sucesso</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={awakeRanking}
                    dataKey="survived"
                    nameKey="person.name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.person.name}: ${entry.rate}%`}
                  >
                    {awakeRanking.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid rgba(229, 9, 20, 0.5)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Row title="Ranking: Mais Acordados">
          {awakeRanking.map((item, index) => (
            <motion.div
              key={item.person.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <motion.div 
                  className="ranking-position"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  #{index + 1}
                </motion.div>
                <h3>{item.person.name}</h3>
                <div className="ranking-stats">
                  <div className="stat">
                    <span className="stat-label">Sobrevivências</span>
                    <span className="stat-value">✅ {item.survived}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Participações</span>
                    <span className="stat-value">📊 {item.participated}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Dormiu Primeiro</span>
                    <span className="stat-value">😴 {item.sleptFirst}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Taxa</span>
                    <span className="stat-value stat-highlight">💯 {item.rate}%</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </Row>

        {/* Estatísticas de Sono/Cochilos */}
        <div className="sleep-ranking-section">
            <h2 className="row-title" style={{ padding: '0 3rem', marginBottom: '1rem' }}>😴 Ranking de Cochilos</h2>
            <div className="sleep-cards-grid">
              {sleepersRanking.map((item, index) => (
                <motion.div
                  key={item.person.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card>
                  <div className="sleep-card-dream">
                    {/* Efeitos de fundo */}
                    <div className="sleep-bg-effects">
                      <motion.div 
                        className="sleep-moon"
                        animate={{ 
                          y: [0, -10, 0],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        🌙
                      </motion.div>
                      <motion.div 
                        className="sleep-z z1"
                        animate={{ 
                          y: [-20, -60],
                          x: [0, 10],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                      >
                        z
                      </motion.div>
                      <motion.div 
                        className="sleep-z z2"
                        animate={{ 
                          y: [-20, -60],
                          x: [0, -10],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                      >
                        z
                      </motion.div>
                      <motion.div 
                        className="sleep-z z3"
                        animate={{ 
                          y: [-20, -60],
                          x: [0, 5],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                      >
                        z
                      </motion.div>
                      {index === 0 && (
                        <motion.div 
                          className="sleep-crown"
                          animate={{ 
                            rotate: [-10, 10, -10],
                            y: [0, -5, 0]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          👑
                        </motion.div>
                      )}
                    </div>

                    {/* Ranking Badge */}
                    <div className={`sleep-rank rank-${index + 1}`}>
                      {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`}
                    </div>

                    {/* Avatar com efeito */}
                    <motion.div 
                      className="sleep-avatar-container"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="sleep-avatar-glow"></div>
                      <img 
                        src={getAvatar(item.person.name)} 
                        alt={item.person.name}
                        className="sleep-avatar"
                      />
                    </motion.div>

                    {/* Nome */}
                    <h3 className="sleep-name">{item.person.name}</h3>
                    
                    {index === 0 && (
                      <motion.div 
                        className="sleep-king-badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        ⭐ Mestre do Sono ⭐
                      </motion.div>
                    )}

                    {/* Stats com design temático */}
                    <div className="sleep-stats-grid">
                      <motion.div 
                        className="sleep-stat-box"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="sleep-stat-icon-big">💤</div>
                        <div className="sleep-stat-value">{item.totalNaps}</div>
                        <div className="sleep-stat-label">Cochilos</div>
                      </motion.div>
                      
                      <motion.div 
                        className="sleep-stat-box"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="sleep-stat-icon-big">⏰</div>
                        <div className="sleep-stat-value">{formatSleepTime(item.totalSleepMinutes)}</div>
                        <div className="sleep-stat-label">Dormindo</div>
                      </motion.div>
                      
                      <motion.div 
                        className="sleep-stat-box"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="sleep-stat-icon-big">😴</div>
                        <div className="sleep-stat-value">{item.avgNapsPerSession}</div>
                        <div className="sleep-stat-label">Por Sessão</div>
                      </motion.div>
                    </div>

                    {/* Barra de sono */}
                    <div className="sleep-meter">
                      <div className="sleep-meter-label">Nível de Sonolência</div>
                      <div className="sleep-meter-bar">
                        <motion.div 
                          className="sleep-meter-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (item.totalNaps / sleepersRanking[0].totalNaps) * 100)}%` }}
                          transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                        >
                          <div className="sleep-meter-glow"></div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'warmup' && (
        <>
          {/* Warm-up Charts */}
          <div className="charts-section">
            <Card>
              <h3 style={{ marginBottom: '1.5rem' }}>🎮 Resultados do Aquecimento</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={warmUpRanking.filter(r => r.total > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="person.name" 
                    stroke="#b3b3b3"
                    style={{ fontSize: '0.85rem' }}
                  />
                  <YAxis stroke="#b3b3b3" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid rgba(229, 9, 20, 0.5)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="wins" name="Vitórias" fill="#22c55e" />
                  <Bar dataKey="draws" name="Empates" fill="#f59e0b" />
                  <Bar dataKey="losses" name="Derrotas" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 style={{ marginBottom: '1.5rem' }}>⭐ Pontos Totais</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={warmUpRanking.filter(r => r.total > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="person.name" 
                    stroke="#b3b3b3"
                    style={{ fontSize: '0.85rem' }}
                  />
                  <YAxis stroke="#b3b3b3" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid rgba(229, 9, 20, 0.5)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="points" name="Pontos" fill="#e50914" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Row title="🎮 Ranking: Rei do Aquecimento">
          {warmUpRanking.filter(r => r.total > 0).map((item, index) => (
            <motion.div
              key={item.person.id}
              initial={{ opacity: 0, rotate: -10 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
            >
              <Card>
                <motion.div 
                  className="ranking-position"
                  animate={index === 0 ? { 
                    scale: [1, 1.3, 1],
                    rotate: [0, 360]
                  } : {}}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  {index === 0 ? '👑' : `#${index + 1}`}
                </motion.div>
                <h3>🎮 {item.person.name}</h3>
                <div className="ranking-stats">
                  <motion.div 
                    className="stat"
                    whileHover={{ x: 10, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                  >
                    <span className="stat-label">Vitórias</span>
                    <span className="stat-value">🏆 {item.wins}</span>
                  </motion.div>
                  <motion.div 
                    className="stat"
                    whileHover={{ x: 10, backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
                  >
                    <span className="stat-label">Empates</span>
                    <span className="stat-value">🤝 {item.draws}</span>
                  </motion.div>
                  <motion.div 
                    className="stat"
                    whileHover={{ x: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                  >
                    <span className="stat-label">Derrotas</span>
                    <span className="stat-value">❌ {item.losses}</span>
                  </motion.div>
                  <motion.div 
                    className="stat"
                    whileHover={{ x: 10, backgroundColor: 'rgba(229, 9, 20, 0.1)' }}
                  >
                    <span className="stat-label">Pontos</span>
                    <span className="stat-value stat-highlight">⭐ {item.points}</span>
                  </motion.div>
                  <motion.div 
                    className="stat"
                    whileHover={{ x: 10, backgroundColor: 'rgba(229, 9, 20, 0.05)' }}
                  >
                    <span className="stat-label">Taxa Vitória</span>
                    <span className="stat-value">📈 {item.winRate}%</span>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ))}
          {warmUpRanking.filter(r => r.total > 0).length === 0 && (
            <motion.p 
              style={{ color: '#888', textAlign: 'center' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Nenhum aquecimento registrado ainda.
            </motion.p>
          )}
        </Row>
        </>
      )}
    </div>
  );
};
