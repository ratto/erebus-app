import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:9000',
    specPattern: 'tests/cypress/e2e/**/*.cy.ts',
    supportFile: 'tests/cypress/support/e2e.ts',
    fixturesFolder: 'tests/cypress/fixtures',
    video: false,
    screenshotOnRunFailure: true,
    // Required to intercept cross-origin requests (API on :3000 vs app on :9000)
    chromeWebSecurity: false,
  },
})
