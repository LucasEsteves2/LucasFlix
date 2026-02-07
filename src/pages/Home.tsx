import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { Row } from '../components/Row';
import { Card } from '../components/Card';
import { PageTransition } from '../components/PageTransition';
import './Home.css';
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

export const Home: React.FC = () => {
  const { sessions: contextSessions, dailyMovies, votes, people: contextPeople, getPerson } = useData();
  const [sessions, setSessions] = useState(contextSessions);
  const [people, setPeople] = useState(contextPeople);
  const carouselRef = useRef<HTMLDivElement>(null);
  const photosCarouselRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
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
          
          <Link to="/start-session" className="cta-button-wrapper">
            <motion.button 
              className="btn-cta-enhanced"
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
          </Link>
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
                  <img src="/src/imgs/sonecas/sono1.jpg" alt="Momento do sono" />
                  <div className="sleep-card-overlay">
                    <span className="sleep-card-date">😴 Primeira soneca registrada do LucasFlix</span>
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
                  <div className="sleep-card-icon">🌟</div>
                  <p>Galeria de sonecas</p>
                </div>
              </div>
              <div className="carousel-item">
                <div className="sleep-card">
                  <div className="sleep-card-icon">💫</div>
                  <p>Em construção</p>
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
      </div>
    </div>
    </PageTransition>
  );
};
