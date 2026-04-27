describe('locale', () => {
  beforeEach(() => {
    cy.exec('cd ../api && source .env/bin/activate && make fixtures')
    cy.clearLocalStorage()
  })

  it('Switch language to dutch', () => {
    cy.login('admin@test.nl', 'admin')
    cy.get('h1').should('contain.text', 'This is the home page')
    cy.get('[data-cy="language-selector"]').click()
    cy.get('[data-cy="language-nl"]').click()
    cy.get('h1').should('contain.text', 'Dit is de home pagina')
  })
})
