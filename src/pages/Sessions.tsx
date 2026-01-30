import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Modal } from '../components/Modal';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Row } from '../components/Row';
import { Session, DailyMovie } from '../data/models';
import './Sessions.css';

export const Sessions: React.FC = () => {
  const { sessions, addSession, updateSession, deleteSession, people, getPerson, dailyMovies, addDailyMovie, deleteDailyMovie, votes, addVote } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string>('all');
  
  // Daily Movies states
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<DailyMovie | null>(null);

  const [formData, setFormData] = useState({
    dateISO: '',
    movieTitle: '',
    chosenByPersonId: '',
    participantIds: [] as string[],
    firstSleeperPersonId: '',
    sleepTimes: [] as { personId: string; time: string }[],
    footMoment: {
      hadFoot: false,
      playerPersonId: '',
      result: 'GANHOU' as 'GANHOU' | 'PERDEU' | 'EMPATE',
      durationMin: 0,
      note: '',
    },
    notes: '',
  });
  
  const [movieFormData, setMovieFormData] = useState({
    title: '',
    dateISO: '',
    createdByPersonId: '',
  });

  const openModal = (session?: Session) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        dateISO: session.dateISO,
        movieTitle: session.movieTitle,
        chosenByPersonId: session.chosenByPersonId,
        participantIds: session.participantIds,
        firstSleeperPersonId: session.firstSleeperPersonId || '',
        sleepTimes: session.sleepTimes || [],
        footMoment: session.footMoment || {
          hadFoot: false,
          playerPersonId: '',
          result: 'GANHOU',
          durationMin: 0,
          note: '',
        },
        notes: session.notes || '',
      });
    } else {
      setEditingSession(null);
      setFormData({
        dateISO: new Date().toISOString().split('T')[0],
        movieTitle: '',
        chosenByPersonId: people[0]?.id || '',
        participantIds: people.map(p => p.id),
        firstSleeperPersonId: '',
        sleepTimes: [],
        footMoment: {
          hadFoot: false,
          playerPersonId: '',
          result: 'GANHOU',
          durationMin: 0,
          note: '',
        },
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sessionData = {
      ...formData,
      footMoment: formData.footMoment.hadFoot ? formData.footMoment : undefined,
      firstSleeperPersonId: formData.firstSleeperPersonId || undefined,
      sleepTimes: formData.sleepTimes.length > 0 ? formData.sleepTimes : undefined,
      notes: formData.notes || undefined,
    };

    if (editingSession) {
      updateSession(editingSession.id, sessionData);
    } else {
      addSession(sessionData);
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta sessão?')) {
      deleteSession(id);
    }
  };

  const toggleParticipant = (personId: string) => {
    setFormData(prev => ({
      ...prev,
      participantIds: prev.participantIds.includes(personId)
        ? prev.participantIds.filter(id => id !== personId)
        : [...prev.participantIds, personId]
    }));
  };
  
  // Daily Movies functions
  const openMovieModal = () => {
    setMovieFormData({
      title: '',
      dateISO: new Date().toISOString().split('T')[0],
      createdByPersonId: people[0]?.id || '',
    });
    setIsMovieModalOpen(true);
  };

  const handleMovieSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDailyMovie({
      ...movieFormData,
      createdAtISO: new Date().toISOString(),
    });
    setIsMovieModalOpen(false);
  };

  const handleMovieDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este filme?')) {
      deleteDailyMovie(id);
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
    .map(movie => ({
      ...movie,
      average: parseFloat(getMovieAverage(movie.id)),
      voteCount: getMovieVotes(movie.id).length,
    }))
    .sort((a, b) => {
      if (b.average !== a.average) return b.average - a.average;
      return b.voteCount - a.voteCount;
    });

  const addSleepTime = () => {
    setFormData(prev => ({
      ...prev,
      sleepTimes: [...prev.sleepTimes, { personId: people[0]?.id || '', time: '' }]
    }));
  };

  const updateSleepTime = (index: number, field: 'personId' | 'time', value: string) => {
    setFormData(prev => ({
      ...prev,
      sleepTimes: prev.sleepTimes.map((st, i) => 
        i === index ? { ...st, [field]: value } : st
      )
    }));
  };

  const removeSleepTime = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sleepTimes: prev.sleepTimes.filter((_, i) => i !== index)
    }));
  };

  const filteredSessions = selectedPerson === 'all' 
    ? sessions 
    : sessions.filter(s => s.participantIds.includes(selectedPerson));

  const sortedSessions = [...filteredSessions].sort((a, b) => b.dateISO.localeCompare(a.dateISO));

  return (
    <div className="sessions-page">
      {/* Daily Movies Section */}
      <div className="page-header">
        <h1>🍿 Filmes do Dia</h1>
        <button className="btn-primary" onClick={openMovieModal}>
          + Novo Filme
        </button>
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
        <h1>🎬 Sessões</h1>
        <button className="btn-primary" onClick={() => openModal()}>
          + Nova Sessão
        </button>
      </div>

      <div className="filters">
        <label>
          Filtrar por pessoa:
          <select value={selectedPerson} onChange={(e) => setSelectedPerson(e.target.value)}>
            <option value="all">Todos</option>
            {people.map(person => (
              <option key={person.id} value={person.id}>{person.name}</option>
            ))}
          </select>
        </label>
      </div>

      <Row title={`${sortedSessions.length} Sessões`}>
        {sortedSessions.map(session => (
          <Card key={session.id}>
            <h3>{session.movieTitle}</h3>
            <p>📅 {new Date(session.dateISO).toLocaleDateString('pt-BR')}</p>
            <p>👤 Escolhido por: {getPerson(session.chosenByPersonId)?.name}</p>
            <p>👥 Participantes: {session.participantIds.length}</p>
            
            <div style={{ marginTop: '0.5rem' }}>
              {session.footMoment && (
                <Badge 
                  text={`PÉS: ${session.footMoment.result}`} 
                  variant={session.footMoment.result === 'GANHOU' ? 'success' : session.footMoment.result === 'PERDEU' ? 'danger' : 'warning'} 
                />
              )}
              {!session.firstSleeperPersonId && <Badge text="VIRAMOS!" variant="success" />}
              {session.firstSleeperPersonId && (
                <Badge text={`Dormiu: ${getPerson(session.firstSleeperPersonId)?.name}`} variant="danger" />
              )}
            </div>
            
            <div className="card-actions">
              <button className="btn-secondary" onClick={() => openModal(session)}>Editar</button>
              <button className="btn-danger" onClick={() => handleDelete(session.id)}>Excluir</button>
            </div>
          </Card>
        ))}
      </Row>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSession ? 'Editar Sessão' : 'Nova Sessão'}>
        <form onSubmit={handleSubmit} className="session-form">
          <div className="form-group">
            <label>Data</label>
            <input 
              type="date" 
              value={formData.dateISO} 
              onChange={(e) => setFormData({ ...formData, dateISO: e.target.value })}
              required 
            />
          </div>

          <div className="form-group">
            <label>Filme</label>
            <input 
              type="text" 
              value={formData.movieTitle} 
              onChange={(e) => setFormData({ ...formData, movieTitle: e.target.value })}
              required 
              placeholder="Nome do filme"
            />
          </div>

          <div className="form-group">
            <label>Escolhido por</label>
            <select 
              value={formData.chosenByPersonId} 
              onChange={(e) => setFormData({ ...formData, chosenByPersonId: e.target.value })}
              required
            >
              {people.map(person => (
                <option key={person.id} value={person.id}>{person.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Participantes</label>
            <div className="checkbox-group">
              {people.map(person => (
                <label key={person.id} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={formData.participantIds.includes(person.id)}
                    onChange={() => toggleParticipant(person.id)}
                  />
                  {person.name}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Primeiro a dormir</label>
            <select 
              value={formData.firstSleeperPersonId} 
              onChange={(e) => setFormData({ ...formData, firstSleeperPersonId: e.target.value })}
            >
              <option value="">Ninguém (viramos!)</option>
              {formData.participantIds.map(id => {
                const person = getPerson(id);
                return person ? <option key={id} value={id}>{person.name}</option> : null;
              })}
            </select>
          </div>

          <div className="form-group">
            <label>Horários de Sono</label>
            {formData.sleepTimes.map((st, index) => (
              <div key={index} className="sleep-time-row">
                <select 
                  value={st.personId}
                  onChange={(e) => updateSleepTime(index, 'personId', e.target.value)}
                >
                  {formData.participantIds.map(id => {
                    const person = getPerson(id);
                    return person ? <option key={id} value={id}>{person.name}</option> : null;
                  })}
                </select>
                <input 
                  type="time" 
                  value={st.time}
                  onChange={(e) => updateSleepTime(index, 'time', e.target.value)}
                />
                <button type="button" onClick={() => removeSleepTime(index)} className="btn-danger-small">×</button>
              </div>
            ))}
            <button type="button" onClick={addSleepTime} className="btn-secondary">+ Adicionar Horário</button>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData.footMoment.hadFoot}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  footMoment: { ...formData.footMoment, hadFoot: e.target.checked }
                })}
              />
              Teve Momento Pés?
            </label>
          </div>

          {formData.footMoment.hadFoot && (
            <>
              <div className="form-group">
                <label>Jogador</label>
                <select 
                  value={formData.footMoment.playerPersonId} 
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    footMoment: { ...formData.footMoment, playerPersonId: e.target.value }
                  })}
                  required
                >
                  <option value="">Selecione...</option>
                  {formData.participantIds.map(id => {
                    const person = getPerson(id);
                    return person ? <option key={id} value={id}>{person.name}</option> : null;
                  })}
                </select>
              </div>

              <div className="form-group">
                <label>Resultado</label>
                <select 
                  value={formData.footMoment.result} 
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    footMoment: { ...formData.footMoment, result: e.target.value as any }
                  })}
                >
                  <option value="GANHOU">Ganhou</option>
                  <option value="PERDEU">Perdeu</option>
                  <option value="EMPATE">Empate</option>
                </select>
              </div>

              <div className="form-group">
                <label>Duração (minutos)</label>
                <input 
                  type="number" 
                  value={formData.footMoment.durationMin || ''} 
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    footMoment: { ...formData.footMoment, durationMin: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>

              <div className="form-group">
                <label>Observação (Pés)</label>
                <input 
                  type="text" 
                  value={formData.footMoment.note || ''} 
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    footMoment: { ...formData.footMoment, note: e.target.value }
                  })}
                  placeholder="Ex: Vitória épica!"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Observações Gerais</label>
            <textarea 
              value={formData.notes} 
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Comentários sobre a sessão..."
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editingSession ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Daily Movie Modal */}
      <Modal isOpen={isMovieModalOpen} onClose={() => setIsMovieModalOpen(false)} title="Novo Filme do Dia">
        <form onSubmit={handleMovieSubmit} className="movie-form">
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

          <div className="form-group">
            <label>Data</label>
            <input 
              type="date" 
              value={movieFormData.dateISO} 
              onChange={(e) => setMovieFormData({ ...movieFormData, dateISO: e.target.value })}
              required 
            />
          </div>

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

          <div className="form-actions">
            <button type="button" onClick={() => setIsMovieModalOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Criar
            </button>
          </div>
        </form>
      </Modal>

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
  );
};
