describe('Smoke', () => {
  it('página inicial carrega', () => {
    cy.visit('/')
    cy.title().should('match', /Erebus/)
  })
})
