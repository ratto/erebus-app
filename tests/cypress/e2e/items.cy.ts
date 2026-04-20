/**
 * E2E — Página de Itens (/itens)
 * SPEC: SPEC-008 — CRUD de Itens
 * Data: 2026-04-18
 *
 * Não depende da erebus-api — itens são mantidos apenas na store Pinia (client-side).
 *
 * NOTAS DE IMPLEMENTAÇÃO:
 * - O app usa hash-mode routing. Todas as rotas são acessadas via /#/rota.
 * - Seletores via data-testid para robustez em CI headless.
 * - O q-input tem debounce="300" — aguardamos cy.wait(400) após digitar.
 */

const ITEMS_URL = '/#/itens';
const HOME_URL = '/#/';

describe('Página de Itens — /itens', () => {
  beforeEach(() => {
    cy.visit(ITEMS_URL);
  });

  // ---------------------------------------------------------------------------
  // E2E-01: Página carrega com tabela vazia
  // ---------------------------------------------------------------------------
  it('E2E-01: exibe a tabela com estado vazio ao carregar', () => {
    cy.get('.items-table').should('be.visible');
    cy.get('.items-table').contains('th', 'Nome').should('be.visible');
    cy.get('.items-table').contains('th', 'Tipo').should('be.visible');
    cy.get('.items-table').contains('th', 'Descrição').should('be.visible');
    cy.get('.items-table').contains('Nenhum item cadastrado').should('be.visible');
  });

  // ---------------------------------------------------------------------------
  // E2E-02: Criar item — aparece na tabela
  // ---------------------------------------------------------------------------
  it('E2E-02: criar item aparece na tabela com badge correto', () => {
    cy.get('[data-testid="btn-new-item"]').click();

    cy.get('[data-testid="input-item-name"]').find('input').type('Tocha');

    cy.get('[data-testid="select-item-type"]').click();
    cy.get('.q-menu').should('be.visible');
    cy.get('.q-menu').contains('.q-item', 'Mundano').click({ force: true });

    cy.get('[data-testid="input-item-description"]').find('textarea').type('Ilumina ambientes escuros.');

    cy.get('[data-testid="btn-save"]').click();

    cy.get('.items-table').contains('Tocha').should('be.visible');
    cy.get('.items-table').contains('Mundano').should('be.visible');
  });

  // ---------------------------------------------------------------------------
  // E2E-03: Editar item — linha atualiza
  // ---------------------------------------------------------------------------
  it('E2E-03: editar item atualiza a linha na tabela', () => {
    // Cria item
    cy.get('[data-testid="btn-new-item"]').click();
    cy.get('[data-testid="input-item-name"]').find('input').type('Poção');
    cy.get('[data-testid="select-item-type"]').click();
    cy.get('.q-menu').contains('.q-item', 'Consumível').click({ force: true });
    cy.get('[data-testid="btn-save"]').click();

    cy.get('.items-table').contains('Poção').should('be.visible');

    // Clica em editar (primeiro botão de edição na tabela)
    cy.get('[data-testid^="btn-edit-"]').first().click();

    // Limpa e altera o nome
    cy.get('[data-testid="input-item-name"]').find('input').clear().type('Poção de Cura');

    cy.get('[data-testid="btn-save"]').click();

    cy.get('.items-table').contains('Poção de Cura').should('be.visible');
    cy.get('.items-table').should('not.contain.text', 'Poção').within(() => {});
  });

  // ---------------------------------------------------------------------------
  // E2E-04: Remover item — linha desaparece
  // ---------------------------------------------------------------------------
  it('E2E-04: remover item remove a linha da tabela', () => {
    // Cria item
    cy.get('[data-testid="btn-new-item"]').click();
    cy.get('[data-testid="input-item-name"]').find('input').type('Corda');
    cy.get('[data-testid="select-item-type"]').click();
    cy.get('.q-menu').contains('.q-item', 'Mundano').click({ force: true });
    cy.get('[data-testid="btn-save"]').click();

    cy.get('.items-table').contains('Corda').should('be.visible');

    // Clica em remover
    cy.get('[data-testid^="btn-delete-"]').first().click();

    // Confirma no dialog
    cy.get('[data-testid="btn-delete-confirm"]').click();

    cy.get('.items-table').should('not.contain', 'Corda');
    cy.get('.items-table').contains('Nenhum item cadastrado').should('be.visible');
  });

  // ---------------------------------------------------------------------------
  // E2E-05: Cancelar remoção mantém o item
  // ---------------------------------------------------------------------------
  it('E2E-05: cancelar remoção mantém o item na tabela', () => {
    cy.get('[data-testid="btn-new-item"]').click();
    cy.get('[data-testid="input-item-name"]').find('input').type('Bússola');
    cy.get('[data-testid="select-item-type"]').click();
    cy.get('.q-menu').contains('.q-item', 'Mundano').click({ force: true });
    cy.get('[data-testid="btn-save"]').click();

    cy.get('[data-testid^="btn-delete-"]').first().click();
    cy.get('[data-testid="btn-delete-cancel"]').click();

    cy.get('.items-table').contains('Bússola').should('be.visible');
  });

  // ---------------------------------------------------------------------------
  // E2E-06: Busca por nome filtra a tabela
  // ---------------------------------------------------------------------------
  it('E2E-06: busca por nome filtra a tabela (debounce 300ms)', () => {
    // Cria dois itens
    cy.get('[data-testid="btn-new-item"]').click();
    cy.get('[data-testid="input-item-name"]').find('input').type('Lanterna');
    cy.get('[data-testid="select-item-type"]').click();
    cy.get('.q-menu').contains('.q-item', 'Mundano').click({ force: true });
    cy.get('[data-testid="btn-save"]').click();

    cy.get('[data-testid="btn-new-item"]').click();
    cy.get('[data-testid="input-item-name"]').find('input').type('Poção de Força');
    cy.get('[data-testid="select-item-type"]').click();
    cy.get('.q-menu').contains('.q-item', 'Consumível').click({ force: true });
    cy.get('[data-testid="btn-save"]').click();

    // Busca por "lant"
    cy.get('[data-testid="search-input"]').find('input').type('lant');
    cy.wait(400);

    cy.get('.items-table').contains('Lanterna').should('be.visible');
    cy.get('.items-table').should('not.contain', 'Poção de Força');
  });

  // ---------------------------------------------------------------------------
  // E2E-07: Filtro por tipo filtra a tabela
  // ---------------------------------------------------------------------------
  it('E2E-07: filtro por tipo filtra a tabela', () => {
    // Cria item mundano e consumível
    cy.get('[data-testid="btn-new-item"]').click();
    cy.get('[data-testid="input-item-name"]').find('input').type('Isqueiro');
    cy.get('[data-testid="select-item-type"]').click();
    cy.get('.q-menu').contains('.q-item', 'Mundano').click({ force: true });
    cy.get('[data-testid="btn-save"]').click();

    cy.get('[data-testid="btn-new-item"]').click();
    cy.get('[data-testid="input-item-name"]').find('input').type('Antídoto');
    cy.get('[data-testid="select-item-type"]').click();
    cy.get('.q-menu').contains('.q-item', 'Consumível').click({ force: true });
    cy.get('[data-testid="btn-save"]').click();

    // Filtra por Consumível
    cy.get('[data-testid="select-type"]').click();
    cy.get('.q-menu').contains('.q-item', 'Consumível').click({ force: true });

    cy.get('.items-table').contains('Antídoto').should('be.visible');
    cy.get('.items-table').should('not.contain', 'Isqueiro');
  });

  // ---------------------------------------------------------------------------
  // E2E-08: Combinação busca + filtro
  // ---------------------------------------------------------------------------
  it('E2E-08: combinação de busca e filtro funciona por interseção', () => {
    // Cria 3 itens
    cy.get('[data-testid="btn-new-item"]').click();
    cy.get('[data-testid="input-item-name"]').find('input').type('Poção A');
    cy.get('[data-testid="select-item-type"]').click();
    cy.get('.q-menu').contains('.q-item', 'Consumível').click({ force: true });
    cy.get('[data-testid="btn-save"]').click();

    cy.get('[data-testid="btn-new-item"]').click();
    cy.get('[data-testid="input-item-name"]').find('input').type('Poção B');
    cy.get('[data-testid="select-item-type"]').click();
    cy.get('.q-menu').contains('.q-item', 'Mundano').click({ force: true });
    cy.get('[data-testid="btn-save"]').click();

    cy.get('[data-testid="btn-new-item"]').click();
    cy.get('[data-testid="input-item-name"]').find('input').type('Espada');
    cy.get('[data-testid="select-item-type"]').click();
    cy.get('.q-menu').contains('.q-item', 'Mundano').click({ force: true });
    cy.get('[data-testid="btn-save"]').click();

    // Filtra por Consumível e busca "Poção"
    cy.get('[data-testid="select-type"]').click();
    cy.get('.q-menu').contains('.q-item', 'Consumível').click({ force: true });

    cy.get('[data-testid="search-input"]').find('input').type('Poção');
    cy.wait(400);

    cy.get('.items-table').contains('Poção A').should('be.visible');
    cy.get('.items-table').should('not.contain', 'Poção B');
    cy.get('.items-table').should('not.contain', 'Espada');
  });

  // ---------------------------------------------------------------------------
  // E2E-09: Filtros sem resultado exibem mensagem adequada
  // ---------------------------------------------------------------------------
  it('E2E-09: filtros sem resultado exibem mensagem de filtro vazio', () => {
    cy.get('[data-testid="search-input"]').find('input').type('ItemQueNaoExiste');
    cy.wait(400);

    cy.get('.items-table').contains('Nenhum item encontrado para os filtros aplicados').should('be.visible');
  });

  // ---------------------------------------------------------------------------
  // E2E-10: Navegação via MenuDrawer
  // ---------------------------------------------------------------------------
  it('E2E-10: link ITENS no MenuDrawer navega para /#/itens', () => {
    cy.visit(HOME_URL);

    cy.get('.erebus-topbar button').first().click();
    cy.get('.erebus-drawer').contains('ITENS').click({ force: true });

    cy.url().should('include', '/#/itens');
    cy.get('.items-table').should('be.visible');
  });

  // ---------------------------------------------------------------------------
  // E2E-11: Validação — salvar com nome vazio desabilitado
  // ---------------------------------------------------------------------------
  it('E2E-11: botão Salvar fica desabilitado com nome vazio', () => {
    cy.get('[data-testid="btn-new-item"]').click();

    cy.get('[data-testid="btn-save"]').should('be.disabled');

    cy.get('[data-testid="input-item-name"]').find('input').type('Nome válido');
    cy.get('[data-testid="select-item-type"]').click();
    cy.get('.q-menu').contains('.q-item', 'Mundano').click({ force: true });

    cy.get('[data-testid="btn-save"]').should('not.be.disabled');
  });
});
