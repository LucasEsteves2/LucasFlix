# LucasFlix 🎬

Um hub inspirado na Netflix para registrar sessões de filmes com amigos, criar rankings e estatísticas internas de forma divertida.

## 🚀 Tecnologias

- **React 18** com TypeScript
- **Vite** - Build tool rápido
- **React Router** - Navegação
- **Recharts** - Gráficos e estatísticas
- **LocalStorage** - Persistência de dados (preparado para Firebase)

## 📦 Instalação

```bash
npm install
```

## 🎯 Executar o Projeto

```bash
npm run dev
```

O app estará disponível em: `http://localhost:5173`

## 🏗️ Estrutura do Projeto

```
src/
├── app/           # App principal e layout
├── pages/         # Páginas da aplicação
├── components/    # Componentes reutilizáveis
├── context/       # Context API para estado global
├── data/          # Modelos, seed, e camada de dados
│   ├── models.ts              # TypeScript interfaces
│   ├── seed.ts                # Dados mockados iniciais
│   ├── IDataStore.ts          # Interface do repositório
│   ├── LocalStorageDataStore.ts  # Implementação LocalStorage
│   └── FirebaseDataStore.ts   # Stub para Firebase (futuro)
└── utils/         # Utilitários
```

## ✨ Funcionalidades

### 🎥 Sessões
- CRUD completo de sessões de filmes
- Registro de participantes e quem dormiu
- Momento Pés (mini-jogo antes do filme)
- Horários de sono por pessoa

### 😴 Mural da Vergonha
- Registro de quem dormiu durante as sessões
- Filtros por pessoa
- Observações personalizadas

### 🏆 Rankings
- **Mais Acordados**: Ranking de quem sobrevive às madrugadas
- **Rei do Pés**: Ranking do mini-jogo com pontuação (vitória=3, empate=1)

### 🎬 Filmes do Dia
- Cadastro de filmes
- Sistema de votação por estrelas (1-5)
- Ranking dos melhores filmes avaliados

### 📊 Estatísticas
- KPIs principais (sessões, viramos, filmes, votos)
- Gráficos de resultados do Momento Pés
- Evolução de pontos ao longo do tempo
- Top 10 filmes por avaliação
- Estatísticas de quem dormiu primeiro

### 💾 Backup
- Exportar dados via clipboard (JSON)
- Importar backup anterior
- Resetar para dados de exemplo
- **Mobile-friendly** - funciona perfeitamente no celular!

## 👥 Grupo Padrão

- Thiago
- Diego
- Menta
- Lucas

## 🎨 Design

Interface inspirada na Netflix com:
- Tema escuro elegante
- Cards com hover effects
- Layout responsivo
- Badges e indicadores visuais
- Gradientes e sombras

## 🔄 Migração Futura para Firebase

O projeto já está estruturado para migração fácil para Firebase:

1. A interface `IDataStore` abstrai a camada de dados
2. Toda lógica de negócio usa o Context, não o storage diretamente
3. O arquivo `FirebaseDataStore.ts` já tem a estrutura comentada

**Para migrar:**
```typescript
// Em DataContext.tsx, trocar:
const dataStore: IDataStore = new LocalStorageDataStore();
// Por:
const dataStore: IDataStore = new FirebaseDataStore();
```

## 📝 Dados de Exemplo

O app inicia com dados mockados incluindo:
- 5 sessões de exemplo
- 5 registros no Mural da Vergonha
- 5 Filmes do Dia com votos
- Rankings pré-calculados

## 🛠️ Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`

## 📱 Mobile

O app é totalmente responsivo e funciona perfeitamente em dispositivos móveis, incluindo a funcionalidade de backup via clipboard.

## 🎯 Próximos Passos

- [ ] Implementar Firebase para sync entre dispositivos
- [ ] Adicionar autenticação (opcional)
- [ ] Upload de fotos para o Mural da Vergonha
- [ ] Notificações de sessões futuras
- [ ] Integração com API de filmes (TMDB)

## 📄 Licença

Projeto pessoal - Use como quiser! 🎉

---

**Desenvolvido com ❤️ para registrar as melhores (e mais engraçadas) noites de filme com os amigos!**
