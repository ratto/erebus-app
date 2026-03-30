/**
 * E2E — Página de Perícias (/pericias)
 * Autor: Balder (QA Sênior)
 * SPEC: SPEC-002 — Consultar Perícias
 * Data: 2026-03-30
 *
 * Todos os testes usam cy.intercept() com fixture para mockar a API.
 * Não depende da erebus-api estar rodando.
 *
 * NOTAS DE IMPLEMENTAÇÃO:
 * - O app usa hash-mode routing (createWebHashHistory). Todas as rotas devem
 *   ser acessadas via /#/rota (ex: cy.visit('/#/pericias')).
 * - A API está em http://localhost:3000/api/v1 (origem diferente da app em :9000).
 *   O intercept usa regex para capturar a URL completa independente do VITE_API_URL.
 * - O data-testid="search-input" é renderizado diretamente no <input> nativo pelo Quasar.
 * - O q-input tem debounce="300" — usamos cy.clock()/cy.tick() ou aguardamos naturalmente.
 * - O q-select de grupo/atributo abre um .q-menu que pode ser coberto por outros elementos;
 *   usamos {force: true} na interação para robustez em CI headless.
 */

// O app chama http://localhost:3000/api/v1/skills (origem diferente do dev server :9000)
// O regex captura qualquer URL que termine com /api/v1/skills
const SKILLS_API = /\/api\/v1\/skills$/

// O app usa hash-mode routing
const PERICIAS_URL = '/#/pericias'
const HOME_URL = '/#/'

describe('Página de Perícias — /pericias', () => {
  beforeEach(() => {
    cy.intercept('GET', SKILLS_API, { fixture: 'skills.json' }).as('getSkills')
    cy.visit(PERICIAS_URL)
    cy.wait('@getSkills')
  })

  // ---------------------------------------------------------------------------
  // E2E-01: Tabela carrega com os dados da fixture
  // ---------------------------------------------------------------------------
  it('E2E-01: exibe a tabela com as perícias carregadas', () => {
    cy.get('.skills-table').should('be.visible')

    // Cabeçalhos obrigatórios
    cy.get('.skills-table').contains('th', 'Nome').should('be.visible')
    cy.get('.skills-table').contains('th', 'Grupo').should('be.visible')
    cy.get('.skills-table').contains('th', 'Apenas c/ Treinamento').should('be.visible')

    // Dados da fixture (primeiras 15 linhas visíveis na página 1 com rowsPerPage=15)
    cy.get('.skills-table').contains('Espada').should('be.visible')
    cy.get('.skills-table').contains('Furtividade').should('be.visible')
    cy.get('.skills-table').contains('Combate').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-02: Filtro por nome
  // ---------------------------------------------------------------------------
  it('E2E-02: filtro por nome funciona', () => {
    // O data-testid é renderizado diretamente no <input> nativo pelo Quasar
    // O q-input tem debounce="300" ms
    cy.get('[data-testid="search-input"]').type('Espada')
    // Aguarda o debounce de 300ms
    cy.wait(400)

    cy.get('.skills-table').contains('Espada').should('be.visible')
    cy.get('.skills-table').should('not.contain', 'Furtividade')
    cy.get('.skills-table').should('not.contain', 'Ocultismo')
  })

  // ---------------------------------------------------------------------------
  // E2E-03: Filtro por grupo
  // ---------------------------------------------------------------------------
  it('E2E-03: filtro por grupo funciona', () => {
    // Abre o q-select de Grupo (click direto no campo)
    cy.get('[data-testid="select-grupo"]').click()

    // Aguarda o menu aparecer e seleciona "Combate"
    cy.get('.q-menu', { timeout: 5000 }).should('be.visible')
    cy.get('.q-menu').contains('.q-item', 'Combate').click({ force: true })

    // Apenas perícias do grupo Combate devem aparecer
    cy.get('.skills-table').contains('Espada').should('be.visible')
    cy.get('.skills-table').contains('Machado').should('be.visible')
    cy.get('.skills-table').contains('Arco').should('be.visible')

    // Perícias de outros grupos não devem aparecer na tabela
    cy.get('.skills-table').should('not.contain', 'Furtividade')
    cy.get('.skills-table').should('not.contain', 'Ocultismo')
    cy.get('.skills-table').should('not.contain', 'Atletismo')
  })

  // ---------------------------------------------------------------------------
  // E2E-04: Filtro por atributo base
  // ---------------------------------------------------------------------------
  it('E2E-04: filtro por atributo base funciona', () => {
    cy.get('[data-testid="select-atributo"]').click()

    cy.get('.q-menu', { timeout: 5000 }).should('be.visible')
    cy.get('.q-menu').contains('.q-item', 'INT').click({ force: true })

    // Apenas perícias com atributoBase === 'INT' devem aparecer
    cy.get('.skills-table').contains('Ocultismo').should('be.visible')
    cy.get('.skills-table').contains('Conhecimento Arcano').should('be.visible')
    cy.get('.skills-table').contains('Eletrônica').should('be.visible')

    // Perícias com outro atributo não devem aparecer
    cy.get('.skills-table').should('not.contain', 'Espada')
    cy.get('.skills-table').should('not.contain', 'Furtividade')
  })

  // ---------------------------------------------------------------------------
  // E2E-05: Filtro por atributo "Nenhum" retorna perícias sem atributo
  // ---------------------------------------------------------------------------
  it('E2E-05: filtro por atributo "Nenhum" retorna perícias sem atributo', () => {
    cy.get('[data-testid="select-atributo"]').click()

    cy.get('.q-menu', { timeout: 5000 }).should('be.visible')
    cy.get('.q-menu').contains('.q-item', 'Nenhum').click({ force: true })

    // A fixture tem "Meditação" com atributoBase: null
    cy.get('.skills-table').contains('Meditação').should('be.visible')

    // Perícias com atributo definido não devem aparecer
    cy.get('.skills-table').should('not.contain', 'Espada')
    cy.get('.skills-table').should('not.contain', 'Ocultismo')
  })

  // ---------------------------------------------------------------------------
  // E2E-06: Expansão de linha via chevron
  // ---------------------------------------------------------------------------
  it('E2E-06: expansão de linha via chevron abre e fecha a descrição', () => {
    // A descrição não deve estar visível antes do clique
    cy.get('.skill-description').should('not.exist')

    // Clica no chevron da primeira linha
    cy.get('[data-testid="chevron-btn"]').first().click()

    // A linha de descrição deve aparecer com o texto da fixture
    cy.get('.skill-description')
      .should('be.visible')
      .and('contain', 'Habilidade no manejo de espadas')

    // Clica novamente para colapsar
    cy.get('[data-testid="chevron-btn"]').first().click()

    // A linha de descrição deve desaparecer
    cy.get('.skill-description').should('not.exist')
  })

  // ---------------------------------------------------------------------------
  // E2E-07: Estado de loading aparece durante o carregamento
  // ---------------------------------------------------------------------------
  it('E2E-07: estado de loading aparece durante carregamento', () => {
    // Para garantir que o onMounted dispare novamente (e o loading seja observável),
    // navegamos primeiro para home, depois registramos o intercept com delay,
    // depois navegamos para /#/pericias via router-link para forçar remontagem.
    cy.intercept('GET', SKILLS_API, (req) => {
      req.reply({ fixture: 'skills.json', delay: 2500 })
    }).as('getSkillsDelayed')

    // Navega para HOME para sair da rota /pericias
    cy.visit(HOME_URL)

    // Navega para /pericias via hash routing — clicando no link do drawer
    // para forçar o remount do componente
    cy.get('.erebus-topbar button').first().click()
    cy.get('.erebus-drawer').contains('PERÍCIAS').click({ force: true })

    // Aguarda a q-table aparecer no DOM (Vue já montou) — neste ponto o loading=true
    // O Quasar renderiza tr.q-table__progress com .q-linear-progress quando loading=true
    cy.get('.q-table', { timeout: 5000 }).should('exist')
    cy.get('.q-table__progress').should('exist')

    cy.wait('@getSkillsDelayed')

    // Após a resposta, o loading deve sumir e os dados aparecer
    cy.get('.q-table__progress').should('not.exist')
    cy.get('.skills-table').contains('Espada').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-08: Link "PERÍCIAS" no MenuDrawer navega para /#/pericias
  // ---------------------------------------------------------------------------
  it('E2E-08: link "PERÍCIAS" no MenuDrawer navega para /pericias', () => {
    cy.intercept('GET', SKILLS_API, { fixture: 'skills.json' }).as('getSkillsFromHome')

    cy.visit(HOME_URL)

    // O drawer usa behavior="mobile" — abre via o botão da toolbar
    // O botão de menu está no ErebusTopbar com aria-label="Menu" (Quasar padrão)
    cy.get('.erebus-topbar button').first().click()

    // O drawer está no DOM mas pode ser offscreen; usamos force para clicar no link
    cy.get('.erebus-drawer').contains('PERÍCIAS').click({ force: true })

    // Verifica que a URL mudou para /#/pericias (hash routing)
    cy.url().should('include', '/#/pericias')

    // Aguarda a chamada de API e verifica que a tabela carregou
    cy.wait('@getSkillsFromHome')
    cy.get('.skills-table').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-09: Paginação — fixture tem 22 skills, rowsPerPage padrão = 15
  // ---------------------------------------------------------------------------
  it('E2E-09: paginação funciona — página 2 contém itens além dos 15 iniciais', () => {
    // Verifica que o rodapé de paginação está visível
    cy.get('.q-table__bottom').should('be.visible')

    // A barra de paginação deve mostrar "1-15 of 22"
    cy.get('.q-table__bottom').contains('1-15 of 22').should('be.visible')

    // O botão "Next page" deve estar habilitado — verificação separada do click
    // (.should() com negação não retorna o elemento no mesmo chain)
    cy.get('[aria-label="Next page"]').should('exist')
    cy.get('[aria-label="Next page"]').click({ force: true })

    // Na página 2, os itens que não couberam na primeira devem aparecer
    // Fixture: id 16 = Acrobacia é o 16º item → aparece na página 2
    cy.get('.skills-table').contains('Acrobacia').should('be.visible')

    // Itens da primeira página (ex: Espada = id 1) não devem aparecer na página 2
    cy.get('.skills-table').should('not.contain', 'Espada')
  })

  // ---------------------------------------------------------------------------
  // E2E-10: Estado vazio quando filtros não retornam resultados
  // ---------------------------------------------------------------------------
  it('E2E-10: estado vazio quando filtros não retornam resultados', () => {
    // Digita um nome que não existe na fixture
    cy.get('[data-testid="search-input"]').type('XxPericiaNaoExisteXx')
    // Aguarda o debounce de 300ms
    cy.wait(400)

    // O slot #no-data da q-table deve ser exibido com a mensagem customizada
    cy.get('.skills-table').contains('Nenhuma perícia encontrada').should('be.visible')

    // O ícone search_off deve estar presente no slot no-data
    cy.get('.skills-table').find('.q-icon').contains('search_off').should('exist')
  })
})
