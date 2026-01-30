import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useData } from '../context/DataContext';
import { Row } from '../components/Row';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
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
  const { sessions: contextSessions, shameWall, dailyMovies, votes, people: contextPeople, getPerson } = useData();
  const [sessions, setSessions] = useState(contextSessions);
  const [people, setPeople] = useState(contextPeople);
  const [forceUpdate, setForceUpdate] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const photosCarouselRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Força recarga dos dados SEMPRE que o componente renderiza
  const reloadData = () => {
    console.log('🔄 Home - Recarregando dados do localStorage...');
    const freshData = JSON.parse(localStorage.getItem('lucasflix_data') || '{}');
    if (freshData.people) {
      console.log('🔄 Home - Atualizando people, exemplo Thiago:', freshData.people.find((p: any) => p.name === 'Thiago')?.stats);
      setPeople(freshData.people);
    }
    if (freshData.sessions) {
      console.log('🔄 Home - Atualizando sessions, total:', freshData.sessions.length);
      setSessions(freshData.sessions);
    }
    setForceUpdate(prev => prev + 1);
  };
  
  // Recarrega dados frescos do localStorage quando componente monta
  useEffect(() => {
    console.log('🏠 Home montado - carregando dados iniciais');
    reloadData();
  }, []);
  
  // ESCUTA evento global de atualização de dados
  useEffect(() => {
    const handleDataUpdate = (event: any) => {
      console.log('📡 Home - Recebeu evento de atualização!');
      reloadData();
    };
    
    const handleForceReload = () => {
      console.log('🔄 Home - FORCE RELOAD solicitado!');
      setTimeout(() => reloadData(), 50);
    };
    
    window.addEventListener('lucasflix-data-updated', handleDataUpdate);
    window.addEventListener('lucasflix-force-reload', handleForceReload);
    
    return () => {
      window.removeEventListener('lucasflix-data-updated', handleDataUpdate);
      window.removeEventListener('lucasflix-force-reload', handleForceReload);
    };
  }, []);
  
  // Atualiza quando contexto muda
  useEffect(() => {
    console.log('🔄 Home - Contexto people mudou');
    setPeople(contextPeople);
  }, [contextPeople]);
  
  useEffect(() => {
    console.log('🔄 Home - Contexto sessions mudou');
    setSessions(contextSessions);
  }, [contextSessions]);
  
  // IMPORTANTE: Também recarrega quando a rota muda (volta pra Home)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Home - Window focus, recarregando...');
      reloadData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  
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

  // Get today's session or next upcoming session
  const today = new Date().toISOString().split('T')[0];
  const todaySession = sessions.find(s => s.dateISO === today);
  
  // If no session today, find the next upcoming one
  const upcomingSession = !todaySession ? 
    [...sessions]
      .filter(s => s.dateISO > today)
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO))[0] 
    : null;

  // Get latest sessions (excluding today's/upcoming)
  const latestSessions = [...sessions]
    .filter(s => s !== todaySession && s !== upcomingSession)
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO))
    .slice(0, 4);

  // Get latest shame entries
  const latestShame = [...shameWall]
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO))
    .slice(0, 4);

  // Calculate most awake ranking (filtra alternativos)
  const awakeRanking = people
    .filter(person => !person.isAlternative)
    .map(person => {
      const participated = sessions.filter(s => s.participantIds.includes(person.id)).length;
      const survived = sessions.filter(s => 
        s.participantIds.includes(person.id) && s.firstSleeperPersonId !== person.id
      ).length;
      return { person, survived, participated };
    }).sort((a, b) => b.survived - a.survived).slice(0, 4);

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

  // Get latest daily movies
  const latestMovies = [...dailyMovies]
    .sort((a, b) => b.createdAtISO.localeCompare(a.createdAtISO))
    .slice(0, 4);

  const getMovieAverage = (movieId: string) => {
    const movieVotes = votes.filter(v => v.dailyMovieId === movieId);
    if (movieVotes.length === 0) return 0;
    const sum = movieVotes.reduce((acc, v) => acc + v.stars, 0);
    return (sum / movieVotes.length).toFixed(1);
  };

  const featuredMovie = latestMovies[0];

  return (
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
        {/* Today's Session with Daily Movies */}
        {(todaySession || upcomingSession) && (
          <Row title={todaySession ? '🎬 Sessão de Hoje' : '📅 Próxima Sessão'}>
            <Card hover>
              <div className="session-card-netflix">
                <div className="session-poster">
                  <img src="/lucasFlixImg.webp" alt="Sessão" />
                  <Badge 
                    text={todaySession ? 'HOJE' : 'EM BREVE'} 
                    variant={todaySession ? 'success' : 'warning'} 
                  />
                </div>
                <div className="session-info">
                  <h4>{new Date((todaySession || upcomingSession)!.dateISO).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</h4>
                  <p>{(todaySession || upcomingSession)!.movies.length} filmes</p>
                </div>
              </div>
            </Card>
            {(todaySession || upcomingSession)!.movies.map((movie, idx) => (
              <Card key={idx}>
                <div className="movie-card-netflix">
                  <div className="movie-poster">
                    <img src="/lucasFlixImg.webp" alt={movie.title} />
                    <div className="movie-order-badge">{movie.order}</div>
                  </div>
                  <div className="movie-info">
                    <h4>{movie.title}</h4>
                    <p className="movie-duration">{movie.duration}</p>
                  </div>
                </div>
              </Card>
            ))}
          </Row>
        )}

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
              <Card key={item.person.id}>
                <div className="ranking-card-compact ranking-awake">
                  <div className="rank-header">
                    <motion.div 
                      className="trophy-big"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {trophy}
                    </motion.div>
                    <div className="rank-position">#{index + 1}</div>
                  </div>
                  <motion.div 
                    className="rank-avatar"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <img src={getAvatar(item.person.name)} alt={item.person.name} />
                  </motion.div>
                  <h4 className="rank-name">{item.person.name}</h4>
                  <div className="stats-single">
                    <div className="stat-compact-large">
                      <span className="stat-num-large">{item.survived}</span>
                      <span className="stat-txt">sobrevivências</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </Row>

        {warmUpRanking.length > 0 && (
          <Row title="Rei do Aquecimento" action={<Link to="/rankings?tab=warmup" className="view-all-link">Ver ranking</Link>} className="ranking-grid">
            {warmUpRanking.map((item, index) => (
              <Card key={item.person.id}>
                <div className="ranking-card-compact ranking-warmup">
                  <div className="rank-header">
                    {index === 0 ? (
                      <motion.div 
                        className="trophy-big king"
                        animate={{ 
                          rotate: [0, -10, 10, 0],
                          scale: [1, 1.15, 1]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      >
                        👑
                      </motion.div>
                    ) : (
                      <div className="trophy-big">⚽</div>
                    )}
                    <div className="rank-position gold">{index === 0 ? 'REI' : `#${index + 1}`}</div>
                  </div>
                  <motion.div 
                    className="rank-avatar"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <img src={getAvatar(item.person.name)} alt={item.person.name} />
                    {index === 0 && <div className="avatar-crown">👑</div>}
                  </motion.div>
                  <h4 className="rank-name">{item.person.name}</h4>
                  <div className="stats-horizontal">
                    <div className="stat-compact">
                      <span className="stat-num gold">{item.wins}</span>
                      <span className="stat-txt">vitórias</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-compact">
                      <span className="stat-num points">{item.points}</span>
                      <span className="stat-txt">pontos</span>
                    </div>
                  </div>
                </div>
              </Card>
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
            <button className="carousel-btn carousel-btn-left" onClick={() => scrollCarousel('left')} aria-label="Anterior">
              ‹
            </button>
            
            <div className="carousel-track" ref={carouselRef}>
              <div className="carousel-item">
                <div className="sleep-card">
                  <div className="sleep-card-icon">💤</div>
                  <p>Fotos em breve...</p>
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
            <div className="photos-icon">🎬</div>
            <h2>Momentos LucasFlix</h2>
            <div className="photos-decoration">✨ Memórias ✨</div>
          </div>
          
          <div className="carousel-container">
            <button className="carousel-btn carousel-btn-left" onClick={() => scrollCarousel('left', photosCarouselRef)} aria-label="Anterior">
              ‹
            </button>
            
            <div className="carousel-track" ref={photosCarouselRef}>
              <div className="carousel-item">
                <div className="photo-card">
                  <img src="/src/imgs/Header/amigos.png" alt="LucasFlix Momento 1" />
                  <div className="photo-overlay">
                    <span className="photo-caption">🎬 Sessão Especial</span>
                  </div>
                </div>
              </div>
              <div className="carousel-item">
                <div className="photo-card">
                  <img src="/src/imgs/Header/amigos2.jpg" alt="LucasFlix Momento 2" />
                  <div className="photo-overlay">
                    <span className="photo-caption">🎉 Noite de Cinema</span>
                  </div>
                </div>
              </div>
              <div className="carousel-item">
                <div className="photo-card">
                  <img src="/src/imgs/Header/amigos.png" alt="LucasFlix Momento 3" />
                  <div className="photo-overlay">
                    <span className="photo-caption">🍿 Amigos Reunidos</span>
                  </div>
                </div>
              </div>
              <div className="carousel-item">
                <div className="photo-card">
                  <img src="/src/imgs/Header/amigos2.jpg" alt="LucasFlix Momento 4" />
                  <div className="photo-overlay">
                    <span className="photo-caption">⭐ Momento Marcante</span>
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
  );
};
