# ⚔️ Erebus WebApp

> _"Em terras sombrias, onde dragões cospem fogo e hordas de goblins infestam masmorras, surge um herói carregando seu grimório de códigos em uma mão e uma xícara de café quente na outra."_

**Erebus App** é o frontend SPA do projeto **Erebus** — uma plataforma de mecânicas de jogo que implementa o **Sistema Daemon**, o RPG de mesa brasileiro criado por Marcelo Del Debio. Esta interface permite criar personagens, testar perícias, simular combates e acompanhar logs em tempo real, tudo sem precisar sair do conforto da sua taverna favorita.

Este repositório é **um dos três pilares do ecossistema Erebus**:

| Repositório     | Stack                          | Responsabilidade                     |
| --------------- | ------------------------------ | ------------------------------------ |
| `erebus-engine` | C++17                          | Núcleo de mecânicas de jogo          |
| `erebus-api`    | Node.js + TypeScript + Express | API REST que expõe o engine          |
| `erebus-app`    | Vue 3 + Quasar                 | **Este repositório** — interface web |

---

# 🗺️ Visão Geral da Arquitetura

O frontend é uma **SPA** construída com **Vue 3 + Quasar Framework**, utilizando:

- **Pinia** para gerenciamento de estado
- **Axios** para comunicação com a API REST
- **EventSource (SSE)** para streaming de logs em tempo real
- **vue-i18n** para internacionalização
- **Vite** como bundler — porque a vida é curta demais para esperar o Webpack

### Páginas implementadas

| Página                       | Rota                     | Descrição                                      |
| ---------------------------- | ------------------------ | ---------------------------------------------- |
| `IndexPage`                  | `/`                      | Landing page / início                          |
| `SkillsPage`                 | `/pericias`              | Listagem das 195 perícias do Sistema Daemon    |
| `WeaponsPage`                | `/armas`                 | Listagem de armamentos                         |
| `EnhancementsPage`           | `/aprimoramentos`        | Listagem de aprimoramentos                     |
| `ProtectiveEquipmentPage`    | `/equipamentos-protecao` | Equipamentos de proteção com IPs por dano      |
| `ItemsPage`                  | `/itens`                 | Listagem de itens                              |
| `CombatSkillsPage`           | `/pericias-combate`      | Perícias de combate do Sistema Daemon          |
| `CharacterPage`              | `/personagem`            | Ficha e validação de personagem                |
| `ErrorNotFound`              | fallback 404             | Página de erro                                 |

### Arquitetura de dados

O padrão adotado é **composable → gateway → API** (sem camada `src/services/`):

| Camada        | Localização                     | Responsabilidade                     |
| ------------- | ------------------------------- | ------------------------------------ |
| `composable`  | `src/composables/`              | Lógica de negócio, loading state     |
| `gateway`     | `src/model/gateways/`           | Chamadas HTTP via Axios              |
| `types`       | `src/model/types/`              | Tipos TypeScript da camada de dados  |

### Stores (Pinia)

| Store             | Status      | Responsabilidade                        |
| ----------------- | ----------- | --------------------------------------- |
| `example-store`   | Placeholder | —                                       |
| `character`       | Planejado   | Personagem atual e histórico de geração |
| `ui`              | Planejado   | Estado de página e tema                 |
| `logs`            | Planejado   | Eventos SSE e status de conexão         |
| `api`             | Planejado   | Configurações e estado da API           |

---

# ⚗️ Stack & Dependências

| Categoria           | Tecnologia              | Versão           |
| ------------------- | ----------------------- | ---------------- |
| Framework UI        | Vue 3 + Quasar          | `^3.5` / `^2.16` |
| State Management    | Pinia                   | `^3.0`           |
| HTTP Client         | Axios                   | `^1.2`           |
| Internacionalização | vue-i18n                | `^11.0`          |
| Roteamento          | Vue Router              | `^5.0`           |
| Testes unitários    | Vitest + Vue Test Utils | `^2.0`           |
| Testes E2E          | Cypress                 | `^13.0`          |
| Linting             | ESLint + Prettier       | `^9` / `^3`      |
| Linguagem           | TypeScript              | `^5.9`           |
| Bundler             | Vite (via Quasar CLI)   | —                |

**Node.js requerido:** `^20 || ^22 || ^24 || ^26 || ^28`

---

# 🏰 Começando (Setup Local)

Antes de invocar os feitiços de instalação, certifique-se de que o `erebus-api` está rodando localmente na porta `3000`. Sem a API, o frontend é apenas uma tela bonita — como um cavaleiro sem espada.

### 1. Clone o repositório

```bash
git clone https://github.com/ratto/erebus-app.git
cd erebus-app
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
VITE_API_URL=http://localhost:3000/api/v1
VITE_LOGS_STREAM_URL=http://localhost:3000/api/v1/logs/stream
VITE_APP_TITLE=Erebus Engine
VITE_APP_VERSION=0.1.0
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:9000`. _(Sim, porta 9000 — porque a 3000 já está ocupada pelo backend e a 8080 é território inimigo.)_

---

# 🧪 Testes

O projeto usa **Vitest** para testes unitários e **Cypress** para testes E2E. Nenhum mock de banco de dados foi utilizado na elaboração desses testes — aprendemos da pior forma que mocks mentem mais que bardos bêbados.

```bash
# Testes unitários (single run)
npm run test

# Testes unitários com watch
npm run test:watch

# Cobertura de código
npm run test:coverage

# Testes E2E (headless)
npm run test:e2e

# Testes E2E com interface gráfica
npm run test:e2e:open
```

---

# 🔨 Comandos de Build

```bash
# Build de produção → dist/
npm run build

# Lint do código
npm run lint

# Formatar código com Prettier
npm run format

# Regenerar helpers de tipo do Quasar
quasar prepare
```

---

# 🚀 Deploy

O projeto é implantado automaticamente na **Netlify** a partir da branch `main`. Um redirecionamento SPA está configurado para que todas as rotas apontem para `index.html` — afinal, o roteamento é responsabilidade do Vue Router, não do servidor.

```toml
# netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

# 📜 Domínio — Sistema Daemon

O Sistema Daemon é um RPG de mesa brasileiro com 8 atributos primários:

| Código | Atributo         | Descrição                                     |
| ------ | ---------------- | --------------------------------------------- |
| `FR`   | Força            | Força física e capacidade muscular            |
| `CON`  | Constituição     | Vigor, saúde e condição física                |
| `DEX`  | Destreza         | Habilidade manual e com os pés                |
| `AGI`  | Agilidade        | Velocidade e equilíbrio                       |
| `INT`  | Inteligência     | Raciocínio lógico                             |
| `WILL` | Força de Vontade | Concentração e determinação                   |
| `PER`  | Percepção        | Poder de observação e percepção dos arredores |
| `CAR`  | Carisma          | Charme e presença                             |

**Modos de criação de personagem:**

- **Cenários de Aventura, Fantasia, Espionagem e Heróico** — 111 pontos de atributos para distribuir, atributos iniciais entre 5 e 20, 6 pontos de aprimoramento, e até 500 pontos de perícia.
- **Cenários de Realista, Terror e Horror Medieval** — 101 pontos _(para quem gosta de sofrer)_, atributos iniciais entre 5 e 18, 5 pontos de aprimoramento, e até 500 pontos de perícia.
- **Cenários para Imortais e Heróis** — 131 pontos de atributos para distribuir, atributos iniciais entre 12 e 30, 1 ponto de aprimoramento para cada 20 anos de vida.

**Fórmula de capacidade física:** `Y = K × 2^(Atributo / 6)`

---

# 🤝 Contribuindo

Este projeto está em desenvolvimento ativo. Contribuições são bem-vindas — especialmente as que vêm acompanhadas de testes e sem `console.log` esquecido no código de produção.

1. Fork o repositório
2. Crie sua branch: `git checkout -b feature/minha-magia`
3. Commit suas mudanças: `git commit -m 'feat: adicionar feitiço de autocomplete'`
4. Push para a branch: `git push origin feature/minha-magia`
5. Abra um Pull Request

---

# ☕ Apoie o Projeto

Se este projeto te ajudou a criar personagens, simular batalhas épicas ou simplesmente te fez sorrir enquanto bebericava seu café às 2h da manhã depurando TypeScript — considere apoiar o desenvolvimento.

Cada contribuição vai diretamente para o fundo de café da taverna (e talvez para um servidor melhor).

[![Doe via PayPal](https://img.shields.io/badge/Doe-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=8RE442ASFC2PS)

---

# 📄 Licença

Este projeto está sob a licença **Generic Public License v2.0**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

_Feito com ⚔️, ☕ e uma quantidade irresponsável de TypeScript._
