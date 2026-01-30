import { useData } from '../context/DataContext';
import { ACHIEVEMENTS, Achievement, PersonStats } from '../data/achievements';
import { Session, PersonAchievement } from '../data/models';

export const useAchievements = () => {
  const { data, updateData, people } = useData();

  // Calcula estatísticas (usa person.stats que já está salvo)
  const calculatePersonStats = (personId: string, _newSession?: Session): PersonStats => {
    const person = people.find(p => p.id === personId);
    if (!person) {
      return {
        personId,
        totalSessions: 0,
        totalSurvived: 0,
        totalSlept: 0,
        totalNaps: 0,
        totalSleepMinutes: 0,
        consecutiveSurvived: 0,
        warmupWins: 0,
        warmupGames: 0,
        timesRescued: 0,
        longestAwakeStreak: 0,
      };
    }
    
    return {
      ...person.stats,
      personId,
      timesRescued: 0,
    };
  };

  // Verifica quais conquistas uma pessoa desbloqueou
  const checkAchievements = (personId: string): Achievement[] => {
    // LÊ DIRETO DO LOCALSTORAGE para garantir dados atualizados
    const storedData = localStorage.getItem('lucasflix_data');
    const currentData = storedData ? JSON.parse(storedData) : data;
    
    const person = currentData.people.find((p: any) => p.id === personId);
    if (!person) {
      console.log('⚠️ Pessoa não encontrada:', personId);
      return [];
    }
    
    const stats = { ...person.stats, personId, timesRescued: 0 };
    console.log('📊 Stats da pessoa', person.name, ':', stats);
    
    const alreadyUnlocked = person.achievements.map((a: any) => a.achievementId);
    console.log('🔓 Conquistas já desbloqueadas:', alreadyUnlocked);

    const newAchievements = ACHIEVEMENTS.filter(achievement => {
      const notUnlocked = !alreadyUnlocked.includes(achievement.id);
      const meetsCondition = achievement.condition(stats);
      
      if (meetsCondition && notUnlocked) {
        console.log('🎯 NOVA CONQUISTA encontrada:', achievement.title, achievement.id);
      }
      
      return notUnlocked && meetsCondition;
    });
    
    console.log('✅ Total de novas conquistas para', person.name, ':', newAchievements.length);
    
    return newAchievements;
  };

  // Desbloqueia uma conquista
  const unlockAchievement = (personId: string, achievementId: string, sessionId?: string) => {
    const updatedPeople = data.people.map(person => {
      if (person.id === personId) {
        const newAchievement: PersonAchievement = {
          achievementId,
          unlockedAt: new Date().toISOString(),
          sessionId,
        };
        return {
          ...person,
          achievements: [...person.achievements, newAchievement],
          lastUpdated: new Date().toISOString(),
        };
      }
      return person;
    });

    updateData({ ...data, people: updatedPeople });
  };

  // Pega conquistas desbloqueadas de uma pessoa
  const getUnlockedAchievements = (personId: string): Achievement[] => {
    const person = people.find(p => p.id === personId);
    if (!person) return [];
    
    const unlockedIds = person.achievements.map(a => a.achievementId);
    return ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id));
  };

  // Pega todas as conquistas com status
  const getAllAchievementsWithStatus = (personId: string) => {
    const unlocked = getUnlockedAchievements(personId);
    const unlockedIds = unlocked.map(a => a.id);
    
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.includes(achievement.id),
    }));
  };

  // Verifica conquistas sem desbloquear (para acumular antes de salvar)
  const checkNewAchievements = (personId: string): Achievement[] => {
    return checkAchievements(personId);
  };

  // Verifica e desbloqueia conquistas
  const checkAndUnlockNew = (personId: string): Achievement[] => {
    const newAchievements = checkAchievements(personId);
    return newAchievements;
  };

  // Desbloqueia múltiplas conquistas de uma vez
  const unlockMultipleAchievements = (achievements: { personId: string, achievementId: string, sessionId?: string }[]) => {
    console.log('🎯 Desbloqueando', achievements.length, 'conquistas:', achievements);
    
    // LÊ OS DADOS MAIS RECENTES do localStorage AGORA (não antes!)
    const storedData = localStorage.getItem('lucasflix_data');
    const currentData = storedData ? JSON.parse(storedData) : data;
    
    console.log('📦 Pessoas ANTES de salvar conquistas (dados FRESCOS):', currentData.people.map((p: any) => ({
      name: p.name,
      achievements: p.achievements.length,
      totalSurvived: p.stats.totalSurvived
    })));
    
    // Agrupa por personId
    const achievementsByPerson = new Map<string, PersonAchievement[]>();
    
    achievements.forEach(({ personId, achievementId, sessionId }) => {
      if (!achievementsByPerson.has(personId)) {
        achievementsByPerson.set(personId, []);
      }
      achievementsByPerson.get(personId)!.push({
        achievementId,
        unlockedAt: new Date().toISOString(),
        sessionId,
      });
    });
    
    console.log('🗂️ Achievements agrupados por pessoa:', Array.from(achievementsByPerson.entries()).map(([pid, achs]) => ({
      personId: pid,
      count: achs.length,
      achievements: achs.map(a => a.achievementId)
    })));

    // Atualiza todas as pessoas de uma vez
    const updatedPeople = currentData.people.map((person: any) => {
      const newAchievements = achievementsByPerson.get(person.id);
      if (newAchievements) {
        console.log('✅ Adicionando', newAchievements.length, 'conquistas para', person.name, ':', newAchievements.map(a => a.achievementId));
        return {
          ...person,
          achievements: [...person.achievements, ...newAchievements],
          lastUpdated: new Date().toISOString(),
        };
      }
      return person;
    });

    console.log('📦 Pessoas DEPOIS de atualizar conquistas:', updatedPeople.map((p: any) => ({
      name: p.name,
      achievements: p.achievements.length
    })));

    // Salva direto no localStorage IMEDIATAMENTE
    const updatedData = { ...currentData, people: updatedPeople };
    localStorage.setItem('lucasflix_data', JSON.stringify(updatedData));
    
    console.log('💾 Salvo no localStorage!');
    
    // E também atualiza o contexto
    updateData(updatedData);
    
    console.log('💾 Conquistas salvas! Total de achievements agora:', updatedPeople.flatMap((p: any) => p.achievements).length);
  };

  return {
    calculatePersonStats,
    checkAchievements,
    unlockAchievement,
    getUnlockedAchievements,
    getAllAchievementsWithStatus,
    checkNewAchievements,
    checkAndUnlockNew,
    unlockMultipleAchievements,
  };
};
