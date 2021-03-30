import { newE2EPage } from '@stencil/core/testing';

describe('local-auth-strategy', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<local-auth-strategy></local-auth-strategy>');
    const element = await page.find('local-auth-strategy');
    expect(element).toHaveClass('hydrated');
  });{cursor}
});
