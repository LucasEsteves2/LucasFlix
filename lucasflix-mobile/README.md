# LucasFlix Mobile

Versão mobile do LucasFlix para iOS e Android usando React Native + Expo.

## 🚀 Como Rodar

### Pré-requisitos
- Node.js instalado
- Expo Go app no celular (iOS ou Android)

### Instalação e Execução

```bash
# Navegar até a pasta do projeto
cd lucasflix-mobile

# Instalar dependências (já feito)
npm install

# Iniciar o servidor de desenvolvimento
npm start

# Ou rodar diretamente no Android
npm run android

# Ou rodar diretamente no iOS (somente no macOS)
npm run ios

# Ou rodar na web
npm run web
```

## 📱 Features Implementadas

### ✅ Telas Principais
- **Home**: Hero, Destaques da Semana (MVPs + Reis do Cochilo), Últimas Sessões
- **Sessions**: Lista completa de todas as sessões com filmes e quem dormiu
- **Rankings**: Mais Acordado, Mais Dorminhoco, Mais Participativo
- **Statistics**: Estatísticas gerais e por pessoa
- **More**: Menu adicional (em desenvolvimento)

### ✅ Componentes
- **Avatar**: Exibe avatares dos participantes
- **Card**: Card reutilizável com suporte a gradientes
- **Badge**: Badge para destacar informações

### ✅ Integração Firebase
- Conexão com Firebase Realtime Database
- Sincronização em tempo real
- Mesmos dados da versão web

## 🎨 Design

- Dark theme Netflix-inspired (#0A0A0A background)
- Gradientes e animações suaves
- Bottom tabs navigation
- Tema vermelho (#E50914) como cor primária

## 📦 Tecnologias

- **React Native** + **Expo SDK**
- **TypeScript** para type safety
- **Firebase Realtime Database** para dados
- **React Navigation** para navegação
- **Expo Linear Gradient** para gradientes
- **React Native Reanimated** para animações

## 🔄 Sincronização com Web

Todos os dados são sincronizados em tempo real com a versão web através do Firebase.
Qualquer alteração feita no app mobile aparece instantaneamente na web e vice-versa.

## 📁 Estrutura do Projeto

```
src/
├── assets/          # Avatares e imagens
├── components/      # Componentes reutilizáveis
├── context/         # DataContext com Firebase
├── navigation/      # Configuração de navegação
├── screens/         # Telas do app
├── services/        # Firebase config
└── types/           # TypeScript types (models)
```

## 🚧 Próximas Features

- [ ] Tela de Nova Sessão
- [ ] Tela de Detalhes da Sessão
- [ ] Mural do Sono
- [ ] Daily Movies
- [ ] Sistema de Conquistas
- [ ] Notificações push
- [ ] Modo offline

## 📝 Notas

Para testar no celular:
1. Execute `npm start`
2. Escaneie o QR code com o app Expo Go
3. O app será carregado automaticamente

---

Desenvolvido com ❤️ para o LucasFlix
