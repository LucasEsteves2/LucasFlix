import React from 'react';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { PageTransition } from '../components/PageTransition';
import './Statistics.css';

export const Statistics: React.FC = () => {
  const { sessions, dailyMovies, votes, people } = useData();

  // KPIs
  const totalSessions = sessions.length;
  const totalMovies = dailyMovies.length;
  const totalVotes = votes.length;
  const sessionsSurvived = sessions.filter(s => !s.firstSleeperPersonId).length;

  // Warm-up statistics by person (Aquecimento)
  const warmUpStats = people.map(person => {
    const games = sessions.filter(s => s.warmUp?.playerPersonId === person.id);
    const wins = games.filter(g => g.warmUp?.result === 'GANHOU').length;
    const draws = games.filter(g => g.warmUp?.result === 'EMPATE').length;
    const losses = games.filter(g => g.warmUp?.result === 'PERDEU').length;
    return {
      name: person.name,
      Vitórias: wins,
      Empates: draws,
      Derrotas: losses,
    };
  });

  // Who slept first statistics
  const sleepStats = people.map(person => {
    const count = sessions.filter(s => s.firstSleeperPersonId === person.id).length;
    return {
      name: person.name,
      'Dormiu Primeiro': count,
    };
  });

  // Daily movies by average rating
  const movieRatings = dailyMovies
    .map(movie => {
      const movieVotes = votes.filter(v => v.dailyMovieId === movie.id);
      if (movieVotes.length === 0) return null;
      const avg = movieVotes.reduce((acc, v) => acc + v.stars, 0) / movieVotes.length;
      return {
        name: movie.title.length > 20 ? movie.title.substring(0, 17) + '...' : movie.title,
        'Média': parseFloat(avg.toFixed(1)),
      };
    })
    .filter(m => m !== null)
    .sort((a, b) => (b?.Média || 0) - (a?.Média || 0))
    .slice(0, 10);

  // Points evolution over time (for warm-up)
  const pointsEvolution = sessions
    .filter(s => s.warmUp)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
    .reduce((acc, session) => {
      const date = new Date(session.dateISO).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
      const lastEntry = acc[acc.length - 1] || { date: '', ...Object.fromEntries(people.map(p => [p.name, 0])) };
      
      const newEntry: any = { date, ...lastEntry };
      delete newEntry.date;
      newEntry.date = date;
      
      if (session.warmUp) {
        const playerName = people.find(p => p.id === session.warmUp!.playerPersonId)?.name || '';
        if (playerName) {
          const points = session.warmUp.result === 'GANHOU' ? 3 : session.warmUp.result === 'EMPATE' ? 1 : 0;
          newEntry[playerName] = (newEntry[playerName] || 0) + points;
        }
      }
      
      acc.push(newEntry);
      return acc;
    }, [] as any[]);

  return (
    <PageTransition>
      <div className="statistics-page">
        <div className="page-header">
          <h1>📊 Estatísticas</h1>
        </div>

      <div className="kpis">
        <div className="kpi-card">
          <div className="kpi-value">{totalSessions}</div>
          <div className="kpi-label">Sessões</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{sessionsSurvived}</div>
          <div className="kpi-label">Viramos</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{totalMovies}</div>
          <div className="kpi-label">Filmes do Dia</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{totalVotes}</div>
          <div className="kpi-label">Votos</div>
        </div>
      </div>

      <div className="charts">
        <div className="chart-container">
          <h2>🎮 Aquecimento: Resultados por Pessoa</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={warmUpStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#b3b3b3" />
              <YAxis stroke="#b3b3b3" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="Vitórias" fill="#28a745" />
              <Bar dataKey="Empates" fill="#ffc107" />
              <Bar dataKey="Derrotas" fill="#e50914" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {pointsEvolution.length > 0 && (
          <div className="chart-container">
            <h2>📈 Evolução de Pontos (Aquecimento) ao Longo do Tempo</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pointsEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#b3b3b3" />
                <YAxis stroke="#b3b3b3" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                {people.map((person, index) => (
                  <Line 
                    key={person.id}
                    type="monotone" 
                    dataKey={person.name} 
                    stroke={['#e50914', '#28a745', '#ffc107', '#17a2b8'][index % 4]}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="chart-container">
          <h2>Top 10: Filmes do Dia (Média de Estrelas)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={movieRatings}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#b3b3b3" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#b3b3b3" domain={[0, 5]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="Média" fill="#ffd700" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h2>Quem Dormiu Primeiro</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sleepStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#b3b3b3" />
              <YAxis stroke="#b3b3b3" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="Dormiu Primeiro" fill="#e50914" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};
