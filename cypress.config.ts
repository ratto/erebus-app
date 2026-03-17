import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:9000',
    specPattern: 'tests/e2e/**/*.cy.ts',
    supportFile: false,
    video: false,
    screenshotOnRunFailure: true,
  },
})
