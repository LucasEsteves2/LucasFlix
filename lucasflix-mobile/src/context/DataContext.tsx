import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ref, onValue, set, push, update, remove } from 'firebase/database';
import { database } from '../services/firebaseConfig';
import type { Person, Session, DailyMovie, Vote, ShameEntry, LucasflixData } from '../types/models';

interface DataContextType {
  people: Person[];
  sessions: Session[];
  dailyMovies: DailyMovie[];
  votes: Vote[];
  shameWall: ShameEntry[];
  loading: boolean;
  activeSession: any | null;
  addSession: (session: Omit<Session, 'id'>) => Promise<void>;
  updateSession: (id: string, updates: Partial<Session>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  addDailyMovie: (movie: Omit<DailyMovie, 'id'>) => Promise<void>;
  addVote: (vote: Omit<Vote, 'id'>) => Promise<void>;
  addPerson: (person: Omit<Person, 'id'>) => Promise<void>;
  updatePerson: (id: string, updates: Partial<Person>) => Promise<void>;
  saveActiveSession: (sessionData: any) => Promise<void>;
  updateActiveSession: (updates: any) => Promise<void>;
  clearActiveSession: () => Promise<void>;
  finalizeActiveSession: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [dailyMovies, setDailyMovies] = useState<DailyMovie[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [shameWall, setShameWall] = useState<ShameEntry[]>([]);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper para converter strings booleanas em booleanos reais
  const toBoolean = (value: any): boolean => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return Boolean(value);
  };

  useEffect(() => {
    const dataRef = ref(database, '/lucasflix');
    
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val() as LucasflixData | null;
      
      if (data) {
        // Normalizar booleanos que podem vir como strings do Firebase
        const normalizedPeople = (data.people || []).map(p => ({
          ...p,
          isAlternative: toBoolean(p.isAlternative),
          isVisible: p.isVisible === undefined ? true : toBoolean(p.isVisible),
        }));
        
        // Normalizar booleanos em sessions
        const normalizedSessions = (data.sessions || []).map(s => ({
          ...s,
          participants: s.participants?.map(part => ({
            ...part,
            sleptFirst: toBoolean(part.sleptFirst),
          })),
        }));
        
        setPeople(normalizedPeople);
        setSessions(normalizedSessions);
        setDailyMovies(data.dailyMovies || []);
        setVotes(data.votes || []);
        setShameWall(data.shameWall || []);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listener para sessão ativa
  useEffect(() => {
    const activeSessionRef = ref(database, 'activeSession');
    
    const unsubscribe = onValue(activeSessionRef, (snapshot) => {
      const data = snapshot.val();
      setActiveSession(data);
    });

    return () => unsubscribe();
  }, []);

  const addSession = async (session: Omit<Session, 'id'>) => {
    const sessionsRef = ref(database, 'sessions');
    const newSessionRef = push(sessionsRef);
    const newSession = { ...session, id: newSessionRef.key };
    await set(newSessionRef, newSession);
  };

  const updateSession = async (id: string, updates: Partial<Session>) => {
    const sessionRef = ref(database, `sessions/${id}`);
    await update(sessionRef, updates);
  };

  const deleteSession = async (id: string) => {
    const sessionRef = ref(database, `sessions/${id}`);
    await remove(sessionRef);
  };

  const addDailyMovie = async (movie: Omit<DailyMovie, 'id'>) => {
    const moviesRef = ref(database, 'dailyMovies');
    const newMovieRef = push(moviesRef);
    const newMovie = { ...movie, id: newMovieRef.key };
    await set(newMovieRef, newMovie);
  };

  const addVote = async (vote: Omit<Vote, 'id'>) => {
    const votesRef = ref(database, 'votes');
    const newVoteRef = push(votesRef);
    const newVote = { ...vote, id: newVoteRef.key };
    await set(newVoteRef, newVote);
  };

  const addPerson = async (person: Omit<Person, 'id'>) => {
    const peopleRef = ref(database, 'people');
    const newPersonRef = push(peopleRef);
    const newPerson = { ...person, id: newPersonRef.key };
    await set(newPersonRef, newPerson);
  };

  const updatePerson = async (id: string, updates: Partial<Person>) => {
    const personRef = ref(database, `people/${id}`);
    await update(personRef, updates);
  };

  // Funções para gerenciar sessão ativa (temporária)
  const saveActiveSession = async (sessionData: any) => {
    const activeSessionRef = ref(database, 'activeSession');
    await set(activeSessionRef, {
      ...sessionData,
      createdAt: Date.now(),
    });
  };

  const updateActiveSession = async (updates: any) => {
    const activeSessionRef = ref(database, 'activeSession');
    await update(activeSessionRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  };

  const clearActiveSession = async () => {
    const activeSessionRef = ref(database, 'activeSession');
    await remove(activeSessionRef);
  };

  const finalizeActiveSession = async () => {
    if (!activeSession) return;

    // Salvar como sessão definitiva
    const sessionsRef = ref(database, 'sessions');
    const newSessionRef = push(sessionsRef);
    
    const finalSession = {
      ...activeSession,
      id: newSessionRef.key,
      finalizedAt: Date.now(),
    };
    
    // Remove campos temporários
    delete finalSession.createdAt;
    delete finalSession.updatedAt;
    
    await set(newSessionRef, finalSession);
    
    // Limpar sessão ativa
    await clearActiveSession();
  };

  return (
    <DataContext.Provider
      value={{
        people,
        sessions,
        dailyMovies,
        votes,
        shameWall,
        loading,
        activeSession,
        addSession,
        updateSession,
        deleteSession,
        addDailyMovie,
        addVote,
        addPerson,
        updatePerson,
        saveActiveSession,
        updateActiveSession,
        clearActiveSession,
        finalizeActiveSession,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
