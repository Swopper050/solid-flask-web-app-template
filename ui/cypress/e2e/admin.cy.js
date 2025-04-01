describe('admin', () => {
  beforeEach(() => {
    cy.exec('cd ../api && source .env/bin/activate && make fixtures')
  })

  it('Create new user', () => {
    cy.visit('/')

    cy.login("admin@test.nl", "admin")
    cy.navigateToAdminPanel()
    cy.createUser("user@test.nl", "Testing1", false)
    cy.logout()
    cy.login("user@test.nl", "Testing1")
    cy.url().should('include', '/home')
  })

  it('Create another admin', function() {
    cy.visit('/')

    cy.login("admin@test.nl", "admin")
    cy.navigateToAdminPanel()
    cy.createUser("another@admin.nl", "AdminAwesome1", true)
    cy.logout()
    cy.login("another@admin.nl", "AdminAwesome1")
    cy.navigateToAdminPanel()
    cy.url().should('include', '/admin-panel')
  });

  it('Delete user', function() {
    cy.visit('/');

    cy.login("admin@test.nl", "admin")
    cy.navigateToAdminPanel()
    cy.createUser("user@test.nl", "Testing1", false)
    cy.logout()

    cy.login("user@test.nl", "Testing1")
    cy.url().should('include', '/home')
    cy.logout()

    cy.login("admin@test.nl", "admin")
    cy.navigateToAdminPanel()

    cy.deleteUser("user@test.nl")
    cy.logout()

    cy.login("user@test.nl", "Testing1")
    cy.get('[data-cy="login-error"]').should('contain.text', 'Could not login with the given email and password');
  });
})
