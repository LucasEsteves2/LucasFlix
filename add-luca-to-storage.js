// Script para adicionar Luca no localStorage
// Execute este arquivo no console do navegador (F12)

const data = JSON.parse(localStorage.getItem('lucasflix_data') || '{}');

// Verifica se Luca já existe
const lucaExists = data.people?.find(p => p.name === 'Luca');

if (lucaExists) {
  console.log('✅ Luca já existe no localStorage!', lucaExists);
} else {
  console.log('❌ Luca não encontrada. Adicionando...');
  
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
  
  if (!data.people) {
    data.people = [];
  }
  
  // Adiciona Luca
  data.people.push({
    id: 'p8',
    name: 'Luca',
    isAlternative: true,
    stats: emptyStats,
    achievements: [],
    lastUpdated: new Date().toISOString()
  });
  
  // Salva de volta
  localStorage.setItem('lucasflix_data', JSON.stringify(data));
  console.log('✅ Luca adicionada com sucesso!');
  console.log('🔄 Recarregue a página (F5) para ver as mudanças');
}

// Mostra todos os participantes
console.log('\n📋 Todos os participantes:');
data.people?.forEach(p => {
  console.log(`${p.isAlternative ? '🔓' : '🔒'} ${p.name} (${p.id})`);
});
