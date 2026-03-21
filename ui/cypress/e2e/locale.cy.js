describe('locale', () => {
  it('Switch language to dutch', () => {
    cy.visit('/login')

    cy.get('h1').should('contain.text', 'Welcome back');

    cy.get('.dropdown > .btn-sm').click();
    cy.get('.menu > :nth-child(2) > .btn > .flex').click();

    cy.get('h1').should('contain.text', 'Welkom terug');
  })
})
