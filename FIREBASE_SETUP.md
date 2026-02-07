# Migração para Firebase Realtime Database

## ✅ Alterações Implementadas

### 1. Arquivos Criados/Modificados:
- ✅ `src/firebaseConfig.ts` - Configuração do Firebase
- ✅ `src/data/FirebaseDataStore.ts` - Implementação do Firebase Realtime Database
- ✅ `src/context/DataContext.tsx` - Trocado de LocalStorage para Firebase
- ✅ `uploadInitialData.js` - Script para carregar dados iniciais

### 2. O que foi feito:
- Implementação completa do Firebase Realtime Database
- Mantida a mesma interface IDataStore (fácil de trocar entre Firebase e localStorage)
- Sistema de sincronização em tempo real (método `subscribe()`)
- Tratamento de erros e fallback para seed data

## 📦 Instalação

### Passo 1: Instalar Firebase SDK
Execute no terminal:
```bash
npm install firebase
```

### Passo 2: Fazer Upload dos Dados Iniciais

#### Opção A - Usando o Console do Firebase (Recomendado):
1. Acesse: https://console.firebase.google.com/
2. Selecione seu projeto
3. Vá em "Realtime Database"
4. Clique nos 3 pontos (⋮) > "Import JSON"
5. Copie e cole o JSON do arquivo `uploadInitialData.js`

#### Opção B - Usando Fetch API:
1. Abra o console do navegador (F12)
2. Copie e cole o código do arquivo `uploadInitialData.js`
3. Execute `uploadData()`

#### Opção C - Usando cURL:
```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -d @initial-data.json \
  https://lucasflix-default-rtdb.firebaseio.com/lucasflix.json
```

### Passo 3: Configurar Regras do Firebase (IMPORTANTE!)

No Firebase Console, vá em "Realtime Database" > "Regras" e configure:

```json
{
  "rules": {
    "lucasflix": {
      ".read": true,
      ".write": true
    }
  }
}
```

⚠️ **NOTA DE SEGURANÇA**: Estas regras permitem leitura/escrita pública. Para produção, você deve:
1. Adicionar autenticação (Firebase Auth)
2. Restringir acesso apenas a usuários autenticados
3. Exemplo de regras seguras:
```json
{
  "rules": {
    "lucasflix": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### Passo 4: Testar
```bash
npm run dev
```

## 🔄 Como Voltar para LocalStorage

Se precisar voltar para localStorage, basta editar `src/context/DataContext.tsx`:

```typescript
// Trocar esta linha:
const dataStore: IDataStore = new FirebaseDataStore();

// Por esta:
const dataStore: IDataStore = new LocalStorageDataStore();
```

## 📊 Estrutura de Dados no Firebase

Os dados serão salvos em:
```
https://lucasflix-default-rtdb.firebaseio.com/lucasflix
```

Com a seguinte estrutura:
```
lucasflix/
  ├── version: 1
  ├── people: [...]
  ├── sessions: [...]
  ├── dailyMovies: [...]
  ├── votes: [...]
  └── shameWall: [...]
```

## 🎯 Funcionalidades

### Já Funcionando:
- ✅ Leitura/escrita no Firebase
- ✅ Carregamento inicial dos dados
- ✅ Todas as operações CRUD (Create, Read, Update, Delete)
- ✅ Sincronização em tempo real (opcional)
- ✅ Fallback para seed data em caso de erro

### Benefícios:
- 📱 Dados acessíveis de qualquer dispositivo
- 🔄 Sincronização em tempo real (se ativada)
- ☁️ Backup automático na nuvem
- 🚀 Mesma interface da aplicação

## 🐛 Troubleshooting

### Erro: "Firebase not initialized"
- Certifique-se de ter instalado: `npm install firebase`
- Reinicie o servidor: `npm run dev`

### Erro: "Permission denied"
- Verifique as regras do Firebase
- Certifique-se de que `.read` e `.write` estão como `true`

### Dados não aparecem
- Verifique se fez o upload dos dados iniciais
- Abra o console do navegador e veja os logs
- Acesse diretamente: https://lucasflix-default-rtdb.firebaseio.com/lucasflix.json

## 📝 Próximos Passos (Opcional)

1. **Adicionar Autenticação**:
   - Firebase Authentication
   - Login com Google/Email
   - Regras de segurança

2. **Otimizações**:
   - Cache local com IndexedDB
   - Sync offline
   - Compression de dados

3. **Monitoramento**:
   - Firebase Analytics
   - Crash Reporting
   - Performance Monitoring
