import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../context/DataContext';
import { useAlternativeMode } from '../context/AlternativeModeContext';
import { useAchievements } from '../hooks/useAchievements';
import { Badge } from '../components/Badge';
import { AchievementNotification } from '../components/AchievementNotification';
import { Achievement } from '../data/achievements';
import './StartSession.css';

// Avatar imports
import DiegoAvatar from '../imgs/DiegoAvatar.png';
import LucasAvatar from '../imgs/LucasAvatar.png';
import MentaAvatar from '../imgs/MentaAvatar.png';
import ThiagoAvatar from '../imgs/ThiagoAvatar.png';
import JuliaAvatar from '../imgs/JuliaAvatar.png';
import ValescaAvatar from '../imgs/ValescaAvatar.png';
import VitoriaAvatar from '../imgs/VitoriaAvatar.png';
import LucaVitoriaAvatar from '../imgs/lucaVitoriaAvatar.png';

const getAvatar = (name: string) => {
  const firstName = name.split(' ')[0].toLowerCase();
  const avatars: Record<string, string> = {
    'diego': DiegoAvatar,
    'lucas': LucasAvatar,
    'menta': MentaAvatar,
    'thiago': ThiagoAvatar,
    'julia': JuliaAvatar,
    'valesca': ValescaAvatar,
    'vitória': VitoriaAvatar,
    'lucca': LucaVitoriaAvatar,
  };
  return avatars[firstName] || LucasAvatar;
};

type WarmUpResult = 'GANHOU' | 'PERDEU' | 'EMPATE' | null;

export const StartSession: React.FC = () => {
  const { people, addSession, addShameEntry } = useData();
  const { isAlternativeMode, setAlternativeMode } = useAlternativeMode();
  const { checkAndUnlockNew, unlockMultipleAchievements } = useAchievements();
  const navigate = useNavigate();
  
  // Estado para notificações de conquista
  interface AchievementWithPerson {
    achievement: Achievement;
    personIds: string[];
  }
  const [achievementQueue, setAchievementQueue] = useState<AchievementWithPerson[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<AchievementWithPerson | null>(null);
  
  // Garante que o modo alternativo sempre começa desativado ao entrar na página
  useEffect(() => {
    console.log('🔧 Resetando modo alternativo para FALSE');
    setAlternativeMode(false);
  }, []); // Executa apenas uma vez ao montar

  const [step, setStep] = useState(1);
  const [warmUpPlayer, setWarmUpPlayer] = useState<string | null>(null);
  const [warmUpDone, setWarmUpDone] = useState(false);
  const [warmUpResult, setWarmUpResult] = useState<WarmUpResult>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  
  // Log para debug
  useEffect(() => {
    console.log('📊 Estado atual:', {
      isAlternativeMode,
      totalPeople: people.length,
      alternatives: people.filter(p => p.isAlternative).map(p => p.name),
      regulars: people.filter(p => !p.isAlternative).map(p => p.name),
    });
  }, [isAlternativeMode, people]);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const [sleepers, setSleepers] = useState<string[]>([]);
  const [rescued, setRescued] = useState<string[]>([]);
  const [sleepTimes, setSleepTimes] = useState<{ personId: string; time: string }[]>([]);
  // Rastreia quantos cochilos cada pessoa tirou: { personId: numero_cochilos }
  const [naps, setNaps] = useState<Record<string, number>>({});
  // Rastreia quando cada pessoa começou a dormir (timestamp)
  const [sleepStartTimes, setSleepStartTimes] = useState<Record<string, Date>>({});
  // Rastreia o tempo total dormindo em minutos
  const [totalSleepTime, setTotalSleepTime] = useState<Record<string, number>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [showHourlyAlert, setShowHourlyAlert] = useState(false);
  const [lastAlertHour, setLastAlertHour] = useState<number>(0);
  // Rastreia quando cada pessoa foi resgatada pela última vez (ou início da sessão)
  const [awakeStartTimes, setAwakeStartTimes] = useState<Record<string, Date>>({});
  const [awakeTimers, setAwakeTimers] = useState<Record<string, string>>({});
  const [sleepTimers, setSleepTimers] = useState<Record<string, string>>({});
  const [showAlternativeModal, setShowAlternativeModal] = useState(false);
  const [showDishToast, setShowDishToast] = useState(false);

  // Timer da sessão
  useEffect(() => {
    if (!sessionStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - sessionStartTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Alarme de hora em hora
  useEffect(() => {
    if (!sessionStartTime || showSummary) return;

    const checkInterval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - sessionStartTime.getTime();
      const currentHour = Math.floor(diff / (1000 * 60 * 60));
      
      // Se completou uma nova hora e não é a hora 0
      if (currentHour > lastAlertHour && currentHour > 0) {
        setLastAlertHour(currentHour);
        setShowHourlyAlert(true);
        
        // Toca o som de alerta
        playAlertSound();
        
        // Auto-fecha após 30 segundos se não interagir
        setTimeout(() => {
          setShowHourlyAlert(false);
        }, 30000);
      }
    }, 10000); // Verifica a cada 10 segundos

    return () => clearInterval(checkInterval);
  }, [sessionStartTime, lastAlertHour, showSummary]);

  // Atualiza contadores de resistência a cada segundo
  useEffect(() => {
    if (!sessionStarted || showSummary) return;

    const interval = setInterval(() => {
      const now = new Date();
      const newTimers: Record<string, string> = {};
      
      Object.entries(awakeStartTimes).forEach(([personId, startTime]) => {
        if (!sleepers.includes(personId)) {
          const diff = now.getTime() - startTime.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          newTimers[personId] = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
      });
      
      setAwakeTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStarted, awakeStartTimes, sleepers, showSummary]);

  // Atualiza contadores de tempo dormindo a cada segundo
  useEffect(() => {
    if (!sessionStarted || showSummary) return;

    const interval = setInterval(() => {
      const now = new Date();
      const newSleepTimers: Record<string, string> = {};
      
      Object.entries(sleepStartTimes).forEach(([personId, startTime]) => {
        if (sleepers.includes(personId)) {
          const diff = now.getTime() - startTime.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          newSleepTimers[personId] = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
      });
      
      setSleepTimers(newSleepTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStarted, sleepStartTimes, sleepers, showSummary]);

  const playAlertSound = () => {
    // Cria um contexto de áudio e toca um beep
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Frequência do som
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Toca 3 vezes
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 800;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.5);
    }, 600);
    
    setTimeout(() => {
      const osc3 = audioContext.createOscillator();
      const gain3 = audioContext.createGain();
      osc3.connect(gain3);
      gain3.connect(audioContext.destination);
      osc3.frequency.value = 800;
      osc3.type = 'sine';
      gain3.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc3.start(audioContext.currentTime);
      osc3.stop(audioContext.currentTime + 0.5);
    }, 1200);
  };

  const handleDismissAlert = () => {
    setShowHourlyAlert(false);
  };

  const handleToggleAlternativeMode = () => {
    if (isAlternativeMode) {
      // Se já está ativo, desativa direto
      setAlternativeMode(false);
    } else {
      // Se vai ativar, mostra modal engraçado
      setShowAlternativeModal(true);
    }
  };

  const handleConfirmAlternative = () => {
    console.log('✅ Ativando modo alternativo...');
    setAlternativeMode(true);
    setShowAlternativeModal(false);
    setShowDishToast(true);
    
    // Esconde o toast após 4 segundos
    setTimeout(() => {
      setShowDishToast(false);
    }, 4000);
    
    console.log('✅ Modo alternativo ativado!');
  };

  const handleCancelAlternative = () => {
    console.log('❌ Cancelado modo alternativo');
    setShowAlternativeModal(false);
  };

  const handleWarmUpPlayerSelect = (personId: string) => {
    setWarmUpPlayer(personId);
  };

  const handleConfirmWarmUp = () => {
    setWarmUpDone(true);
  };

  const handleWarmUpResult = (result: WarmUpResult) => {
    setWarmUpResult(result);
    setTimeout(() => setStep(2), 500);
  };

  const toggleParticipant = (personId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(personId) 
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const handleStartSession = () => {
    setSessionStarted(true);
    const startTime = new Date();
    setSessionStartTime(startTime);
    
    // Inicializa o tempo acordado para todos os participantes
    const initialAwakeTimes: Record<string, Date> = {};
    selectedParticipants.forEach(personId => {
      initialAwakeTimes[personId] = startTime;
    });
    setAwakeStartTimes(initialAwakeTimes);
  };

  const handleMarkAsleep = (personId: string) => {
    if (!sleepers.includes(personId)) {
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      setSleepers(prev => [...prev, personId]);
      setSleepTimes(prev => [...prev, { personId, time: timeString }]);
      
      // Registra quando começou a dormir
      setSleepStartTimes(prev => ({
        ...prev,
        [personId]: now
      }));
      
      // Remove o timer de resistência
      setAwakeTimers(prev => {
        const { [personId]: _, ...rest } = prev;
        return rest;
      });
      
      // Incrementa contador de cochilos
      setNaps(prev => ({
        ...prev,
        [personId]: (prev[personId] || 0) + 1
      }));
      // Remove do rescued se estava
      setRescued(prev => prev.filter(id => id !== personId));
    }
  };

  const handleRescue = (personId: string) => {
    const now = new Date();
    
    // Calcula tempo dormindo
    if (sleepStartTimes[personId]) {
      const sleepDuration = (now.getTime() - sleepStartTimes[personId].getTime()) / (1000 * 60); // em minutos
      
      setTotalSleepTime(prev => ({
        ...prev,
        [personId]: (prev[personId] || 0) + sleepDuration
      }));
      
      // Remove o timestamp de início do sono
      setSleepStartTimes(prev => {
        const { [personId]: _, ...rest } = prev;
        return rest;
      });
    }
    
    // Remove o timer de sono
    setSleepTimers(prev => {
      const { [personId]: _, ...rest } = prev;
      return rest;
    });
    
    // Reinicia o contador de resistência
    setAwakeStartTimes(prev => ({
      ...prev,
      [personId]: now
    }));
    
    setRescued(prev => [...prev, personId]);
    setSleepers(prev => prev.filter(id => id !== personId));
    
    // Após 3 segundos, remove o estado de resgatado
    setTimeout(() => {
      setRescued(prev => prev.filter(id => id !== personId));
    }, 3000);
  };

  const handleEndSession = async () => {
    // Calcula o tempo de quem ainda está dormindo
    const now = new Date();
    const updatedSleepTimes = { ...totalSleepTime };
    
    Object.entries(sleepStartTimes).forEach(([personId, startTime]) => {
      const sleepDuration = (now.getTime() - startTime.getTime()) / (1000 * 60); // em minutos
      updatedSleepTimes[personId] = (updatedSleepTimes[personId] || 0) + sleepDuration;
    });
    
    setTotalSleepTime(updatedSleepTimes);
    setShowSummary(true);

    // Salva a sessão e verifica conquistas
    const today = new Date().toISOString().split('T')[0];
    
    // Cria array de participantes centralizado
    const firstSleeperId = sleepTimes.length > 0 ? sleepTimes[0].personId : undefined;
    const participants = selectedParticipants.map(personId => ({
      personId,
      naps: naps[personId] || 0,
      totalSleepTime: updatedSleepTimes[personId] || 0,
      sleptFirst: personId === firstSleeperId,
      sleepTime: sleepTimes.find(st => st.personId === personId)?.time
    }));
    
    const newSession = addSession({
      dateISO: today,
      participantIds: selectedParticipants, // manter para compatibilidade
      participants, // NOVA estrutura centralizada
      movies: [],
      warmUp: warmUpPlayer && warmUpResult ? {
        playerPersonId: warmUpPlayer,
        result: warmUpResult,
      } : undefined,
      // Campos antigos - manter para compatibilidade
      sleepTimes: sleepTimes,
      firstSleeperPersonId: firstSleeperId,
      naps: naps,
      totalSleepTime: updatedSleepTimes,
    });

    // Salva entradas no mural da vergonha
    sleepTimes.forEach(({ personId, time }) => {
      addShameEntry({
        dateISO: today,
        personId,
        time,
      });
    });

    // IMPORTANTE: NÃO aguarda - deixa o fluxo natural
    // Os dados JÁ estão no localStorage, vamos ler direto de lá
    
    console.log('🔍 Verificando conquistas após sessão salva...');
    
    // Lê dados DIRETO DO LOCALSTORAGE - FONTE ÚNICA DA VERDADE
    const storedData = localStorage.getItem('lucasflix_data');
    if (!storedData) {
      console.error('❌ Nenhum dado no localStorage!');
      return;
    }
    
    const freshData = JSON.parse(storedData);
    const thiagoData = freshData.people?.find((p: any) => p.name === 'Thiago');
    console.log('🔍 Thiago do localStorage:', thiagoData?.stats);

    // Verifica conquistas para todos os participantes (AGORA os stats estão atualizados)
    const allAchievementsToUnlock: { personId: string, achievementId: string, sessionId: string }[] = [];
    const achievementsByPerson: { personId: string, achievements: Achievement[] }[] = [];
    
    selectedParticipants.forEach(personId => {
      const person = freshData.people?.find((p: any) => p.id === personId);
      console.log('🔍 Verificando', person?.name, '- Stats:', person?.stats);
      console.log('🔍 Conquistas já desbloqueadas:', person?.achievements.map((a: any) => a.achievementId));
      
      const newAchievements = checkAndUnlockNew(personId);
      console.log('🏆 Verificando conquistas para:', person?.name, 'Encontradas:', newAchievements.length, newAchievements.map(a => a.title));
      console.log('🏆 Detalhes das conquistas encontradas:', newAchievements.map(a => ({ id: a.id, title: a.title })));
      
      if (newAchievements.length > 0) {
        console.log('✅ Adicionando', newAchievements.length, 'conquistas de', person?.name, 'para processamento');
        achievementsByPerson.push({ personId, achievements: newAchievements });
        
        // Acumula para salvar depois
        newAchievements.forEach(achievement => {
          allAchievementsToUnlock.push({
            personId,
            achievementId: achievement.id,
            sessionId: newSession.id,
          });
        });
      }
    });

    // Salva todas as conquistas de uma vez
    if (allAchievementsToUnlock.length > 0) {
      console.log('💾 Salvando todas as conquistas:', allAchievementsToUnlock);
      unlockMultipleAchievements(allAchievementsToUnlock);
      
      // Pequeno delay para garantir que o localStorage foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('🎯 Total de achievements encontrados:', achievementsByPerson.length);
    console.log('🎯 Achievements por pessoa:', achievementsByPerson);

    // Agrupar conquistas por achievement ID
    const groupedAchievements = new Map<string, string[]>();
    achievementsByPerson.forEach(({ personId, achievements }) => {
      achievements.forEach(achievement => {
        if (!groupedAchievements.has(achievement.id)) {
          groupedAchievements.set(achievement.id, []);
        }
        groupedAchievements.get(achievement.id)!.push(personId);
      });
    });

    console.log('🗂️ Conquistas agrupadas:', Array.from(groupedAchievements.entries()));

    // Converter para array de AchievementWithPerson (agora com múltiplas pessoas)
    const allNewAchievements: AchievementWithPerson[] = [];
    groupedAchievements.forEach((personIds, achievementId) => {
      const achievement = achievementsByPerson
        .flatMap(p => p.achievements)
        .find(a => a.id === achievementId);
      
      if (achievement) {
        console.log('✅ Adicionando conquista para notificação:', achievement.title, 'Pessoas:', personIds);
        allNewAchievements.push({
          achievement,
          personIds
        });
      }
    });

    console.log('📢 Total de notificações a mostrar:', allNewAchievements.length);

    // Se houver conquistas, mostra a primeira e adiciona resto na fila
    if (allNewAchievements.length > 0) {
      console.log('🎊 Mostrando primeira conquista:', allNewAchievements[0].achievement.title);
      setCurrentAchievement(allNewAchievements[0]);
      setAchievementQueue(allNewAchievements.slice(1));
    } else {
      console.log('⚠️ Nenhuma conquista nova para mostrar');
    }
  };

  const handleConfirmEnd = () => {
    console.log('🏁 Finalizando e recarregando página...');
    
    // Força reload DIRETO da página - sem navegação React
    window.location.href = '/';
  };

  // Gerencia a fila de conquistas
  useEffect(() => {
    if (currentAchievement === null && achievementQueue.length > 0) {
      // Mostra próxima conquista da fila
      setCurrentAchievement(achievementQueue[0]);
      setAchievementQueue(prev => prev.slice(1));
    }
  }, [currentAchievement, achievementQueue]);

  // Calcula quantas flexões são necessárias baseado no número de cochilos
  const getPushUpsCount = (personId: string) => {
    const napCount = naps[personId] || 0;
    return napCount * 5; // 5, 10, 15, 20...
  };

  const getPerson = (id: string) => people.find(p => p.id === id);

  return (
    <div className="start-session">
      <AnimatePresence mode="wait">
        {/* Step 1: Aquecimento */}
        {step === 1 && !warmUpDone && (
          <motion.div
            key="warmup-select"
            className="session-step"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.6 }}
          >
            <div className="step-container">
              <motion.div 
                className="step-icon"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎮
              </motion.div>
              <h1 className="step-title">Partida de Pes</h1>
              <p className="step-subtitle">Quem vai jogar o aquecimento hoje?</p>

              <div className="players-grid">
                {people.filter(p => !p.isAlternative).map((person, index) => (
                  <motion.div
                    key={person.id}
                    className={`player-card ${warmUpPlayer === person.id ? 'selected' : ''}`}
                    onClick={() => handleWarmUpPlayerSelect(person.id)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="player-avatar-img">
                      <img src={getAvatar(person.name)} alt={person.name} />
                      {person.name.toLowerCase().includes('lucas') && (
                        <div className="feet-master-badge" title="Reconhecido pelo Pés">
                          👑
                        </div>
                      )}
                    </div>
                    <div className="player-name">
                      {person.name}
                      {person.name.toLowerCase().includes('lucas') && (
                        <span className="feet-title">Reconhecido pelo Pés</span>
                      )}
                    </div>
                    {warmUpPlayer === person.id && (
                      <motion.div 
                        className="check-mark"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        ✓
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {warmUpPlayer && (
                <motion.button
                  className="btn-primary"
                  onClick={handleConfirmWarmUp}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Confirmar Jogador
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 1.5: Resultado do Aquecimento */}
        {step === 1 && warmUpDone && !warmUpResult && (
          <motion.div
            key="warmup-result"
            className="session-step"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="step-container">
              <motion.div 
                className="step-icon"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🔥
              </motion.div>
              <h1 className="step-title">Aquecimento Completo!</h1>
              <p className="step-subtitle">Como foi o resultado de {getPerson(warmUpPlayer!)?.name}?</p>

              <div className="result-buttons">
                <motion.button
                  className="btn-result btn-win"
                  onClick={() => handleWarmUpResult('GANHOU')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="result-icon">🏆</span>
                  <span>Ganhou</span>
                </motion.button>
                <motion.button
                  className="btn-result btn-draw"
                  onClick={() => handleWarmUpResult('EMPATE')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="result-icon">🤝</span>
                  <span>Empate</span>
                </motion.button>
                <motion.button
                  className="btn-result btn-loss"
                  onClick={() => handleWarmUpResult('PERDEU')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="result-icon">😢</span>
                  <span>Perdeu</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Selecionar Participantes */}
        {step === 2 && !sessionStarted && (
          <motion.div
            key="select-participants"
            className="session-step"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.6 }}
          >
            <div className="step-container">
              <motion.div 
                className="step-icon"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                🎬
              </motion.div>
              <h1 className="step-title">Quem vai assistir?</h1>
              <p className="step-subtitle">Selecione os participantes da sessão</p>

              {/* Toast Engraçado Modo Louça */}
              <AnimatePresence>
                {showDishToast && (
                  <motion.div
                    className="dish-toast"
                    initial={{ opacity: 0, y: -50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.8 }}
                  >
                    <span className="dish-icon">🍽️</span>
                    <span className="dish-text">Modo Louça Ativado!</span>
                    <span className="dish-subtext">Prepara a pia que tá vindo coisa! 🧙</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Emojis de Louça Flutuando */}
              {isAlternativeMode && (
                <div className="floating-dishes">
                  {['🍽️', '🥘', '🍴', '🥄', '🥣', '🍽️', '🥘', '🍴'].map((emoji, i) => (
                    <motion.div
                      key={i}
                      className="floating-dish"
                      style={{
                        left: `${10 + i * 12}%`,
                        animationDelay: `${i * 0.8}s`,
                      }}
                      initial={{ y: 100, opacity: 0, rotate: 0 }}
                      animate={{ 
                        y: -1000, 
                        opacity: [0, 1, 1, 0],
                        rotate: 360,
                      }}
                      transition={{ 
                        duration: 8, 
                        repeat: Infinity,
                        delay: i * 0.8,
                        ease: "linear"
                      }}
                    >
                      {emoji}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Badge Flutuante quando Alternativo está ativo */}
              {isAlternativeMode && (
                <motion.div
                  className="alternative-badge"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  🍽️ Louça Mode
                </motion.div>
              )}
              {/* Modal DRAMÁTICO - Invasão Doméstica */}
              <AnimatePresence>
                {showAlternativeModal && (
                  <motion.div
                    className="hourly-alert-overlay witch-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="hourly-alert-modal witch-modal"
                      initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                      animate={{ 
                        scale: [0.5, 1.1, 0.95, 1.05, 1],
                        opacity: 1,
                        rotate: [10, -5, 5, -2, 0],
                        y: [0, -10, 5, -5, 0]
                      }}
                      exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
                      transition={{ duration: 0.6, type: "spring" }}
                    >
                      {/* Elementos voando - Vassoura e Louça */}
                      <motion.div 
                        className="flying-broom broom-1"
                        animate={{ 
                          x: [-100, window.innerWidth + 100],
                          y: [0, -30, 0, -20, 0],
                          rotate: [0, 5, -5, 3, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        🧹
                      </motion.div>
                      <motion.div 
                        className="flying-broom broom-2"
                        animate={{ 
                          x: [window.innerWidth + 100, -100],
                          y: [0, -40, 0, -25, 0],
                          rotate: [180, 185, 175, 183, 180]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 1 }}
                      >
                        🍽️
                      </motion.div>
                      <motion.div 
                        className="flying-broom broom-1"
                        animate={{ 
                          x: [-150, window.innerWidth + 150],
                          y: [20, -10, 20, 0, 20],
                          rotate: [0, -5, 5, -3, 0]
                        }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "linear", delay: 1.5 }}
                      >
                        🧽
                      </motion.div>

                      {/* Ícone de alerta com tremor */}
                      <motion.div 
                        className="alert-icon witch-icon"
                        animate={{ 
                          rotate: [-10, 10, -10, 10, 0],
                          scale: [1, 1.2, 0.9, 1.1, 1]
                        }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                      >
                        👩‍🍳
                      </motion.div>
                      
                      <motion.h2 
                        className="alert-title witch-title"
                        animate={{ 
                          x: [-2, 2, -2, 2, 0],
                        }}
                        transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 2 }}
                      >
                        🚨 INVASÃO DOMÉSTICA DETECTADA 🚨
                      </motion.h2>
                      
                      <motion.p 
                        className="alert-message witch-message"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        ⚠️ <strong>ATENÇÃO!</strong> Você está prestes a liberar o <strong>MODO LOUÇA</strong>!
                      </motion.p>
                      
                      <motion.div 
                        className="witch-warnings"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="witch-warning-item">🍽️ Prepare a pia - vem louça a caminho</div>
                        <div className="witch-warning-item">🧹 Vassoura em modo automático</div>
                        <div className="witch-warning-item">❄️ "Tá frio" a cada 5 minutos</div>
                        <div className="witch-warning-item">😴 Cochilo surpresa durante ação</div>
                        <div className="witch-warning-item">📱 Modo "só olhando o celular"</div>
                        <div className="witch-warning-item">🛋️ Sofá vira cama instantânea</div>
                      </motion.div>

                      <motion.p 
                        className="witch-final-warning"
                        animate={{ 
                          scale: [1, 1.05, 1],
                          color: ["#ff6b6b", "#ff3838", "#ff6b6b"]
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        🧽 Tem certeza? A louça não vai se lavar sozinha! 🧽
                      </motion.p>

                      <div className="alternative-modal-buttons">
                        <motion.button 
                          className="btn-cancel witch-btn-cancel" 
                          onClick={handleCancelAlternative}
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          🏃‍♂️ CANCELAR MISSÃO!
                        </motion.button>
                        <motion.button 
                          className="btn-confirm-alternative witch-btn-confirm" 
                          onClick={handleConfirmAlternative}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          animate={{
                            boxShadow: [
                              "0 0 20px rgba(255, 105, 180, 0.5)",
                              "0 0 40px rgba(255, 105, 180, 0.8)",
                              "0 0 20px rgba(255, 105, 180, 0.5)"
                            ]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          🍽️ ATIVAR MODO LOUÇA!
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div 
                className={`alternative-mode-toggle ${isAlternativeMode ? 'active' : ''}`}
                onClick={handleToggleAlternativeMode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="toggle-icon">{isAlternativeMode ? '🔓' : '🔒'}</span>
                <span className="toggle-text">
                  {isAlternativeMode ? 'Voltar ao LucasFlix Raiz' : 'Desbloquear LucasFlix Alternativo'}
                </span>
              </motion.div>

              <div className={`participants-grid ${isAlternativeMode ? 'alternative-mode-active' : ''}`}>
                {people.filter(p => isAlternativeMode || !p.isAlternative).map((person, index) => (
                  <motion.div
                    key={person.id}
                    className={`participant-card ${selectedParticipants.includes(person.id) ? 'selected' : ''}`}
                    onClick={() => toggleParticipant(person.id)}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="participant-avatar-img">
                      <img src={getAvatar(person.name)} alt={person.name} />
                    </div>
                    <div className="participant-name">{person.name}</div>
                    {selectedParticipants.includes(person.id) && (
                      <motion.div 
                        className="check-icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        ✓
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {selectedParticipants.length > 0 && (
                <motion.button
                  className="btn-start"
                  onClick={handleStartSession}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="btn-start-icon">🎬</span>
                  Iniciar LucasFlix
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 3: Sessão em Andamento */}
        {sessionStarted && !showSummary && (
          <motion.div
            key="session-active"
            className="session-step session-active"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Alerta de Hora em Hora */}
            <AnimatePresence>
              {showHourlyAlert && (
                <motion.div
                  className="hourly-alert-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="hourly-alert-modal"
                    initial={{ scale: 0.8, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 50 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <motion.div
                      className="alert-icon"
                      animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      ⏰
                    </motion.div>
                    <h2 className="alert-title">Check-in do Grupo!</h2>
                    <p className="alert-message">
                      Se passou 1 hora! Todo mundo ainda está acordado? 😊
                    </p>
                    <div className="alert-stats">
                      <div className="alert-stat">
                        <span className="stat-label">Tempo de Sessão:</span>
                        <span className="stat-value">{elapsedTime}</span>
                      </div>
                      <div className="alert-stat">
                        <span className="stat-label">Acordados:</span>
                        <span className="stat-value awake-count">
                          {selectedParticipants.length - sleepers.length}/{selectedParticipants.length}
                        </span>
                      </div>
                    </div>
                    <motion.button
                      className="btn-alert-confirm"
                      onClick={handleDismissAlert}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ✅ Todos Acordados!
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="session-header">
              <motion.h1 
                className="session-title"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎬 Sessão em Andamento
              </motion.h1>
              <div className="session-badges">
                <Badge text={`${selectedParticipants.length} Participantes`} variant="success" />
                <Badge text={`⏱️ ${elapsedTime}`} variant="info" />
              </div>
            </div>

            <div className="active-participants">
              {(() => {
                // Calcula o recordista (quem está há mais tempo acordado)
                const awakeTimes = selectedParticipants
                  .filter(id => !sleepers.includes(id) && awakeTimers[id])
                  .map(id => ({
                    personId: id,
                    time: awakeTimers[id],
                    milliseconds: awakeStartTimes[id] ? new Date().getTime() - awakeStartTimes[id].getTime() : 0
                  }))
                  .sort((a, b) => b.milliseconds - a.milliseconds);
                
                const recordHolder = awakeTimes.length > 0 ? awakeTimes[0].personId : null;

                return selectedParticipants.map((personId, index) => {
                const person = getPerson(personId);
                const isAsleep = sleepers.includes(personId);
                const isRescued = rescued.includes(personId);
                const napCount = naps[personId] || 0;
                const pushUps = getPushUpsCount(personId);
                const awakeTime = awakeTimers[personId];
                const sleepTime = sleepTimers[personId];
                const isRecordHolder = personId === recordHolder;

                return (
                  <motion.div
                    key={personId}
                    className={`active-participant ${isAsleep ? 'asleep' : ''} ${isRescued ? 'rescued' : ''} ${isRecordHolder ? 'record-holder' : ''}`}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 }}
                  >
                    <div className="participant-info">
                      <div className="participant-avatar-large-img">
                        <img src={getAvatar(person?.name || '')} alt={person?.name} />
                        {isAsleep && <div className="sleep-overlay">😴</div>}
                        {isRescued && <div className="rescue-overlay">💪</div>}
                        {isRecordHolder && !isAsleep && <div className="record-overlay">🏆</div>}
                      </div>
                      <div className="participant-details">
                        <h3>{person?.name}</h3>
                        <div className="badges-row">
                          {isAsleep && (
                            <>
                              <Badge text="Dormindo..." variant="danger" />
                              {sleepTime && (
                                <Badge text={`😴 ${sleepTime} dormindo`} variant="danger" />
                              )}
                            </>
                          )}
                          {isRescued && (
                            <Badge text="Resgatado!" variant="success" />
                          )}
                          {napCount > 0 && (
                            <Badge text={`${napCount} cochilo${napCount > 1 ? 's' : ''} 😅`} variant="warning" />
                          )}
                          {awakeTime && !isAsleep && (
                            <Badge text={`⏱️ ${awakeTime} acordado`} variant="info" />
                          )}
                          {isRecordHolder && !isAsleep && (
                            <Badge text="🏆 Recordista!" variant="success" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="participant-actions">
                      {!isAsleep && (
                        <motion.button
                          className="btn-action btn-sleep"
                          onClick={() => handleMarkAsleep(personId)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          😴 Dormiu
                        </motion.button>
                      )}
                      {isAsleep && (
                        <motion.button
                          className="btn-action btn-rescue"
                          onClick={() => handleRescue(personId)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          💪 Resgatar ({pushUps} flexões)
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              });
            })()}
            </div>

            <motion.button
              className="btn-end-session"
              onClick={handleEndSession}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Finalizar Sessão
            </motion.button>
          </motion.div>
        )}

        {/* Resumo da Sessão - Reis e Rankings */}
        {showSummary && (() => {
          // Função para formatar o tempo de sono
          const formatSleepTime = (minutes: number) => {
            if (minutes < 1) {
              const seconds = Math.round(minutes * 60);
              return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
            }
            const mins = Math.round(minutes);
            return `${mins} minuto${mins !== 1 ? 's' : ''}`;
          };

          // Calcula o rei do sono baseado no TEMPO total dormindo
          const sleepTimeEntries = Object.entries(totalSleepTime).filter(([_, time]) => time > 0);
          const sortedByTime = sleepTimeEntries.sort((a, b) => b[1] - a[1]);
          const sleepKing = sortedByTime.length > 0 ? sortedByTime[0] : null;
          
          // Dados para o gráfico de cochilos (quantidade)
          const napEntries = Object.entries(naps).filter(([_, count]) => count > 0);
          const sortedByNaps = napEntries.sort((a, b) => b[1] - a[1]);
          const napKing = sortedByNaps.length > 0 ? sortedByNaps[0] : null;
          
          const napChartData = sortedByNaps.map(([personId, count]) => ({
            name: getPerson(personId)?.name.split(' ')[0] || 'Desconhecido',
            cochilos: count,
          }));
          
          // Dados para o gráfico de tempo dormindo
          const timeChartData = sortedByTime.map(([personId, time]) => ({
            name: getPerson(personId)?.name.split(' ')[0] || 'Desconhecido',
            minutos: Math.round(time),
          }));
          
          // Calcula os sobreviventes (quem não dormiu)
          const survivors = selectedParticipants.filter(personId => !naps[personId] || naps[personId] === 0);

          return (
            <motion.div
              key="session-summary"
              className="session-step session-summary"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="summary-container">
                <motion.div 
                  className="summary-icon"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🏆
                </motion.div>
                
                <h1 className="summary-title">Resumo da Sessão</h1>
                
                <div className="summary-sections">
                  {/* Rei do Sono - Quem dormiu mais TEMPO */}
                  {sleepKing && (
                    <motion.div
                      className="sleep-king"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    >
                      <div className="sleep-king-crown">👑</div>
                      <div className="sleep-king-avatar-img">
                        <img src={getAvatar(getPerson(sleepKing[0])?.name || '')} alt="Rei do Sono" />
                      </div>
                      <h2 className="sleep-king-title">Rei do Sono</h2>
                      <h3 className="sleep-king-name">{getPerson(sleepKing[0])?.name}</h3>
                      <div className="sleep-king-stats">
                        <Badge text={`${formatSleepTime(sleepKing[1])} dormindo 😴`} variant="danger" />
                        <Badge text={`${naps[sleepKing[0]] || 0} cochilo${(naps[sleepKing[0]] || 0) > 1 ? 's' : ''}`} variant="warning" />
                      </div>
                    </motion.div>
                  )}

                  {/* Rei do Cochilo - Quem mais COCHILOU */}
                  {napKing && napKing !== sleepKing && (
                    <motion.div
                      className="sleep-king nap-king"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    >
                      <div className="sleep-king-crown">😴</div>
                      <div className="sleep-king-avatar-img">
                        <img src={getAvatar(getPerson(napKing[0])?.name || '')} alt="Rei do Cochilo" />
                      </div>
                      <h2 className="sleep-king-title">Rei do Cochilo</h2>
                      <h3 className="sleep-king-name">{getPerson(napKing[0])?.name}</h3>
                      <div className="sleep-king-stats">
                        <Badge text={`${napKing[1]} cochilo${napKing[1] > 1 ? 's' : ''} 😅`} variant="warning" />
                        <Badge text={`${formatSleepTime(totalSleepTime[napKing[0]] || 0)} dormindo`} variant="info" />
                      </div>
                    </motion.div>
                  )}

                  {/* Dorminhocos - Todos que dormiram */}
                  {sortedByTime.length > 0 && (
                    <motion.div
                      className="survivors dorminhocos"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    >
                      <div className="survivors-trophy">💤</div>
                      <h2 className="survivors-title">Dorminhocos</h2>
                      <p className="survivors-subtitle">Ranking dos que dormiram</p>
                      <div className="survivors-grid">
                        {sortedByTime.map(([personId, time], index) => (
                          <motion.div
                            key={personId}
                            className="survivor-card dorminhoco-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                          >
                            <div className="survivor-avatar-img">
                              <img src={getAvatar(getPerson(personId)?.name || '')} alt={getPerson(personId)?.name} />
                            </div>
                            <div className="survivor-name">{getPerson(personId)?.name.split(' ')[0]}</div>
                            <div className="dorminhoco-stats">
                              <Badge text={formatSleepTime(time)} variant="danger" size="small" />
                              <Badge text={`${naps[personId] || 0} 😴`} variant="warning" size="small" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Sobreviventes */}
                  {survivors.length > 0 && (
                    <motion.div
                      className="survivors"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                    >
                      <div className="survivors-trophy">🎉</div>
                      <h2 className="survivors-title">Sobreviventes</h2>
                      <p className="survivors-subtitle">Ficaram acordados!</p>
                      <div className="survivors-grid">
                        {survivors.map((personId, index) => (
                          <motion.div
                            key={personId}
                            className="survivor-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                          >
                            <div className="survivor-avatar-img">
                              <img src={getAvatar(getPerson(personId)?.name || '')} alt={getPerson(personId)?.name} />
                            </div>
                            <div className="survivor-name">{getPerson(personId)?.name.split(' ')[0]}</div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Gráficos */}
                {napChartData.length > 0 && (
                  <div className="charts-container">
                    {/* Gráfico de Quantidade de Cochilos */}
                    <motion.div
                      className="sleep-chart"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <h3 className="chart-title">Quantidade de Cochilos</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={napChartData}>
                          <XAxis dataKey="name" stroke="#999" />
                          <YAxis stroke="#999" />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(20, 20, 20, 0.95)',
                              border: '1px solid rgba(229, 9, 20, 0.3)',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar dataKey="cochilos" fill="#e50914" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </motion.div>

                    {/* Gráfico de Tempo Dormindo */}
                    <motion.div
                      className="sleep-chart"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      <h3 className="chart-title">Tempo Dormindo (minutos)</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={timeChartData}>
                          <XAxis dataKey="name" stroke="#999" />
                          <YAxis stroke="#999" />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(20, 20, 20, 0.95)',
                              border: '1px solid rgba(229, 9, 20, 0.3)',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar dataKey="minutos" fill="#ff6b6b" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </div>
                )}

                {/* Sessão Perfeita (caso ninguém tenha dormido) */}
                {napChartData.length === 0 && (
                  <motion.div
                    className="no-sleepers"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <div className="no-sleepers-icon">🎉</div>
                    <h2>Sessão Perfeita!</h2>
                    <p>Ninguém dormiu durante a sessão!</p>
                  </motion.div>
                )}

                <motion.button
                  className="btn-confirm-end"
                  onClick={handleConfirmEnd}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Concluir e Voltar ao Início
                </motion.button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Achievement Notifications */}
      <AchievementNotification 
        achievement={currentAchievement?.achievement || null}
        personNames={currentAchievement ? currentAchievement.personIds.map(id => getPerson(id)?.name || '').filter(n => n) : undefined}
        onClose={() => setCurrentAchievement(null)}
      />
    </div>
  );
};

