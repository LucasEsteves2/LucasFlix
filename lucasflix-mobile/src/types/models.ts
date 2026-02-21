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
  isVisible?: boolean;
  stats: PersonStats;
  achievements: PersonAchievement[];
  lastUpdated: string;
}

export interface MovieWatched {
  title: string;
  chosenByPersonId: string;
  order: number;
}

export interface SessionParticipant {
  personId: string;
  naps: number;
  totalSleepTime: number;
  sleptFirst: boolean;
  sleepTime?: string;
}

export interface Session {
  id: string;
  dateISO: string;
  participantIds: string[];
  participants?: SessionParticipant[];
  movies: MovieWatched[];
  warmUp?: WarmUp;
  firstSleeperPersonId?: string;
  sleepTimes?: { personId: string; time: string }[];
  naps?: Record<string, number>;
  totalSleepTime?: Record<string, number>;
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
  time: string;
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

export interface LucasflixData {
  version: number;
  people: Person[];
  sessions: Session[];
  dailyMovies: DailyMovie[];
  votes: Vote[];
  shameWall: ShameEntry[];
}
