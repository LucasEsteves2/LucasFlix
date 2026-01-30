// Sistema de Conquistas (Achievements)

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'endurance' | 'participation' | 'warmup' | 'recovery' | 'legendary';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: (stats: PersonStats) => boolean;
}

export interface PersonStats {
  personId: string;
  totalSessions: number;
  totalSurvived: number;
  totalSlept: number;
  totalNaps: number;
  totalSleepMinutes: number;
  consecutiveSurvived: number;
  warmupWins: number;
  warmupGames: number;
  timesRescued: number;
  longestAwakeStreak: number;
}

export interface UnlockedAchievement {
  achievementId: string;
  personId: string;
  unlockedAt: string; // ISO date
  sessionId?: string;
}

// Definição de todas as conquistas
export const ACHIEVEMENTS: Achievement[] = [
  // ENDURANCE - Resistência
  {
    id: 'first_survivor',
    title: 'Primeira Vitória',
    description: 'Sobreviveu 1 sessão sem dormir',
    icon: '🎉',
    category: 'endurance',
    rarity: 'common',
    condition: (stats) => stats.totalSurvived >= 1,
  },
  {
    id: 'survivor_5',
    title: 'Maratonista',
    description: 'Sobreviveu 5 sessões sem dormir',
    icon: '🏃',
    category: 'endurance',
    rarity: 'common',
    condition: (stats) => stats.consecutiveSurvived >= 5,
  },
  {
    id: 'survivor_10',
    title: 'Resistência de Ferro',
    description: 'Sobreviveu 10 sessões sem dormir',
    icon: '💪',
    category: 'endurance',
    rarity: 'rare',
    condition: (stats) => stats.consecutiveSurvived >= 10,
  },
  {
    id: 'survivor_20',
    title: 'Imortal',
    description: 'Sobreviveu 20 sessões sem dormir',
    icon: '👑',
    category: 'endurance',
    rarity: 'legendary',
    condition: (stats) => stats.consecutiveSurvived >= 20,
  },
  {
    id: 'never_sleep',
    title: 'Insone',
    description: 'Nunca dormiu em nenhuma sessão',
    icon: '😎',
    category: 'endurance',
    rarity: 'epic',
    condition: (stats) => stats.totalSessions >= 5 && stats.totalSlept === 0,
  },

  // PARTICIPATION - Participação
  {
    id: 'sessions_10',
    title: 'Frequentador',
    description: 'Participou de 10 sessões',
    icon: '🎬',
    category: 'participation',
    rarity: 'common',
    condition: (stats) => stats.totalSessions >= 10,
  },
  {
    id: 'sessions_25',
    title: 'Viciado em Cinema',
    description: 'Participou de 25 sessões',
    icon: '🍿',
    category: 'participation',
    rarity: 'rare',
    condition: (stats) => stats.totalSessions >= 25,
  },
  {
    id: 'sessions_50',
    title: 'Lenda do LucasFlix',
    description: 'Participou de 50 sessões',
    icon: '🌟',
    category: 'participation',
    rarity: 'legendary',
    condition: (stats) => stats.totalSessions >= 50,
  },

  // WARMUP - Aquecimento (Pés)
  {
    id: 'warmup_streak_3',
    title: 'Tricampeão',
    description: 'Venceu 3 vezes seguidas no Pés',
    icon: '🎯',
    category: 'warmup',
    rarity: 'rare',
    condition: (stats) => stats.warmupWins >= 3,
  },
  {
    id: 'warmup_master',
    title: 'Mestre dos Pés',
    description: 'Taxa de vitória acima de 75% (mín. 10 jogos)',
    icon: '🦶',
    category: 'warmup',
    rarity: 'epic',
    condition: (stats) => 
      stats.warmupGames >= 10 && 
      (stats.warmupWins / stats.warmupGames) >= 0.75,
  },
  {
    id: 'warmup_unbeatable',
    title: 'Invencível',
    description: 'Venceu 10 jogos de Pés',
    icon: '👑',
    category: 'warmup',
    rarity: 'legendary',
    condition: (stats) => stats.warmupWins >= 10,
  },

  // RECOVERY - "Vergonha" / Cochilos
  {
    id: 'sleeper_redemption',
    title: 'Dorminhoco Arrependido',
    description: 'Foi resgatado 5 vezes em uma única sessão',
    icon: '😅',
    category: 'recovery',
    rarity: 'rare',
    condition: (stats) => stats.timesRescued >= 5, // precisa ser checado por sessão
  },
  {
    id: 'king_of_naps',
    title: 'Rei do Cochilo',
    description: 'Acumulou 50 cochilos no total',
    icon: '😴',
    category: 'recovery',
    rarity: 'epic',
    condition: (stats) => stats.totalNaps >= 50,
  },
  {
    id: 'sleep_master',
    title: 'Mestre do Sono',
    description: 'Dormiu mais de 5 horas no total',
    icon: '💤',
    category: 'recovery',
    rarity: 'rare',
    condition: (stats) => stats.totalSleepMinutes >= 300, // 5 horas
  },

  // LEGENDARY - Conquistas especiais
  {
    id: 'first_session',
    title: 'Primeira Sessão',
    description: 'Participou da primeira sessão',
    icon: '🎉',
    category: 'legendary',
    rarity: 'common',
    condition: (stats) => stats.totalSessions >= 1,
  },
  {
    id: 'perfect_record',
    title: 'Registro Perfeito',
    description: '100% de taxa de sobrevivência (mín. 10 sessões)',
    icon: '✨',
    category: 'legendary',
    rarity: 'legendary',
    condition: (stats) => 
      stats.totalSessions >= 10 && 
      stats.totalSlept === 0,
  },
];

// Cores por raridade
export const RARITY_COLORS = {
  common: '#b3b3b3',
  rare: '#4a9eff',
  epic: '#9c27b0',
  legendary: '#ff9800',
};

export const RARITY_GLOW = {
  common: 'rgba(179, 179, 179, 0.3)',
  rare: 'rgba(74, 158, 255, 0.5)',
  epic: 'rgba(156, 39, 176, 0.6)',
  legendary: 'rgba(255, 152, 0, 0.7)',
};
