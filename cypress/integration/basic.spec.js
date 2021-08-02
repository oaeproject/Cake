/// <reference types="Cypress" />

import { compose, not, isEmpty } from 'ramda';

const isNotEmpty = compose(not, isEmpty);

const createTenantAdmin = () => {};
const createRegularUser = () => {};

const MOCK_USERNAME = 'miguellaginha';
const OAE = 'Open Academic Environment';

describe('Make sure the interface works', () => {
  before(() => {
    createTenantAdmin();
    createRegularUser();
  });

  beforeEach(() => {
    cy.visit('/');
  });

  it('It is up and running', () => {
    cy.title().should('eq', OAE);
    cy.contains(OAE);
  });
});

describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  const fillInForm = credentials => {
    cy.get('a.signIn-button').click();
    cy.get('#username').click();

    if (isNotEmpty(credentials.username)) {
      cy.get('#username').shadow().find('input').type(credentials.username);
    }
    if (isNotEmpty(credentials.password)) {
      cy.get('#password').shadow().find('input').type(credentials.password);
    }
    cy.get('#submit-button').click();
  };

  const assertLocationHasNotChanged = () => {
    cy.location().should(location => {
      expect(location.host).to.eq('guest.oae.com');
      expect(location.pathname).to.eq('/');
    });
  };

  it('rejects submit without username', () => {
    fillInForm({ username: '', password: 'password' });
    cy.contains('A valid username should be provided');

    assertLocationHasNotChanged();
  });

  it('rejects submit without password', () => {
    fillInForm({ username: 'username', password: '' });
    cy.contains('A valid password should be provided');

    assertLocationHasNotChanged();
  });

  it('rejects login without correct credentials', () => {
    fillInForm({ username: 'username', password: 'password' });
    cy.contains('Wrong credentials');

    assertLocationHasNotChanged();
    cy.get('#password').shadow().find('input').should('have.value', '');
  });

  it('login as regular user and then logout', () => {
    const mockCredentials = { username: MOCK_USERNAME, password: MOCK_USERNAME };
    fillInForm(mockCredentials);

    cy.title().should('eq', OAE);
    cy.contains('Home');
    cy.contains('Upload file');
    cy.contains('Create');
    cy.contains('Activity Feed');
    cy.contains('Library');
    cy.contains('Discussions');
    cy.contains('Groups');
    cy.contains('Settings');

    cy.location().should(location => {
      expect(location.host).to.eq('guest.oae.com');
      expect(location.pathname).to.eq('/dashboard');
    });

    cy.get('button.logout-button').click();

    cy.location().should(location => {
      expect(location.host).to.eq('guest.oae.com');
      expect(location.pathname).to.eq('/');
    });
  });

  it('login as regular user and check cookies', () => {
    const mockCredentials = { username: MOCK_USERNAME, password: MOCK_USERNAME };
    fillInForm(mockCredentials);

    cy.getCookies().should('have.length', 2);

    expect(cy.getCookie('session')).to.exist;
    expect(cy.getCookie('session.sig')).to.exist;

    cy.getCookie('loggedin_tenancies').should('eq', null);
    cy.getCookie('breadcrumb').should('eq', null);
  });
});
