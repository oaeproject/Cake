import { Component, h, Prop, Element, getAssetPath } from '@stencil/core';

import '@material/mwc-dialog';
import '@material/mwc-button';
import '@material/mwc-textfield';

@Component({
  tag: 'home-nav',
  styleUrl: 'home-nav.scss',
  assetsDirs: ['assets'],
})
export class HomeNav {
  @Prop() image = 'oae-logo.svg';
  @Element() element;

  showSignInModal = () => {
    const dialog = this.element.querySelector('mwc-dialog');
    dialog.open = true;
  };

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
              <img src={getAssetPath(`./assets/${this.image}`)} />
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
