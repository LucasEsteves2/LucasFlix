# Feature Flags - LucasFlix

## Participante "Lucca"

O participante **Lucca** está atualmente **oculto** da aplicação, mas permanece no código e no banco de dados.

### Status Atual
- ✅ Código implementado
- ✅ Dados no Firebase
- ❌ **Visível na aplicação: NÃO**

### Como Ativar o Lucca

Para tornar o Lucca visível novamente, altere a propriedade `isVisible` para `true` nos seguintes arquivos:

#### 1. **src/data/seed.ts** (linha ~41)
```typescript
{ id: 'p8', name: 'Lucca', isAlternative: true, isVisible: true, stats: emptyStats, achievements: [], lastUpdated: now.toISOString() },
```

#### 2. **src/context/DataContext.tsx** (linha ~112)
```typescript
{ id: 'p8', name: 'Lucca', isAlternative: true, isVisible: true, stats: emptyStats, achievements: [], lastUpdated: now },
```

#### 3. **uploadInitialData.js** (linha ~189)
```json
{
  "id": "p8",
  "name": "Lucca",
  "isAlternative": true,
  "isVisible": true,
  ...
}
```

Depois execute:
```bash
node uploadInitialData.js
```

### Como Desativar o Lucca

Altere `isVisible: true` para `isVisible: false` nos mesmos arquivos acima e execute:
```bash
node uploadInitialData.js
```

---

## Como Funciona

A propriedade `isVisible` no modelo `Person`:
```typescript
interface Person {
  id: string;
  name: string;
  isVisible?: boolean; // false = oculto, true ou undefined = visível
  ...
}
```

Todos os componentes filtram usando:
```typescript
people.filter(p => p.isVisible !== false)
```

Isso garante que participantes com `isVisible: false` não apareçam em:
- 📋 Seleção de participantes (StartSession)
- 🏆 Página de Conquistas
- 📊 Estatísticas
- 🎬 Filmes Diários (votos e criação)
- 🎮 Seleção de jogadores do Warmup
