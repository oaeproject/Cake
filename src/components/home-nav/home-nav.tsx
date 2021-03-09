/* eslint-disable import/no-unassigned-import, new-cap */
import { Component, h, Prop, Element } from '@stencil/core';

import '@material/mwc-dialog';
import '@material/mwc-button';
import '@material/mwc-textfield';

import { pipe, last, split, equals } from 'ramda';

@Component({
  tag: 'home-nav',
  styleUrl: 'home-nav.scss',
  assetsDirs: ['assets'],
})
export class HomeNav {
  @Prop() tenantLogo: string;
  @Prop() authStrategyInfo: Record<string, unknown>;
  @Element() element;

  showSignInModal = () => {
    const dialog = this.element.querySelector('mwc-dialog');
    dialog.open = true;
  };

  async componentWillLoad() {
    return (
      fetch('/api/ui/logo')
        .then(async response => response.text())
        .then(text => {
          // TODO we need to change the backend to deliver the correct filepath
          const isDefaultLogo = pipe(split('/'), last, equals('oae-logo.png'))(text);

          if (isDefaultLogo) {
            this.tenantLogo = './assets/images/logo-oae.svg';
          } else {
            // TODO here we go get the tenant logo wherever it is
            this.tenantLogo = './assets/images/custom-logo.svg';
          }
        })
        // TODO handle this better
        .catch(error => {
          console.error(error);
        })
    );
  }

  render() {
    return (
      <div>
        <mwc-dialog id="dialog" heading="Sign in to TENANT">
          <p>This dialog can validate user input before closing.</p>
          <mwc-textfield id="username" minlength="3" maxlength="64" placeholder="Username" required></mwc-textfield>
          <mwc-textfield type="password" id="password" minlength="3" maxlength="64" placeholder="Password" required></mwc-textfield>
          <mwc-button id="primary-action-button" slot="primaryAction">
            Sign in
          </mwc-button>
          <mwc-button slot="secondaryAction" dialogAction="close">
            Cancel
          </mwc-button>
        </mwc-dialog>

        <nav class="navbar home-nav">
          <div class="navbar-brand">
            <a class="navbar-item logo" href="#">
              <img src={this.tenantLogo} />
            </a>
          </div>
          <div class="navbar-end navEnd">
            <div class="navbar-item">
              <div class="buttons">
                <a class="button is-round register-button">Register</a>
                <a onClick={this.showSignInModal} class="button is-round signIn-button">
                  Sign In
                </a>
              </div>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}
