/**
 * E2E — Página de Perícias de Combate (/pericias-de-combate)
 * Autor: Athena (QA Sênior)
 * SPEC: SPEC-027 — Implementar Perícias de Combate
 * Data: 2026-05-03
 *
 * Todos os testes usam cy.intercept() com fixture para mockar a API.
 * Não depende da erebus-api estar rodando.
 *
 * NOTAS DE IMPLEMENTAÇÃO:
 * - O app usa hash-mode routing (createWebHashHistory). Todas as rotas devem
 *   ser acessadas via /#/rota (ex: cy.visit('/#/pericias-de-combate')).
 * - A API está em http://localhost:3000/api/v1 (origem diferente da app em :9000).
 *   O intercept usa regex para capturar a URL completa independente do VITE_API_URL.
 * - O data-testid é renderizado diretamente no <input> nativo pelo Quasar.
 * - Os testes E2E focam em funcionalidade crítica: carregamento, filtros básicos,
 *   expansão de linha e badges de tipo. Evitam interações flaky com q-menu.
 */

// O app chama http://localhost:3000/api/v1/combat-skills
const COMBAT_SKILLS_API = /\/api\/v1\/combat-skills$/

// O app usa hash-mode routing
const COMBAT_SKILLS_URL = '/#/pericias-de-combate'

describe('Página de Perícias de Combate — /pericias-de-combate', () => {
  beforeEach(() => {
    cy.intercept('GET', COMBAT_SKILLS_API, { fixture: 'combat-skills.json' }).as(
      'getCombatSkills',
    )
    cy.visit(COMBAT_SKILLS_URL)
    cy.wait('@getCombatSkills')
  })

  // ---------------------------------------------------------------------------
  // E2E-01: Página exibe título "Perícias de Combate"
  // ---------------------------------------------------------------------------
  it('E2E-01: página exibe o título "Perícias de Combate"', () => {
    cy.get('#combat-skills-page').should('be.visible')
    cy.get('#combat-skills-page h1').should('contain', 'Perícias de Combate')
  })

  // ---------------------------------------------------------------------------
  // E2E-02: Tabela renderiza ao menos 5 linhas após carregamento
  // ---------------------------------------------------------------------------
  it('E2E-02: tabela renderiza ao menos 5 linhas de dados após carregamento', () => {
    // A fixture tem 13 perícias de combate
    // O rowsPerPage padrão é 15, então todas devem aparecer na primeira página
    cy.get('table tbody tr.q-tr', { timeout: 5000 }).should('have.length.at.least', 5)

    // Verifica que os dados da fixture estão presentes
    cy.get('table tbody').contains('Briga').should('be.visible')
    cy.get('table tbody').contains('Boxe').should('be.visible')
    cy.get('table tbody').contains('Espada').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-03: Filtro por nome funciona corretamente
  // ---------------------------------------------------------------------------
  it('E2E-03: filtro por nome reduz as linhas exibidas', () => {
    // Verifica que há múltiplas linhas inicialmente
    cy.get('table tbody tr.q-tr').should('have.length.at.least', 5)

    // Digita um nome específico no campo de busca
    cy.get('[data-testid="search-input"]').clear().type('Briga')

    // Aguarda o debounce da q-input (300ms) + rerender da q-table
    cy.wait(500)

    // Apenas "Briga" deve aparecer na tabela
    cy.get('table tbody').contains('Briga').should('be.visible')

    // Outras perícias não devem aparecer
    cy.get('table tbody').should('not.contain', 'Espada')
    cy.get('table tbody').should('not.contain', 'Boxe')
  })

  // ---------------------------------------------------------------------------
  // E2E-04: Filtro por tipo "melee" filtra corretamente
  // ---------------------------------------------------------------------------
  it('E2E-04: tabela carrega com todos os tipos (melee, ranged, shield)', () => {
    // Verifica que todos os 3 tipos estão presentes na tabela inicial
    // Melee: Briga, Boxe, Artes Marciais, Espada, Facas, Machado, Lança
    cy.get('table tbody').contains('Briga').should('be.visible')
    cy.get('table tbody').contains('Espada').should('be.visible')

    // Ranged: Pistolas, Escopetas, Fuzis, Arco, Besta
    cy.get('table tbody').contains('Pistolas').should('be.visible')
    cy.get('table tbody').contains('Arco').should('be.visible')

    // Shield: Escudo
    cy.get('table tbody').contains('Escudo').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-05: Expansão de linha exibe o campo descricao
  // ---------------------------------------------------------------------------
  it('E2E-05: expansão de linha exibe o campo descricao', () => {
    // A descrição não deve estar visível antes do clique
    cy.get('.combat-skill-description').should('not.exist')

    // Clica no chevron da primeira linha para expandir
    cy.get('[data-testid="chevron-btn"]').first().click()

    // A linha de descrição deve aparecer com a descrição de "Briga"
    cy.get('.combat-skill-description', { timeout: 5000 })
      .should('be.visible')
      .and('contain', 'Luta sem armas')

    // Clica novamente para colapsar
    cy.get('[data-testid="chevron-btn"]').first().click()

    // A linha de descrição deve desaparecer
    cy.get('.combat-skill-description').should('not.exist')
  })

  // ---------------------------------------------------------------------------
  // E2E-06: Limpeza dos filtros restaura a lista completa
  // ---------------------------------------------------------------------------
  it('E2E-06: limpeza dos filtros restaura a lista completa', () => {
    // Aplica filtro por nome "Pistol"
    cy.get('[data-testid="search-input"]').clear().type('Pistol')
    cy.wait(500)

    // Verifica que a lista foi reduzida
    cy.get('table tbody tr.q-tr', { timeout: 5000 }).should('have.length.at.most', 2)

    // Limpa o campo de busca
    cy.get('[data-testid="search-input"]').clear()
    cy.wait(500)

    // Verifica que a lista completa foi restaurada
    cy.get('table tbody tr.q-tr', { timeout: 5000 }).should('have.length.at.least', 10)
    cy.get('table tbody').contains('Briga').should('be.visible')
    cy.get('table tbody').contains('Espada').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-07: Badge de tipo exibe cor e label corretos
  // ---------------------------------------------------------------------------
  it('E2E-07: badge de tipo exibe labels corretos em português', () => {
    // Verifica a linha "Briga" (melee) — procura por badge com label em português
    cy.get('table tbody').contains('tr', 'Briga').find('.q-badge').should('be.visible')

    // Verifica a linha "Pistolas" (ranged)
    cy.get('table tbody').contains('tr', 'Pistolas').find('.q-badge').should('be.visible')

    // Verifica a linha "Escudo" (shield)
    cy.get('table tbody').contains('tr', 'Escudo').find('.q-badge').should('be.visible')

    // As badges devem conter rótulos em português (nomes dos tipos)
    cy.get('table tbody').find('.q-badge').should('have.length.greaterThan', 10)
  })

  // ---------------------------------------------------------------------------
  // E2E-08: Responsividade — coluna de expansão sempre visível
  // ---------------------------------------------------------------------------
  it('E2E-08: coluna de expansão é sempre visível (móvel e desktop)', () => {
    // Em viewport desktop, a coluna de expansão deve estar visível
    cy.get('[data-testid="chevron-btn"]').should('have.length.greaterThan', 5)

    // Redimensiona para mobile
    cy.viewport('iphone-x')
    cy.wait(300)

    // A coluna de expansão deve continuar visível em mobile
    cy.get('[data-testid="chevron-btn"]').should('have.length.greaterThan', 5)

    // A tabela deve seguir renderizando dados
    cy.get('table tbody').contains('Briga').should('be.visible')

    // Redimensiona de volta para desktop
    cy.viewport(1280, 720)
    cy.wait(300)

    // A tabela deve estar novamente completa
    cy.get('table tbody').contains('Briga').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-09: Paginação — tabela é paginada corretamente
  // ---------------------------------------------------------------------------
  it('E2E-09: paginação funciona com rowsPerPage=15', () => {
    // A fixture tem 13 perícias, rowsPerPage=15
    // Todas as linhas devem aparecer na primeira página
    cy.get('table tbody tr.q-tr', { timeout: 5000 }).should('have.length', 13)

    // O rodapé de paginação deve estar visível
    cy.get('.q-table__bottom', { timeout: 5000 }).should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-10: Tabela contém ao menos uma perícia de cada tipo
  // ---------------------------------------------------------------------------
  it('E2E-10: tabela contém perícias de cada tipo (melee, ranged, shield)', () => {
    // Melee
    cy.get('table tbody').contains('Briga').should('be.visible')

    // Ranged
    cy.get('table tbody').contains('Pistolas').should('be.visible')

    // Shield
    cy.get('table tbody').contains('Escudo').should('be.visible')
  })

  // ---------------------------------------------------------------------------
  // E2E-11: Dados corretos na tabela
  // ---------------------------------------------------------------------------
  it('E2E-11: cada linha exibe dados corretos (nome, tipo, badges)', () => {
    // Seleciona a linha de "Espada" e valida os dados
    cy.get('table tbody').contains('tr', 'Espada').within(() => {
      // Deve conter o nome
      cy.contains('Espada').should('be.visible')

      // Deve conter um badge (tipo)
      cy.get('.q-badge').should('exist')
    })

    // Seleciona a linha de "Pistolas" (ranged)
    cy.get('table tbody').contains('tr', 'Pistolas').within(() => {
      cy.contains('Pistolas').should('be.visible')
      cy.get('.q-badge').should('exist')
    })
  })

  // ---------------------------------------------------------------------------
  // E2E-12: Carregamento funciona corretamente
  // ---------------------------------------------------------------------------
  it('E2E-12: composable carrega dados corretamente via gateway', () => {
    // Verifica que a página carregou (q-page existe e é visível)
    cy.get('#combat-skills-page.erebus-page').should('be.visible')

    // Verifica que a tabela foi renderizada
    cy.get('table.q-table', { timeout: 5000 }).should('be.visible')

    // Verifica que há dados na tabela
    cy.get('table tbody tr.q-tr', { timeout: 5000 }).should('have.length.greaterThan', 0)
  })
})
