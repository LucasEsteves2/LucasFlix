import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Modal } from '../components/Modal';
import { Card } from '../components/Card';
import { Row } from '../components/Row';
import { DailyMovie } from '../data/models';
import { PageTransition } from '../components/PageTransition';
import './DailyMovies.css';

export const DailyMovies: React.FC = () => {
  const { dailyMovies, addDailyMovie, deleteDailyMovie, votes, addVote, people, getPerson } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<DailyMovie | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    dateISO: '',
    createdByPersonId: '',
  });

  const openModal = () => {
    setFormData({
      title: '',
      dateISO: new Date().toISOString().split('T')[0],
      createdByPersonId: people[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDailyMovie({
      ...formData,
      createdAtISO: new Date().toISOString(),
    });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
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

  // Top movies by rating
  const rankedMovies = [...dailyMovies]
    .map(movie => ({
      ...movie,
      average: parseFloat(getMovieAverage(movie.id) || '0'),
      voteCount: getMovieVotes(movie.id).length,
    }))
    .sort((a, b) => {
      if (b.average !== a.average) return b.average - a.average;
      return b.voteCount - a.voteCount;
    });

  return (
    <PageTransition>
      <div className="daily-movies-page">
        <div className="page-header">
          <h1>🎬 Filmes do Dia</h1>
          <button className="btn-primary" onClick={openModal}>
            + Novo Filme
          </button>
        </div>

      <Row title="Rei dos Filmes (Melhores Avaliados)">
        {rankedMovies.slice(0, 10).map((movie, index) => (
          <Card key={movie.id} onClick={() => openVoteModal(movie)}>
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
              <button className="btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(movie.id); }}>
                Excluir
              </button>
            </div>
          </Card>
        ))}
      </Row>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Filme do Dia">
        <form onSubmit={handleSubmit} className="movie-form">
          <div className="form-group">
            <label>Título do Filme</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required 
              placeholder="Ex: John Wick 4"
            />
          </div>

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
            <label>Cadastrado por</label>
            <select 
              value={formData.createdByPersonId} 
              onChange={(e) => setFormData({ ...formData, createdByPersonId: e.target.value })}
              required
            >
              {people.filter(p => p.isVisible !== false).map(person => (
                <option key={person.id} value={person.id}>{person.name}</option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Criar
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={voteModalOpen} onClose={() => setVoteModalOpen(false)} title={`Votar: ${selectedMovie?.title}`}>
        <div className="vote-modal">
          {people.filter(p => p.isVisible !== false).map(person => {
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
