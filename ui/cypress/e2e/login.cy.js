describe('login', () => {
  it('Login as admin', () => {
    cy.visit('/')

    cy.get('.hidden > :nth-child(1)').click();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').clear('ad');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').type('admin@test.nl');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').clear();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').type('admin{enter}');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > .modal-action > .btn').click();
  })
})
