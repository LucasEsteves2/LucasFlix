import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useData } from '../context/DataContext';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

type Step = 'warmup' | 'participants' | 'lobby';

// Animated Zzz Component
const FloatingZzz = ({ delay = 0 }: { delay?: number }) => {
  const translateY = new Animated.Value(0);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(translateY, {
          toValue: -40,
          duration: 2000,
          delay,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay]);

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        fontSize: 20,
        color: '#6C7AE0',
        fontWeight: 'bold',
        opacity,
        transform: [{ translateY }],
      }}
    >
      Z
    </Animated.Text>
  );
};

export default function StartSessionScreen({ navigation, route }: any) {
  const { people, activeSession, saveActiveSession, updateActiveSession, clearActiveSession, finalizeActiveSession } = useData();
  const continueSession = route?.params?.continueSession;
  
  // Estado do fluxo
  const [step, setStep] = useState<Step>('warmup');
  const [isAlternativeMode, setIsAlternativeMode] = useState(false);
  const [showAlternativeModal, setShowAlternativeModal] = useState(false);
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Warmup/PES
  const [warmupPlayer, setWarmupPlayer] = useState('');
  const [warmupResult, setWarmupResult] = useState<'GANHOU' | 'PERDEU' | 'EMPATE' | ''>('');
  
  // Participantes
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  
  // Lobby - Sessão Ativa
  const [sessionStarted, setSessionStarted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sleepers, setSleepers] = useState<string[]>([]);
  const [rescued, setRescued] = useState<string[]>([]);
  const [naps, setNaps] = useState<Record<string, number>>({});
  const [sleepStartTimes, setSleepStartTimes] = useState<Record<string, Date>>({});
  const [awakeStartTimes, setAwakeStartTimes] = useState<Record<string, Date>>({});
  const [totalSleepTime, setTotalSleepTime] = useState<Record<string, number>>({});
  
  // Resumo final
  const [showSummary, setShowSummary] = useState(false);

  const visiblePeople = people.filter(p => 
    p.isVisible && (isAlternativeMode || !p.isAlternative)
  );

  // Carregar sessão ativa ao continuar
  useEffect(() => {
    if (continueSession && activeSession) {
      setStep(activeSession.step || 'warmup');
      setIsAlternativeMode(activeSession.isAlternativeMode || false);
      setWarmupPlayer(activeSession.warmupPlayer || '');
      setWarmupResult(activeSession.warmupResult || '');
      setSelectedParticipants(activeSession.selectedParticipants || []);
      setSessionStarted(activeSession.sessionStarted || false);
      setElapsedSeconds(activeSession.elapsedSeconds || 0);
      setSleepers(activeSession.sleepers || []);
      setRescued(activeSession.rescued || []);
      setNaps(activeSession.naps || {});
      
      // Restaurar timestamps
      if (activeSession.sleepStartTimes) {
        const restored: Record<string, Date> = {};
        Object.entries(activeSession.sleepStartTimes).forEach(([id, timestamp]: [string, any]) => {
          restored[id] = new Date(timestamp);
        });
        setSleepStartTimes(restored);
      }
      
      if (activeSession.awakeStartTimes) {
        const restored: Record<string, Date> = {};
        Object.entries(activeSession.awakeStartTimes).forEach(([id, timestamp]: [string, any]) => {
          restored[id] = new Date(timestamp);
        });
        setAwakeStartTimes(restored);
      }
      
      setTotalSleepTime(activeSession.totalSleepTime || {});
    }
  }, [continueSession, activeSession]);

  // Animação de entrada
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  // Timer da sessão
  useEffect(() => {
    if (sessionStarted) {
      const timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [sessionStarted]);

  // Atualizar activeSession quando elapsedSeconds mudar (a cada 5 segundos para não sobrecarregar)
  useEffect(() => {
    if (sessionStarted && elapsedSeconds > 0 && elapsedSeconds % 5 === 0) {
      updateActiveSession({ elapsedSeconds });
    }
  }, [elapsedSeconds, sessionStarted]);

  // Inicializar timers de todos os participantes
  useEffect(() => {
    if (sessionStarted) {
      const now = new Date();
      const initialTimes: Record<string, Date> = {};
      selectedParticipants.forEach(id => {
        initialTimes[id] = now;
      });
      setAwakeStartTimes(initialTimes);
    }
  }, [sessionStarted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getPersonAwakeTime = (personId: string) => {
    if (!awakeStartTimes[personId]) return '00:00';
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - awakeStartTimes[personId].getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getPersonSleepTime = (personId: string) => {
    if (!sleepStartTimes[personId]) return '00:00';
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - sleepStartTimes[personId].getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // STEP 1: Warmup/PES
  const handleConfirmWarmup = () => {
    if (!warmupPlayer) {
      Alert.alert('Atenção', 'Selecione quem vai jogar o aquecimento');
      return;
    }
    if (!warmupResult) {
      Alert.alert('Atenção', 'Selecione o resultado da partida');
      return;
    }
    setStep('participants');
  };

  // STEP 2: Participantes
  const toggleParticipant = (personId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const handleToggleAlternativeMode = () => {
    if (isAlternativeMode) {
      setIsAlternativeMode(false);
    } else {
      setShowAlternativeModal(true);
    }
  };

  const handleConfirmAlternative = () => {
    setIsAlternativeMode(true);
    setShowAlternativeModal(false);
  };

  const handleStartSession = () => {
    if (selectedParticipants.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um participante');
      return;
    }
    setStep('lobby');
    setSessionStarted(true);
    
    // Salvar sessão ativa
    const sessionData = {
      step: 'lobby',
      isAlternativeMode,
      warmupPlayer,
      warmupResult,
      selectedParticipants,
      sessionStarted: true,
      elapsedSeconds: 0,
      sleepers: [],
      rescued: [],
      naps: {},
      sleepStartTimes: {},
      awakeStartTimes: {},
      totalSleepTime: {},
    };
    saveActiveSession(sessionData);
  };

  // STEP 3: Lobby - Sleep Tracking
  const handleMarkAsleep = (personId: string) => {
    const now = new Date();
    const newSleepers = [...sleepers, personId];
    const newSleepStartTimes = { ...sleepStartTimes, [personId]: now };
    const newNaps = { ...naps, [personId]: (naps[personId] || 0) + 1 };
    const newAwakeStartTimes = { ...awakeStartTimes };
    delete newAwakeStartTimes[personId];
    
    setSleepers(newSleepers);
    setSleepStartTimes(newSleepStartTimes);
    setNaps(newNaps);
    setAwakeStartTimes(newAwakeStartTimes);
    
    // Atualizar activeSession
    updateActiveSession({
      sleepers: newSleepers,
      sleepStartTimes: Object.fromEntries(
        Object.entries(newSleepStartTimes).map(([id, date]) => [id, date.toISOString()])
      ),
      naps: newNaps,
      awakeStartTimes: Object.fromEntries(
        Object.entries(newAwakeStartTimes).map(([id, date]) => [id, date.toISOString()])
      ),
    });
  };

  const handleRescue = (personId: string) => {
    const now = new Date();
    let newTotalSleepTime = { ...totalSleepTime };
    
    if (sleepStartTimes[personId]) {
      const sleepDuration = (now.getTime() - sleepStartTimes[personId].getTime()) / (1000 * 60);
      newTotalSleepTime = { 
        ...newTotalSleepTime, 
        [personId]: (newTotalSleepTime[personId] || 0) + sleepDuration 
      };
    }
    
    const newAwakeStartTimes = { ...awakeStartTimes, [personId]: now };
    const newRescued = [...rescued, personId];
    const newSleepers = sleepers.filter(id => id !== personId);
    const newSleepStartTimes = { ...sleepStartTimes };
    delete newSleepStartTimes[personId];
    
    setTotalSleepTime(newTotalSleepTime);
    setAwakeStartTimes(newAwakeStartTimes);
    setRescued(newRescued);
    setSleepers(newSleepers);
    setSleepStartTimes(newSleepStartTimes);
    
    // Atualizar activeSession
    updateActiveSession({
      totalSleepTime: newTotalSleepTime,
      awakeStartTimes: Object.fromEntries(
        Object.entries(newAwakeStartTimes).map(([id, date]) => [id, date.toISOString()])
      ),
      rescued: newRescued,
      sleepers: newSleepers,
      sleepStartTimes: Object.fromEntries(
        Object.entries(newSleepStartTimes).map(([id, date]) => [id, date.toISOString()])
      ),
    });
  };



  const finishSession = async () => {
    setSessionStarted(false);
    setShowSummary(true);
  };

  const saveSession = async () => {
    const dateISO = new Date().toISOString().split('T')[0];
    const sleepTimesArray = Object.entries(sleepStartTimes).map(([personId, time]) => ({
      personId,
      time: `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`,
    }));
    
    const firstSleeper = sleepTimesArray.length > 0 ? sleepTimesArray[0].personId : undefined;

    const session = {
      dateISO,
      participantIds: selectedParticipants,
      participants: selectedParticipants.map(personId => ({
        personId,
        naps: naps[personId] || 0,
        totalSleepTime: totalSleepTime[personId] || 0,
        sleptFirst: firstSleeper === personId,
      })),
      movies: [],
      sleepTimes: sleepTimesArray,
      firstSleeperPersonId: firstSleeper,
      warmUp: warmupPlayer && warmupResult ? {
        playerPersonId: warmupPlayer,
        result: warmupResult,
      } : undefined,
    };

    try {
      await finalizeActiveSession(session);
      Alert.alert('Sucesso!', 'Sessão salva com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar sessão');
    }
  };

  // Step Indicator Component
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[styles.stepDot, step === 'warmup' && styles.stepDotActive]} />
      <View style={[styles.stepDot, step === 'participants' && styles.stepDotActive]} />
      <View style={[styles.stepDot, step === 'lobby' && styles.stepDotActive]} />
    </View>
  );

  // STEP 1 RENDER: Warmup/PES
  const renderWarmupStep = () => (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <LinearGradient
          colors={['rgba(108, 122, 224, 0.2)', 'rgba(229, 9, 20, 0.1)', 'rgba(0, 0, 0, 0)']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.mainTitle}>Nova Sessão</Text>
          <Text style={styles.subtitle}>Preparando o Aquecimento</Text>
        </LinearGradient>

        <View style={styles.cardContainer}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
            style={styles.modernCard}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>🎮</Text>
              </View>
              <View>
                <Text style={styles.sectionTitleText}>Aquecimento / PES</Text>
                <Text style={styles.sectionSubtext}>Quem vai dominar?</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.label}>Selecione o Jogador</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.avatarScroll}
              contentContainerStyle={styles.avatarScrollContent}
            >
              {visiblePeople.map((person, index) => (
                <TouchableOpacity
                  key={person.id}
                  style={[
                    styles.avatarOption,
                    warmupPlayer === person.id && styles.avatarOptionSelected
                  ]}
                  onPress={() => setWarmupPlayer(person.id)}
                >
                  {warmupPlayer === person.id && (
                    <LinearGradient
                      colors={['#E50914', '#6C7AE0']}
                      style={styles.avatarGlow}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  )}
                  <Avatar name={person.name} size={70} />
                  <Text style={[
                    styles.avatarName,
                    warmupPlayer === person.id && styles.avatarNameSelected
                  ]}>
                    {person.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Resultado da Partida</Text>
            <View style={styles.resultButtons}>
              <TouchableOpacity
                style={[
                  styles.resultButton,
                  warmupResult === 'GANHOU' && styles.resultButtonWin
                ]}
                onPress={() => setWarmupResult('GANHOU')}
              >
                <LinearGradient
                  colors={
                    warmupResult === 'GANHOU'
                      ? ['#22C55E', '#16A34A']
                      : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                  }
                  style={styles.resultButtonGradient}
                >
                  <Text style={styles.resultButtonIcon}>🏆</Text>
                  <Text style={[
                    styles.resultButtonText,
                    warmupResult === 'GANHOU' && styles.resultButtonTextActive
                  ]}>
                    GANHOU
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.resultButton,
                  warmupResult === 'PERDEU' && styles.resultButtonLose
                ]}
                onPress={() => setWarmupResult('PERDEU')}
              >
                <LinearGradient
                  colors={
                    warmupResult === 'PERDEU'
                      ? ['#EF4444', '#DC2626']
                      : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                  }
                  style={styles.resultButtonGradient}
                >
                  <Text style={styles.resultButtonIcon}>💔</Text>
                  <Text style={[
                    styles.resultButtonText,
                    warmupResult === 'PERDEU' && styles.resultButtonTextActive
                  ]}>
                    PERDEU
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.resultButton,
                  warmupResult === 'EMPATE' && styles.resultButtonDraw
                ]}
                onPress={() => setWarmupResult('EMPATE')}
              >
                <LinearGradient
                  colors={
                    warmupResult === 'EMPATE'
                      ? ['#F59E0B', '#D97706']
                      : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                  }
                  style={styles.resultButtonGradient}
                >
                  <Text style={styles.resultButtonIcon}>🤝</Text>
                  <Text style={[
                    styles.resultButtonText,
                    warmupResult === 'EMPATE' && styles.resultButtonTextActive
                  ]}>
                    EMPATE
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <TouchableOpacity onPress={handleConfirmWarmup} activeOpacity={0.8}>
          <LinearGradient
            colors={['#E50914', '#B00710', '#8B0000']}
            style={styles.continueButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.continueButtonText}>Continuar para Participantes</Text>
            <Text style={styles.continueButtonIcon}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );

  // STEP 2 RENDER: Participants
  const renderParticipantsStep = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card>
        <Text style={styles.stepTitle}>Selecione os Participantes</Text>

        <View style={styles.alternativeModeContainer}>
          <TouchableOpacity
            style={[
              styles.alternativeModeButton,
              isAlternativeMode && styles.alternativeModeButtonActive
            ]}
            onPress={handleToggleAlternativeMode}
          >
            <Text style={styles.alternativeModeText}>
              {isAlternativeMode ? '🔓 Modo Alternativo Ativo' : '🔒 Modo Normal'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.selectedCount}>
          Selecionados: {selectedParticipants.length}
        </Text>

        <View style={styles.participantsGrid}>
          {visiblePeople.map(person => (
            <TouchableOpacity
              key={person.id}
              style={[
                styles.participantCard,
                selectedParticipants.includes(person.id) && styles.participantCardSelected
              ]}
              onPress={() => toggleParticipant(person.id)}
            >
              <Avatar name={person.name} size={50} />
              <Text style={styles.participantName}>{person.name}</Text>
              {selectedParticipants.includes(person.id) && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setStep('warmup')}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleStartSession} style={styles.flexButton}>
            <LinearGradient
              colors={['#E50914', '#8B0000']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.gradientButtonText}>Iniciar Sessão</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Alternative Mode Confirmation Modal */}
      <Modal
        visible={showAlternativeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAlternativeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Modo Alternativo</Text>
            <Text style={styles.modalText}>
              Você está prestes a ativar o modo alternativo. Isso irá exibir participantes especiais.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowAlternativeModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleConfirmAlternative}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );

  // STEP 3 RENDER: Lobby
  const renderLobbyStep = () => {
    // Calculate record holder (most naps)
    const maxNaps = Math.max(...Object.values(naps), 0);
    const recordHolders = maxNaps > 0 
      ? Object.keys(naps).filter(id => naps[id] === maxNaps)
      : [];

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Card>
          <Text style={styles.stepTitle}>Sessão em Andamento</Text>
          
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Tempo de Sessão</Text>
            <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
          </View>

          <View style={styles.badgesRow}>
            <Badge label="Participantes" value={selectedParticipants.length} />
            <Badge label="Dorminhocos" value={sleepers.length} />
          </View>

          <Text style={styles.sectionTitle}>Participantes</Text>
          <View style={styles.participantsLobbyGrid}>
            {selectedParticipants.map(personId => {
              const person = people.find(p => p.id === personId);
              if (!person) return null;

              const isAsleep = sleepers.includes(personId);
              const isRecordHolder = recordHolders.includes(personId);
              const napCount = naps[personId] || 0;

              return (
                <View key={personId} style={styles.lobbyCard}>
                  {isAsleep && (
                    <View style={styles.zzzContainer}>
                      <FloatingZzz delay={0} />
                      <FloatingZzz delay={400} />
                      <FloatingZzz delay={800} />
                    </View>
                  )}
                  <View style={styles.lobbyCardHeader}>
                    <Avatar name={person.name} size={50} />
                    <View style={styles.lobbyCardInfo}>
                      <Text style={styles.lobbyCardName}>
                        {person.name} {isRecordHolder && '🏆'} {isAsleep && '😴'}
                      </Text>
                      <Text style={styles.lobbyCardTimer}>
                        {isAsleep 
                          ? `💤 ${getPersonSleepTime(personId)}`
                          : `⏰ ${getPersonAwakeTime(personId)}`
                        }
                      </Text>
                      {napCount > 0 && (
                        <Text style={styles.napCounter}>{napCount} cochilos</Text>
                      )}
                    </View>
                  </View>

                  {isAsleep ? (
                    <TouchableOpacity
                      style={styles.rescueButton}
                      onPress={() => handleRescue(personId)}
                    >
                      <Text style={styles.rescueButtonText}>
                        Resgatar ({napCount * 10} flexões)
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.sleepButton}
                      onPress={() => handleMarkAsleep(personId)}
                    >
                      <Text style={styles.sleepButtonText}>Dormiu</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          <TouchableOpacity onPress={finishSession} style={styles.finishButtonFull}>
            <Text style={styles.finishButtonText}>✅ Finalizar Sessão</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    );
  };

  // SUMMARY RENDER: Final Session Summary
  const renderSummaryStep = () => {
    // Calculate statistics
    const survivors = selectedParticipants.filter(id => !sleepers.includes(id));
    const totalFlexoes = Object.values(naps).reduce((sum, count) => sum + (count * 10), 0);
    
    // Find MVP (most awake time)
    const awakeStats = selectedParticipants.map(id => {
      const person = people.find(p => p.id === id);
      const sleepTime = totalSleepTime[id] || 0;
      const awakeTime = elapsedSeconds - sleepTime;
      return { id, name: person?.name || '', awakeTime };
    });
    awakeStats.sort((a, b) => b.awakeTime - a.awakeTime);
    const mvp = awakeStats[0];

    // Find first sleeper
    const firstSleeper = Object.entries(sleepStartTimes)
      .sort(([, a], [, b]) => a.getTime() - b.getTime())[0];
    const firstSleeperPerson = firstSleeper 
      ? people.find(p => p.id === firstSleeper[0]) 
      : null;

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Card>
          <Text style={styles.stepTitle}>🎬 Resumo da Sessão</Text>
          
          <View style={styles.summarySection}>
            <Text style={styles.summarySectionTitle}>⏱️ Duração Total</Text>
            <Text style={styles.summaryValue}>{formatTime(elapsedSeconds)}</Text>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summarySectionTitle}>🏆 MVP - Mais Acordado</Text>
            <View style={styles.summaryPersonRow}>
              <Avatar name={mvp.name} size={40} />
              <Text style={styles.summaryPersonName}>{mvp.name}</Text>
              <Text style={styles.summaryPersonValue}>
                {Math.floor(mvp.awakeTime / 60)}min acordado
              </Text>
            </View>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summarySectionTitle}>💪 Flexões Totais</Text>
            <Text style={styles.summaryValue}>{totalFlexoes} flexões</Text>
          </View>

          {survivors.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>✅ Sobreviventes ({survivors.length})</Text>
              {survivors.map(id => {
                const person = people.find(p => p.id === id);
                return person ? (
                  <View key={id} style={styles.summaryListItem}>
                    <Avatar name={person.name} size={30} />
                    <Text style={styles.summaryListName}>{person.name}</Text>
                  </View>
                ) : null;
              })}
            </View>
          )}

          {sleepers.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>😴 Dorminhocos ({sleepers.length})</Text>
              {sleepers.map(id => {
                const person = people.find(p => p.id === id);
                const napCount = naps[id] || 0;
                return person ? (
                  <View key={id} style={styles.summaryListItem}>
                    <Avatar name={person.name} size={30} />
                    <Text style={styles.summaryListName}>
                      {person.name} - {napCount} cochilo{napCount > 1 ? 's' : ''}
                    </Text>
                  </View>
                ) : null;
              })}
            </View>
          )}

          {firstSleeperPerson && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>🥇 Salvou Demais</Text>
              <View style={styles.summaryPersonRow}>
                <Avatar name={firstSleeperPerson.name} size={40} />
                <Text style={styles.summaryPersonName}>{firstSleeperPerson.name}</Text>
                <Text style={styles.summaryPersonValue}>Primeiro a dormir</Text>
              </View>
            </View>
          )}

          <View style={styles.summaryButtons}>
            <TouchableOpacity
              style={styles.discardButton}
              onPress={() => {
                Alert.alert(
                  'Descartar Sessão',
                  'Tem certeza que deseja descartar esta sessão?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Descartar',
                      style: 'destructive',
                      onPress: () => navigation.goBack(),
                    },
                  ]
                );
              }}
            >
              <Text style={styles.discardButtonText}>Descartar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={saveSession}>
              <LinearGradient
                colors={['#E50914', '#8B0000']}
                style={styles.saveButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.saveButtonText}>💾 Salvar Sessão</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {!showSummary && renderStepIndicator()}
      {!showSummary && step === 'warmup' && renderWarmupStep()}
      {!showSummary && step === 'participants' && renderParticipantsStep()}
      {!showSummary && step === 'lobby' && renderLobbyStep()}
      {showSummary && renderSummaryStep()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  headerGradient: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  cardContainer: {
    marginBottom: 20,
  },
  modernCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  iconText: {
    fontSize: 28,
  },
  sectionTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  sectionSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.9,
  },
  avatarScroll: {
    marginVertical: 8,
  },
  avatarScrollContent: {
    paddingVertical: 8,
  },
  avatarOption: {
    alignItems: 'center',
    marginRight: 20,
    padding: 12,
    borderRadius: 16,
    position: 'relative',
  },
  avatarOptionSelected: {
    transform: [{ scale: 1.1 }],
  },
  avatarGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    opacity: 0.3,
  },
  avatarName: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginTop: 8,
    fontWeight: '500',
  },
  avatarNameSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  resultButtons: {
    gap: 12,
    marginVertical: 8,
  },
  resultButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  resultButtonGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  resultButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  resultButtonTextActive: {
    color: '#FFF',
  },
  resultButtonWin: {
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  resultButtonLose: {
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  resultButtonDraw: {
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  continueButton: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  continueButtonIcon: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
  },
  stepDotActive: {
    backgroundColor: '#E50914',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dateText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
  resultButtonSelected: {
    borderColor: '#E50914',
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
  },
  resultButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gradientButton: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  gradientButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  alternativeModeContainer: {
    marginBottom: 16,
  },
  alternativeModeButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  alternativeModeButtonActive: {
    borderColor: '#E50914',
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
  },
  alternativeModeText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedCount: {
    color: '#888',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  participantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  participantCard: {
    width: 100,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    position: 'relative',
  },
  participantCardSelected: {
    borderColor: '#E50914',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
  },
  participantName: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#E50914',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  flexButton: {
    flex: 2,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  timerLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  timerText: {
    color: '#E50914',
    fontSize: 36,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 20,
    marginBottom: 12,
  },
  participantsLobbyGrid: {
    gap: 12,
  },
  lobbyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  zzzContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  lobbyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  lobbyCardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  lobbyCardName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lobbyCardTimer: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  napCounter: {
    color: '#E50914',
    fontSize: 12,
    marginTop: 2,
  },
  sleepButton: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E50914',
  },
  sleepButtonText: {
    color: '#E50914',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rescueButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  rescueButtonText: {
    color: '#22C55E',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  finishButtonFull: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  finishButtonText: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalButtonConfirm: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderColor: '#E50914',
  },
  modalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 14,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 16,
  },
  modalAvatarScroll: {
    maxHeight: 100,
    marginBottom: 8,
  },
  modalAvatarOption: {
    alignItems: 'center',
    marginRight: 12,
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modalAvatarOptionSelected: {
    borderColor: '#E50914',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
  },
  modalAvatarName: {
    color: '#FFF',
    fontSize: 11,
    marginTop: 4,
  },
  // Summary styles
  summarySection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  summarySectionTitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  summaryPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryPersonName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  summaryPersonValue: {
    color: '#888',
    fontSize: 14,
  },
  summaryListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  summaryListName: {
    color: '#FFF',
    fontSize: 14,
  },
  summaryButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  discardButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  discardButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
