# 🗺️ Mapa de Navegação - LucasFlix

## Estrutura de Rotas

```
LucasFlix
│
├── 🏠 Home (/)
│   │
│   ├── Últimas Sessões
│   ├── Mural da Vergonha (recentes)
│   ├── Ranking: Mais Acordados
│   ├── Rei do Pés
│   └── Filmes do Dia
│
├── 🎬 Sessões (/sessions)
│   │
│   ├── Listar todas as sessões
│   ├── Filtrar por pessoa
│   ├── [+] Nova Sessão
│   │   ├── Data
│   │   ├── Filme
│   │   ├── Escolhido por
│   │   ├── Participantes (checkboxes)
│   │   ├── Primeiro a dormir
│   │   ├── Horários de sono
│   │   ├── Momento Pés
│   │   │   ├── Jogador
│   │   │   ├── Resultado (Ganhou/Perdeu/Empate)
│   │   │   ├── Duração
│   │   │   └── Observação
│   │   └── Observações gerais
│   ├── [Editar] Sessão
│   └── [Excluir] Sessão
│
├── 😴 Mural da Vergonha (/shame-wall)
│   │
│   ├── Listar todos os registros
│   ├── Filtrar por pessoa
│   ├── [+] Novo Registro
│   │   ├── Pessoa
│   │   ├── Data
│   │   ├── Horário
│   │   └── Observação
│   ├── [Editar] Registro
│   └── [Excluir] Registro
│
├── 🏆 Rankings (/rankings)
│   │
│   ├── [Tab] Mais Acordados
│   │   └── Cards com:
│   │       ├── Posição (#1, #2, etc)
│   │       ├── Nome
│   │       ├── Sobrevivências
│   │       ├── Participações
│   │       ├── Dormiu Primeiro
│   │       └── Taxa de sobrevivência
│   │
│   └── [Tab] Rei do Pés
│       └── Cards com:
│           ├── Posição
│           ├── Nome
│           ├── Vitórias
│           ├── Empates
│           ├── Derrotas
│           ├── Pontos (vitória=3, empate=1)
│           └── Taxa de vitória
│
├── 🎥 Filmes do Dia (/daily-movies)
│   │
│   ├── Rei dos Filmes (Top 10 por avaliação)
│   ├── [+] Novo Filme
│   │   ├── Título
│   │   ├── Data
│   │   └── Cadastrado por
│   ├── [Votar] Filme
│   │   └── Para cada pessoa:
│   │       └── Estrelas (1 a 5)
│   └── [Excluir] Filme
│
├── 📊 Estatísticas (/statistics)
│   │
│   ├── KPIs (cards no topo)
│   │   ├── Total de Sessões
│   │   ├── Viramos (ninguém dormiu)
│   │   ├── Filmes do Dia
│   │   └── Total de Votos
│   │
│   └── Gráficos (Recharts)
│       ├── Momento Pés: Resultados por Pessoa (BarChart)
│       ├── Evolução de Pontos ao Longo do Tempo (LineChart)
│       ├── Top 10 Filmes por Média (BarChart)
│       └── Quem Dormiu Primeiro (BarChart)
│
└── 💾 Backup (/backup)
    │
    ├── [Copiar Backup]
    │   └── Gera JSON e copia para clipboard
    │
    ├── [Restaurar Backup]
    │   ├── Textarea para colar JSON
    │   └── Botão Restaurar
    │
    └── [Resetar para Exemplo]
        └── Volta aos dados seed iniciais
```

## 🎨 Elementos Visuais em Cada Página

### Navbar (sempre visível)
- Logo "LucasFlix" (vermelho Netflix)
- Links: Home, Sessões, Filmes do Dia, Mural da Vergonha, Rankings, Estatísticas, Backup
- Link ativo destacado em vermelho

### Cards (estilo Netflix)
- Background: gradiente escuro
- Hover: scale(1.05) + sombra vermelha
- Badges coloridos (Ganhou=verde, Perdeu=vermelho, Empate=amarelo, etc)
- Ações no rodapé (Editar, Excluir, Votar, etc)

### Modais
- Background escuro translúcido
- Formulários com validação
- Botões: Cancelar (cinza) e Confirmar (vermelho)

### Toasts
- Posição: topo direito
- Tipos: success (verde), error (vermelho), info (azul)
- Auto-dismiss após 3 segundos

### Filtros
- Selects estilizados
- Filtro por pessoa (comum em várias páginas)

## 🔄 Fluxo de Dados

```
User Action
    ↓
Component (Page)
    ↓
DataContext (useData hook)
    ↓
DataContext operations (add/update/delete)
    ↓
DataStore (IDataStore implementation)
    ↓
LocalStorage / Firebase
    ↓
State update (setData)
    ↓
Re-render (automatic)
```

## 📱 Responsividade

- Desktop: Grid com múltiplas colunas
- Tablet: 2 colunas
- Mobile: 1 coluna
- Navbar: Colapsa em mobile (vertical)
- Modais: Full-screen em mobile

## 🎯 Principais Interações

1. **Home**: Visualização rápida de tudo
2. **Sessões**: CRUD completo com form detalhado
3. **Mural da Vergonha**: CRUD simples
4. **Rankings**: Visualização (calculado automaticamente)
5. **Filmes do Dia**: CRUD + votação interativa
6. **Estatísticas**: Visualização de gráficos
7. **Backup**: Export/Import de dados

## 🔐 Persistência

- **LocalStorage** (atual)
  - Chave: `lucasflix_data`
  - Formato: JSON serializado de `LucasflixData`
  - Auto-save em toda operação

- **Firebase** (preparado)
  - Documento: `lucasflix/data`
  - Mesma interface `IDataStore`
  - Trocar implementação = mudança em 1 linha

## 🎬 Pronto para usar!

Todas as rotas estão configuradas e funcionais.
Navegação suave com React Router.
Estado sincronizado em tempo real.
