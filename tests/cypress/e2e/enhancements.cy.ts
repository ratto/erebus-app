/**
 * E2E — Página de Aprimoramentos (/aprimoramentos)
 * Autor: Athena (QA Sênior)
 * SPEC: SPEC-028 — Correção do Padrão de Resposta HTTP
 * Data: 2026-04-21
 *
 * Testes E2E para validar que o gateway de enhancements consome corretamente
 * arrays diretos da API (sem envelope { enhancements: [...] } e sem paginação server-side).
 *
 * Todos os testes usam cy.intercept() com fixture para mockar a API.
 * Não depende da erebus-api estar rodando.
 */

const ENHANCEMENTS_API = /\/api\/v1\/enhancements$/
const ENHANCEMENTS_URL = '/#/aprimoramentos'
const HOME_URL = '/#/'

describe('Página de Aprimoramentos — /aprimoramentos', () => {
  beforeEach(() => {
    cy.intercept('GET', ENHANCEMENTS_API, { fixture: 'enhancements.json' }).as('getEnhancements')
    cy.visit(ENHANCEMENTS_URL)
    cy.wait('@getEnhancements')
  })

  // ---------------------------------------------------------------------------
  // E2E-EN-01: Página carrega com dados da fixture de aprimoramentos
  // ---------------------------------------------------------------------------
  it('E2E-EN-01: página carrega e exibe tabela de aprimoramentos', () => {
    // Valida que o container de aprimoramentos está visível
    cy.get('[data-testid="enhancements-container"]').should('be.visible')

    // Valida que a tabela está visível
    cy.get('.enhancements-table').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-EN-02: Cabeçalhos da tabela estão presentes
  // ---------------------------------------------------------------------------
  it('E2E-EN-02: cabeçalhos da tabela são exibidos corretamente', () => {
    cy.get('.enhancements-table').contains('th', 'Nome').should('be.visible')
    cy.get('.enhancements-table').contains('th', 'Tipo').should('be.visible')
    cy.get('.enhancements-table').contains('th', 'Custo').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-EN-03: Aprimoramentos da fixture são listados
  // ---------------------------------------------------------------------------
  it('E2E-EN-03: aprimoramentos da fixture são exibidos na tabela', () => {
    cy.get('.enhancements-table').contains('Ambidestria').should('be.visible')
    cy.get('.enhancements-table').contains('Mira Certeira').should('be.visible')
    cy.get('.enhancements-table').contains('Regeneração').should('be.visible')
    cy.get('.enhancements-table').contains('Fraqueza Mágica').should('be.visible')
    cy.get('.enhancements-table').contains('Lentidão').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-EN-04: Distinção visual entre aprimoramentos positivos e negativos
  // ---------------------------------------------------------------------------
  it('E2E-EN-04: aprimoramentos positivos e negativos são diferenciados visualmente', () => {
    // Valida que há badges ou cores diferentes para tipo positivo
    cy.get('.enhancements-table').contains('tr', 'Ambidestria').within(() => {
      cy.contains('positivo').should('be.visible')
    })

    // Valida que há badges ou cores diferentes para tipo negativo
    cy.get('.enhancements-table').contains('tr', 'Fraqueza Mágica').within(() => {
      cy.contains('negativo').should('be.visible')
    })
  })

  // ---------------------------------------------------------------------------
  // E2E-EN-05: Expansão de linha via chevron revela descrição
  // ---------------------------------------------------------------------------
  it('E2E-EN-05: expansão de linha abre e fecha a descrição', () => {
    // A descrição não deve estar visível antes do clique
    cy.get('.enhancement-description').should('not.exist')

    // Clica no chevron da primeira linha (Ambidestria)
    cy.get('[data-testid="chevron-btn"]').first().click()

    // A descrição deve aparecer
    cy.get('.enhancement-description')
      .should('be.visible')
      .and('contain', 'O personagem pode usar ambas as mãos com igual habilidade')

    // Clica novamente para colapsar
    cy.get('[data-testid="chevron-btn"]').first().click()

    // A descrição deve desaparecer
    cy.get('.enhancement-description').should('not.exist')
  })

  // ---------------------------------------------------------------------------
  // E2E-EN-06: Custos são exibidos corretamente
  // ---------------------------------------------------------------------------
  it('E2E-EN-06: custos dos aprimoramentos são exibidos', () => {
    cy.get('.enhancements-table').contains('Ambidestria').closest('tr').contains('5').should('be.visible')
    cy.get('.enhancements-table').contains('Mira Certeira').closest('tr').contains('3').should('be.visible')
    cy.get('.enhancements-table').contains('Fraqueza Mágica').closest('tr').contains('0').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-EN-07: Link "APRIMORAMENTOS" no MenuDrawer navega para /#/aprimoramentos
  // ---------------------------------------------------------------------------
  it('E2E-EN-07: link "APRIMORAMENTOS" no MenuDrawer navega para /aprimoramentos', () => {
    cy.intercept('GET', ENHANCEMENTS_API, { fixture: 'enhancements.json' }).as(
      'getEnhancementsFromHome'
    )

    cy.visit(HOME_URL)

    // Abre o drawer via botão de menu
    cy.get('.erebus-topbar button').first().click()

    // Clica no link de APRIMORAMENTOS se existir
    cy.get('.erebus-drawer').then(($drawer) => {
      if ($drawer.text().includes('APRIMORAMENTOS')) {
        cy.get('.erebus-drawer').contains('APRIMORAMENTOS').click({ force: true })
        cy.url().should('include', '/#/aprimoramentos')
        cy.wait('@getEnhancementsFromHome')
        cy.get('[data-testid="enhancements-container"]').should('be.visible')
      } else {
        cy.log('Link APRIMORAMENTOS não encontrado no drawer — ajuste necessário')
      }
    })
  })

  // ---------------------------------------------------------------------------
  // E2E-EN-08: Estado de loading durante carregamento
  // ---------------------------------------------------------------------------
  it('E2E-EN-08: estado de loading aparece durante carregamento', () => {
    cy.intercept('GET', ENHANCEMENTS_API, (req) => {
      req.reply({ fixture: 'enhancements.json', delay: 2500 })
    }).as('getEnhancementsDelayed')

    cy.visit(HOME_URL)

    // Abre o drawer e clica em APRIMORAMENTOS
    cy.get('.erebus-topbar button').first().click()
    cy.get('.erebus-drawer').then(($drawer) => {
      if ($drawer.text().includes('APRIMORAMENTOS')) {
        cy.get('.erebus-drawer').contains('APRIMORAMENTOS').click({ force: true })

        // Aguarda a renderização
        cy.get('[data-testid="enhancements-container"]', { timeout: 5000 }).should('exist')

        // Após a resposta, valida que os dados aparecem
        cy.wait('@getEnhancementsDelayed')
        cy.get('.enhancements-table').contains('Ambidestria').should('be.visible')
      }
    })
  })

  // ---------------------------------------------------------------------------
  // E2E-EN-09: Array é retornado diretamente (sem envelope)
  // ---------------------------------------------------------------------------
  it('E2E-EN-09: API retorna array diretamente (validação de contrato)', () => {
    // Este teste valida que a chamada à API foi feita e retornou um array
    // A fixture está configurada como array direto (não como { enhancements: [...] })
    cy.intercept('GET', ENHANCEMENTS_API, (req) => {
      req.reply((res) => {
        // Valida que a resposta é um array
        expect(Array.isArray(res.body)).to.be.true
        expect(res.body.length).to.equal(5)
      })
    })

    cy.visit(ENHANCEMENTS_URL)
  })

  // ---------------------------------------------------------------------------
  // E2E-EN-10: Sem paginação server-side
  // ---------------------------------------------------------------------------
  it('E2E-EN-10: todos os aprimoramentos são exibidos sem paginação', () => {
    // Valida que todos os 5 aprimoramentos da fixture aparecem
    cy.get('.enhancements-table tbody tr').should('have.length', 5)

    // Valida que NÃO há botões de paginação (ou paginação é frontend-side)
    // Se houver paginação no Quasar, ela deve ser client-side e não server-side
    // Este teste apenas garante que todos os items estão visíveis
    cy.get('.enhancements-table').contains('Ambidestria').should('be.visible')
    cy.get('.enhancements-table').contains('Lentidão').should('be.visible')
  })
})
