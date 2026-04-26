// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.addAll({
  login(email, password) {
    cy.get('[data-cy="open-login-modal"]').click();
    cy.get('[data-cy="login-email"]').type(email);
    cy.get('[data-cy="login-password"]').type(password);
    cy.get('[data-cy="login-button"]').click();
  },
  logout() {
    cy.get('[data-cy="toggle-profile-menu-dropdown"').click();
    cy.get('[data-cy="logout"]').click();
  },
  navigateToAdminPanel() {
    cy.get('[data-cy="toggle-profile-menu-dropdown"').click();
    cy.get('[data-cy="admin-panel"]').click();
  },
  createUser(email, password, isAdmin) {
    cy.get('[data-cy="create-new-user"]').click();
    cy.get('[data-cy="new-user-email"]').type(email);
    cy.get('[data-cy="new-user-password"]').type(password);
    if (isAdmin) {
      cy.get('[data-cy="new-user-admin"]').check();
    }
    cy.get('[data-cy="submit-new-user"]').click();
  },
  deleteUser(email) {
    cy.get(`[data-cy="delete-user-${email}"]`).click();
    cy.get(`[data-cy="delete-user"]`).click();
  }
})
