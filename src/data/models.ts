// ==================== MODELS ====================

export interface PersonStats {
  totalSessions: number;
  totalSurvived: number;
  totalSlept: number;
  totalNaps: number;
  totalSleepMinutes: number;
  consecutiveSurvived: number;
  longestAwakeStreak: number;
  warmupWins: number;
  warmupGames: number;
  timesSleptFirst: number;
}

export interface PersonAchievement {
  achievementId: string;
  unlockedAt: string; // ISO date
  sessionId?: string;
}

export interface Person {
  id: string;
  name: string;
  avatarUrl?: string;
  isAlternative?: boolean;
  stats: PersonStats;
  achievements: PersonAchievement[];
  lastUpdated: string; // ISO date
}

export interface MovieWatched {
  title: string;
  chosenByPersonId: string;
  order: number; // ordem do filme no dia (1, 2, 3...)
}

export interface SessionParticipant {
  personId: string;
  naps: number; // quantidade de cochilos
  totalSleepTime: number; // tempo total dormindo em minutos
  sleptFirst: boolean; // foi o primeiro a dormir?
  sleepTime?: string; // hora que dormiu pela primeira vez "HH:MM"
}

export interface Session {
  id: string;
  dateISO: string; // "2026-01-20"
  participantIds: string[]; // MANTER para compatibilidade
  participants?: SessionParticipant[]; // NOVA estrutura centralizada
  movies: MovieWatched[]; // VÁRIOS filmes assistidos no dia
  warmUp?: WarmUp; // Aquecimento (Hora do Pés) antes dos filmes
  // CAMPOS ANTIGOS - Manter para compatibilidade com dados existentes
  firstSleeperPersonId?: string;
  sleepTimes?: { personId: string; time: string }[]; // "HH:MM"
  naps?: Record<string, number>; // { personId: quantidade_de_cochilos }
  totalSleepTime?: Record<string, number>; // { personId: tempo_total_em_minutos }
  notes?: string;
}

export interface WarmUp {
  playerPersonId: string;
  result: 'GANHOU' | 'PERDEU' | 'EMPATE';
  durationMin?: number;
  note?: string;
}

export interface ShameEntry {
  id: string;
  sessionId?: string;
  dateISO: string;
  personId: string;
  time: string; // "HH:MM"
  note?: string;
  photoUrl?: string;
}

export interface DailyMovie {
  id: string;
  dateISO: string;
  title: string;
  createdByPersonId: string;
  createdAtISO: string;
}

export interface Vote {
  id: string;
  dailyMovieId: string;
  personId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  createdAtISO: string;
}

// ==================== ROOT DATA STRUCTURE ====================

export interface LucasflixData {
  version: number;
  people: Person[];
  sessions: Session[];
  dailyMovies: DailyMovie[];
  votes: Vote[];
  shameWall: ShameEntry[];
}
