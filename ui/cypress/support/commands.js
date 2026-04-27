Cypress.Commands.addAll({
  login(email, password) {
    cy.visit('/login')
    cy.get('[data-cy="login-email"]').type(email)
    cy.get('[data-cy="login-password"]').type(password)
    cy.get('[data-cy="login-button"]').click()
  },
  logout() {
    cy.get('[data-cy="toggle-profile-menu-dropdown"]').click()
    cy.get('[data-cy="logout"]').click()
  },
  register(name, email, password) {
    cy.visit('/register')
    cy.get('[data-cy="register-name"]').type(name)
    cy.get('[data-cy="register-email"]').type(email)
    cy.get('[data-cy="register-password"]').type(password)
    cy.get('[data-cy="register-check-password"]').type(password)
    cy.get('[data-cy="register-button"]').click()
  },
  forgotPassword(email) {
    cy.visit('/forgot-password')
    cy.get('[data-cy="forgot-password-email"]').type(email)
    cy.get('[data-cy="forgot-password-submit"]').click()
  },
  navigateToAdminPanel() {
    cy.get('[data-cy="toggle-profile-menu-dropdown"]').click()
    cy.get('[data-cy="admin-panel"]').click()
  },
  navigateToAccount() {
    cy.get('[data-cy="toggle-profile-menu-dropdown"]').click()
    cy.get('[data-cy="user-account"]').click()
  },
  changePassword(currentPassword, newPassword) {
    cy.get('[data-cy="open-change-password"]').click()
    cy.get('[data-cy="change-password-current"]').type(currentPassword)
    cy.get('[data-cy="change-password-new"]').type(newPassword)
    cy.get('[data-cy="change-password-confirm"]').type(newPassword)
    cy.get('[data-cy="change-password-submit"]').click()
  },
  deleteAccount() {
    cy.get('[data-cy="delete-account"]').click()
    cy.get('[data-cy="confirm-delete-account"]').click()
  },
  createUser(email, password, isAdmin) {
    cy.get('[data-cy="create-new-user"]').click()
    cy.get('[data-cy="new-user-email"]').type(email)
    cy.get('[data-cy="new-user-password"]').type(password)
    if (isAdmin) {
      cy.get('[data-cy="new-user-admin"]').check()
    }
    cy.get('[data-cy="submit-new-user"]').click()
  },
  deleteUser(email) {
    cy.get(`[data-cy="delete-user-${email}"]`).click()
    cy.get(`[data-cy="delete-user"]`).click()
  },
})
