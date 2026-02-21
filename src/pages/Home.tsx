import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { Row } from '../components/Row';
import { Card } from '../components/Card';
import { PageTransition } from '../components/PageTransition';
import { Modal } from '../components/Modal';
import './Home.css';
// Avatar imports
import DiegoAvatar from '../imgs/DiegoAvatar.png';
import LucasAvatar from '../imgs/LucasAvatar.png';
import MentaAvatar from '../imgs/MentaAvatar.png';
import ThiagoAvatar from '../imgs/ThiagoAvatar.png';
import LucaVitoriaAvatar from '../imgs/lucaVitoriaAvatar.png';
import Sono1Image from '../imgs/sonecas/sono1.jpg';
import Sono2Image from '../imgs/sonecas/sono2.jpeg';
import FlexaoVideo from '../imgs/sonecas/flexoes/WhatsApp Video 2026-02-07 at 01.05.46.mp4';

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

export const Home: React.FC = () => {
  const { 
    sessions: contextSessions, 
    dailyMovies, 
    votes, 
    people: contextPeople, 
    getPerson,
    activeSession,
    clearActiveSession 
  } = useData();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState(contextSessions);
  const [people, setPeople] = useState(contextPeople);
  const carouselRef = useRef<HTMLDivElement>(null);
  const photosCarouselRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSessionModal, setShowSessionModal] = useState(false);
  
  // Atualiza states locais quando o contexto muda
  useEffect(() => {
    console.log('🏠 Home - Dados do contexto atualizados');
    console.log('🏠 Total de pessoas:', people.length, 'Total de sessões:', sessions.length);
  }, [people, sessions]);
  
  // Atualiza quando contexto muda
  useEffect(() => {
    console.log('🔄 Home - Contexto people mudou');
    setPeople(contextPeople);
  }, [contextPeople]);
  
  useEffect(() => {
    console.log('🔄 Home - Contexto sessions mudou');
    setSessions(contextSessions);
  }, [contextSessions]);
  

  
  const heroImages = [
    '/src/imgs/Header/amigos.png',
    '/src/imgs/Header/amigos2.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Troca a cada 5 segundos
    
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const scrollCarousel = (direction: 'left' | 'right', ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      const scrollAmount = 400;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Função para verificar sessão ativa ao iniciar nova
  const handleStartSession = () => {
    if (activeSession) {
      setShowSessionModal(true);
    } else {
      navigate('/start-session');
    }
  };

  // Get today's date
  const today = new Date().toISOString().split('T')[0];



  // Calculate most awake ranking (filtra alternativos)
  const awakeRanking = people
    .filter(person => !person.isAlternative)
    .map(person => ({
      person,
      survived: person.stats.totalSurvived,
      participated: person.stats.totalSessions
    }))
    .sort((a, b) => b.survived - a.survived)
    .slice(0, 4);

  // Calculate warm-up king ranking (Aquecimento) (filtra alternativos)
  const warmUpRanking = people
    .filter(person => !person.isAlternative)
    .map(person => {
      const games = sessions.filter(s => s.warmUp?.playerPersonId === person.id);
      const wins = games.filter(g => g.warmUp?.result === 'GANHOU').length;
      const draws = games.filter(g => g.warmUp?.result === 'EMPATE').length;
      const losses = games.filter(g => g.warmUp?.result === 'PERDEU').length;
      const points = wins * 3 + draws * 1;
      return { person, wins, draws, losses, points, total: games.length };
    }).sort((a, b) => b.points - a.points).slice(0, 4);

  // Get latest daily movies (today's movies)
  const latestMovies = [...dailyMovies]
    .filter(m => m.createdAtISO && m.dateISO === today) // Filter today's movies
    .sort((a, b) => b.createdAtISO.localeCompare(a.createdAtISO))
    .slice(0, 4);

  const getMovieAverage = (movieId: string) => {
    const movieVotes = votes.filter(v => v.dailyMovieId === movieId);
    if (movieVotes.length === 0) return 0;
    const sum = movieVotes.reduce((acc, v) => acc + v.stars, 0);
    return (sum / movieVotes.length).toFixed(1);
  };

  return (
    <PageTransition>
      <div className="home">
      {/* Particulas flutuantes em toda a página */}
      <div className="page-particles">
        {[...Array(35)].map((_, i) => {
          const startPosition = Math.random() * (window.innerHeight + 200) - 200;
          return (
            <motion.div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: `${startPosition}px`,
              }}
              animate={{
                y: [0, -(window.innerHeight + 300)],
                opacity: [0, 0.9, 0.7, 0],
              }}
              transition={{
                duration: 15 + Math.random() * 12,
                repeat: Infinity,
                ease: "linear",
                delay: 0,
              }}
            />
          );
        })}
      </div>

      {/* Start Session CTA - Enhanced Hero */}
      <motion.div 
        className="start-session-cta"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className="cta-backdrop">
          {heroImages.map((img, index) => (
            <motion.img
              key={img}
              src={img}
              alt=""
              className="cta-bg"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: index === currentImageIndex ? 1 : 0,
                scale: index === currentImageIndex ? 1 : 1.1
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          ))}
          <div className="cta-gradient-overlay"></div>
        </div>
        
        <div className="cta-content-wrapper">
          <motion.div
            className="cta-text-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <h1 className="cta-title">
              <span className="cta-title-line">Bem-vindo ao</span>
              <span className="cta-title-brand">LucasFlix</span>
            </h1>
            <p className="cta-subtitle">Seus momentos de cinema com os amigos</p>
          </motion.div>
          
          <motion.button 
            className="btn-cta-enhanced"
            onClick={handleStartSession}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="btn-cta-glow"></span>
              <span className="btn-cta-icon">🎬</span>
              <span className="btn-cta-text">Iniciar Sessão</span>
              <motion.span 
                className="btn-cta-arrow"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.button>
        </div>
        
        <div className="slideshow-indicators">
          {heroImages.map((_, index) => (
            <motion.button
              key={index}
              className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </motion.div>

      <div className="home-content">
        {/* Daily Movies Row */}
        <Row title="🎬 Filmes do Dia" action={<Link to="/daily-movies" className="view-all-link">Ver tudo</Link>} className="ranking-grid">
          {latestMovies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="daily-movie-card">
                <div className="daily-movie-poster">
                  <motion.img 
                    src="/lucasFlixImg.webp" 
                    alt={movie.title}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="poster-overlay">
                    <motion.button 
                      className="play-button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ▶
                    </motion.button>
                  </div>
                  <div className="movie-rating-badge">
                    <span className="rating-stars">★</span>
                    <span className="rating-value">{getMovieAverage(movie.id)}</span>
                  </div>
                </div>
                <div className="daily-movie-content">
                  <h4 className="movie-title">{movie.title}</h4>
                  <div className="movie-meta">
                    <span className="meta-item">
                      <span className="meta-icon">👤</span>
                      {getPerson(movie.createdByPersonId)?.name.split(' ')[0]}
                    </span>
                    <span className="meta-divider">•</span>
                    <span className="meta-item">
                      {new Date(movie.dateISO).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <div className="movie-votes">
                    {votes.filter(v => v.dailyMovieId === movie.id).length > 0 ? (
                      <span>{votes.filter(v => v.dailyMovieId === movie.id).length} votos</span>
                    ) : (
                      <span className="no-votes">Seja o primeiro a votar</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </Row>

        <Row title="Mais Acordados" action={<Link to="/rankings" className="view-all-link">Ver ranking</Link>} className="ranking-grid">
          {awakeRanking.map((item, index) => {
            const trophies = ['🥇', '🥈', '🥉', '🏅'];
            const trophy = trophies[index] || '🏆';
            return (
              <motion.div
                key={item.person.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card>
                  <div className="ranking-card-compact ranking-awake modern-card">
                    <div className="card-glow-bg"></div>
                    <div className="rank-header">
                      <motion.div 
                        className="trophy-big"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, 0, -5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        whileHover={{ scale: 1.3, rotate: 15 }}
                      >
                        {trophy}
                      </motion.div>
                      <motion.div 
                        className="rank-position"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                      >
                        #{index + 1}
                      </motion.div>
                    </div>
                    <motion.div 
                      className="rank-avatar"
                      whileHover={{ scale: 1.15, rotate: 8 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="avatar-ring"></div>
                      <img src={getAvatar(item.person.name)} alt={item.person.name} />
                    </motion.div>
                    <motion.h4 
                      className="rank-name"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                    >
                      {item.person.name}
                    </motion.h4>
                    <motion.div 
                      className="stats-single"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      <div className="stat-compact-large">
                        <motion.span 
                          className="stat-num-large"
                          whileHover={{ scale: 1.2, color: "#ff4444" }}
                        >
                          {item.survived}
                        </motion.span>
                        <span className="stat-txt">sobrevivências</span>
                      </div>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </Row>

        {warmUpRanking.length > 0 && (
          <Row title="Rei do Aquecimento" action={<Link to="/rankings?tab=warmup" className="view-all-link">Ver ranking</Link>} className="ranking-grid">
            {warmUpRanking.map((item, index) => (
              <motion.div
                key={item.person.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card>
                  <div className="ranking-card-compact ranking-warmup modern-card">
                    <div className="card-glow-bg gold"></div>
                    <div className="rank-header">
                      {index === 0 ? (
                        <motion.div 
                          className="trophy-big king"
                          animate={{ 
                            rotate: [0, -10, 10, 0],
                            scale: [1, 1.15, 1],
                            y: [0, -5, 0]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                          whileHover={{ scale: 1.4, rotate: 20 }}
                        >
                          👑
                        </motion.div>
                      ) : (
                        <motion.div 
                          className="trophy-big"
                          whileHover={{ scale: 1.3, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          ⚽
                        </motion.div>
                      )}
                      <motion.div 
                        className="rank-position gold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                      >
                        {index === 0 ? 'REI' : `#${index + 1}`}
                      </motion.div>
                    </div>
                    <motion.div 
                      className="rank-avatar"
                      whileHover={{ scale: 1.15, rotate: -8 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="avatar-ring gold"></div>
                      <img src={getAvatar(item.person.name)} alt={item.person.name} />
                      {index === 0 && (
                        <motion.div 
                          className="avatar-crown"
                          animate={{ y: [-2, 2, -2] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          👑
                        </motion.div>
                      )}
                    </motion.div>
                    <motion.h4 
                      className="rank-name"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                    >
                      {item.person.name}
                    </motion.h4>
                    <motion.div 
                      className="stats-horizontal"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      <div className="stat-compact">
                        <motion.span 
                          className="stat-num gold"
                          whileHover={{ scale: 1.2 }}
                        >
                          {item.wins}
                        </motion.span>
                        <span className="stat-txt">vitórias</span>
                      </div>
                      <div className="stat-divider"></div>
                      <div className="stat-compact">
                        <motion.span 
                          className="stat-num points"
                          whileHover={{ scale: 1.2 }}
                        >
                          {item.points}
                        </motion.span>
                        <span className="stat-txt">pontos</span>
                      </div>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </Row>
        )}

        <div className="sleep-carousel-section">
          <div className="sleep-header">
            <div className="sleep-icon">🌙</div>
            <h2>Mural do Sono</h2>
            <div className="sleep-decoration">✨ Zzz... ✨</div>
          </div>
          
          <div className="carousel-container">
            <button className="carousel-btn carousel-btn-left" onClick={() => scrollCarousel('left', carouselRef)} aria-label="Anterior">
              ‹
            </button>
            
            <div className="carousel-track" ref={carouselRef}>
              <div className="carousel-item">
                <div className="sleep-card sleep-card-photo special-card">
                  <div className="special-badge">⭐ Primeira Soneca Histórica</div>
                  <img src={Sono1Image} alt="Momento do sono" />
                  <div className="sleep-card-overlay">
                    <span className="sleep-card-date">😴 Primeira soneca registrada do LucasFlix</span>
                  </div>
                </div>
              </div>
              <div className="carousel-item">
                <div className="sleep-card sleep-card-video special-card">
                  <div className="special-badge">🏆 Momento Bodybuilder</div>
                  <video controls src={FlexaoVideo} />
                  <div className="sleep-card-overlay">
                    <span className="sleep-card-date">💪 Só faz flexão quem dorme!</span>
                  </div>
                </div>
              </div>
              <div className="carousel-item">
                <div className="sleep-card sleep-card-photo special-card">
                  <div className="special-badge">👑 Rei da Soneca</div>
                  <img src={Sono2Image} alt="Sono 2" />
                  <div className="sleep-card-overlay">
                    <span className="sleep-card-date">😴 Mais uma vítima do sono</span>
                  </div>
                </div>
              </div>
              <div className="carousel-item">
                <div className="sleep-card">
                  <div className="sleep-card-icon">😴</div>
                  <p>Momentos inesquecíveis</p>
                </div>
              </div>
              <div className="carousel-item">
                <div className="sleep-card">
                  <div className="sleep-card-icon">🛌</div>
                  <p>Capturados aqui</p>
                </div>
              </div>
              <div className="carousel-item">
                <div className="sleep-card">
                  <div className="sleep-card-icon">💪</div>
                  <p>Hall da Flexão</p>
                </div>
              </div>
              <div className="carousel-item">
                <div className="sleep-card">
                  <div className="sleep-card-icon">🌟</div>
                  <p>Galeria de sonecas</p>
                </div>
              </div>
              <div className="carousel-item">
                <div className="sleep-card">
                  <div className="sleep-card-icon">💫</div>
                  <p>Mais em breve</p>
                </div>
              </div>
            </div>
            
            <button className="carousel-btn carousel-btn-right" onClick={() => scrollCarousel('right', carouselRef)} aria-label="Próximo">
              ›
            </button>
          </div>
        </div>

        {/* Mural de Fotos do LucasFlix */}
        <div className="photos-carousel-section">
          <div className="photos-header">
            <div className="photos-icon">📸</div>
            <h2>Galeria de Momentos</h2>
            <div className="photos-decoration">✨ Memórias ✨</div>
          </div>
          
          <div className="carousel-container">
            <button className="carousel-btn carousel-btn-left" onClick={() => scrollCarousel('left', photosCarouselRef)} aria-label="Anterior">
              ‹
            </button>
            
            <div className="carousel-track" ref={photosCarouselRef}>
              <div className="carousel-item">
                <div className="photo-card">
                  <div className="photo-polaroid">
                    <div className="photo-frame-inner">
                      <img src="/src/imgs/Header/amigos.png" alt="LucasFlix Momento 1" />
                    </div>
                    <div className="photo-caption-bar">
                      <span className="photo-caption-text">🎬 Sessão Especial</span>
                      <span className="photo-date">2024</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="carousel-item">
                <div className="photo-card">
                  <div className="photo-polaroid">
                    <div className="photo-frame-inner">
                      <img src="/src/imgs/Header/amigos2.jpg" alt="LucasFlix Momento 2" />
                    </div>
                    <div className="photo-caption-bar">
                      <span className="photo-caption-text">🎉 Noite de Cinema</span>
                      <span className="photo-date">2024</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="carousel-item">
                <div className="photo-card">
                  <div className="photo-polaroid">
                    <div className="photo-frame-inner">
                      <img src="/src/imgs/Header/amigos.png" alt="LucasFlix Momento 3" />
                    </div>
                    <div className="photo-caption-bar">
                      <span className="photo-caption-text">🍿 Amigos Reunidos</span>
                      <span className="photo-date">2024</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="carousel-item">
                <div className="photo-card">
                  <div className="photo-polaroid">
                    <div className="photo-frame-inner">
                      <img src="/src/imgs/Header/amigos2.jpg" alt="LucasFlix Momento 4" />
                    </div>
                    <div className="photo-caption-bar">
                      <span className="photo-caption-text">⭐ Momento Marcante</span>
                      <span className="photo-date">2024</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="carousel-item">
                <div className="photo-card">
                  <div className="photo-polaroid">
                    <div className="photo-frame-inner">
                      <img src="/src/imgs/Header/amigos.png" alt="LucasFlix Momento 5" />
                    </div>
                    <div className="photo-caption-bar">
                      <span className="photo-caption-text">🎥 Sessão Épica</span>
                      <span className="photo-date">2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="carousel-btn carousel-btn-right" onClick={() => scrollCarousel('right', photosCarouselRef)} aria-label="Próximo">
              ›
            </button>
          </div>
        </div>

        {/* Destaque da Semana - Melhorado */}
        <div className="weekly-spotlight-section">
          <motion.div 
            className="spotlight-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="spotlight-title-wrapper">
              <span className="spotlight-icon">⭐</span>
              <h2 className="spotlight-title">Destaques da Semana</h2>
              <span className="spotlight-icon">⭐</span>
            </div>
            <p className="spotlight-subtitle">Os melhores momentos dos últimos 7 dias</p>
          </motion.div>
          
          <div className="spotlight-container">
            {/* MVP Card - Destaque Principal */}
            <motion.div 
              className="spotlight-mvp-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{ y: -10, boxShadow: "0 30px 80px rgba(255, 215, 0, 0.4)" }}
            >
              <div className="mvp-crown">👑</div>
              {(() => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                const recentSessions = sessions.filter(s => new Date(s.dateISO) >= weekAgo);
                const scores = people
                  .filter(p => !p.isAlternative && p.isVisible !== false)
                  .map(p => ({
                    person: p,
                    score: recentSessions.filter(s => 
                      s.participantIds.includes(p.id) && 
                      !(s.sleepTimes || []).some(st => st.personId === p.id)
                    ).length,
                    participated: recentSessions.filter(s => s.participantIds.includes(p.id)).length
                  }))
                  .filter(s => s.participated > 0)
                  .sort((a, b) => b.score - a.score);
                
                const topScore = scores[0]?.score;
                const mvps = scores.filter(s => s.score === topScore);
                
                return mvps.length > 0 ? (
                  <>
                    <div className="mvp-badge-float">
                      {mvps.length > 1 ? `${mvps.length} MVPs DA SEMANA` : 'MVP DA SEMANA'}
                    </div>
                    {mvps.length === 1 ? (
                      <>
                        <div className="mvp-avatar-wrapper">
                          <img src={getAvatar(mvps[0].person.name)} alt={mvps[0].person.name} className="mvp-avatar-large" />
                          <div className="mvp-glow"></div>
                        </div>
                        <div className="mvp-details">
                          <h3 className="mvp-name">{mvps[0].person.name}</h3>
                          <div className="mvp-stats-grid">
                            <div className="mvp-stat-item">
                              <span className="stat-value">{mvps[0].score}</span>
                              <span className="stat-label">Sessões Acordado</span>
                            </div>
                            <div className="mvp-stat-item">
                              <span className="stat-value">{mvps[0].participated}</span>
                              <span className="stat-label">Participações</span>
                            </div>
                            <div className="mvp-stat-item">
                              <span className="stat-value">{Math.round((mvps[0].score / mvps[0].participated) * 100)}%</span>
                              <span className="stat-label">Taxa de Sucesso</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mvp-avatars-grid">
                          {mvps.map(mvp => (
                            <div key={mvp.person.id} className="mvp-avatar-item">
                              <img src={getAvatar(mvp.person.name)} alt={mvp.person.name} className="mvp-avatar-small" />
                              <div className="mvp-glow-small"></div>
                              <p className="mvp-name-small">{mvp.person.name}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mvp-details">
                          <div className="mvp-stats-grid">
                            <div className="mvp-stat-item">
                              <span className="stat-value">{topScore}</span>
                              <span className="stat-label">Sessões Acordado</span>
                            </div>
                            <div className="mvp-stat-item">
                              <span className="stat-value">{mvps[0].participated}</span>
                              <span className="stat-label">Participações</span>
                            </div>
                            <div className="mvp-stat-item">
                              <span className="stat-value">{Math.round((topScore / mvps[0].participated) * 100)}%</span>
                              <span className="stat-label">Taxa de Sucesso</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <p className="no-data-message">Aguardando mais sessões para calcular o MVP</p>
                );
              })()}
            </motion.div>

            {/* Cards Secundários */}
            <div className="spotlight-secondary-grid">
              {/* Reis do Cochilo */}
              <motion.div 
                className="spotlight-card sleep-spotlight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 50px rgba(108, 122, 224, 0.4)" }}
              >
                {(() => {
                  const sleepers = people
                    .filter(p => !p.isAlternative && p.isVisible !== false)
                    .map(p => ({
                      person: p,
                      naps: p.stats.totalNaps
                    }))
                    .sort((a, b) => b.naps - a.naps);
                  
                  const topNaps = sleepers[0]?.naps;
                  const topSleepers = sleepers.filter(s => s.naps === topNaps && s.naps > 0);
                  
                  return topSleepers.length > 0 ? (
                    <>
                      <div className="card-badge sleepy">
                        {topSleepers.length > 1 ? `${topSleepers.length} Reis do Cochilo` : 'Rei do Cochilo'}
                      </div>
                      <div className="card-icon-large">😴</div>
                      {topSleepers.length === 1 ? (
                        <>
                          <h3 className="card-name">{topSleepers[0].person.name}</h3>
                          <div className="card-stat-highlight">
                            <span className="stat-big">{topSleepers[0].naps}</span>
                            <span className="stat-unit">sonecas registradas</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="sleepers-names-list">
                            {topSleepers.map(s => (
                              <p key={s.person.id} className="sleeper-name">{s.person.name}</p>
                            ))}
                          </div>
                          <div className="card-stat-highlight">
                            <span className="stat-big">{topNaps}</span>
                            <span className="stat-unit">sonecas cada</span>
                          </div>
                        </>
                      )}
                    </>
                  ) : <p className="no-data-mini">Nenhuma soneca ainda</p>;
                })()}
              </motion.div>

              {/* Melhor Momento */}
              <motion.div 
                className="spotlight-card moment-spotlight"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 50px rgba(229, 9, 20, 0.4)" }}
              >
                <div className="card-badge moment">📸 Momento Épico</div>
                <div className="moment-photo-wrapper">
                  <img src={Sono1Image} alt="Melhor momento" className="moment-photo-featured" />
                  <div className="photo-overlay-gradient"></div>
                </div>
                <div className="moment-description">
                  <p>Primeira soneca histórica do LucasFlix!</p>
                </div>
              </motion.div>

              {/* Momento Bodybuilder */}
              <motion.div 
                className="spotlight-card moment-spotlight bodybuilder-spotlight"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 50px rgba(229, 9, 20, 0.4)" }}
              >
                <div className="card-badge moment">💪 Bodybuilder</div>
                <div className="moment-photo-wrapper">
                  <video 
                    src={FlexaoVideo} 
                    className="moment-photo-featured" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                  />
                  <div className="photo-overlay-gradient"></div>
                </div>
                <div className="moment-description">
                  <p>Momento Bodybuilder Épico! 🏆</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Modal de Sessão Ativa */}
    <Modal 
      isOpen={showSessionModal} 
      onClose={() => setShowSessionModal(false)}
      title="⚠️ Sessão em Andamento"
    >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ marginBottom: '30px', fontSize: '16px', opacity: 0.9 }}>
            Você já tem uma sessão aberta. Deseja continuar de onde parou?
          </p>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              className="btn-secondary"
              onClick={async () => {
                await clearActiveSession();
                setShowSessionModal(false);
                navigate('/start-session');
              }}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Não, iniciar nova
            </button>
            
            <button
              className="btn-primary"
              onClick={() => {
                setShowSessionModal(false);
                navigate('/start-session', { state: { continueSession: true } });
              }}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                background: 'linear-gradient(135deg, #6C7AE0 0%, #5563C1 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: '600'
              }}
            >
              Sim, continuar
            </button>
          </div>
        </div>
      </Modal>

    </PageTransition>
  );
};
