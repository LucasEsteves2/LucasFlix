import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { people, sessions, loading, activeSession, clearActiveSession } = useData();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showSessionModal, setShowSessionModal] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [loading]);

  // Auto-scroll gallery
  useEffect(() => {
    const timer = setInterval(() => {
      setGalleryIndex(prev => (prev + 1) % 5);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Carregando LucasFlix...</Text>
      </View>
    );
  }

  // Filmes de hoje
  const today = new Date().toISOString().split('T')[0];
  const todayMovies = sessions
    .filter(s => s.dateISO === today && s.movies && s.movies.length > 0)
    .flatMap(s => s.movies.map(m => ({ ...m, sessionDate: s.dateISO })))
    .slice(0, 3);

  // Mock para teste - adicionar filmes se não houver
  const displayMovies = todayMovies.length > 0 ? todayMovies : [
    { title: 'Interestelar', chosenByPersonId: people[0]?.id || '1', order: 1 },
    { title: 'O Poderoso Chefão', chosenByPersonId: people[1]?.id || '2', order: 2 },
  ];

  // MVPs da Semana
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentSessions = sessions.filter(s => new Date(s.dateISO) >= weekAgo);
  
  const scores = people
    .filter(p => !p.isAlternative && p.isVisible)
    .map(p => ({
      person: p,
      score: recentSessions.filter(s =>
        s.participantIds.includes(p.id) &&
        !(s.sleepTimes || []).some(st => st.personId === p.id)
      ).length,
      participated: recentSessions.filter(s => s.participantIds.includes(p.id)).length,
    }))
    .filter(s => s.participated > 0)
    .sort((a, b) => b.score - a.score);

  const topScore = scores[0]?.score || 0;
  const mvps = scores.filter(s => s.score === topScore);

  // Ranking Geral - Mais Acordados (calculado dinamicamente das sessões)
  const overallScores = people
    .filter(p => p.isVisible)
    .map(p => {
      const totalSessions = sessions.filter(s => s.participantIds.includes(p.id)).length;
      const awakeSessions = sessions.filter(s =>
        s.participantIds.includes(p.id) &&
        !(s.sleepTimes || []).some(st => st.personId === p.id)
      ).length;
      return {
        person: p,
        survivals: awakeSessions,
        totalSessions,
      };
    })
    .sort((a, b) => b.survivals - a.survivals)
    .slice(0, 4);

  // Rei do Aquecimento (Warmup King)
  const warmupScores = people
    .filter(p => !p.isAlternative && p.isVisible)
    .map(p => {
      const warmupWins = sessions.filter(s => 
        s.warmUp?.playerPersonId === p.id && s.warmUp?.result === 'GANHOU'
      ).length;
      const warmupDraws = sessions.filter(s => 
        s.warmUp?.playerPersonId === p.id && s.warmUp?.result === 'EMPATE'
      ).length;
      const warmupLosses = sessions.filter(s => 
        s.warmUp?.playerPersonId === p.id && s.warmUp?.result === 'PERDEU'
      ).length;
      return {
        person: p,
        wins: warmupWins,
        draws: warmupDraws,
        losses: warmupLosses,
        points: warmupWins * 3 + warmupDraws * 1,
      };
    })
    .sort((a, b) => b.points - a.points)
    .slice(0, 4);

  // Reis do Cochilo
  const sleepers = people
    .filter(p => !p.isAlternative && p.isVisible)
    .map(p => ({
      person: p,
      naps: p.stats.totalNaps || 0,
    }))
    .sort((a, b) => b.naps - a.naps);

  const topNaps = sleepers[0]?.naps || 0;
  const topSleepers = sleepers.filter(s => s.naps === topNaps && s.naps > 0);

  const galleryImages = [
    { image: require('../imgs/Header/amigos.png'), title: 'Sessão Especial', year: '2024' },
    { image: require('../imgs/Header/amigos2.jpg'), title: 'Noite de Cinema', year: '2024' },
    { image: require('../imgs/Header/amigos3.jpg'), title: 'Amigos Reunidos', year: '2024' },
    { image: require('../imgs/Header/amigos4.jpg'), title: 'Momento Marcante', year: '2024' },
    { image: require('../imgs/Header/amigos5.jpg'), title: 'Sessão Épica', year: '2024' },
    { image: require('../imgs/Header/amigos6.jpg'), title: 'Galera Reunida', year: '2024' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }} edges={['top']}>
      <ScrollView style={styles.container}>
        {/* Hero Section */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <LinearGradient
            colors={['#E50914', '#8B0000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroCenter}>
              <Text style={styles.heroTitle}>LucasFlix</Text>
              <Text style={styles.heroSubtitle}>🎬 Cinema com os amigos 🍿</Text>
              
              {/* Avatars dos participantes */}
              <View style={styles.participantsRow}>
                {people
                  .filter(p => !p.isAlternative && p.isVisible)
                  .slice(0, 4)
                  .map((person, index) => (
                    <Animated.View 
                      key={person.id} 
                      style={[
                        styles.avatarWrapper,
                        { 
                          zIndex: 10 - index,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 5,
                        }
                      ]}
                    >
                      <Avatar name={person.name} size={70} />
                    </Animated.View>
                  ))}
              </View>
              
              <Text style={styles.participantsCount}>
                {people.filter(p => !p.isAlternative && p.isVisible).length} Participantes
              </Text>
            </View>
            
            {/* Quick Stats Cards */}
            <View style={styles.quickStatsGrid}>
              <TouchableOpacity 
                style={styles.quickStatCard}
                onPress={() => navigation.navigate('Sessions')}
              >
                <Text style={styles.quickStatValue}>{sessions.length}</Text>
                <Text style={styles.quickStatLabel}>Sessões</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickStatCard}
                onPress={() => navigation.navigate('Rankings')}
              >
                <Text style={styles.quickStatValue}>🏆</Text>
                <Text style={styles.quickStatLabel}>Rankings</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickStatCard}
                onPress={() => navigation.navigate('Statistics')}
              >
                <Text style={styles.quickStatValue}>📊</Text>
                <Text style={styles.quickStatLabel}>Estatísticas</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Filmes do Dia */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎬 Filmes de Hoje</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.moviesScroll}
              contentContainerStyle={styles.moviesScrollContent}
            >
              {displayMovies.map((movie, idx) => {
                const chooser = people.find(p => p.id === movie.chosenByPersonId);
                return (
                  <View key={idx} style={styles.moviePoster}>
                    <LinearGradient
                      colors={['rgba(229, 9, 20, 0.3)', 'rgba(0, 0, 0, 0.8)']}
                      style={styles.moviePosterGradient}
                    >
                      <Image
                        source={require('../imgs/lucsaflix.png')}
                        style={styles.moviePosterImage}
                        resizeMode="contain"
                      />
                    </LinearGradient>
                    <View style={styles.moviePosterInfo}>
                      <Text style={styles.moviePosterTitle} numberOfLines={2}>
                        {movie.title}
                      </Text>
                      {chooser && (
                        <View style={styles.moviePosterChooser}>
                          <Avatar name={chooser.name} size={24} />
                          <Text style={styles.moviePosterChooserName} numberOfLines={1}>
                            {chooser.name}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </Animated.View>

        {/* Mais Acordados */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Mais Acordados</Text>
            {overallScores.slice(0, 4).map((item, idx) => (
              <View key={item.person.id} style={[
                styles.rankingCardNew,
                idx === 0 && styles.rankingCardGold,
                idx === 1 && styles.rankingCardSilver,
                idx === 2 && styles.rankingCardBronze,
              ]}>
                <View style={styles.rankingBadge}>
                  <Text style={styles.rankingBadgeText}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅'}
                  </Text>
                </View>
                <Avatar name={item.person.name} size={56} />
                <View style={styles.rankingInfoNew}>
                  <Text style={styles.rankingNameNew}>{item.person.name}</Text>
                  <Text style={styles.rankingStatNew}>
                    {item.survivals} acordado · {item.totalSessions} sessões
                  </Text>
                </View>
                <View style={styles.rankingScore}>
                  <Text style={styles.rankingScoreValue}>{item.survivals}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Rei do Aquecimento */}
        {warmupScores[0]?.wins > 0 && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚽ Rei do Aquecimento</Text>
              {warmupScores.slice(0, 4).map((item, idx) => (
                <View key={item.person.id} style={[
                  styles.rankingCardNew,
                  styles.rankingCardWarmup,
                ]}>
                  <View style={styles.rankingBadge}>
                    <Text style={styles.rankingBadgeText}>
                      {idx === 0 ? '👑' : idx === 1 ? '⚽' : idx === 2 ? '🎯' : '🏆'}
                    </Text>
                  </View>
                  <Avatar name={item.person.name} size={56} />
                  <View style={styles.rankingInfoNew}>
                    <Text style={styles.rankingNameNew}>{item.person.name}</Text>
                    <Text style={styles.rankingStatNew}>
                      {item.wins}V · {item.draws}E · {item.losses}D
                    </Text>
                  </View>
                  <View style={styles.rankingScore}>
                    <Text style={styles.rankingScoreValue}>{item.points}</Text>
                    <Text style={styles.rankingScoreLabel}>pts</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Mural do Sono */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>😴 Mural do Sono</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.sleepWallScroll}
            >
              <TouchableOpacity style={styles.sleepWallCard}>
                <Image 
                  source={require('../imgs/sonecas/sono1.jpg')} 
                  style={styles.sleepWallImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.9)']}
                  style={styles.sleepWallOverlay}
                >
                  <Text style={styles.sleepWallTitle}>💤 Momento Épico</Text>
                  <Text style={styles.sleepWallDesc}>Registrado para história</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sleepWallCard}>
                <Image 
                  source={require('../imgs/sonecas/sono2.jpeg')} 
                  style={styles.sleepWallImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.9)']}
                  style={styles.sleepWallOverlay}
                >
                  <Text style={styles.sleepWallTitle}>😴 Cochilo Legendário</Text>
                  <Text style={styles.sleepWallDesc}>Momento clássico</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Animated.View>

        {/* Galeria de Momentos */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Galeria de Momentos</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.gallery}
              pagingEnabled
            >
              {galleryImages.map((img, idx) => (
                <TouchableOpacity key={idx} style={styles.galleryCard}>
                  <Image 
                    source={img.image} 
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.galleryOverlay}
                  >
                    <Text style={styles.galleryTitle}>{img.title}</Text>
                    <Text style={styles.galleryYear}>{img.year}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.galleryDots}>
              {galleryImages.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.galleryDot,
                    idx === galleryIndex && styles.galleryDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Destaques da Semana */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Destaques da Semana</Text>
            <Text style={styles.sectionSubtitle}>
              Os melhores momentos dos últimos 7 dias
            </Text>

            {/* MVPs */}
            <Card gradient={true} style={styles.spotlightCard}>
              <View style={styles.crownContainer}>
                <Text style={styles.crown}>👑</Text>
              </View>
              <Badge
                text={mvps.length > 1 ? `${mvps.length} MVPs DA SEMANA` : 'MVP DA SEMANA'}
                variant="warning"
                style={styles.mvpBadge}
              />
              {mvps.length > 0 ? (
                <>
                  {mvps.length === 1 ? (
                    <>
                      <Avatar name={mvps[0].person.name} size={100} />
                      <Text style={styles.mvpName}>{mvps[0].person.name}</Text>
                      <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                          <Text style={styles.statCardValue}>{mvps[0].score}</Text>
                          <Text style={styles.statCardLabel}>Acordado</Text>
                        </View>
                        <View style={styles.statCard}>
                          <Text style={styles.statCardValue}>{mvps[0].participated}</Text>
                          <Text style={styles.statCardLabel}>Participações</Text>
                        </View>
                        <View style={styles.statCard}>
                          <Text style={styles.statCardValue}>
                            {Math.round((mvps[0].score / mvps[0].participated) * 100)}%
                          </Text>
                          <Text style={styles.statCardLabel}>Taxa</Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.mvpsGrid}>
                        {mvps.map(mvp => (
                          <View key={mvp.person.id} style={styles.mvpItem}>
                            <Avatar name={mvp.person.name} size={60} showName={true} />
                          </View>
                        ))}
                      </View>
                      <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                          <Text style={styles.statCardValue}>{topScore}</Text>
                          <Text style={styles.statCardLabel}>Acordado</Text>
                        </View>
                      </View>
                    </>
                  )}
                </>
              ) : (
                <Text style={styles.noData}>Aguardando mais sessões...</Text>
              )}
            </Card>

            {/* Reis do Cochilo */}
            {topSleepers.length > 0 && (
              <Card style={styles.secondaryCard}>
                <Badge
                  text={topSleepers.length > 1 ? `${topSleepers.length} Reis do Cochilo` : 'Rei do Cochilo'}
                  variant="info"
                />
                <Text style={styles.cardIcon}>😴</Text>
                {topSleepers.length === 1 ? (
                  <Text style={styles.cardName}>{topSleepers[0].person.name}</Text>
                ) : (
                  <View style={styles.sleepersList}>
                    {topSleepers.map(s => (
                      <Text key={s.person.id} style={styles.sleeperName}>
                        {s.person.name}
                      </Text>
                    ))}
                  </View>
                )}
                <View style={styles.statHighlight}>
                  <Text style={styles.statBig}>{topNaps}</Text>
                  <Text style={styles.statUnit}>
                    {topSleepers.length === 1 ? 'sonecas registradas' : 'sonecas cada'}
                  </Text>
                </View>
              </Card>
            )}
          </View>
        </Animated.View>

      {/* Últimas Sessões */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎬 Últimas Sessões</Text>
          {sessions.slice(-3).reverse().map(session => (
            <Card key={session.id} style={styles.sessionCard} onPress={() => {}}>
              <Text style={styles.sessionDate}>{session.dateISO}</Text>
              <Text style={styles.sessionParticipants}>
                {session.participantIds.length} participantes
              </Text>
              {session.movies && session.movies.length > 0 && (
                <Text style={styles.sessionMovies}>
                  🎥 {session.movies.map(m => m.title).join(', ')}
                </Text>
              )}
            </Card>
          ))}
        </View>
      </Animated.View>

      <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Botão Nova Sessão */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (activeSession) {
            setShowSessionModal(true);
          } else {
            navigation.navigate('StartSession');
          }
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#E50914', '#8B0000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Text style={styles.fabText}>+ Nova Sessão</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal de Sessão Ativa */}
      <Modal
        visible={showSessionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSessionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Sessão em Andamento</Text>
            <Text style={styles.modalText}>
              Você já tem uma sessão aberta. Deseja continuar de onde parou?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={async () => {
                  await clearActiveSession();
                  setShowSessionModal(false);
                  navigation.navigate('StartSession');
                }}
              >
                <Text style={styles.modalButtonSecondaryText}>Não, iniciar nova</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={() => {
                  setShowSessionModal(false);
                  navigation.navigate('StartSession', { continueSession: true });
                }}
              >
                <LinearGradient
                  colors={['#6C7AE0', '#5563C1']}
                  style={styles.modalButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.modalButtonPrimaryText}>Sim, continuar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  hero: {
    padding: 32,
    paddingTop: 40,
    paddingBottom: 36,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#fff',
    marginTop: 6,
    opacity: 0.95,
    fontWeight: '500',
  },
  heroCenter: {
    alignItems: 'center',
    marginBottom: 28,
  },
  participantsRow: {
    flexDirection: 'row',
    marginTop: 24,
    marginLeft: 20,
  },
  avatarWrapper: {
    borderWidth: 4,
    borderColor: '#FFF',
    borderRadius: 40,
    backgroundColor: '#000',
    marginLeft: -20,
  },
  participantsCount: {
    marginTop: 16,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 14,
    padding: 18,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  quickStatValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 6,
  },
  quickStatLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  spotlightCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  crownContainer: {
    position: 'absolute',
    top: -10,
  },
  crown: {
    fontSize: 48,
  },
  mvpBadge: {
    marginBottom: 16,
  },
  mvpName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginTop: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFD700',
  },
  statCardLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    textAlign: 'center',
  },
  mvpsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 16,
  },
  mvpItem: {
    alignItems: 'center',
  },
  noData: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
    marginTop: 16,
  },
  secondaryCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  cardIcon: {
    fontSize: 48,
    marginVertical: 12,
  },
  cardName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  sleepersList: {
    marginVertical: 12,
    alignItems: 'center',
  },
  sleeperName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginVertical: 4,
  },
  statHighlight: {
    alignItems: 'center',
    marginTop: 12,
  },
  statBig: {
    fontSize: 36,
    fontWeight: '900',
    color: '#6C7AE0',
  },
  statUnit: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
    marginTop: 4,
  },
  sessionCard: {
    marginBottom: 12,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  sessionParticipants: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sessionMovies: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
  },
  bottomPadding: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  movieCard: {
    marginBottom: 12,
    padding: 16,
  },
  movieCardNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 9, 20, 0.12)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E50914',
  },
  movieIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderRadius: 24,
    marginRight: 12,
  },
  movieIconText: {
    fontSize: 24,
  },
  movieInfo: {
    marginLeft: 12,
    flex: 1,
  },
  movieTitleNew: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  movieMetaNew: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '500',
  },
  moviesScroll: {
    marginTop: 8,
  },
  moviesScrollContent: {
    paddingRight: 16,
  },
  moviePoster: {
    width: 160,
    height: 240,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  moviePosterGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moviePosterIcon: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(229, 9, 20, 0.3)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E50914',
    overflow: 'hidden',
  },
  moviePosterImage: {
    width: 120,
    height: 120,
  },
  moviePosterIconText: {
    fontSize: 40,
  },
  moviePosterInfo: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  moviePosterTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    height: 36,
  },
  moviePosterChooser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moviePosterChooserName: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    flex: 1,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  movieMeta: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  rankingCard: {
    padding: 16,
  },
  rankingCardNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
  },
  rankingCardGold: {
    borderLeftColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
  },
  rankingCardSilver: {
    borderLeftColor: '#C0C0C0',
    backgroundColor: 'rgba(192, 192, 192, 0.08)',
  },
  rankingCardBronze: {
    borderLeftColor: '#CD7F32',
    backgroundColor: 'rgba(205, 127, 50, 0.08)',
  },
  rankingCardWarmup: {
    borderLeftColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
  },
  rankingBadge: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankingBadgeText: {
    fontSize: 32,
  },
  rankingInfoNew: {
    marginLeft: 12,
    flex: 1,
  },
  rankingNameNew: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  rankingStatNew: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '500',
  },
  rankingScore: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  rankingScoreValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  rankingScoreLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rankingPosition: {
    fontSize: 24,
    marginRight: 12,
    width: 60,
  },
  rankingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  rankingName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  rankingStat: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  sleepWallScroll: {
    marginTop: 8,
  },
  sleepWallCard: {
    width: width - 120,
    height: 280,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  sleepWallImage: {
    width: '100%',
    height: '100%',
  },
  sleepWallOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  sleepWallEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  sleepWallTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  sleepWallDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sleepBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  gallery: {
    marginTop: 8,
  },
  galleryCard: {
    width: width - 80,
    height: 300,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  galleryEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  galleryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  galleryYear: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  galleryDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  galleryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  galleryDotActive: {
    backgroundColor: '#E50914',
    width: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalButtonSecondaryText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalButtonPrimary: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    padding: 14,
    borderRadius: 12,
  },
  modalButtonPrimaryText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
