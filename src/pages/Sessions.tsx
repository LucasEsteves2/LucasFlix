import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Modal } from '../components/Modal';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Row } from '../components/Row';
import { Session, DailyMovie } from '../data/models';
import { PageTransition } from '../components/PageTransition';
import { AnimatePresence } from 'framer-motion';
import { ShameCard } from '../components/ShameCard';
import { SurvivorCard } from '../components/SurvivorCard';
import { KingCard } from '../components/KingCard';
import { AwardCard } from '../components/AwardCard';
import { SessionSummaryCard } from '../components/SessionSummaryCard';
import './Sessions.css';

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
  };
  return avatars[firstName] || LucasAvatar;
};

export const Sessions: React.FC = () => {
  const { sessions, people, getPerson, dailyMovies, addDailyMovie, addDailyMovies, deleteDailyMovie, getTodayMovies, clearTodayMovies, votes, addVote } = useData();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  
  // Card states
  const [showShameCard, setShowShameCard] = useState<string | null>(null);
  const [showSurvivorCard, setShowSurvivorCard] = useState(false);
  const [showKingCard, setShowKingCard] = useState<{type: 'sleep'|'nap'; personId: string} | null>(null);
  const [showAwardCard, setShowAwardCard] = useState<{type: 'fastest'|'longest'|'flexoes'|'coruja'; personId: string; stat: string} | null>(null);
  const [showSessionSummaryCard, setShowSessionSummaryCard] = useState(false);
  
  // Daily Movies states
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkMovieList, setBulkMovieList] = useState('');
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<DailyMovie | null>(null);

  const [movieFormData, setMovieFormData] = useState({
    title: '',
    dateISO: '',
    createdByPersonId: '',
  });
  
  // Daily Movies functions
  const openMovieModal = () => {
    setMovieFormData({
      title: '',
      dateISO: new Date().toISOString().split('T')[0],
      createdByPersonId: people[0]?.id || '',
    });
    setBulkMovieList('');
    setIsBulkMode(false);
    setIsMovieModalOpen(true);
  };

  const handleMovieSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBulkMode) {
      // Bulk add mode
      if (!bulkMovieList.trim()) {
        alert('Digite pelo menos um filme!');
        return;
      }
      
      const movies = bulkMovieList
        .split('\n')
        .map(m => m.trim())
        .filter(m => m.length > 0);
      
      if (movies.length === 0) {
        alert('Nenhum filme válido encontrado!');
        return;
      }
      
      addDailyMovies(movieFormData.dateISO, movies);
    } else {
      // Single add mode
      addDailyMovie({
        ...movieFormData,
        createdAtISO: new Date().toISOString(),
      });
    }
    
    setIsMovieModalOpen(false);
  };

  const handleMovieDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este filme?')) {
      deleteDailyMovie(id);
    }
  };

  const handleClearTodayMovies = () => {
    const todayMovies = getTodayMovies();
    
    if (todayMovies.length === 0) {
      alert('Não há filmes para hoje!');
      return;
    }

    if (confirm(`Tem certeza que deseja limpar os ${todayMovies.length} filmes de hoje?`)) {
      clearTodayMovies();
      alert('Filmes de hoje limpos com sucesso!');
    }
  };

  const openVoteModal = (movie: DailyMovie) => {
    setSelectedMovie(movie);
    setVoteModalOpen(true);
  };

  const handleVote = (stars: 1 | 2 | 3 | 4 | 5, personId: string) => {
    if (!selectedMovie) return;
    addVote({
      dailyMovieId: selectedMovie.id,
      personId,
      stars,
      createdAtISO: new Date().toISOString(),
    });
  };

  const getMovieVotes = (movieId: string) => votes.filter(v => v.dailyMovieId === movieId);
  
  const getMovieAverage = (movieId: string) => {
    const movieVotes = getMovieVotes(movieId);
    if (movieVotes.length === 0) return 0;
    const sum = movieVotes.reduce((acc, v) => acc + v.stars, 0);
    return (sum / movieVotes.length).toFixed(1);
  };

  const getUserVote = (movieId: string, personId: string) => {
    return votes.find(v => v.dailyMovieId === movieId && v.personId === personId);
  };

  const rankedMovies = [...dailyMovies]
    .map(movie => {
      const avg = getMovieAverage(movie.id);
      return {
        ...movie,
        average: typeof avg === 'string' ? parseFloat(avg) : avg,
        voteCount: getMovieVotes(movie.id).length,
      };
    })
    .sort((a, b) => {
      if (b.average !== a.average) return b.average - a.average;
      return b.voteCount - a.voteCount;
    });

  return (
    <PageTransition>
      <div className="sessions-page">
        {/* Daily Movies Section */}
        <div className="page-header">
          <h1>🍿 Filmes do Dia</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" onClick={openMovieModal}>
              + Novo Filme
            </button>
            <button className="btn-danger" onClick={handleClearTodayMovies}>
              🗑️ Limpar Filmes de Hoje
            </button>
          </div>
        </div>

      <Row title="Rei dos Filmes (Melhores Avaliados)">
        {rankedMovies.slice(0, 10).map((movie, index) => (
          <Card key={movie.id} hover onClick={() => openVoteModal(movie)}>
            <div className="ranking-badge">#{index + 1}</div>
            <h3>{movie.title}</h3>
            <p>👤 Por: {getPerson(movie.createdByPersonId)?.name}</p>
            <p>📅 {new Date(movie.dateISO).toLocaleDateString('pt-BR')}</p>
            <div className="movie-rating">
              <span className="stars">{'⭐'.repeat(Math.round(movie.average))}</span>
              <span className="rating-text">{movie.average.toFixed(1)} ({movie.voteCount} votos)</span>
            </div>
            <div className="card-actions">
              <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); openVoteModal(movie); }}>
                Votar
              </button>
              <button className="btn-danger" onClick={(e) => { e.stopPropagation(); handleMovieDelete(movie.id); }}>
                Excluir
              </button>
            </div>
          </Card>
        ))}
      </Row>

      <div style={{ borderTop: '2px solid rgba(229, 9, 20, 0.3)', margin: '3rem 0', paddingTop: '2rem' }}></div>

      {/* Sessions Section */}
      <div className="page-header">
        <h1>📅 Sessões Anteriores</h1>
      </div>

      <Row title={`${sessions.length} Sessões Realizadas`}>
        {sessions
          .sort((a, b) => b.dateISO.localeCompare(a.dateISO))
          .map(session => {
            const sessionMovies = session.movies || [];
            const participants = session.participantIds || [];
            const survivors = participants.filter(id => 
              !session.sleepTimes?.some(st => st.personId === id)
            );
            
            return (
              <Card key={session.id} hover onClick={() => setSelectedSession(session)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.8rem', margin: 0 }}>
                    {new Date(session.dateISO).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })}
                  </h2>
                  <Badge 
                    text={`${participants.length} pessoas`} 
                    variant="info" 
                  />
                </div>
                
                <div style={{ marginBottom: '0.75rem' }}>
                  {sessionMovies.length > 0 && (
                    <p style={{ color: '#b3b3b3', margin: '0.5rem 0' }}>
                      🎬 {sessionMovies.length} filme{sessionMovies.length > 1 ? 's' : ''}
                    </p>
                  )}
                  {survivors.length === participants.length ? (
                    <Badge text="🏆 VIRAMOS A NOITE!" variant="success" />
                  ) : (
                    <p style={{ color: '#b3b3b3', margin: '0.5rem 0' }}>
                      😴 {participants.length - survivors.length} dormiram
                    </p>
                  )}
                </div>
                
                <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                  Clique para ver detalhes
                </p>
              </Card>
            );
          })}
      </Row>

      {/* Session Summary Modal */}
      {selectedSession && (() => {
        // Get movies for this session date
        const sessionMovies = dailyMovies.filter(m => m.dateISO === selectedSession.dateISO);
        
        return (
          <Modal 
            isOpen={!!selectedSession} 
            onClose={() => setSelectedSession(null)} 
            title={`Sessão - ${new Date(selectedSession.dateISO).toLocaleDateString('pt-BR')}`}
          >
            <div className="session-summary-modal">
              <div className="summary-section">
                <h3>🎬 Filmes Assistidos</h3>
                {sessionMovies.length > 0 ? (
                  <ul>
                    {sessionMovies.map((movie, idx) => (
                      <li key={idx}>{movie.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#666' }}>Nenhum filme registrado para esta data</p>
                )}
            </div>

            <div className="summary-section">
              <h3>👥 Participantes ({selectedSession.participantIds?.length || 0})</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedSession.participantIds?.map(id => {
                  const person = getPerson(id);
                  return person ? (
                    <Badge key={id} text={person.name} variant="info" />
                  ) : null;
                })}
              </div>
            </div>

            {selectedSession.sleepTimes && selectedSession.sleepTimes.length > 0 && (
              <div className="summary-section">
                <h3>😴 Dorminhocos</h3>
                {selectedSession.sleepTimes.map((st, idx) => {
                  const person = getPerson(st.personId);
                  return person ? (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{person.name}</span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Badge text={st.time} variant="danger" />
                        <button 
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                          onClick={() => setShowShameCard(st.personId)}
                        >
                          🃏 Card
                        </button>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            )}

            {selectedSession.participantIds && (() => {
              const survivors = selectedSession.participantIds.filter(id => 
                !selectedSession.sleepTimes?.some(st => st.personId === id)
              );
              const sleepers = selectedSession.sleepTimes || [];
              const sleepKing = sleepers.length > 0 ? sleepers[0].personId : null;
              
              return survivors.length > 0 && (
                <>
                  {sleepKing && (
                    <div className="summary-section">
                      <h3>👑 Rei do Sono</h3>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255, 215, 0, 0.1)', borderRadius: '6px', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{getPerson(sleepKing)?.name}</span>
                        <button 
                          className="btn-primary"
                          onClick={() => setShowKingCard({ type: 'sleep', personId: sleepKing })}
                        >
                          🃏 Gerar Card do Rei
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="summary-section">
                    <h3>🏆 Sobreviventes ({survivors.length})</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      {survivors.map(id => {
                        const person = getPerson(id);
                        return person ? (
                          <Badge key={id} text={person.name} variant="success" />
                        ) : null;
                      })}
                    </div>
                    <button 
                      className="btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => setShowSurvivorCard(true)}
                    >
                      🃏 Gerar Card dos Sobreviventes
                    </button>
                  </div>
                </>
              );
            })()}

            {selectedSession.warmUp && (
              <div className="summary-section">
                <h3>🦶 Momento Pés</h3>
                <p>Jogador: {getPerson(selectedSession.warmUp.playerPersonId)?.name}</p>
                <p>
                  Resultado: <Badge 
                    text={selectedSession.warmUp.result} 
                    variant={selectedSession.warmUp.result === 'GANHOU' ? 'success' : selectedSession.warmUp.result === 'PERDEU' ? 'danger' : 'warning'} 
                  />
                </p>
                {selectedSession.warmUp.durationMin && (
                  <p>Duração: {selectedSession.warmUp.durationMin} min</p>
                )}
              </div>
            )}

            {selectedSession.notes && (
              <div className="summary-section">
                <h3>📝 Observações</h3>
                <p style={{ color: '#b3b3b3' }}>{selectedSession.notes}</p>
              </div>
            )}

            {/* Master Summary Card Button */}
            <div className="summary-section" style={{ borderBottom: 'none', paddingTop: '2rem' }}>
              <button 
                className="btn-primary"
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: 'linear-gradient(135deg, #e50914 0%, #b20710 100%)', fontWeight: 600 }}
                onClick={() => setShowSessionSummaryCard(true)}
              >
                🎬 Gerar Resumo Completo da Sessão
              </button>
            </div>

            <button 
              className="btn-secondary" 
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => setSelectedSession(null)}
            >
              Fechar
            </button>
          </div>
        </Modal>
        );
      })()}

      {/* Daily Movie Modal */}
      <Modal isOpen={isMovieModalOpen} onClose={() => setIsMovieModalOpen(false)} title="Novo Filme do Dia">
        <form onSubmit={handleMovieSubmit} className="movie-form">
          {/* Toggle between single and bulk mode */}
          <div className="form-group">
            <label className="bulk-mode-toggle">
              <input 
                type="checkbox" 
                checked={isBulkMode}
                onChange={(e) => setIsBulkMode(e.target.checked)}
              />
              <span>Adicionar múltiplos filmes (um por linha)</span>
            </label>
          </div>

          {!isBulkMode ? (
            // Single movie mode
            <div className="form-group">
              <label>Título do Filme</label>
              <input 
                type="text" 
                value={movieFormData.title} 
                onChange={(e) => setMovieFormData({ ...movieFormData, title: e.target.value })}
                required 
                placeholder="Ex: John Wick 4"
              />
            </div>
          ) : (
            // Bulk mode
            <div className="form-group">
              <label>Lista de Filmes (um por linha)</label>
              <textarea 
                value={bulkMovieList}
                onChange={(e) => setBulkMovieList(e.target.value)}
                placeholder="Não Fale o Mal&#10;Erin Brockovich&#10;A Cor que Caiu do Espaço&#10;Arcadian Invasão Sombria&#10;Pisque Duas Vezes"
                rows={8}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0a0a0a',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  resize: 'vertical'
                }}
              />
            </div>
          )}

          <div className="form-group">
            <label>Data</label>
            <input 
              type="date" 
              value={movieFormData.dateISO} 
              onChange={(e) => setMovieFormData({ ...movieFormData, dateISO: e.target.value })}
              required 
            />
          </div>

          {!isBulkMode && (
            <div className="form-group">
              <label>Cadastrado por</label>
              <select 
                value={movieFormData.createdByPersonId} 
                onChange={(e) => setMovieFormData({ ...movieFormData, createdByPersonId: e.target.value })}
                required
              >
                {people.map(person => (
                  <option key={person.id} value={person.id}>{person.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={() => setIsMovieModalOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {isBulkMode ? 'Adicionar Filmes' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Card Modals */}
      <AnimatePresence>
        {showShameCard && selectedSession && (() => {
          const person = getPerson(showShameCard);
          const sleepTime = selectedSession.sleepTimes?.find(st => st.personId === showShameCard);
          const totalSleepTime = selectedSession.totalSleepTime?.[showShameCard] || 0;
          const napCount = selectedSession.naps?.[showShameCard] || 0;
          return person && sleepTime && (
            <ShameCard
              key="shame-card"
              personName={person.name}
              personAvatar={getAvatar(person.name)}
              totalSleepTime={totalSleepTime}
              napCount={napCount}
              sleepTime={sleepTime.time}
              onClose={() => setShowShameCard(null)}
            />
          );
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {showSurvivorCard && selectedSession && (() => {
          const participants = selectedSession.participantIds || [];
          const sleepers = selectedSession.sleepTimes || [];
          const survivors = participants
            .filter(id => !sleepers.some(st => st.personId === id))
            .map(id => {
              const p = getPerson(id);
              return p ? { name: p.name, avatar: getAvatar(p.name) } : null;
            })
            .filter(p => p !== null) as { name: string; avatar: string }[];
          
          const sessionStart = '20:00';
          const lastSleepTime = sleepers.length > 0 ? sleepers[sleepers.length - 1].time : '06:00';
          const calculateDuration = (start: string, end: string) => {
            const [startH, startM] = start.split(':').map(Number);
            const [endH, endM] = end.split(':').map(Number);
            let hours = endH - startH;
            let minutes = endM - startM;
            if (hours < 0) hours += 24;
            if (minutes < 0) { hours--; minutes += 60; }
            return `${hours}h ${minutes}min`;
          };
          
          return (
            <SurvivorCard
              key="survivor-card"
              sessionDuration={calculateDuration(sessionStart, lastSleepTime)}
              survivors={survivors}
              onClose={() => setShowSurvivorCard(false)}
            />
          );
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {showKingCard && selectedSession && (() => {
          const person = getPerson(showKingCard.personId);
          const sleepTime = selectedSession.sleepTimes?.find(st => st.personId === showKingCard.personId);
          const totalSleepTime = selectedSession.totalSleepTime?.[showKingCard.personId] || 0;
          const napCount = selectedSession.naps?.[showKingCard.personId] || 0;
          return person && sleepTime && (
            <KingCard
              key="king-card"
              kingName={person.name}
              kingAvatar={getAvatar(person.name)}
              kingType={showKingCard.type}
              totalSleepTime={totalSleepTime}
              napCount={napCount}
              onClose={() => setShowKingCard(null)}
            />
          );
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {showAwardCard && selectedSession && (() => {
          const person = getPerson(showAwardCard.personId);
          return person && (
            <AwardCard
              key="award-card"
              awardType={showAwardCard.type}
              winnerName={person.name}
              winnerAvatar={getAvatar(person.name)}
              statValue={showAwardCard.stat}
              onClose={() => setShowAwardCard(null)}
            />
          );
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {showSessionSummaryCard && selectedSession && (() => {
          const participants = selectedSession.participantIds || [];
          const sleepers = selectedSession.sleepTimes || [];
          const survivors = participants
            .filter(id => !sleepers.some(st => st.personId === id))
            .map(id => {
              const p = getPerson(id);
              return p ? { name: p.name, avatar: getAvatar(p.name) } : null;
            })
            .filter(p => p !== null) as { name: string; avatar: string }[];
          
          const lastSleepTime = sleepers.length > 0 ? sleepers[sleepers.length - 1].time : '23:59';
          const calculateDuration = (end: string) => {
            const sessionStart = '20:00';
            const [startH, startM] = sessionStart.split(':').map(Number);
            const [endH, endM] = end.split(':').map(Number);
            let hours = endH - startH;
            let minutes = endM - startM;
            if (hours < 0) hours += 24;
            if (minutes < 0) { hours--; minutes += 60; }
            return `${hours}h ${minutes}min`;
          };
          
          const sleepKingData = sleepers.length > 0 ? (() => {
            const kingId = sleepers[0].personId;
            const king = getPerson(kingId);
            if (!king) return undefined;
            return {
              name: king.name,
              avatar: getAvatar(king.name),
              time: sleepers[0].time,
              naps: selectedSession.naps?.[kingId] || 0
            };
          })() : undefined;
          
          const napTimes = sleepers.map(st => {
            const [h, m] = st.time.split(':').map(Number);
            return { id: st.personId, minutes: h * 60 + m };
          }).filter(t => t.minutes < 12 * 60);
          const napKingData = napTimes.length > 0 ? (() => {
            const napKingId = napTimes.sort((a, b) => a.minutes - b.minutes)[0].id;
            const napKing = getPerson(napKingId);
            if (!napKing) return undefined;
            return {
              name: napKing.name,
              avatar: getAvatar(napKing.name),
              naps: selectedSession.naps?.[napKingId] || 0
            };
          })() : undefined;
          
          return (
            <SessionSummaryCard
              key="session-summary-card"
              sessionDuration={calculateDuration(lastSleepTime)}
              totalParticipants={participants.length}
              sleepKing={sleepKingData}
              napKing={napKingData}
              recordHolder={undefined}
              survivors={survivors}
              awards={{}}
              onClose={() => setShowSessionSummaryCard(false)}
            />
          );
        })()}
      </AnimatePresence>

      {/* Vote Modal */}
      <Modal isOpen={voteModalOpen} onClose={() => setVoteModalOpen(false)} title={`Votar: ${selectedMovie?.title}`}>
        <div className="vote-modal">
          {people.map(person => {
            const userVote = selectedMovie ? getUserVote(selectedMovie.id, person.id) : null;
            return (
              <div key={person.id} className="vote-person">
                <h4>{person.name}</h4>
                {userVote && (
                  <p className="current-vote">Voto atual: {'⭐'.repeat(userVote.stars)}</p>
                )}
                <div className="star-buttons">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className={`star-button ${userVote?.stars === star ? 'star-selected' : ''}`}
                      onClick={() => handleVote(star as any, person.id)}
                    >
                      {'⭐'.repeat(star)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
    </PageTransition>
  );
};
