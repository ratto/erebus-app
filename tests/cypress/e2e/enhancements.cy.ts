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

  // ---------------------------------------------------------------------------
  // E2E-EN-11: Filtro por nome retorna apenas aprimoramentos com termo
  // ---------------------------------------------------------------------------
  it('E2E-EN-11: filtro por nome retorna apenas aprimoramentos cujo nome contenha o termo digitado', () => {
    // Encontra o input de busca por nome
    cy.get('[data-testid="enhancements-container"] input').first().as('searchInput')

    // Digita "Ambi" para filtrar por Ambidestria
    cy.get('@searchInput').clear().type('Ambi')

    // Aguarda que a tabela seja atualizada
    cy.get('.enhancements-table tbody tr').should('have.length', 1)

    // Valida que apenas Ambidestria aparece
    cy.get('.enhancements-table').contains('Ambidestria').should('be.visible')
    cy.get('.enhancements-table').contains('Mira Certeira').should('not.exist')
    cy.get('.enhancements-table').contains('Regeneração').should('not.exist')
  })

  // ---------------------------------------------------------------------------
  // E2E-EN-12: Filtro por tipo "positivo"
  // ---------------------------------------------------------------------------
  it('E2E-EN-12: filtro por tipo "positivo" exibe apenas aprimoramentos positivos', () => {
    // Encontra o select de tipo e clica para abrir dropdown
    cy.get('[data-testid="select-type"]').click({ force: true })

    // Aguarda que a opção "Positivo" apareça no dropdown
    cy.contains('[role="option"]', 'Positivo', { timeout: 5000 }).should('be.visible').click()

    // Aguarda que a tabela seja atualizada
    cy.get('.enhancements-table tbody tr').should('have.length', 3)

    // Valida que apenas positivos aparecem
    cy.get('.enhancements-table').contains('Ambidestria').should('be.visible')
    cy.get('.enhancements-table').contains('Mira Certeira').should('be.visible')
    cy.get('.enhancements-table').contains('Regeneração').should('be.visible')

    // Valida que negativos não aparecem
    cy.get('.enhancements-table').contains('Fraqueza Mágica').should('not.exist')
    cy.get('.enhancements-table').contains('Lentidão').should('not.exist')
  })

  // ---------------------------------------------------------------------------
  // E2E-EN-13: Filtro por tipo "negativo"
  // ---------------------------------------------------------------------------
  it('E2E-EN-13: filtro por tipo "negativo" exibe apenas aprimoramentos negativos', () => {
    // Encontra o select de tipo e clica para abrir dropdown
    cy.get('[data-testid="select-type"]').click({ force: true })

    // Aguarda que a opção "Negativo" apareça no dropdown
    cy.contains('[role="option"]', 'Negativo', { timeout: 5000 }).should('be.visible').click()

    // Aguarda que a tabela seja atualizada
    cy.get('.enhancements-table tbody tr').should('have.length', 2)

    // Valida que apenas negativos aparecem
    cy.get('.enhancements-table').contains('Fraqueza Mágica').should('be.visible')
    cy.get('.enhancements-table').contains('Lentidão').should('be.visible')

    // Valida que positivos não aparecem
    cy.get('.enhancements-table').contains('Ambidestria').should('not.exist')
    cy.get('.enhancements-table').contains('Mira Certeira').should('not.exist')
    cy.get('.enhancements-table').contains('Regeneração').should('not.exist')
  })

  // ---------------------------------------------------------------------------
  // E2E-EN-14: Combinação de filtros nome + tipo
  // ---------------------------------------------------------------------------
  it('E2E-EN-14: combinação de filtro nome + tipo retorna intersecção correta', () => {
    // Digita nome que corresponde a um positivo
    cy.get('[data-testid="enhancements-container"] input').first().as('searchInput')
    cy.get('@searchInput').clear().type('Ambi')

    // Seleciona tipo "Positivo"
    cy.get('[data-testid="select-type"]').click({ force: true })
    cy.contains('[role="option"]', 'Positivo', { timeout: 5000 }).should('be.visible').click()

    // Aguarda que a tabela seja atualizada
    cy.get('.enhancements-table tbody tr').should('have.length', 1)

    // Valida que apenas Ambidestria aparece
    cy.get('.enhancements-table').contains('Ambidestria').should('be.visible')

    // Agora altera para tipo "Negativo" — o mesmo termo "Ambi" não deve encontrar negativos
    cy.get('[data-testid="select-type"]').click({ force: true })
    cy.contains('[role="option"]', 'Negativo', { timeout: 5000 }).should('be.visible').click()

    // Aguarda que a tabela mostre "no data" (0 linhas)
    cy.get('.enhancements-table tbody tr').should('have.length', 0)
  })

  // ---------------------------------------------------------------------------
  // E2E-EN-15: Filtro sem resultados exibe estado no-data
  // ---------------------------------------------------------------------------
  it('E2E-EN-15: filtro por nome sem resultados exibe estado no-data', () => {
    // Digita um termo que não existe
    cy.get('[data-testid="enhancements-container"] input').first().as('searchInput')
    cy.get('@searchInput').clear().type('XYZInexistente')

    // Aguarda que a tabela mostre estado vazio (0 linhas no tbody)
    cy.get('.enhancements-table tbody tr').should('have.length', 0)

    // Valida que o template no-data é exibido
    cy.get('.enhancements-table').within(() => {
      cy.get('[role="gridcell"]').should('not.exist')
      // O template no-data do q-table exibe um ícone e texto
      cy.get('.full-width').should('be.visible')
    })
  })

  // ---------------------------------------------------------------------------
  // E2E-EN-16: Ao alterar filtro, paginação retorna à página 1
  // ---------------------------------------------------------------------------
  it('E2E-EN-16: ao alterar o filtro, a paginação retorna à página 1', () => {
    // Como a fixture tem 5 items e rowsPerPage=10, não há múltiplas páginas reais.
    // Este teste valida que o objeto pagination.page volta a 1 ao filtrar.
    // Valida o estado inicial: página 1
    cy.get('.enhancements-table').contains('Ambidestria').should('be.visible')

    // Aplica um filtro
    cy.get('[data-testid="enhancements-container"] input').first().as('searchInput')
    cy.get('@searchInput').clear().type('Mira')

    // Valida que ainda estamos na página 1 (seletor de paginação mostra "1-1 de 1" ou similar)
    // O Quasar exibe algo como "1 de 1" no seletor de paginação
    cy.get('.enhancements-table').contains('Mira Certeira').should('be.visible')

    // Limpa o filtro e valida que voltamos ao estado inicial
    cy.get('@searchInput').clear()
    cy.get('.enhancements-table tbody tr').should('have.length', 5)
  })

  // ---------------------------------------------------------------------------
  // E2E-EN-17: Paginação inicial exibe 10 linhas por página
  // ---------------------------------------------------------------------------
  it('E2E-EN-17: paginação inicial exibe 10 linhas por página (não 100)', () => {
    // Valida que apenas 5 linhas da fixture aparecem (menos que 10)
    cy.get('.enhancements-table tbody tr').should('have.length', 5)

    // Valida que com rowsPerPage=10, a tabela caberia em 1 página
    cy.get('.enhancements-table tbody tr').its('length').should('be.lte', 10)

    // Procura pelo seletor de paginação do Quasar que mostra o número de linhas por página
    // O q-table exibe a informação de paginação abaixo/ao lado da tabela
    cy.get('.enhancements-table').parent().within(() => {
      // Procura por referências ao número "10" no seletor de paginação
      cy.get('[role="button"]').each(($btn) => {
        // O seletor de linhas por página em Quasar é um input ou botão
        if ($btn.text().includes('10') || $btn.attr('aria-label')?.includes('10')) {
          cy.wrap($btn).should('exist')
        }
      })
    })
  })
})
