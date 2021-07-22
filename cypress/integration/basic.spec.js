import { expect } from 'chai';

describe('Make sure Cake is launched', () => {
  it('actually works', () => {
    cy.visit('/');
    cy.contains('Open Academic Environment');
  });
});
