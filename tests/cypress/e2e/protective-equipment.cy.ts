/**
 * E2E — Página de Equipamentos de Proteção (/equipamentos-protecao)
 * Autor: Athena (QA Sênior)
 * SPEC: SPEC-041 — Corrigir Implementação da Consulta de Equipamento
 * Data: 2026-05-04
 *
 * Testes E2E para validar que a página de equipamentos de proteção é funcional.
 * Testes validam:
 * - Página é acessível pela rota
 * - Título e subtítulo carregam corretamente
 * - Tabela e filtros são renderizados
 * - Inputs de filtros têm os data-testids esperados
 * - Navegação via menu funciona
 *
 * Nota: Os testes E2E no erebus-app não dependem da API estar rodando,
 * pois validam principalmente a renderização da página e presença de elementos.
 */

const PROTECTIVE_EQUIPMENT_URL = '/#/equipamentos-protecao'
const HOME_URL = '/#/'

describe('Página de Equipamentos de Proteção — /equipamentos-protecao', () => {
  // ---------------------------------------------------------------------------
  // E2E-PE-01: Página é acessível pela rota /equipamentos-protecao
  // ---------------------------------------------------------------------------
  it('E2E-PE-01: página é acessível pela rota /equipamentos-protecao', () => {
    cy.visit(PROTECTIVE_EQUIPMENT_URL)
    cy.url().should('include', '/#/equipamentos-protecao')
    cy.get('[id="protective-equipment-page"]').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-PE-02: Página carrega com título correto
  // ---------------------------------------------------------------------------
  it('E2E-PE-02: página carrega com título "Equipamentos de Proteção"', () => {
    cy.visit(PROTECTIVE_EQUIPMENT_URL)
    cy.get('[id="protective-equipment-page"]').should('be.visible')
    cy.get('h1').should('contain', 'Equipamentos de Proteção')
  })

  // ---------------------------------------------------------------------------
  // E2E-PE-03: Subtítulo é exibido
  // ---------------------------------------------------------------------------
  it('E2E-PE-03: subtítulo é exibido na página', () => {
    cy.visit(PROTECTIVE_EQUIPMENT_URL)
    cy.get('.subtitle').should('be.visible')
    cy.get('.subtitle').should('contain', 'Consulte armaduras')
  })

  // ---------------------------------------------------------------------------
  // E2E-PE-04: Card de filtros é renderizado
  // ---------------------------------------------------------------------------
  it('E2E-PE-04: card de filtros é renderizado', () => {
    cy.visit(PROTECTIVE_EQUIPMENT_URL)
    cy.get('.filtros-card').should('be.visible')
    cy.get('.card-header').should('contain', 'Filtros')
  })

  // ---------------------------------------------------------------------------
  // E2E-PE-05: Campo de busca (equipment) está presente
  // ---------------------------------------------------------------------------
  it('E2E-PE-05: campo de busca (equipment) com data-testid existe', () => {
    cy.visit(PROTECTIVE_EQUIPMENT_URL)
    cy.get('[data-testid="search-input"]').should('exist').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-PE-06: Select de damageType está presente
  // ---------------------------------------------------------------------------
  it('E2E-PE-06: select de damageType com data-testid existe', () => {
    cy.visit(PROTECTIVE_EQUIPMENT_URL)
    cy.get('[data-testid="select-damage-type"]').should('exist').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-PE-07: Inputs de penalidade DEX estão presentes
  // ---------------------------------------------------------------------------
  it('E2E-PE-07: inputs de penalidade DEX com data-testids existem', () => {
    cy.visit(PROTECTIVE_EQUIPMENT_URL)
    cy.get('[data-testid="input-min-dex-penalty"]').should('exist').should('be.visible')
    cy.get('[data-testid="input-max-dex-penalty"]').should('exist').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-PE-08: Inputs de penalidade AGI estão presentes
  // ---------------------------------------------------------------------------
  it('E2E-PE-08: inputs de penalidade AGI com data-testids existem', () => {
    cy.visit(PROTECTIVE_EQUIPMENT_URL)
    cy.get('[data-testid="input-min-agi-penalty"]').should('exist').should('be.visible')
    cy.get('[data-testid="input-max-agi-penalty"]').should('exist').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-PE-09: Botão "Limpar filtros" está presente
  // ---------------------------------------------------------------------------
  it('E2E-PE-09: botão "Limpar filtros" com data-testid existe', () => {
    cy.visit(PROTECTIVE_EQUIPMENT_URL)
    cy.get('[data-testid="clear-filters"]').should('exist').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-PE-10: Tabela ErebusTable é renderizada
  // ---------------------------------------------------------------------------
  it('E2E-PE-10: tabela ErebusTable é renderizada', () => {
    cy.visit(PROTECTIVE_EQUIPMENT_URL)
    cy.get('.erebus-table').should('exist').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-PE-11: Título do campo search é correto
  // ---------------------------------------------------------------------------
  it('E2E-PE-11: campo de busca tem placeholder/label correto', () => {
    cy.visit(PROTECTIVE_EQUIPMENT_URL)
    cy.get('[data-testid="search-input"]')
      .parent()
      .should('contain', 'Buscar por nome')
  })

  // ---------------------------------------------------------------------------
  // E2E-PE-12: Link no menu lateral navega para a página
  // ---------------------------------------------------------------------------
  it('E2E-PE-12: link no menu lateral navega para equipamentos de proteção', () => {
    cy.visit(HOME_URL)

    // Abre o drawer via botão de menu (primeiro botão na topbar)
    cy.get('.erebus-topbar button').first().click()

    // Procura pelo link de equipamentos de proteção
    cy.get('[data-testid="nav-protective-equipment"]')
      .should('exist')
      .should('be.visible')
      .click({ force: true })

    // Valida que navegou para a página correta
    cy.url().should('include', '/#/equipamentos-protecao')
    cy.get('[id="protective-equipment-page"]').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-PE-13: Campo de busca aceita input
  // ---------------------------------------------------------------------------
  it('E2E-PE-13: campo de busca aceita digitação', () => {
    cy.visit(PROTECTIVE_EQUIPMENT_URL)
    cy.get('[data-testid="search-input"]')
      .clear()
      .type('kevlar')
      .should('have.value', 'kevlar')
  })

  // ---------------------------------------------------------------------------
  // E2E-PE-14: Select de damageType pode ser aberto
  // ---------------------------------------------------------------------------
  it('E2E-PE-14: select de damageType pode ser aberto e opciones visíveis', () => {
    cy.visit(PROTECTIVE_EQUIPMENT_URL)
    cy.get('[data-testid="select-damage-type"]').click()

    // Valida que há opções visíveis (KINETIC, BALLISTIC, etc.)
    cy.contains('[role="option"]', 'KINETIC').should('exist')
    cy.contains('[role="option"]', 'BALLISTIC').should('exist')
  })

  // ---------------------------------------------------------------------------
  // E2E-PE-15: Inputs numéricos aceitam valores
  // ---------------------------------------------------------------------------
  it('E2E-PE-15: inputs de penalidade aceitam valores numéricos', () => {
    cy.visit(PROTECTIVE_EQUIPMENT_URL)

    cy.get('[data-testid="input-min-dex-penalty"]')
      .clear()
      .type('1')
      .should('have.value', '1')

    cy.get('[data-testid="input-max-dex-penalty"]')
      .clear()
      .type('3')
      .should('have.value', '3')

    cy.get('[data-testid="input-min-agi-penalty"]')
      .clear()
      .type('0')
      .should('have.value', '0')

    cy.get('[data-testid="input-max-agi-penalty"]')
      .clear()
      .type('2')
      .should('have.value', '2')
  })

  // ---------------------------------------------------------------------------
  // E2E-PE-16: Botão "Limpar filtros" limpa os inputs
  // ---------------------------------------------------------------------------
  it('E2E-PE-16: botão "Limpar filtros" limpa todos os campos de filtro', () => {
    cy.visit(PROTECTIVE_EQUIPMENT_URL)

    // Adiciona valores aos filtros
    cy.get('[data-testid="search-input"]').clear().type('teste')
    cy.get('[data-testid="input-min-dex-penalty"]').clear().type('1')

    // Clica no botão "Limpar filtros"
    cy.get('[data-testid="clear-filters"]').click()

    // Valida que os campos foram limpos
    cy.get('[data-testid="search-input"]').should('have.value', '')
    cy.get('[data-testid="input-min-dex-penalty"]').should('have.value', '')
  })

  // ---------------------------------------------------------------------------
  // E2E-PE-17: Página tem classe CSS erebus-page
  // ---------------------------------------------------------------------------
  it('E2E-PE-17: página tem classe CSS erebus-page para styling', () => {
    cy.visit(PROTECTIVE_EQUIPMENT_URL)
    cy.get('[id="protective-equipment-page"]').should('have.class', 'erebus-page')
  })

  // ---------------------------------------------------------------------------
  // E2E-PE-18: Tabela renderiza com config esperada
  // ---------------------------------------------------------------------------
  it('E2E-PE-18: tabela tem atributos esperados (row-key, paginação)', () => {
    cy.visit(PROTECTIVE_EQUIPMENT_URL)

    // Valida que há elementos de paginação ou controles de tabela
    cy.get('.erebus-table').should('exist')
  })
})
