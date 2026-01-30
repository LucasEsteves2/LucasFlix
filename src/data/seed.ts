import { LucasflixData } from './models';

/**
 * SEED DATA - Initial mock data for the app
 */
export const getSeedData = (): LucasflixData => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Helper to get date N days ago
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  };

  const emptyStats = {
    totalSessions: 0,
    totalSurvived: 0,
    totalSlept: 0,
    totalNaps: 0,
    totalSleepMinutes: 0,
    consecutiveSurvived: 0,
    longestAwakeStreak: 0,
    warmupWins: 0,
    warmupGames: 0,
    timesSleptFirst: 0,
  };

  return {
    version: 1,
    
    people: [
      { id: 'p1', name: 'Thiago', stats: emptyStats, achievements: [], lastUpdated: now.toISOString() },
      { id: 'p2', name: 'Diego', stats: emptyStats, achievements: [], lastUpdated: now.toISOString() },
      { id: 'p3', name: 'Menta', stats: emptyStats, achievements: [], lastUpdated: now.toISOString() },
      { id: 'p4', name: 'Lucas', stats: emptyStats, achievements: [], lastUpdated: now.toISOString() },
      { id: 'p5', name: 'Julia', isAlternative: true, stats: emptyStats, achievements: [], lastUpdated: now.toISOString() },
      { id: 'p6', name: 'Valesca', isAlternative: true, stats: emptyStats, achievements: [], lastUpdated: now.toISOString() },
      { id: 'p7', name: 'Vitória', isAlternative: true, stats: emptyStats, achievements: [], lastUpdated: now.toISOString() },
      { id: 'p8', name: 'Lucca', isAlternative: true, stats: emptyStats, achievements: [], lastUpdated: now.toISOString() },
    ],
    
    sessions: [
      {
        id: 's1',
        dateISO: daysAgo(2),
        participantIds: ['p1', 'p2', 'p3', 'p4'],
        movies: [
          { title: 'Interestelar', chosenByPersonId: 'p1', order: 1 },
          { title: 'Matrix Resurrections', chosenByPersonId: 'p2', order: 2 },
          { title: 'John Wick 4', chosenByPersonId: 'p3', order: 3 },
        ],
        warmUp: {
          playerPersonId: 'p4',
          result: 'GANHOU',
          durationMin: 12,
          note: 'Vitória épica no aquecimento!',
        },
        firstSleeperPersonId: 'p3',
        sleepTimes: [
          { personId: 'p3', time: '02:15' },
          { personId: 'p2', time: '04:30' },
        ],
        notes: 'Maratona épica! 3 filmes em uma noite',
      },
      {
        id: 's2',
        dateISO: daysAgo(5),
        participantIds: ['p1', 'p2', 'p4'],
        movies: [
          { title: 'Duna: Parte Dois', chosenByPersonId: 'p2', order: 1 },
          { title: 'Blade Runner 2049', chosenByPersonId: 'p1', order: 2 },
        ],
        warmUp: {
          playerPersonId: 'p1',
          result: 'PERDEU',
          durationMin: 5,
        },
        firstSleeperPersonId: 'p4',
        sleepTimes: [
          { personId: 'p4', time: '03:45' },
        ],
      },
      {
        id: 's3',
        dateISO: daysAgo(10),
        participantIds: ['p1', 'p2', 'p3', 'p4'],
        movies: [
          { title: 'Oppenheimer', chosenByPersonId: 'p3', order: 1 },
          { title: 'Dunkirk', chosenByPersonId: 'p4', order: 2 },
        ],
        warmUp: {
          playerPersonId: 'p3',
          result: 'EMPATE',
          durationMin: 8,
        },
        firstSleeperPersonId: 'p2',
        sleepTimes: [
          { personId: 'p2', time: '02:00' },
        ],
        notes: 'Noite temática Nolan',
      },
      {
        id: 's4',
        dateISO: daysAgo(15),
        participantIds: ['p1', 'p2', 'p3', 'p4'],
        movies: [
          { title: 'Avatar: O Caminho da Água', chosenByPersonId: 'p4', order: 1 },
        ],
        warmUp: {
          playerPersonId: 'p2',
          result: 'GANHOU',
          durationMin: 10,
        },
        notes: 'Só um filme mas foi até tarde! VIRAMOS!',
      },
      {
        id: 's5',
        dateISO: daysAgo(20),
        participantIds: ['p1', 'p2', 'p3'],
        movies: [
          { title: 'Guardiões da Galáxia Vol. 3', chosenByPersonId: 'p1', order: 1 },
          { title: 'Thor: Ragnarok', chosenByPersonId: 'p2', order: 2 },
        ],
        firstSleeperPersonId: 'p3',
        sleepTimes: [
          { personId: 'p3', time: '01:30' },
        ],
        notes: 'Menta não aguentou',
      },
    ],
    
    shameWall: [
      {
        id: 'sh1',
        sessionId: 's1',
        dateISO: daysAgo(2),
        personId: 'p3',
        time: '02:15',
        note: 'Dormiu no meio do filme!',
      },
      {
        id: 'sh2',
        sessionId: 's2',
        dateISO: daysAgo(5),
        personId: 'p4',
        time: '01:45',
        note: 'Não aguentou nem metade',
      },
      {
        id: 'sh3',
        sessionId: 's3',
        dateISO: daysAgo(10),
        personId: 'p2',
        time: '02:00',
        note: 'Primeiro a cair',
      },
      {
        id: 'sh4',
        sessionId: 's5',
        dateISO: daysAgo(20),
        personId: 'p3',
        time: '01:30',
        note: 'Recorde negativo',
      },
      {
        id: 'sh5',
        dateISO: daysAgo(25),
        personId: 'p2',
        time: '00:45',
        note: 'Dormiu antes do filme começar!',
      },
    ],
    
    dailyMovies: [
      {
        id: 'dm1',
        dateISO: daysAgo(1),
        title: 'John Wick 4',
        createdByPersonId: 'p1',
        createdAtISO: new Date(daysAgo(1)).toISOString(),
      },
      {
        id: 'dm2',
        dateISO: daysAgo(3),
        title: 'Guardiões da Galáxia Vol. 3',
        createdByPersonId: 'p2',
        createdAtISO: new Date(daysAgo(3)).toISOString(),
      },
      {
        id: 'dm3',
        dateISO: daysAgo(7),
        title: 'Spider-Man: Across the Spider-Verse',
        createdByPersonId: 'p3',
        createdAtISO: new Date(daysAgo(7)).toISOString(),
      },
      {
        id: 'dm4',
        dateISO: daysAgo(12),
        title: 'The Batman',
        createdByPersonId: 'p4',
        createdAtISO: new Date(daysAgo(12)).toISOString(),
      },
      {
        id: 'dm5',
        dateISO: daysAgo(18),
        title: 'Top Gun: Maverick',
        createdByPersonId: 'p1',
        createdAtISO: new Date(daysAgo(18)).toISOString(),
      },
    ],
    
    votes: [
      // Votes for dm1 (John Wick 4)
      { id: 'v1', dailyMovieId: 'dm1', personId: 'p1', stars: 5, createdAtISO: new Date(daysAgo(1)).toISOString() },
      { id: 'v2', dailyMovieId: 'dm1', personId: 'p2', stars: 5, createdAtISO: new Date(daysAgo(1)).toISOString() },
      { id: 'v3', dailyMovieId: 'dm1', personId: 'p3', stars: 4, createdAtISO: new Date(daysAgo(1)).toISOString() },
      { id: 'v4', dailyMovieId: 'dm1', personId: 'p4', stars: 5, createdAtISO: new Date(daysAgo(1)).toISOString() },
      
      // Votes for dm2 (Guardiões da Galáxia Vol. 3)
      { id: 'v5', dailyMovieId: 'dm2', personId: 'p1', stars: 5, createdAtISO: new Date(daysAgo(3)).toISOString() },
      { id: 'v6', dailyMovieId: 'dm2', personId: 'p2', stars: 4, createdAtISO: new Date(daysAgo(3)).toISOString() },
      { id: 'v7', dailyMovieId: 'dm2', personId: 'p3', stars: 5, createdAtISO: new Date(daysAgo(3)).toISOString() },
      
      // Votes for dm3 (Spider-Man)
      { id: 'v8', dailyMovieId: 'dm3', personId: 'p1', stars: 5, createdAtISO: new Date(daysAgo(7)).toISOString() },
      { id: 'v9', dailyMovieId: 'dm3', personId: 'p2', stars: 5, createdAtISO: new Date(daysAgo(7)).toISOString() },
      { id: 'v10', dailyMovieId: 'dm3', personId: 'p3', stars: 5, createdAtISO: new Date(daysAgo(7)).toISOString() },
      { id: 'v11', dailyMovieId: 'dm3', personId: 'p4', stars: 4, createdAtISO: new Date(daysAgo(7)).toISOString() },
      
      // Votes for dm4 (The Batman)
      { id: 'v12', dailyMovieId: 'dm4', personId: 'p1', stars: 4, createdAtISO: new Date(daysAgo(12)).toISOString() },
      { id: 'v13', dailyMovieId: 'dm4', personId: 'p2', stars: 3, createdAtISO: new Date(daysAgo(12)).toISOString() },
      { id: 'v14', dailyMovieId: 'dm4', personId: 'p3', stars: 4, createdAtISO: new Date(daysAgo(12)).toISOString() },
      
      // Votes for dm5 (Top Gun)
      { id: 'v15', dailyMovieId: 'dm5', personId: 'p1', stars: 5, createdAtISO: new Date(daysAgo(18)).toISOString() },
      { id: 'v16', dailyMovieId: 'dm5', personId: 'p2', stars: 5, createdAtISO: new Date(daysAgo(18)).toISOString() },
      { id: 'v17', dailyMovieId: 'dm5', personId: 'p4', stars: 4, createdAtISO: new Date(daysAgo(18)).toISOString() },
    ],
  };
};
