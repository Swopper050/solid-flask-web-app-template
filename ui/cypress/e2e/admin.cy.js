describe('admin', () => {
  beforeEach(() => {
    cy.exec('cd ../api && source .env/bin/activate && make fixtures')
  })

  it('Create new user', () => {
    cy.visit('/login')

    cy.wait(100);

    cy.get('#email').clear();
    cy.get('#email').type('admin@test.nl');
    cy.get('#password').clear();
    cy.get('#password').type('admin');
    cy.get('button[type="submit"]').click();

    cy.wait(100);

    cy.get('.text').click();
    cy.get('p.text-success').click();
    cy.get('thead > tr > .text-end > .btn').click();

    cy.wait(100);

    cy.get('#email').clear();
    cy.get('#email').type('test@test.nl');
    cy.get('#password').clear();
    cy.get('#password').type('Testing1!');
    cy.get('.modal-action > .btn').click();

    cy.wait(100);

    cy.get(':nth-child(3) > summary.btn').click();
    cy.wait(50);
    cy.get('.menu > :nth-child(3) > .btn').click();
    cy.wait(50);
    cy.visit('/login');
    cy.wait(50);

    cy.get('#email').clear();
    cy.get('#email').type('test@test.nl');
    cy.get('#password').clear();
    cy.get('#password').type('Testing1!');
    cy.get('button[type="submit"]').click();

    cy.wait(50);

    cy.url().should('include', '/home')
  })

  it('Create another admin', function() {
    cy.visit('/login');
    cy.get('#email').clear();
    cy.get('#email').type('admin@test.nl');
    cy.get('#password').clear();
    cy.get('#password').type('admin');
    cy.get('button[type="submit"]').click();
    cy.get('.text').click();
    cy.get('p.text-success').click();
    cy.get('thead > tr > .text-end').click();
    cy.get('.modal-box').click();
    cy.get('#email').clear();
    cy.get('#email').type('admin2@test.nl');
    cy.get('#password').clear();
    cy.get('#password').type('Testing1@');
    cy.get('.checkbox').check();
    cy.get('.modal-action > .btn').click();
    cy.get('.text').click();
    cy.get('.menu > :nth-child(3) > .btn').click();
    cy.visit('/login');
    cy.get('#email').clear();
    cy.get('#email').type('admin2@test.nl');
    cy.get('#password').clear();
    cy.get('#password').type('Testing1@');
    cy.get('button[type="submit"]').click();
    cy.get('.text').click();
    cy.get(':nth-child(2) > .btn > .fa-solid').click();

    cy.url().should('include', '/admin-panel')
  });

  it('Delete user', function() {
    cy.visit('/login');
    cy.get('#email').clear();
    cy.get('#email').type('admin@test.nl');
    cy.get('#password').clear();
    cy.get('#password').type('admin');
    cy.get('button[type="submit"]').click();
    cy.get('.text').click();
    cy.get('p.text-success').click();
    cy.get('thead > tr > .text-end > .btn > .fa-solid').click();
    cy.get('#email').clear();
    cy.get('#email').type('test@test.nl');
    cy.get('#password').clear();
    cy.get('#password').type('Testing1!');
    cy.get('.modal-action > .btn').click();
    cy.get('.text').click();
    cy.get('.menu > :nth-child(3) > .btn').click();
    cy.visit('/login');
    cy.get('#email').clear();
    cy.get('#email').type('test@test.nl');
    cy.get('#password').clear();
    cy.get('#password').type('Testing1!');
    cy.get('button[type="submit"]').click();
    cy.get('.text').click();
    cy.get('[open=""] > .menu > :nth-child(2) > .btn').click();
    cy.visit('/login');
    cy.get('#email').clear();
    cy.get('#email').type('admin@test.nl');
    cy.get('#password').clear();
    cy.get('#password').type('admin');
    cy.get('button[type="submit"]').click();
    cy.get('.text').click();
    cy.get('p.text-success').click();
    cy.get(':nth-child(2) > .text-end > .btn > .fa-solid').click();
    cy.get('.btn-error').click();
    cy.get('.text').click();
    cy.get('.menu > :nth-child(3) > .btn > .fa-solid').click();
    cy.visit('/login');
    cy.get('#email').clear();
    cy.get('#email').type('test@test.nl');
    cy.get('#password').clear();
    cy.get('#password').type('Testing1!');
    cy.get('button[type="submit"]').click();

    cy.get('.alert span').should('contain.text', 'Could not login with the given email and password');
  });
})
