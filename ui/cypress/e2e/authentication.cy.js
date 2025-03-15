describe('authentication', () => {
  beforeEach(() => {
    cy.exec('cd ../api && source .env/bin/activate && make fixtures')
  })

  it('Login as admin', () => {
    cy.visit('/')

    cy.get('.hidden > :nth-child(1)').click();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').clear('ad');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').type('admin@test.nl');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').clear();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').type('admin');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > .modal-action > .btn').click();

    cy.url().should('include', '/home')
  })

  it('Register new user', function() {
    cy.visit('/');

    cy.get('.hidden > :nth-child(2)').click();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').clear('b');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').type('test@test.nl');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').clear();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').type('Testing1');
    cy.get('#checkPassword').clear();
    cy.get('#checkPassword').type('Testing1');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > .modal-action > .btn').click();

    cy.url().should('include', '/home')
  });

  it('Logout', function() {
    cy.visit('/');
    cy.get('.hidden > :nth-child(1)').click();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').clear('ad');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').type('admin@test.nl');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').clear();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').type('admin');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > .modal-action > .btn').click();

    cy.url().should('include', '/home')
    cy.wait(200);

    cy.get(':nth-child(3) > summary.btn').click();
    cy.get('.menu > :nth-child(3) > .btn').click();

    cy.url().should('not.include', '/home')
  });

  it('Forgot password', function() {
    cy.visit('/');
    cy.get('.hidden > :nth-child(1)').click();
    cy.get('.space-y-4 > .justify-center').click();
    cy.get('form > :nth-child(1) > .input > #email').clear('ad');
    cy.get('form > :nth-child(1) > .input > #email').type('admin@test.nl');
    cy.get('.justify-center > button.btn').click();
  });

  it('Login failed with incorrect password', function() {
    cy.visit('/');
    cy.get('.hidden > :nth-child(1)').click();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').clear('ad');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').type('admin@test.nl');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').clear();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').type('test');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > .modal-action > .btn').click();

    cy.get('.alert span').should('contain.text', 'Could not login with the given email and password');
  });

  it('Register failed email already exists', function() {
    cy.visit('/');
    cy.get('.hidden > :nth-child(2)').click();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').clear('ad');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').type('admin@test.nl');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').clear();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').type('Testing1');
    cy.get('#checkPassword').clear();
    cy.get('#checkPassword').type('Testing1{enter}');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > .modal-action > .btn').click();

    cy.get('.alert span').should('contain.text', 'An account with this email already exists');
    cy.url().should('not.include', '/home')
  });

  it('Change password', function() {
    cy.visit('/');
    cy.get('.hidden > :nth-child(1)').click();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').clear('ad');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').type('admin@test.nl');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').clear();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').type('admin');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > .modal-action > .btn').click();

    cy.url().should('include', '/home')

    cy.get('.text').click();
    cy.get('[open=""] > .menu > :nth-child(1) > .btn').click();
    cy.get(':nth-child(2) > .text-end > .tooltip > .btn > .fa-solid').click();
    cy.get('#currentPassword').clear('ad');
    cy.get('#currentPassword').type('admin');
    cy.get('#newPassword').clear();
    cy.get('#newPassword').type('Testing1');
    cy.get('#confirmNewPassword').clear();
    cy.get('#confirmNewPassword').type('Testing1{enter}');

    cy.get('.text').click();
    cy.get('.menu > :nth-child(3) > .btn').click();
    cy.get('.hidden > :nth-child(1)').click();

    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').clear('ad');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').type('admin@test.nl');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').clear();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').type('Testing1');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > .modal-action > .btn').click();

    cy.url().should('include', '/home')
  });

  it('Delete own account', function() {
    cy.visit('/');
    cy.get('.hidden > :nth-child(2)').click();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').clear('te');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').type('test@test.nl');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').clear();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').type('Testing1');
    cy.get('#checkPassword').clear();
    cy.get('#checkPassword').type('Testing1');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > .modal-action > .btn').click();

    cy.url().should('include', '/home')

    cy.get('.text').click();
    cy.get('[open=""] > .menu > :nth-child(1) > .btn').click();
    cy.get('div.mt-4 > .btn').click();
    cy.get('.modal-action > .btn-error').click();
    cy.get('.hidden > :nth-child(1)').click();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').clear('te');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(1) > .input > #email').type('test@test.nl');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').clear();
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > :nth-child(2) > .input > #password').type('Testing1{enter}');
    cy.get('.modal-open > .modal-box > form.w-full > .space-y-4 > .modal-action > .btn').click();

    cy.get('.alert span').should('contain.text', 'Could not login with the given email and password');
  });
})
