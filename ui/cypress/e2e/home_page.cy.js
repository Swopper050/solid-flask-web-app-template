describe('home page', () => {
  it('Redirects to login when not authenticated', () => {
    cy.visit('/home')
    cy.url().should('include', '/login')
  })
})
