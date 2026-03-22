describe('authentication', () => {
  beforeEach(() => {
    cy.exec('cd ../api && source .env/bin/activate && make fixtures')
  })

  it('Login as admin', () => {
    cy.visit('/login')

    cy.get('#email').clear()
    cy.get('#email').type('admin@test.nl')
    cy.get('#password').clear()
    cy.get('#password').type('admin')
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/home')
  })

  it('Register new user', function () {
    cy.visit('/register')

    cy.get('#name').clear()
    cy.get('#name').type('Test User')
    cy.get('#email').clear()
    cy.get('#email').type('test@test.nl')
    cy.get('#password').clear()
    cy.get('#password').type('Testing1!')
    cy.get('#checkPassword').clear()
    cy.get('#checkPassword').type('Testing1!')
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/home')
  })

  it('Logout', function () {
    cy.visit('/login')
    cy.get('#email').clear()
    cy.get('#email').type('admin@test.nl')
    cy.get('#password').clear()
    cy.get('#password').type('admin')
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/home')
    cy.wait(200)

    cy.get(':nth-child(3) > summary.btn').click()
    cy.get('.menu > :nth-child(3) > .btn').click()

    cy.url().should('not.include', '/home')
  })

  it('Forgot password', function () {
    cy.visit('/login')
    cy.get('a[href="/forgot-password"]').click()
    cy.get('#email').clear()
    cy.get('#email').type('admin@test.nl')
    cy.get('form button[type="submit"]').first().click();
  })

  it('Login failed with incorrect password', function () {
    cy.visit('/login')
    cy.get('#email').clear()
    cy.get('#email').type('admin@test.nl')
    cy.get('#password').clear()
    cy.get('#password').type('test')
    cy.get('button[type="submit"]').click()

    cy.get('.alert span').should(
      'contain.text',
      'Could not login with the given email and password'
    )
  })

  it('Register failed email already exists', function () {
    cy.visit('/register')
    cy.get('#name').clear()
    cy.get('#name').type('Admin User')
    cy.get('#email').clear()
    cy.get('#email').type('admin@test.nl')
    cy.get('#password').clear()
    cy.get('#password').type('Testing1!')
    cy.get('#checkPassword').clear()
    cy.get('#checkPassword').type('Testing1!')
    cy.get('button[type="submit"]').click()

    cy.get('.alert span').should(
      'contain.text',
      'An account with this email already exists'
    )
    cy.url().should('not.include', '/home')
  })

  it('Change password', function () {
    cy.visit('/login')
    cy.get('#email').clear()
    cy.get('#email').type('admin@test.nl')
    cy.get('#password').clear()
    cy.get('#password').type('admin')
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/home')

    cy.get('.text').click()
    cy.get('[open=""] > .menu > :nth-child(1) > .btn').click()
    cy.get(':nth-child(2) > .text-end > .tooltip > .btn > .fa-solid').click()
    cy.get('#currentPassword').clear()
    cy.get('#currentPassword').type('admin')
    cy.get('#newPassword').clear()
    cy.get('#newPassword').type('Testing1@')
    cy.get('#confirmNewPassword').clear()
    cy.get('#confirmNewPassword').type('Testing1@{enter}')

    cy.get('.text').click()
    cy.get('.fa-arrow-right-from-bracket').click({ force: true })
    cy.visit('/login')

    cy.get('#email').clear()
    cy.get('#email').type('admin@test.nl')
    cy.get('#password').clear()
    cy.get('#password').type('Testing1@')
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/home')
  })

  it('Delete own account', function () {
    cy.visit('/register')
    cy.get('#name').clear()
    cy.get('#name').type('Test User')
    cy.get('#email').clear()
    cy.get('#email').type('test@test.nl')
    cy.get('#password').clear()
    cy.get('#password').type('Testing1!')
    cy.get('#checkPassword').clear()
    cy.get('#checkPassword').type('Testing1!')
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/home')

    cy.get('.text').click()
    cy.get('[open=""] > .menu > :nth-child(1) > .btn').click()
    cy.get('div.mt-4 > .btn').click()
    cy.get('.modal-action > .btn-error').click()
    cy.visit('/login')
    cy.get('#email').clear()
    cy.get('#email').type('test@test.nl')
    cy.get('#password').clear()
    cy.get('#password').type('Testing1!')
    cy.get('button[type="submit"]').click()

    cy.get('.alert span').should(
      'contain.text',
      'Could not login with the given email and password'
    )
  })
})
