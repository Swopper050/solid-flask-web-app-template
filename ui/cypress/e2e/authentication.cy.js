describe('authentication', () => {
  beforeEach(() => {
    cy.exec('cd ../api && source .env/bin/activate && make fixtures')
  })

  it('Login as admin', () => {
    cy.login('admin@test.nl', 'admin')
    cy.url().should('include', '/home')
  })

  it('Register new user', () => {
    cy.register('Test User', 'test@test.nl', 'Testing1!')
    cy.url().should('include', '/home')
  })

  it('Logout', () => {
    cy.login('admin@test.nl', 'admin')
    cy.logout()
    cy.url().should('not.include', '/home')
  })

  it('Forgot password', () => {
    cy.forgotPassword('admin@test.nl')
    cy.get('[data-cy="forgot-password-success"]').should('exist')
  })

  it('Login failed with incorrect password', () => {
    cy.login('admin@test.nl', 'wrong-password')
    cy.get('[data-cy="login-error"]').should('contain.text', 'Could not login with the given email and password')
  })

  it('Register failed email already exists', () => {
    cy.register('Admin User', 'admin@test.nl', 'Testing1!')
    cy.get('[data-cy="register-error"]').should('contain.text', 'An account with this email already exists')
    cy.url().should('not.include', '/home')
  })

  it('Change password', () => {
    cy.login('admin@test.nl', 'admin')
    cy.navigateToAccount()
    cy.changePassword('admin', 'Testing1@')
    cy.logout()
    cy.login('admin@test.nl', 'Testing1@')
    cy.url().should('include', '/home')
  })

  it('Delete own account', () => {
    cy.register('Test User', 'test@test.nl', 'Testing1!')
    cy.navigateToAccount()
    cy.deleteAccount()
    cy.login('test@test.nl', 'Testing1!')
    cy.get('[data-cy="login-error"]').should('contain.text', 'Could not login with the given email and password')
  })
})
