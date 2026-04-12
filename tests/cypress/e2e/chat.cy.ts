/**
 * E2E — ChatDrawer / Terminal
 * Autor: Atena (QA)
 * SPEC: SPEC-004 — Implementar Mensageria
 * Data: 2026-04-12
 *
 * Cobre os critérios de aceite:
 *  - E2E-13: Botão de chat abre o drawer
 *  - E2E-14: /roll 2d6 envia para a API e exibe resultado no chat (API mockada)
 *  - E2E-15: Eventos SSE recebidos aparecem no drawer (EventSource mockado)
 *
 * NOTAS:
 *  - O app usa hash-mode routing. Todas as visitas via /#/ ou /#/rota.
 *  - O botão de chat na ErebusTopbar tem aria-label="Terminal".
 *  - O ChatDrawer tem q-drawer com class="chat-drawer" e um header com class="chat-title".
 *  - O q-input dentro do drawer tem placeholder "Digite um comando ou /roll 2d6".
 *  - EventSource é mockado via cy.stub para não depender do servidor SSE.
 */

const HOME_URL = '/#/';
const DICE_API = /\/api\/v1\/dice\/roll$/;

// ── Helper: abre o chat drawer ────────────────────────────────────────────────

function openChatDrawer() {
  cy.get('[aria-label="Terminal"]').click();
  // Aguarda o header do drawer ficar visível
  cy.get('.chat-title', { timeout: 3000 }).should('be.visible');
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('ChatDrawer — Terminal', () => {
  // ── E2E-13: botão abre o drawer ─────────────────────────────────────────────

  describe('E2E-13: botão de chat na topbar abre o drawer', () => {
    beforeEach(() => {
      // Visita com EventSource stubado para evitar conexão real ao SSE
      cy.visit(HOME_URL, {
        onBeforeLoad(win) {
          cy.stub(win, 'EventSource').callsFake(function () {
            return { onmessage: null, onerror: null, close: cy.stub() };
          });
        },
      });
    });

    it('drawer está fechado inicialmente', () => {
      cy.get('.chat-title').should('not.be.visible');
    });

    it('clique no botão torna o drawer visível', () => {
      cy.get('[aria-label="Terminal"]').click();
      cy.get('.chat-title').should('be.visible').and('contain', 'Terminal');
    });

    it('drawer exibe estado vazio antes de qualquer mensagem', () => {
      openChatDrawer();
      cy.contains('Nenhuma mensagem ainda').should('be.visible');
    });

    it('clique no botão de fechar (×) fecha o drawer', () => {
      openChatDrawer();
      cy.get('.close-btn').click();
      cy.get('.chat-title').should('not.be.visible');
    });
  });

  // ── E2E-14: /roll 2d6 envia para API e exibe resultado ─────────────────────

  describe('E2E-14: /roll 2d6 exibe resultado no chat', () => {
    beforeEach(() => {
      cy.intercept('POST', DICE_API, {
        statusCode: 200,
        body: { results: [2, 4], total: 6 },
      }).as('rollDice');

      cy.visit(HOME_URL, {
        onBeforeLoad(win) {
          cy.stub(win, 'EventSource').callsFake(function () {
            return { onmessage: null, onerror: null, close: cy.stub() };
          });
        },
      });

      openChatDrawer();
    });

    it('digitar /roll 2d6 + Enter chama a API de dados', () => {
      cy.get('.chat-input input').type('/roll 2d6{enter}');
      cy.wait('@rollDice');
    });

    it('exibe o comando digitado como mensagem user-command', () => {
      cy.get('.chat-input input').type('/roll 2d6{enter}');
      cy.wait('@rollDice');
      cy.get('.message-user-command').should('be.visible').and('contain', '/roll 2d6');
    });

    it('exibe o resultado da rolagem como mensagem roll-result', () => {
      cy.get('.chat-input input').type('/roll 2d6{enter}');
      cy.wait('@rollDice');
      // O resultado é formatado como "2d6: [2, 4] = 6"
      cy.get('.message-roll-result')
        .should('be.visible')
        .and('contain', '2d6')
        .and('contain', '6');
    });

    it('/roll inválido (/roll 3d20) exibe mensagem de erro sem chamar a API', () => {
      cy.get('.chat-input input').type('/roll 3d20{enter}');
      // A API não deve ser chamada para dado inválido
      cy.get('@rollDice.all').should('have.length', 0);
      cy.get('.message-error').should('be.visible');
    });

    it('campo de input é limpo após envio do comando', () => {
      cy.get('.chat-input input').type('/roll 2d6{enter}');
      cy.wait('@rollDice');
      cy.get('.chat-input input').should('have.value', '');
    });
  });

  // ── E2E-15: eventos SSE aparecem no drawer ──────────────────────────────────

  describe('E2E-15: eventos SSE recebidos aparecem no drawer', () => {
    it('evento SSE dice.rolled aparece como mensagem server-event no chat', () => {
      // Referência ao mock da instância EventSource para simular eventos
      let sseInstance: {
        onmessage: ((e: MessageEvent) => void) | null;
        onerror: (() => void) | null;
        close: () => void;
      } | null = null;

      cy.visit(HOME_URL, {
        onBeforeLoad(win) {
          cy.stub(win, 'EventSource').callsFake(function () {
            sseInstance = { onmessage: null, onerror: null, close: cy.stub() };
            return sseInstance;
          });
        },
      });

      openChatDrawer();

      // Dispara um evento SSE simulado depois que o drawer está aberto
      cy.window().then(() => {
        if (sseInstance && sseInstance.onmessage) {
          const payload = { diceType: 'd6', count: 1, results: [4], total: 4 };
          const data = JSON.stringify({
            event: 'dice.rolled',
            payload,
            timestamp: new Date().toISOString(),
          });
          sseInstance.onmessage(new MessageEvent('message', { data }));
        }
      });

      // O evento deve aparecer como mensagem server-event no drawer
      cy.get('.message-server-event')
        .should('be.visible')
        .and('contain', 'dice.rolled');
    });

    it('múltiplos eventos SSE são exibidos em sequência', () => {
      let sseInstance: {
        onmessage: ((e: MessageEvent) => void) | null;
        onerror: (() => void) | null;
        close: () => void;
      } | null = null;

      cy.visit(HOME_URL, {
        onBeforeLoad(win) {
          cy.stub(win, 'EventSource').callsFake(function () {
            sseInstance = { onmessage: null, onerror: null, close: cy.stub() };
            return sseInstance;
          });
        },
      });

      openChatDrawer();

      cy.window().then(() => {
        if (sseInstance && sseInstance.onmessage) {
          const makeEvent = (total: number) =>
            new MessageEvent('message', {
              data: JSON.stringify({
                event: 'dice.rolled',
                payload: { diceType: 'd6', count: 1, results: [total], total },
                timestamp: new Date().toISOString(),
              }),
            });
          sseInstance.onmessage(makeEvent(3));
          sseInstance.onmessage(makeEvent(5));
        }
      });

      cy.get('.message-server-event').should('have.length', 2);
    });
  });
});
