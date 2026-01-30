# 🚀 Instruções de Instalação - LucasFlix

## Pré-requisitos

Você precisa ter o **Node.js** instalado no seu computador.

### Instalar Node.js

1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS** (recomendada)
3. Execute o instalador e siga as instruções
4. Após instalar, **reinicie o VS Code** ou o terminal

### Verificar Instalação

Abra um novo terminal e execute:

```bash
node --version
npm --version
```

Se aparecer as versões, está tudo certo!

## 📦 Instalar Dependências do Projeto

No terminal, dentro da pasta do projeto (`c:\Users\lucas.arodrigues\Desktop\Flix`), execute:

```bash
npm install
```

Isso irá instalar todas as dependências necessárias (React, TypeScript, Vite, Recharts, etc).

## 🎯 Executar o Projeto

Após instalar as dependências, execute:

```bash
npm run dev
```

O projeto estará disponível em: **http://localhost:5173**

Abra esse endereço no navegador e você verá o LucasFlix funcionando!

## 🛠️ Comandos Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Visualiza o build de produção

## ❓ Problemas Comuns

### "npm não é reconhecido"
- Instale o Node.js conforme instruções acima
- Reinicie o terminal/VS Code após instalar

### Erro ao instalar dependências
- Certifique-se de estar na pasta correta do projeto
- Tente executar: `npm cache clean --force` e depois `npm install` novamente

### Porta 5173 já em uso
- O Vite tentará usar outra porta automaticamente
- Ou pare o processo que está usando a porta 5173

## 📱 Acessar no Celular

1. Execute `npm run dev`
2. O Vite mostrará algo como: `Network: http://192.168.x.x:5173`
3. Acesse esse endereço no navegador do celular (na mesma rede WiFi)

## 🎉 Pronto!

Seu LucasFlix está pronto para uso! Divirta-se registrando suas sessões de filmes!
