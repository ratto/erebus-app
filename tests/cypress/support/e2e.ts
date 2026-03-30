// Este arquivo é carregado automaticamente antes de cada spec E2E.
// Importe comandos globais ou plugins aqui.
import './commands'

// Dismiss the vite-plugin-checker error overlay that appears in dev mode
// when TypeScript type errors are detected in the project files.
// This overlay blocks UI interaction in Cypress tests.
Cypress.on('window:load', (win) => {
  const overlay = win.document.querySelector('vite-plugin-checker-error-overlay')
  if (overlay) {
    overlay.remove()
  }
})
