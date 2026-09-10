# Design System — Project Erebus

- **Autor:** rattopedro@gmail.com
- **Data:** 2026-09-10
- **Status:** v1 — direção escolhida: **Códice** (Opção A), corpo em sans, prioridade em densidade de dados
- **Documentos relacionados:** `uploads/prd.md` (PRD Fase 1), `uploads/sistema-daemon-manual-basico.md` (Módulo Básico, v1.04 Dez/2022), `docs/decisions/ADR-001-weapon-taxonomy-melee-ranged-firearms.md`
- **Escopo:** identidade visual e componentes de `erebus-app` (Fase 1 e adiante)

---

## 1. Contexto

### 1.1 O produto

`erebus-app` (React + Vite + TypeScript, MVVM) é a interface de consulta às tabelas do Sistema Daemon servidas por `erebus-api`: **armas brancas, armas à distância, armas de fogo, proteções, perícias e aprimoramentos**. Fase 1 é read-only: listar, buscar por nome, filtrar e ver detalhe.

O PRD declara que a Fase 1 **não exige** identidade visual definitiva e prioriza usabilidade de busca/filtro. Este documento, portanto, não expande escopo de engenharia: define a identidade que a Fase 1 já pode adotar sem custo (tokens, tipografia, um punhado de componentes) e que sustenta as fases seguintes.

### 1.2 Tese visual

> **Project Erebus é um resgate à fantasia medieval no lightmode e ao horror medieval no darkmode.**

Os dois modos não são "claro e escuro" do mesmo tema — são dois registros narrativos do mesmo mundo:

| | Lightmode — fantasia medieval | Darkmode — horror medieval |
|---|---|---|
| Registro | luz de dia, ofício, catálogo, ordem | vela, cripta, ameaça, decomposição |
| Função no produto | consulta e planejamento (montar personagem, comparar armas) | mesa em sessão, leitura em ambiente escuro |
| Campanhas espelhadas | Aventura/Fantasia (111 pts) | Horror Medieval (101 pts), Realista/Terror |
| Acento | ouro / âmbar / tinta | sangue seco / ferida / vitral aceso |

### 1.3 Requisitos que a UI precisa carregar

Três exigências do PRD são **visuais**, não só de dados:

1. **Proveniência sempre visível.** Todo registro tem `sourceLevel` (1–3) e `source`. Nível 2/3 **nunca** pode parecer Nível 1. Isso exige um componente de badge com hierarquia visual inequívoca e leitura sem depender de cor sozinha (rótulo textual + peso/borda).
2. **Taxonomia de regras acima da taxonomia de navegação (ADR-001).** `category` (melee / ranged / firearm) é auxílio de navegação; `skillGroup` (`Armas Brancas*` / `Armas de Fogo*`) é a regra. No detalhe de arma, `skillGroup` é campo de primeira classe; na listagem de armas à distância existe nota fixa de que arcos e bestas testam `Armas Brancas*`.
3. **Estados de carregamento e erro** (API fora, item não encontrado) têm tratamento visual próprio — não são exceções silenciosas.

### 1.4 Tipos de Campanha (Módulo Básico, Passo 1)

Vocabulário canônico do sistema; a UI usa esses nomes literalmente e o design system precisa acomodar os cinco como categoria/filtro.

| Tipo de Campanha | Atributos | Aprimoramentos | Perícias | Inimigos | Exemplos |
|---|---|---|---|---|---|
| **Realista/Terror** | 101 pontos (5–18) | 5 | até 500 | 1 inicial | TREVAS, INVASÃO, INIMIGO NATURAL |
| **Aventura/Fantasia** | 111 pontos (5–20) | 6 | até 500 | 1 inicial | TORMENTA, ARCÁDIA, TEMPLÁRIOS |
| **Horror Medieval** | 101 pontos (5–18) | 5 | até 500 | ao menos 1 | ARKANUN, INQUISIÇÃO |
| **Espionagem/Heroico** | 111 pontos (5–20) | 6 | até 500 | ao menos 2 | época contemporânea |
| **Imortais/Heróis** | 131 pontos (12–30) | 1 pt a cada 20 anos de vida | — | mínimo 2 | ANJOS, DEMÔNIOS, VAMPIROS, SPIRITUM |

Notas do manual:
- **Realista/Terror** — geralmente época moderna, mas serve a qualquer período.
- **Aventura/Fantasia** — geralmente Medieval Fantástico, com magos, elfos, duendes.
- **Horror Medieval** — "um dos favoritos dos jogadores".
- **Espionagem/Heroico** — época contemporânea.
- **Imortais/Heróis** — vampiros, dragões, anjos caídos, demônios, nephalins, semideuses; 1 ponto de Aprimoramento por 20 anos de vida, 1 inimigo por 50 anos (mínimo 2).
- **Outros Ambientes** — regras genéricas: II Guerra, Egito Antigo, Piratas, Japão Feudal, Renascença, Império Romano, futurista, Vietnã.

**Consequência de design:** a época limita o conteúdo válido (armas de fogo não existem até 1400+; equipamento medieval tem lista própria no manual). O design system trata **Época/Tipo de Campanha como filtro de primeira classe** — a mesma faceta que decide se "metralhadora" aparece numa campanha medieval. Os dois modos do tema mapeiam para as duas campanhas medievais: Aventura/Fantasia (light) e Horror Medieval (dark).

---

## 2. Fundações comuns às três direções

Independentes da direção escolhida:

- **Tokens em dois temas**, mesmos nomes semânticos: `bg`, `surface`, `ink`, `ink-muted`, `rule`, `accent`, `accent-2`. Troca via `data-theme="light|dark"` no `<html>`, valores em custom properties.
- **Escala tipográfica** (rem): 11 · 12 · 13 · 15 · 16 · 19 · 21 · 26 · 34 · 42 · 60. Parágrafo 19px; célula de tabela 16px; dados nunca abaixo de 11px (só rótulos caixa-alta em mono).
- **Serifa nunca em texto corrido** — legibilidade em tela; serifa é exclusiva de display ≥26px.
- **Escala de espaço** (px, base 4): 4 · 8 · 12 · 16 · 22 · 28 · 40 · 56 · 80.
- **Dados em fonte monoespaçada ou tabular**: dano, iniciativa, alcance, calibre, custo, `sourceLevel`, IDs. Regra e número nunca em fonte de corpo.
- **Contraste** ≥ 4.5:1 para texto; ≥ 3:1 apenas para display. Badges de nível são legíveis em monocromático.
- **Sem raios grandes, sem sombras difusas, sem gradientes decorativos.** Todas as três direções são de matéria (papel, pedra, madeira), não de vidro.
- **Componentes do inventário Fase 1:** AppShell + alternância de tema · SearchField · FilterBar (nível de fonte, atributo-base, faixa de custo, alcance, calibre) · SourceLevelBadge (N1/N2/N3) · EntityList (grade de cards ou tabela) · EntityRow · DetailPanel · SkillGroupField (destacado, ADR-001) · ProvenanceBlock (`sourceLevel` + `source` + edição/versão) · TaxonomyNote · EmptyState · ErrorState (API indisponível / 404) · Skeleton.
- **Imagens:** nenhuma arte proprietária de terceiros. Onde houver imagem, placeholder listrado com rótulo monoespaçado até material real ser fornecido.

---

## 3. As três direções

### Opção A — **Códice** — ESCOLHIDA (`ds-opcao-a-codice.dc.html`)

O manuscrito iluminado como interface: pergaminho, tinta ferro-gálica, rubricação em vermelhão e ouro. Nível de fonte lido como rubrica — o vermelhão é a marca do canônico. Ver a especificação consolidada na seção 4.

- **Tipografia:** EB Garamond (só display) · Alegreya Sans (corpo e UI) · IBM Plex Mono (dados, IDs, proveniência)
- **Light:** `#EFE6D4` pergaminho · `#F7F1E3` fólio · `#211B14` tinta · `#A32A1E` vermelhão · `#9C7A2E` ouro
- **Dark:** `#12100E` velino queimado · `#1B1815` fólio noturno · `#E8E0D0` osso · `#C43A22` sangue seco · `#A98A3E` ouro fosco
- **Forma:** filete de 1px, borda-de-acento de 3px à esquerda dos cards, zero raio
- **Prós:** o mais "livro de regras" dos três; cor quente favorece leitura longa de tabelas; rubricação dá ao badge de nível um lugar histórico natural
- **Riscos a vigiar:** pergaminho é o clichê mais previsível do gênero — sem textura de fundo, sem ornamento além do filete de acento

### Opção B — **Ferro & Vitral** (`ds-opcao-b-ferro-vitral.dc.html`)

Arquitetura em vez de papel: calcário, ferro forjado e um raio de vitral (cobalto + âmbar). Capitais romanas nos títulos, dados em grade tabular densa — o mais próximo de uma ferramenta profissional de consulta.

- **Tipografia:** Cinzel (títulos, navegação) · Spectral (corpo) · Roboto Mono (dados)
- **Light:** `#E6E7E4` calcário · `#F4F5F3` cal · `#1C1F21` ferro · `#23477F` cobalto · `#B8791C` âmbar
- **Dark:** `#0F1214` nave escura · `#171B1E` cripta · `#DDE3E6` estanho · `#4E7ECB` vitral aceso · `#C98A2A` tocha
- **Forma:** tabelas com cabeçalho em bloco escuro, linhas zebradas, botões retangulares sólidos
- **Prós:** melhor densidade de dados dos três; dois acentos permitem codificar N1 vs N2 por cor sem ambiguidade; escala bem para as fases futuras (motor, fichas)
- **Contras:** o mais frio; horror medieval fica mais "gótico institucional" que assustador; Cinzel em caixa-alta cansa se usado além de títulos

### Opção C — **Xilogravura** (`ds-opcao-c-xilogravura.dc.html`)

Impressão em madeira: linho cru, preto absoluto, um único sanguíneo. Sem gradiente, sem sombra — filetes de 2px, blocos cheios, contraste brutal. O darkmode é literalmente o negativo da matriz.

- **Tipografia:** Grenze Gotisch (só display) · Alegreya (corpo) · Alegreya Sans (rótulos, dados)
- **Light:** `#F2EFE9` linho · `#FFFFFF` papel · `#0D0D0C` tinta · `#8C2B22` sanguíneo
- **Dark:** `#0B0B0A` matriz · `#121211` bloco · `#EDEAE3` giz · `#B33A2B` ferida
- **Forma:** bordas de 2px, faixas de cabeçalho invertidas nos cards, nenhum raio, nenhuma sombra
- **Prós:** identidade mais autoral e memorável; contraste extremo é o mais acessível; a inversão light↔dark expressa fantasia↔horror com um único gesto
- **Contras:** a mais opinativa e a mais difícil de manter em telas densas; Grenze Gotisch precisa ficar restrito a display; paleta de um só acento não codifica N1/N2/N3 por cor — depende de rótulo e inversão

---

## 4. Decisão

| | |
|---|---|
| **Direção escolhida** | **Opção A — Códice** (`ds-opcao-a-codice.dc.html`) |
| **Data da decisão** | 2026-09-10 |
| **Critério dominante** | Densidade de dados |
| **Emenda 1** | **Sem serifa em texto corrido.** Serifa (EB Garamond) fica restrita a display ≥26px: títulos de tela, nome da entidade no detalhe. Todo parágrafo, rótulo, botão e controle usa **Alegreya Sans** (sans humanista, casa com a paleta quente sem o custo de legibilidade da serifa em tela). Dados seguem em IBM Plex Mono. |
| **Emenda 2** | **Tabela é o padrão de listagem**, não a grade de cards — colunas Arma / Perícia / Dano / IN / Alcance / Fonte, linhas zebradas de 9px de padding, cabeçalho em bloco de tinta. Cards ficam reservados a resultados heterogêneos (busca global). |

### Alternativas consideradas (arquivadas)

- **Opção B — Ferro & Vitral** (`ds-opcao-b-ferro-vitral.dc.html`) — calcário/ferro + cobalto e âmbar, Cinzel + Spectral. Melhor densidade dos três, mas registro frio; sua estratégia de tabela foi absorvida pela Emenda 2.
- **Opção C — Xilogravura** (`ds-opcao-c-xilogravura.dc.html`) — linho/preto absoluto + sanguíneo, Grenze Gotisch + Alegreya. A mais autoral e a de maior contraste, descartada por dificuldade de manutenção em telas densas e por codificar N1/N2/N3 sem apoio de cor.

### Especificação consolidada — Códice v1

**Tokens (mesmos nomes semânticos nos dois temas)**

| Token | Light — fantasia medieval | Dark — horror medieval |
|---|---|---|
| `bg` | `#EFE6D4` pergaminho | `#12100E` velino queimado |
| `surface` | `#F7F1E3` fólio | `#1B1815` fólio noturno |
| `ink` | `#211B14` tinta | `#E8E0D0` osso |
| `ink-muted` | `#6B5E4B` | `#9A8F7D` |
| `rule` | `#CBBC9E` (linhas de tabela: `#DED0B4`) | `#332C24` |
| `accent` | `#A32A1E` vermelhão | `#C43A22` sangue seco |
| `accent-2` | `#9C7A2E` ouro (texto sobre claro: `#7C5F22`) | `#A98A3E` ouro fosco |

**Tipografia**

| Papel | Fonte | Tamanhos |
|---|---|---|
| Display | EB Garamond 500 | 26 / 34 / 42 / 46 / 60 — nunca abaixo de 26px |
| Corpo e UI | Alegreya Sans 400/500/700 | 15 (secundário) · 16 (célula de tabela) · 19 (parágrafo) · 21 (campo destacado) |
| Dados e proveniência | IBM Plex Mono 400/500 | 11 (rótulo caixa-alta, `letter-spacing` 0.1–0.18em) · 12 (badge) · 13 (célula) · 18–24 (valor em destaque) |

**Componentes — decisões fixadas**

- **SourceLevelBadge** — retângulo sem raio, texto `N1 · CANÔNICO` / `N2 · OFICIAL` / `N3 · COMUNIDADE` em mono 12px. N1 borda+texto vermelhão, N2 borda+texto ouro, N3 borda **tracejada** cinza-tinta. Nível legível sem cor: o rótulo é textual e N3 se distingue pelo traço. Em célula de tabela, forma curta `N1`/`N2`/`N3` com a mesma cor.
- **EntityTable** — cabeçalho `bg: ink`, texto `surface`, mono 11px `letter-spacing: .1em`; linhas alternadas `surface`/`bg`, separador `#DED0B4`, padding `9px 14px`. Números sempre mono, alinhados à esquerda (colunas estreitas de largura fixa).
- **SkillGroupField** — no detalhe, bloco com filete de 3px em `accent` à esquerda, rótulo mono `PERÍCIA QUE GOVERNA`, valor em sans 21px/500. Nunca colapsa em metadado secundário (ADR-001).
- **TaxonomyNote** — na listagem de armas à distância, faixa com filete de 3px em `accent-2`: arcos e bestas testam `Armas Brancas*`.
- **ProvenanceBlock** — badge + `source` + `editionOrVersion` em mono 12px, dentro de `surface` com borda `rule`.
- **FilterBar** — controles retangulares sem raio, mono 13px caixa-alta; facetas: nível de fonte, atributo-base, faixa de custo, alcance, calibre e **Época/Tipo de Campanha**.
- **ErrorState** — título em `accent` sans 16px/500 + explicação em `ink-muted` 15px. Cobre API indisponível e 404.
- **Forma geral** — raio 0, filetes de 1px, filete de acento de 3px como único ornamento; sem sombra, sem gradiente.

---

## 5. Fora de escopo deste documento

- Ilustração, iconografia e arte de marca (logo Erebus) — dependem de material real, não devem ser desenhados em SVG genérico.
- Layout do `erebus-engine` (Fase 2) e de telas de criação de personagem/ficha — fora do escopo da Fase 1 do PRD.
- Qualquer reprodução de identidade visual de publicações da Daemon Editora. A tese "fantasia/horror medieval" é interpretada como direção de gênero original, não como recriação de material publicado.
