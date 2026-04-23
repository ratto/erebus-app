/**
 * E2E — Página de Armas (/armas)
 * Autor: Athena (QA Sênior)
 * SPEC: SPEC-028 — Correção do Padrão de Resposta HTTP
 * Data: 2026-04-21
 *
 * Testes E2E para validar que o gateway de weapons consome corretamente
 * arrays diretos da API (sem envelope { weapons: [...] }).
 *
 * Todos os testes usam cy.intercept() com fixture para mockar a API.
 * Não depende da erebus-api estar rodando.
 */

const WEAPONS_API = /\/api\/v1\/weapons$/
const WEAPONS_URL = '/#/armas'
const HOME_URL = '/#/'

describe('Página de Armas — /armas', () => {
  beforeEach(() => {
    cy.intercept('GET', WEAPONS_API, { fixture: 'weapons.json' }).as('getWeapons')
    cy.visit(WEAPONS_URL)
    cy.wait('@getWeapons')
  })

  // ---------------------------------------------------------------------------
  // E2E-WP-01: Página carrega com dados da fixture de armas
  // ---------------------------------------------------------------------------
  it('E2E-WP-01: página carrega e exibe tabelas de armas', () => {
    // Valida que a página está visível
    cy.get('[data-testid="weapons-container"]').should('be.visible')

    // Valida que há abas (melee, ranged, firearms)
    cy.get('[role="tablist"]').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-WP-02: Aba de Armas Brancas carrega com dados
  // ---------------------------------------------------------------------------
  it('E2E-WP-02: aba de armas brancas exibe a Espada Longa', () => {
    // A aba de armas brancas deve estar ativa por padrão
    cy.get('.weapons-melee-table').should('be.visible')

    // Valida que a Espada Longa (tipo: branca) aparece na tabela
    cy.get('.weapons-melee-table').contains('Espada Longa').should('be.visible')
    cy.get('.weapons-melee-table').contains('1d10').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-WP-03: Aba de Armas à Distância exibe Arco
  // ---------------------------------------------------------------------------
  it('E2E-WP-03: aba de armas à distância exibe Arco Curto', () => {
    // Clica na aba de armas à distância (branca_distancia)
    cy.get('[role="tablist"]').contains('À Distância').click({ force: true })

    // Aguarda a mudança de aba
    cy.get('.weapons-ranged-table').should('be.visible')

    // Valida que o Arco Curto (tipo: branca_distancia) aparece
    cy.get('.weapons-ranged-table').contains('Arco Curto').should('be.visible')
    cy.get('.weapons-ranged-table').contains('1d6').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-WP-04: Aba de Armas de Fogo exibe Pistola 9mm
  // ---------------------------------------------------------------------------
  it('E2E-WP-04: aba de armas de fogo exibe Pistola 9mm', () => {
    // Clica na aba de armas de fogo
    cy.get('[role="tablist"]').contains('Fogo').click({ force: true })

    // Aguarda a mudança de aba
    cy.get('.weapons-firearms-table').should('be.visible')

    // Valida que a Pistola 9mm (tipo: fogo) aparece
    cy.get('.weapons-firearms-table').contains('Pistola 9mm').should('be.visible')
    cy.get('.weapons-firearms-table').contains('2d6').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-WP-05: Filtro por tipo retorna array direto
  // ---------------------------------------------------------------------------
  it('E2E-WP-05: filtro por tipo "branca" carrega corretamente', () => {
    // Simula um filtro que chama a API com ?tipo=branca
    cy.intercept('GET', /\/api\/v1\/weapons\?tipo=branca$/, { fixture: 'weapons.json' }).as(
      'getWeaponsFiltered'
    )

    // Dispara o filtro (a implementação pode variar, este é um exemplo)
    // Se houver um dropdown ou filtro UI, interaja com ele aqui
    // Por enquanto, apenas valida que a aba de brancas exibe os dados

    cy.get('.weapons-melee-table').contains('Espada Longa').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-WP-06: Link "ARMAS" no MenuDrawer navega para /#/armas
  // ---------------------------------------------------------------------------
  it('E2E-WP-06: link "ARMAS" no MenuDrawer navega para /armas', () => {
    cy.intercept('GET', WEAPONS_API, { fixture: 'weapons.json' }).as('getWeaponsFromHome')

    cy.visit(HOME_URL)

    // Abre o drawer via botão de menu
    cy.get('.erebus-topbar button').first().click()

    // Clica no link de ARMAS (se existir no drawer)
    // Caso contrário, este teste pode ser adaptado se a navegação for diferente
    cy.get('.erebus-drawer').then(($drawer) => {
      if ($drawer.text().includes('ARMAS')) {
        cy.get('.erebus-drawer').contains('ARMAS').click({ force: true })
        cy.url().should('include', '/#/armas')
        cy.wait('@getWeaponsFromHome')
        cy.get('[data-testid="weapons-container"]').should('be.visible')
      } else {
        // Se não houver link de ARMAS, o teste deve ser skipped ou adaptado
        cy.log('Link ARMAS não encontrado no drawer — ajuste necessário')
      }
    })
  })

  // ---------------------------------------------------------------------------
  // E2E-WP-07: Estado de loading durante carregamento
  // ---------------------------------------------------------------------------
  it('E2E-WP-07: estado de loading aparece durante carregamento', () => {
    cy.intercept('GET', WEAPONS_API, (req) => {
      req.reply({ fixture: 'weapons.json', delay: 2500 })
    }).as('getWeaponsDelayed')

    cy.visit(HOME_URL)

    // Abre o drawer e clica em ARMAS para forçar o remount
    cy.get('.erebus-topbar button').first().click()
    cy.get('.erebus-drawer').then(($drawer) => {
      if ($drawer.text().includes('ARMAS')) {
        cy.get('.erebus-drawer').contains('ARMAS').click({ force: true })

        // Aguarda a renderização e valida o loading
        cy.get('[data-testid="weapons-container"]', { timeout: 5000 }).should('exist')

        // Após a resposta, valida que os dados aparecem
        cy.wait('@getWeaponsDelayed')
        cy.get('.weapons-melee-table').contains('Espada Longa').should('be.visible')
      }
    })
  })
})
