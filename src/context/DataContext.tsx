import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LucasflixData, Person, Session, DailyMovie, Vote, ShameEntry, PersonStats } from '../data/models';
import { IDataStore } from '../data/IDataStore';
import { LocalStorageDataStore } from '../data/LocalStorageDataStore';

interface DataContextType {
  data: LucasflixData;
  loading: boolean;
  updateData: (newData: LucasflixData) => void;
  
  // People
  people: Person[];
  getPerson: (id: string) => Person | undefined;
  updatePersonStats: (personId: string, stats: PersonStats) => void;
  recalculateAllStats: () => void;
  
  // Sessions
  sessions: Session[];
  addSession: (session: Omit<Session, 'id'>) => Session;
  updateSession: (id: string, session: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  
  // Shame Wall
  shameWall: ShameEntry[];
  addShameEntry: (entry: Omit<ShameEntry, 'id'>) => void;
  updateShameEntry: (id: string, entry: Partial<ShameEntry>) => void;
  deleteShameEntry: (id: string) => void;
  
  // Daily Movies
  dailyMovies: DailyMovie[];
  addDailyMovie: (movie: Omit<DailyMovie, 'id'>) => void;
  updateDailyMovie: (id: string, movie: Partial<DailyMovie>) => void;
  deleteDailyMovie: (id: string) => void;
  
  // Votes
  votes: Vote[];
  addVote: (vote: Omit<Vote, 'id'>) => void;
  updateVote: (id: string, vote: Partial<Vote>) => void;
  deleteVote: (id: string) => void;
  getVotesForMovie: (dailyMovieId: string) => Vote[];
  
  // Backup
  exportData: () => string;
  importData: (jsonString: string) => void;
  resetToSeed: () => void;
  clearAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initialize data store (can be switched to Firebase later)
const dataStore: IDataStore = new LocalStorageDataStore();

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<LucasflixData>({
    version: 1,
    people: [],
    sessions: [],
    dailyMovies: [],
    votes: [],
    shameWall: [],
  });
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const loaded = await dataStore.load();
      
      const now = new Date().toISOString();
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
      
      // Migração: Adiciona stats e achievements em pessoas antigas
      const updatedPeople = loaded.people.map(person => {
        if (!person.stats || !person.achievements) {
          return {
            ...person,
            stats: person.stats || emptyStats,
            achievements: person.achievements || [],
            lastUpdated: person.lastUpdated || now,
          };
        }
        return person;
      });
      
      // Migração: Adiciona participantes alternativos se não existirem
      const alternativeParticipants = [
        { id: 'p5', name: 'Julia', isAlternative: true, stats: emptyStats, achievements: [], lastUpdated: now },
        { id: 'p6', name: 'Valesca', isAlternative: true, stats: emptyStats, achievements: [], lastUpdated: now },
        { id: 'p7', name: 'Vitória', isAlternative: true, stats: emptyStats, achievements: [], lastUpdated: now },
        { id: 'p8', name: 'Lucca', isAlternative: true, stats: emptyStats, achievements: [], lastUpdated: now },
      ];
      
      let needsUpdate = false;
      
      for (const altPerson of alternativeParticipants) {
        if (!updatedPeople.find(p => p.id === altPerson.id)) {
          updatedPeople.push(altPerson);
          needsUpdate = true;
        }
      }
      
      const updatedData = { ...loaded, people: updatedPeople };
      
      if (needsUpdate || updatedPeople.some((p, i) => p !== loaded.people[i])) {
        await dataStore.save(updatedData);
      }
      
      setData(updatedData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newData: LucasflixData) => {
    try {
      await dataStore.save(newData);
      setData(newData);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Helper to generate IDs
  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Função para calcular stats de uma pessoa baseado em todas as sessões
  const calculatePersonStats = (personId: string, sessions: Session[]): PersonStats => {
    const personName = data.people.find(p => p.id === personId)?.name || personId;
    console.log('📢 calculatePersonStats para:', personName, '(', personId, ')');
    console.log('📢 Total de sessões para verificar:', sessions.length);
    
    const personSessions = sessions.filter(s => 
      s.participants?.some(p => p.personId === personId) || 
      s.participantIds.includes(personId)
    );
    
    console.log('📢 Sessões filtradas para', personName, ':', personSessions.length);
    
    let totalSurvived = 0;
    let totalSlept = 0;
    let totalNaps = 0;
    let totalSleepMinutes = 0;
    let consecutiveSurvived = 0;
    let currentStreak = 0;
    let longestAwakeStreak = 0;
    let warmupWins = 0;
    let warmupGames = 0;
    let timesSleptFirst = 0;

    // Ordena por data
    const sortedSessions = [...personSessions].sort((a, b) => 
      a.dateISO.localeCompare(b.dateISO)
    );

    sortedSessions.forEach((session, index) => {
      console.log(`📊 Sessão ${index + 1}/${sortedSessions.length} - Data: ${session.dateISO}`);
      
      let slept = false;
      let napCount = 0;
      let sleepMinutes = 0;
      let sleptFirst = false;
      
      // Prioriza nova estrutura
      if (session.participants) {
        console.log('📊   Tem participants array:', session.participants.map(p => ({ id: p.personId, naps: p.naps })));
        const participant = session.participants.find(p => p.personId === personId);
        console.log('📊   Participant encontrado?', !!participant, participant);
        if (participant) {
          slept = participant.sleptFirst || participant.naps > 0;
          napCount = participant.naps;
          sleepMinutes = participant.totalSleepTime;
          sleptFirst = participant.sleptFirst;
          console.log('📊   Dados: slept=', slept, 'napCount=', napCount, 'sleepMinutes=', sleepMinutes);
        } else {
          console.log('⚠️   Participant NÃO encontrado para', personId, 'em participants');
        }
      } else {
        // Compatibilidade com estrutura antiga
        slept = !!(session.firstSleeperPersonId === personId || 
                (session.naps && session.naps[personId] > 0));
        napCount = session.naps?.[personId] || 0;
        sleepMinutes = session.totalSleepTime?.[personId] || 0;
        sleptFirst = session.firstSleeperPersonId === personId;
      }
      
      if (slept) {
        totalSlept++;
        currentStreak = 0;
      } else {
        totalSurvived++;
        currentStreak++;
        longestAwakeStreak = Math.max(longestAwakeStreak, currentStreak);
      }

      totalNaps += napCount;
      totalSleepMinutes += sleepMinutes;
      if (sleptFirst) timesSleptFirst++;

      // Warmup
      if (session.warmUp && session.warmUp.playerPersonId === personId) {
        warmupGames++;
        if (session.warmUp.result === 'GANHOU') {
          warmupWins++;
        }
      }
    });

    // Streak consecutivo atual (de trás pra frente)
    for (let i = sortedSessions.length - 1; i >= 0; i--) {
      const session = sortedSessions[i];
      let slept = false;
      
      if (session.participants) {
        const participant = session.participants.find(p => p.personId === personId);
        slept = participant ? (participant.sleptFirst || participant.naps > 0) : false;
      } else {
        slept = !!(session.firstSleeperPersonId === personId || 
                (session.naps && session.naps[personId] > 0));
      }
      
      if (slept) break;
      consecutiveSurvived++;
    }

    const finalStats = {
      totalSessions: personSessions.length,
      totalSurvived,
      totalSlept,
      totalNaps,
      totalSleepMinutes,
      consecutiveSurvived,
      longestAwakeStreak,
      warmupWins,
      warmupGames,
      timesSleptFirst,
    };
    
    console.log('✅ Stats FINAIS para', personName, ':', {
      ...finalStats,
      '🟢 SOBREVIVEU': totalSurvived,
      '🔴 DORMIU': totalSlept,
      '😴 COCHILOS': totalNaps
    });
    return finalStats;
  };

  // Atualiza stats de uma pessoa específica
  const updatePersonStats = (personId: string, stats: PersonStats) => {
    const storedData = localStorage.getItem('lucasflix_data');
    const currentData = storedData ? JSON.parse(storedData) : data;
    
    const updatedPeople = currentData.people.map(person => 
      person.id === personId 
        ? { ...person, stats, lastUpdated: new Date().toISOString() }
        : person
    );
    const updatedData = { ...currentData, people: updatedPeople };
    localStorage.setItem('lucasflix_data', JSON.stringify(updatedData));
    saveData(updatedData);
  };

  // Recalcula stats de todas as pessoas
  const recalculateAllStats = () => {
    const storedData = localStorage.getItem('lucasflix_data');
    const currentData = storedData ? JSON.parse(storedData) : data;
    
    const updatedPeople = currentData.people.map(person => ({
      ...person,
      stats: calculatePersonStats(person.id, currentData.sessions),
      lastUpdated: new Date().toISOString(),
    }));
    const updatedData = { ...currentData, people: updatedPeople };
    localStorage.setItem('lucasflix_data', JSON.stringify(updatedData));
    saveData(updatedData);
  };

  // People
  const getPerson = (id: string) => data.people.find(p => p.id === id);

  // Sessions
  const addSession = (session: Omit<Session, 'id'>) => {
    const newSession: Session = { ...session, id: generateId() };
    const updatedData = { ...data, sessions: [...data.sessions, newSession] };
    
    console.log('💾 Salvando sessão e recalculando stats...');
    console.log('💾 Participants na sessão:', session.participants);
    
    // Recalcula stats dos participantes
    const participantIds = session.participants?.map(p => p.personId) || session.participantIds;
    console.log('💾 ParticipantIds extraídos:', participantIds);
    console.log('💾 Nomes dos participantes:', participantIds.map(id => data.people.find(p => p.id === id)?.name));
    
    const updatedPeople = updatedData.people.map(person => {
      if (participantIds.includes(person.id)) {
        const newStats = calculatePersonStats(person.id, updatedData.sessions);
        console.log('📊 Stats recalculadas para', person.name, ':', newStats);
        return {
          ...person,
          stats: newStats,
          lastUpdated: new Date().toISOString(),
        };
      }
      return person;
    });
    
    const finalData = { ...updatedData, people: updatedPeople };
    
    console.log('💾 Salvando no localStorage...');
    // Salva no localStorage IMEDIATAMENTE de forma síncrona
    localStorage.setItem('lucasflix_data', JSON.stringify(finalData));
    
    // LOG CRÍTICO: Mostra o que foi salvo
    const savedPeople = finalData.people.map((p: any) => ({
      name: p.name,
      totalSessions: p.stats.totalSessions,
      totalSurvived: p.stats.totalSurvived,
      totalSlept: p.stats.totalSlept
    }));
    console.log('💾 DADOS SALVOS NO LOCALSTORAGE:', savedPeople);
    
    // Verifica SE REALMENTE salvou IMEDIATAMENTE
    const verifyData = JSON.parse(localStorage.getItem('lucasflix_data') || '{}');
    const verifyPeople = verifyData.people?.map((p: any) => ({
      name: p.name,
      survived: p.stats.totalSurvived
    }));
    console.log('✅ VERIFICAÇÃO IMEDIATA - O que está NO LOCALSTORAGE agora:', verifyPeople);
    
    // MARCA que acabamos de salvar
    (window as any).__lucasflix_last_save = Date.now();
    
    console.log('💾 Atualizando contexto React...');
    // NÃO CHAMA setData() aqui para evitar efeitos colaterais que possam sobrescrever!
    // O contexto será atualizado naturalmente quando componentes lerem do localStorage
    // setData(finalData); // REMOVIDO TEMPORARIAMENTE
    
    // DISPARA EVENTO GLOBAL para forçar atualização em todos os componentes
    window.dispatchEvent(new CustomEvent('lucasflix-data-updated', { detail: finalData }));
    
    console.log('✅ Sessão salva com sucesso!');
    return newSession;
  };

  const updateSession = (id: string, updates: Partial<Session>) => {
    const storedData = localStorage.getItem('lucasflix_data');
    const currentData = storedData ? JSON.parse(storedData) : data;
    
    const updated = currentData.sessions.map(s => s.id === id ? { ...s, ...updates } : s);
    const updatedData = { ...currentData, sessions: updated };
    localStorage.setItem('lucasflix_data', JSON.stringify(updatedData));
    saveData(updatedData);
  };

  const deleteSession = (id: string) => {
    const storedData = localStorage.getItem('lucasflix_data');
    const currentData = storedData ? JSON.parse(storedData) : data;
    
    const filtered = currentData.sessions.filter(s => s.id !== id);
    const updatedData = { ...currentData, sessions: filtered };
    localStorage.setItem('lucasflix_data', JSON.stringify(updatedData));
    saveData(updatedData);
  };

  // Shame Wall
  const addShameEntry = (entry: Omit<ShameEntry, 'id'>) => {
    const newEntry: ShameEntry = { ...entry, id: generateId() };
    
    // LÊ do localStorage para não sobrescrever sessões recém-salvas
    const storedData = localStorage.getItem('lucasflix_data');
    const currentData = storedData ? JSON.parse(storedData) : data;
    
    const updatedData = { ...currentData, shameWall: [...currentData.shameWall, newEntry] };
    localStorage.setItem('lucasflix_data', JSON.stringify(updatedData));
    
    // Atualiza via dataStore também
    saveData(updatedData);
  };

  const updateShameEntry = (id: string, updates: Partial<ShameEntry>) => {
    const storedData = localStorage.getItem('lucasflix_data');
    const currentData = storedData ? JSON.parse(storedData) : data;
    
    const updated = currentData.shameWall.map(e => e.id === id ? { ...e, ...updates } : e);
    const updatedData = { ...currentData, shameWall: updated };
    localStorage.setItem('lucasflix_data', JSON.stringify(updatedData));
    saveData(updatedData);
  };

  const deleteShameEntry = (id: string) => {
    const storedData = localStorage.getItem('lucasflix_data');
    const currentData = storedData ? JSON.parse(storedData) : data;
    
    const filtered = currentData.shameWall.filter(e => e.id !== id);
    const updatedData = { ...currentData, shameWall: filtered };
    localStorage.setItem('lucasflix_data', JSON.stringify(updatedData));
    saveData(updatedData);
  };

  // Daily Movies
  const addDailyMovie = (movie: Omit<DailyMovie, 'id'>) => {
    const storedData = localStorage.getItem('lucasflix_data');
    const currentData = storedData ? JSON.parse(storedData) : data;
    
    const newMovie: DailyMovie = { ...movie, id: generateId() };
    const updatedData = { ...currentData, dailyMovies: [...currentData.dailyMovies, newMovie] };
    localStorage.setItem('lucasflix_data', JSON.stringify(updatedData));
    saveData(updatedData);
  };

  const updateDailyMovie = (id: string, updates: Partial<DailyMovie>) => {
    const storedData = localStorage.getItem('lucasflix_data');
    const currentData = storedData ? JSON.parse(storedData) : data;
    
    const updated = currentData.dailyMovies.map(m => m.id === id ? { ...m, ...updates } : m);
    const updatedData = { ...currentData, dailyMovies: updated };
    localStorage.setItem('lucasflix_data', JSON.stringify(updatedData));
    saveData(updatedData);
  };

  const deleteDailyMovie = (id: string) => {
    const storedData = localStorage.getItem('lucasflix_data');
    const currentData = storedData ? JSON.parse(storedData) : data;
    
    const filtered = currentData.dailyMovies.filter(m => m.id !== id);
    const filteredVotes = currentData.votes.filter(v => v.dailyMovieId !== id);
    const updatedData = { ...currentData, dailyMovies: filtered, votes: filteredVotes };
    localStorage.setItem('lucasflix_data', JSON.stringify(updatedData));
    saveData(updatedData);
  };

  // Votes
  const addVote = (vote: Omit<Vote, 'id'>) => {
    const storedData = localStorage.getItem('lucasflix_data');
    const currentData = storedData ? JSON.parse(storedData) : data;
    
    // Remove existing vote from same person for same movie
    const filtered = currentData.votes.filter(v => 
      !(v.dailyMovieId === vote.dailyMovieId && v.personId === vote.personId)
    );
    const newVote: Vote = { ...vote, id: generateId() };
    const updatedData = { ...currentData, votes: [...filtered, newVote] };
    localStorage.setItem('lucasflix_data', JSON.stringify(updatedData));
    saveData(updatedData);
  };

  const updateVote = (id: string, updates: Partial<Vote>) => {
    const storedData = localStorage.getItem('lucasflix_data');
    const currentData = storedData ? JSON.parse(storedData) : data;
    
    const updated = currentData.votes.map(v => v.id === id ? { ...v, ...updates } : v);
    const updatedData = { ...currentData, votes: updated };
    localStorage.setItem('lucasflix_data', JSON.stringify(updatedData));
    saveData(updatedData);
  };

  const deleteVote = (id: string) => {
    const storedData = localStorage.getItem('lucasflix_data');
    const currentData = storedData ? JSON.parse(storedData) : data;
    
    const filtered = currentData.votes.filter(v => v.id !== id);
    const updatedData = { ...currentData, votes: filtered };
    localStorage.setItem('lucasflix_data', JSON.stringify(updatedData));
    saveData(updatedData);
  };

  const getVotesForMovie = (dailyMovieId: string) => {
    return data.votes.filter(v => v.dailyMovieId === dailyMovieId);
  };

  // Backup
  const exportData = () => {
    return JSON.stringify(data, null, 2);
  };

  const importData = (jsonString: string) => {
    try {
      const imported = JSON.parse(jsonString) as LucasflixData;
      
      // Basic validation
      if (!imported.version || !imported.people || !Array.isArray(imported.people)) {
        throw new Error('Invalid data structure');
      }
      
      saveData(imported);
    } catch (error) {
      throw new Error('Invalid JSON or data structure');
    }
  };

  const resetToSeed = async () => {
    const seed = await dataStore.resetToSeed();
    setData(seed);
  };

  const clearAllData = () => {
    const now = new Date().toISOString();
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
    
    const emptyData: LucasflixData = {
      version: 1,
      people: [
        { id: 'p1', name: 'Thiago', stats: emptyStats, achievements: [], lastUpdated: now },
        { id: 'p2', name: 'Diego', stats: emptyStats, achievements: [], lastUpdated: now },
        { id: 'p3', name: 'Menta', stats: emptyStats, achievements: [], lastUpdated: now },
        { id: 'p4', name: 'Lucas', stats: emptyStats, achievements: [], lastUpdated: now },
        { id: 'p5', name: 'Julia', isAlternative: true, stats: emptyStats, achievements: [], lastUpdated: now },
        { id: 'p6', name: 'Valesca', isAlternative: true, stats: emptyStats, achievements: [], lastUpdated: now },
        { id: 'p7', name: 'Vitória', isAlternative: true, stats: emptyStats, achievements: [], lastUpdated: now },
      ],
      sessions: [],
      dailyMovies: [],
      votes: [],
      shameWall: [],
    };
    saveData(emptyData);
  };

  const value: DataContextType = {
    data,
    loading,
    updateData: saveData,
    people: data.people,
    getPerson,
    updatePersonStats,
    recalculateAllStats,
    sessions: data.sessions,
    addSession,
    updateSession,
    deleteSession,
    shameWall: data.shameWall,
    addShameEntry,
    updateShameEntry,
    deleteShameEntry,
    dailyMovies: data.dailyMovies,
    addDailyMovie,
    updateDailyMovie,
    deleteDailyMovie,
    votes: data.votes,
    addVote,
    updateVote,
    deleteVote,
    getVotesForMovie,
    exportData,
    importData,
    resetToSeed,
    clearAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
