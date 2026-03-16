# PRD: Erebus Web App (SPA)

**Versão:** 1.0  
**Data de Criação:** 16/03/2026  
**Status:** Iniciado  
**Repositório:** `github.com/org/erebus-app`

---

## 1. Visão Geral do Produto

O **Erebus Web App** é a interface de referência do Erebus Engine. Trata-se de uma **SPA (Single Page Application)** desenvolvida em **Vue 3 + Quasar + TypeScript** que:

- Demonstra as capacidades da engine de forma interativa e visual
- Consome endpoints da Erebus API Server via Fetch/Axios
- Exibe logs em tempo real do Core C++ via SSE (Server-Sent Events)
- Serve como documentação viva e ponto de entrada para novos desenvolvedores
- É publicada no **Netlify** com deploy automático a cada push na branch main

### Missão

Fornecer uma experiência de usuário intuitiva que permita explorar o Sistema Daemon de forma visual e interativa, além de servir como prototipo e documentação das capacidades da engine.

---

## 2. Objetivos do Produto

### Objetivos Primários (MVP)

1. **Criar interface intuitiva** para criação e visualização de personagens do Sistema Daemon
2. **Permitir testes interativos** de perícias com visualização de resultados em tempo real
3. **Simular combate** de forma interativa, turno a turno
4. **Exibir logs do Core** em painel dedicado com atualização em tempo real via SSE
5. **Documentar endpoints da API** com Swagger UI integrada
6. **Publicar em produção no Netlify** com deploy automático
7. **Oferecer experiência PWA-ready** (offline capable, installable)

### Objetivos Secundários (Pós-MVP)

- Adicionar editor visual de ficha de personagem (arrastar atributos, distribuir pontos)
- Salvar personagens localmente (IndexedDB) e na nuvem (com autenticação)
- Suporte a múltiplos idiomas (português, inglês, espanhol)
- Temas escuro/claro
- Mobile-first com suporte a Capacitor (iOS/Android)

---

## 3. User Personas

| Persona | Descrição | Necessidades |
|---------|-----------|--------------|
| **Game Developer** | Dev criando jogo baseado em Sistema Daemon | Interface clara do fluxo, logs em tempo real, API docs integrada |
| **Community Member** | Mestre, jogador ou fã do Sistema Daemon | Interface bonita, intuitiva, em português, que respeite o sistema |
| **Primeiro Contato** | Pessoa descobrindo o Erebus Engine pela primeira vez | Onboarding claro, demo rápida, exemplos de uso |
| **DevOps/Infra** | Responsável por deploy em produção | Netlify pronto para deploy, CI/CD automático, healthcheck |
| **Contributor** | Contribuidor open source no projeto | Código limpo, fácil de estender, componentes reutilizáveis |

---

## 4. Escopo do MVP

### O que está dentro do escopo

- ✅ **Quasar Framework 2** com Vue 3 (Composition API) e TypeScript
- ✅ **Vite 5** como bundler (build rápido)
- ✅ **Pinia** para state management (armazenar personagens, ui state)
- ✅ **Axios** para HTTP client (consumir erebus-api)
- ✅ **EventSource** para SSE (logs em tempo real)
- ✅ **Swagger UI** embutida para documentação interativa
- ✅ **Telas principais:**
  - Character Creation (distribuição de atributos)
  - Character Sheet (ficha completa)
  - Skill Testing (interface de teste)
  - Combat Simulator (turno a turno)
  - Logs Viewer (painel em tempo real)
  - API Documentation (Swagger)
- ✅ **Netlify Deploy** com CI/CD automático
- ✅ **Responsive Design** (desktop, tablet, mobile)
- ✅ **Testes automatizados** (Vitest + Vue Test Utils)
- ✅ **Documentação** (README, screenshots, guia de uso)

### O que está fora do escopo (MVP)

- ❌ Salvamento de personagens em servidor (apenas localStorage/sessão)
- ❌ Autenticação e perfis de usuário
- ❌ Modo offline completo (PWA avançada)
- ❌ Suporte a mobile nativo (Capacitor/Electron)
- ❌ Múltiplos idiomas (apenas português)
- ❌ Editor visual drag-and-drop de atributos
- ❌ Geração de PDF de ficha
- ❌ Integração com Discord/Twitch
- ❌ Suporte a WebSocket (apenas SSE)

---

## 5. Requisitos Funcionais

### RF-1: Página Inicial e Navegação

**Descrição:** Landing page com navegação principal e menu lateral.

**Elementos:**
- [ ] Logo do Erebus Engine
- [ ] Menu de navegação (Character Creator, Skills, Combat, Logs, API Docs)
- [ ] Footer com links (GitHub, Discord, Daemon Site)
- [ ] Navbar responsivo (hamburger menu em mobile)
- [ ] Breadcrumb navigation em cada página

**Critérios de Aceite:**
- [ ] Navegação funciona em desktop e mobile
- [ ] Componentes Quasar reutilizáveis
- [ ] Acessibilidade WCAG 2.1 AA
- [ ] Testes: 3+ casos de navegação

---

### RF-2: Character Creator

**Tela:** `/character-creator`

**Descrição:** Interface para criar novo personagem com distribuição de atributos.

**Componentes:**
1. **Seleção de Modo**
   - [ ] Botões para escolher "Realista" (101 pts) ou "Aventura" (111 pts)
   - [ ] Botão "Gerar Aleatório" que chama API

2. **Distribuição de Atributos** (apenas modo manual, futuro)
   - [ ] Sliders ou input numérico para cada atributo (FOR, AGI, CON, INT, PRE, VON, PHI, ELE)
   - [ ] Validação de pontos totais
   - [ ] Reset button

3. **Visualização em Tempo Real**
   - [ ] Exibição dos 8 atributos
   - [ ] Cálculo automático de derivados (vida, magia, defesa, resistência, movimento)
   - [ ] Previsão de pontos disponíveis

4. **Ações**
   - [ ] Botão "Gerar" que chama `GET /api/v1/characters/create`
   - [ ] Botão "Usar Este Personagem" que salva em Pinia
   - [ ] Botão "Tentar Novamente" para novo personagem

**Request (API):**
```
GET /api/v1/characters/create?mode=adventure
```

**Response (API):**
```json
{
  "id": "char-123abc",
  "name": "Generated Name",
  "attributes": { "FOR": 50, "AGI": 45, ... },
  "derived": { "life": 45, "magic": 30, ... }
}
```

**State (Pinia):**
```javascript
{
  currentCharacter: { /* character data */ },
  selectedMode: 'adventure',
  generationHistory: [ /* últimos 5 gerados */ ]
}
```

**Critérios de Aceite:**
- [ ] Personagem gerado em < 2 segundos
- [ ] Atributos derivados calculados corretamente (visualmente correspondem à API)
- [ ] Modo realista vs aventura diferem em pontos (101 vs 111)
- [ ] Histórico de personagens armazenado (últimos 5)
- [ ] Responsive design em mobile
- [ ] Testes: 10+ casos (geração, modos, validação, erros)

---

### RF-3: Character Sheet (Ficha)

**Tela:** `/character/{id}` ou `/character-sheet`

**Descrição:** Exibição completa da ficha do personagem gerado.

**Seções:**
1. **Header**
   - [ ] Nome do personagem
   - [ ] Data de criação
   - [ ] Botões: Editar (futuro), Deletar, Exportar JSON

2. **Atributos Principais**
   - [ ] Grid 2x4 com os 8 atributos
   - [ ] Ícone visual para cada atributo
   - [ ] Cor de fundo que varia por valor (verde forte, amarelo médio, vermelho fraco)

3. **Derivados**
   - [ ] Cards com vida, magia, defesa, resistência, movimento
   - [ ] Cálculos em tempo real conforme atributos

4. **Perícias** (futuro, MVP básico)
   - [ ] Tabela com perícias padrão
   - [ ] Coluna de ranks (0-5)
   - [ ] Coluna de modificador

5. **Ações**
   - [ ] Botão "Testar Perícia" → vai para Skill Testing
   - [ ] Botão "Iniciar Combate" → vai para Combat Simulator
   - [ ] Botão "Voltar" → volta ao Character Creator

**Critérios de Aceite:**
- [ ] Ficha exibida completa e legível em desktop e mobile
- [ ] Cores e ícones com visual polish (tema Daemon)
- [ ] Cálculos dos derivados conferem com API
- [ ] Navegação para outras telas funciona
- [ ] Print-friendly (CSS media query para impressão)
- [ ] Testes: 8+ casos (exibição, cálculos, navegação)

---

### RF-4: Skill Testing

**Tela:** `/skill-testing`

**Descrição:** Interface para testar perícias do personagem.

**Componentes:**
1. **Seletor de Perícia**
   - [ ] Dropdown/select com ~150 perícias (consumidas de `GET /api/v1/skills`)
   - [ ] Busca por nome/categoria
   - [ ] Exibição de atributo-base e descrição

2. **Modificadores**
   - [ ] Input numérico para modificador manual (dificuldade, bônus de item, etc.)
   - [ ] Slider ou buttons (+1, +2, -1, -2)
   - [ ] Campo opcional para notas ("Tentando durante tempestade", etc.)

3. **Botão de Teste**
   - [ ] "Executar Teste" que chama `POST /api/v1/skills/test`

4. **Resultado**
   - [ ] Exibição do resultado em card grande e visual
   - [ ] **Sucesso Crítico** (roll 20): fundo verde, ícone especial
   - [ ] **Sucesso Normal**: verde claro
   - [ ] **Falha Normal**: vermelho claro
   - [ ] **Falha Crítica** (roll 1): vermelho escuro, ícone especial
   - [ ] Margem de sucesso/falha ("Sucesso por 12 pontos!")
   - [ ] Breakdown: roll, modificadores, base

5. **Histórico**
   - [ ] Lista dos últimos 10 testes na sessão
   - [ ] Filtrável por perícia ou resultado

**Request (API):**
```json
POST /api/v1/skills/test
{
  "characterId": "char-123abc",
  "skillId": "skill-456",
  "modifier": 0,
  "difficulty": 0
}
```

**Response (API):**
```json
{
  "testId": "test-789",
  "skillName": "Espada",
  "roll": 65,
  "success": true,
  "margin": 12,
  "resultDetails": { /* ... */ }
}
```

**Critérios de Aceite:**
- [ ] Teste executa em < 2s
- [ ] Resultado visual corresponde ao retorno da API
- [ ] Modificadores aplicados corretamente
- [ ] Histórico persiste durante sessão (Pinia)
- [ ] Busca de perícia funciona
- [ ] Responsive design
- [ ] Testes: 12+ casos (sucesso/falha críticos, modificadores, histórico)

---

### RF-5: Combat Simulator

**Tela:** `/combat`

**Descrição:** Simulador interativo de combate turno a turno.

**Setup**
1. **Criar Combatentes**
   - [ ] Usar personagem gerado atual como atacante (padrão)
   - [ ] Gerar oponente aleatório via `GET /api/v1/characters/create`
   - [ ] Opção de trocar atacante/defensor
   - [ ] Exibir vida/magia de cada um

2. **Interface de Combate**
   - [ ] Dois cards lado a lado (atacante esquerda, defensor direita)
   - [ ] Exibir atributos relevantes (FOR, AGI, VON, DEF, RES)
   - [ ] Barras de vida (HP) com animação
   - [ ] Barras de magia (MP) com animação

3. **Turno**
   - [ ] Seleção de ação do atacante: Attack, Defend, Cast, Dodge, Retreat
   - [ ] Seleção de perícia/magia (se aplicável)
   - [ ] Botão "Executar Turno" → chama `POST /api/v1/combat/resolve`

4. **Resultado do Turno**
   - [ ] Exibição animada do resultado
   - [ ] "Ataque acertou! Dano: 28 HP"
   - [ ] Atualização visual de barras de HP/MP
   - [ ] Log do turno no histórico abaixo

5. **Histórico de Combate**
   - [ ] Lista dos últimos 20 turnos com ações e resultados
   - [ ] Scroll automático para turno mais recente

6. **Fim de Combate**
   - [ ] Botão "Novo Combate"
   - [ ] Botão "Voltar"
   - [ ] Exibição de vencedor quando HP chega a 0

**Request (API):**
```json
POST /api/v1/combat/resolve
{
  "attacker": {
    "characterId": "char-123abc",
    "actionType": "attack",
    "skillId": "skill-123"
  },
  "defender": {
    "characterId": "char-456def",
    "actionType": "defend"
  }
}
```

**Response (API):**
```json
{
  "combatId": "combat-001",
  "turn": 1,
  "result": "hit",
  "damage": 28,
  "attackerHealthAfter": 40,
  "defenderHealthAfter": 17
}
```

**Critérios de Aceite:**
- [ ] Combate simples (1v1) funciona do start ao fim
- [ ] Turno executa em < 2s
- [ ] Barras de HP/MP atualizam corretamente
- [ ] Resultado visual é claro e entendível
- [ ] Histórico de turnos exibido e editável
- [ ] Responsive design (mobile vê um combatente por vez, depois o outro)
- [ ] Testes: 15+ casos (ataque/defesa, críticos, fim de combate, erros)

---

### RF-6: Logs Viewer em Tempo Real

**Tela:** `/logs` ou painel flutuante

**Descrição:** Painel que exibe logs do Core C++ em tempo real via SSE.

**Componentes:**
1. **Connection Status**
   - [ ] Indicator verde/vermelho mostrando status de conexão SSE
   - [ ] "Conectado", "Desconectado", "Reconectando..."

2. **Log List**
   - [ ] Lista de eventos com scroll infinito (últimos 500)
   - [ ] Cada evento mostra: timestamp, tipo (SkillTested, CombatResolved, CharacterCreated), dados

3. **Filtros**
   - [ ] Dropdown: Todos, SkillTested, CombatResolved, CharacterCreated
   - [ ] Busca por texto
   - [ ] Limpar histórico de logs

4. **Visual**
   - [ ] Código JSON colorido (syntax highlighting)
   - [ ] Ícones diferentes por tipo de evento
   - [ ] Linhas alternadas (zebra striping)

5. **Ações**
   - [ ] Botão "Copiar JSON" para cada log
   - [ ] Botão "Expandir/Colapsar" para ver detalhe completo
   - [ ] Botão "Auto-scroll" (toggle)

**API (SSE):**
```
GET /api/v1/logs/stream

data: {"type":"SkillTested","characterId":"char-123","skillName":"Espada","success":true,"timestamp":"..."}
```

**Critérios de Aceite:**
- [ ] Conexão SSE mantida aberta
- [ ] Eventos chegam em < 500ms após ocorrer
- [ ] Eventos exibidos com formatação legível
- [ ] Filtros funcionam corretamente
- [ ] Suporta múltiplos eventos simultâneos (sem duplicação)
- [ ] Disconnect/Reconnect automático (retry exponencial)
- [ ] Testes: 10+ casos (conexão, filtros, múltiplos eventos, disconnect)

---

### RF-7: API Documentation

**Tela:** `/api-docs` ou `/swagger`

**Descrição:** Swagger UI embutida mostrando documentação interativa de todos os endpoints.

**Elementos:**
- [ ] Swagger UI padrão (swagger-ui-dist)
- [ ] Todos os endpoints do erebus-api documentados
- [ ] "Try It Out" funciona para testar endpoints
- [ ] Schemas de request/response visíveis
- [ ] Exemplos de responses populados
- [ ] Autenticação básica configurada (futuro)

**Critérios de Aceite:**
- [ ] Swagger carrega sem erros
- [ ] Todos os endpoints da API listados
- [ ] "Try It Out" permite testar contra API ao vivo
- [ ] Schemas bem formatados
- [ ] Acessível em URL clara

---

### RF-8: Responsive Design & Mobile

**Descrição:** A aplicação funciona em desktop, tablet e mobile.

**Breakpoints (Quasar):**
- [ ] xs (0-599px): mobile phone
- [ ] sm (600-1023px): tablet portrait
- [ ] md (1024-1439px): tablet landscape / small desktop
- [ ] lg (1440px+): desktop

**Componentes Móveis:**
- [ ] Menu hamburger em xs/sm
- [ ] Componentes stack verticalmente em xs
- [ ] Touch-friendly buttons (min 44x44px)
- [ ] Swipe para navegar entre telas (futuro)

**Critérios de Aceite:**
- [ ] Testado em Chrome mobile, Safari iOS, Firefox mobile
- [ ] Sem horizontal scroll
- [ ] Botões e inputs clicáveis com dedo
- [ ] Testes: 5+ casos de responsive

---

## 6. Requisitos Não-Funcionais

| Requisito | Critério | Métrica |
|-----------|----------|---------|
| **Performance** | Build size | < 500 KB (gzip) |
| **Performance** | Lighthouse Score | > 90 (Performance, Accessibility) |
| **Performance** | Time to Interactive (TTI) | < 3s (desktop), < 5s (mobile 4G) |
| **Acessibilidade** | WCAG Compliance | 2.1 AA |
| **Testabilidade** | Unit Test Coverage | > 70% |
| **Compatibilidade** | Browser Support | Chrome, Firefox, Safari, Edge (últimas 2 versões) |
| **SEO** | Meta tags | Preenchidos, Open Graph para share |
| **Build Determinístico** | Reproduzibilidade | `npm run build` sempre gera mesmo hash |
| **Deployment** | Deploy time | < 5 minutos (Netlify) |
| **Reliability** | Error Handling | Graceful fallbacks, user-friendly messages |

---

## 7. Arquitetura Técnica

### Estrutura de Diretórios

```
erebus-app/
├── src/
│   ├── components/              # Componentes Vue reutilizáveis
│   │   ├── CharacterForm.vue
│   │   ├── SkillSelector.vue
│   │   ├── CombatBoard.vue
│   │   ├── LogViewer.vue
│   │   └── ...
│   ├── pages/                   # Páginas (rotas)
│   │   ├── HomePage.vue
│   │   ├── CharacterCreator.vue
│   │   ├── CharacterSheet.vue
│   │   ├── SkillTesting.vue
│   │   ├── CombatSimulator.vue
│   │   ├── LogsPage.vue
│   │   └── ApiDocsPage.vue
│   ├── stores/                  # Pinia stores (state management)
│   │   ├── character.ts
│   │   ├── ui.ts
│   │   ├── logs.ts
│   │   └── api.ts
│   ├── services/                # API client e serviços
│   │   ├── api.ts              # Axios instance, base config
│   │   ├── character.service.ts
│   │   ├── skill.service.ts
│   │   ├── combat.service.ts
│   │   └── logs.service.ts     # SSE handler
│   ├── types/                   # TypeScript interfaces
│   │   ├── character.ts
│   │   ├── skill.ts
│   │   ├── combat.ts
│   │   └── api.ts
│   ├── utils/                   # Funções utilitárias
│   │   ├── formatters.ts       # Formatação de valores
│   │   ├── validators.ts       # Validação de inputs
│   │   └── constants.ts
│   ├── assets/                  # Imagens, ícones, fontes
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   ├── css/                     # Estilos globais
│   │   ├── app.css
│   │   ├── variables.css       # CSS variables para tema
│   │   └── ...
│   ├── App.vue                 # Componente raiz
│   ├── main.ts                 # Entry point
│   ├── router.ts               # Vue Router config
│   └── quasar.conf.ts          # Quasar config
├── tests/
│   ├── unit/                    # Testes unitários
│   ├── integration/             # Testes de integração
│   └── e2e/                     # Testes E2E (Playwright)
├── public/                      # Arquivos estáticos (favicon, manifest)
├── .netlify/                    # Configuração do Netlify
│   └── netlify.toml
├── .github/workflows/           # CI/CD
│   └── deploy.yml
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── README.md
├── CONTRIBUTING.md
└── LICENSE (MIT/Apache 2.0)
```

### Stack Técnica

- **Framework UI:** Vue 3 (Composition API)
- **Meta-framework:** Quasar Framework 2
- **Bundler:** Vite 5
- **Linguagem:** TypeScript 5
- **State Management:** Pinia
- **HTTP Client:** Axios
- **Router:** Vue Router 4
- **CSS:** Tailwind CSS (com Quasar components)
- **Testes Unitários:** Vitest + Vue Test Utils
- **Testes E2E:** Playwright
- **Linting:** ESLint + Prettier
- **Deployment:** Netlify

### Arquitetura de Componentes

```
App.vue
├── MainLayout.vue
│   ├── Navbar.vue
│   ├── Sidebar.vue (mobile hamburguer)
│   └── RouterView (página ativa)
│       ├── CharacterCreator.vue
│       │   └── CharacterForm.vue
│       ├── CharacterSheet.vue
│       │   ├── AttributesGrid.vue
│       │   ├── DerivedStats.vue
│       │   └── SkillsTable.vue
│       ├── SkillTesting.vue
│       │   ├── SkillSelector.vue
│       │   └── TestResult.vue
│       ├── CombatSimulator.vue
│       │   ├── CombatBoard.vue
│       │   ├── ActionPanel.vue
│       │   └── TurnHistory.vue
│       ├── LogsPage.vue
│       │   └── LogViewer.vue
│       └── ApiDocsPage.vue
│           └── SwaggerUI (iframe ou embedded)
└── Footer.vue
```

### State Management (Pinia)

```typescript
// stores/character.ts
export const useCharacterStore = defineStore('character', () => {
  const currentCharacter = ref<Character | null>(null);
  const generationHistory = ref<Character[]>([]);
  
  const generateCharacter = async (mode: 'realistic' | 'adventure') => { /* ... */ }
  const setCurrentCharacter = (char: Character) => { /* ... */ }
  
  return { currentCharacter, generationHistory, generateCharacter, setCurrentCharacter }
})

// stores/ui.ts
export const useUIStore = defineStore('ui', () => {
  const currentPage = ref('home');
  const isDarkMode = ref(false);
  
  const navigateTo = (page: string) => { /* ... */ }
  const toggleDarkMode = () => { /* ... */ }
})

// stores/logs.ts
export const useLogsStore = defineStore('logs', () => {
  const logs = ref<GameEvent[]>([]);
  const isConnected = ref(false);
  const filter = ref('all');
  
  const addLog = (event: GameEvent) => { /* ... */ }
  const clearLogs = () => { /* ... */ }
  const setConnection = (connected: boolean) => { /* ... */ }
})
```

---

## 8. Critérios de Aceite (DoD Global)

- ✅ TypeScript compilando sem errors, strict mode ativo
- ✅ Cobertura de testes > 70% (services e components)
- ✅ PR review por pelo menos um desenvolvedor
- ✅ Todos os testes passando no CI
- ✅ Sem console.log (usar logs estruturados ou remover)
- ✅ Componentes Vue com TypeScript types completos
- ✅ Build determinístico (npm run build sempre gera mesmo hash)
- ✅ Netlify deploy automático funciona
- ✅ Nenhum erro no navegador (console limpo)
- ✅ Lighthouse score > 90 (Performance, Accessibility, Best Practices)
- ✅ Acessível via teclado (tab navigation, aria labels)

---

## 9. Métricas de Sucesso

| Métrica | Meta MVP | Meta Longo Prazo |
|---------|----------|------------------|
| **Lighthouse** | > 90 | > 95 |
| **Bundle Size** | < 500 KB (gzip) | < 400 KB |
| **TTI** | < 3s (desktop) | < 2s |
| **Test Coverage** | > 70% | > 85% |
| **Accessibility** | WCAG 2.1 AA | WCAG 2.1 AAA |
| **Browser Support** | 2 versões recentes | 3 versões recentes |
| **Uptime (Netlify)** | 99% | 99.9% |
| **Page Views (MVP)** | 1000+ | 10000+ |

---

## 10. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|--------|-----------|
| API indisponível (breaks app) | Média | Alto | Implementar retry logic, cache de últimas respostas em IndexedDB |
| Performance ruim em mobile 4G | Média | Médio | Lazy loading, code splitting, otimização de imagens desde Sprint 2 |
| SSE desconecta frequentemente | Baixa | Médio | Reconnect automático com exponential backoff |
| Navegador antigo não suporta features | Baixa | Médio | Polyfills, feature detection, fallbacks |

---

## 11. Dependências e Integrações

### Dependências Internas

- **erebus-api** - Consumir endpoints via Axios
- **erebus-engine** (indiretamente via API)

### Dependências Externas

- **Vue 3** - Framework web
- **Quasar Framework 2** - UI components
- **Vite 5** - Bundler
- **Pinia** - State management
- **Axios** - HTTP client
- **Netlify** - Deployment
- **Google Fonts** - Tipografia

---

## 12. Configuração e Deployment

### Environment Variables (MVP)

```bash
# API
VITE_API_URL=http://localhost:3000/api/v1
VITE_LOGS_STREAM_URL=http://localhost:3000/api/v1/logs/stream

# Aplicação
VITE_APP_TITLE=Erebus Engine
VITE_APP_VERSION=0.1.0
```

### Netlify Configuration (netlify.toml)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production]
  environment = { VITE_API_URL = "https://erebus-api.example.com/api/v1" }

[context.deploy-preview]
  environment = { VITE_API_URL = "http://localhost:3000/api/v1" }
```

### GitHub Actions (deploy.yml)

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      - uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './dist'
          netlify-token: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

---

## 13. Glossário

| Termo | Definição |
|-------|-----------|
| **SPA** | Single Page Application - app que carrega uma vez e usa JavaScript para navegar |
| **Pinia** | State management library para Vue (successor do Vuex) |
| **SSE** | Server-Sent Events - protocolo HTTP para push de dados do servidor |
| **Quasar** | Meta-framework Vue com componentes e build otimizados |
| **Vite** | Bundler moderno que usa ES modules nativo para dev rápido |
| **Netlify** | Platform de deploy de SPAs com CI/CD integrado |

---

## 14. Documentação Necessária

- [ ] **README.md** - Overview, quickstart, screenshots, como rodarclocalmente
- [ ] **CONTRIBUTING.md** - Setup, workflow de desenvolvimento, testes, commit convention
- [ ] **DEPLOYMENT.md** - Como fazer deploy no Netlify, variáveis de ambiente
- [ ] **ARCHITECTURE.md** - Estrutura de componentes, state management, padrões
- [ ] **COMPONENT_LIBRARY.md** - Documentação de componentes reutilizáveis (Storybook, futuro)
- [ ] **TESTING.md** - Como rodar testes, cobertura, fixtures
- [ ] **.env.example** - Template de variáveis

---

## 15. Revisões e Aprovações

| Papel | Nome | Assinatura | Data |
|------|------|-----------|------|
| **Product Owner** | [Nome] | ________________ | __/__/____ |
| **Tech Lead (Frontend)** | [Nome] | ________________ | __/__/____ |
| **Design Lead** | [Nome] | ________________ | __/__/____ |

---

**Próximo Review:** 30/04/2026  
**Última Atualização:** 16/03/2026
