/* eslint-disable import/no-unassigned-import, new-cap, @typescript-eslint/promise-function-async */
import { Component, h, Prop, Element } from '@stencil/core';

import '@material/mwc-dialog';
import '@material/mwc-button';
import '@material/mwc-textfield';

import { map, values, pipe, last, split, equals } from 'ramda';

const DEFAULT_LOGO = 'oae-logo.svg';

@Component({
  tag: 'home-nav',
  styleUrl: 'home-nav.scss',
})
export class HomeNav {
  @Prop() tenantAlias: string;
  @Prop({ mutable: true }) tenantLogo: string;
  @Prop() authStrategyInfo: any;
  @Element() element;

  showSignInModal = () => {
    const dialog = this.element.querySelector('mwc-dialog');
    dialog.open = true;
  };

  componentWillLoad() {
    return fetch('/api/ui/logo')
      .then(response => response.text())
      .then(text => {
        // TODO we need to change the backend to deliver the correct filepath if default
        const isDefaultLogo = pipe(split('/'), last, equals(DEFAULT_LOGO))(text);

        let logoToDisplay;
        if (isDefaultLogo) {
          logoToDisplay = './assets/logo/oae-logo.svg';
        } else {
          logoToDisplay = text;
        }
        this.tenantLogo = logoToDisplay;
      })
      .catch(error => {
        // TODO handle this better
        console.error(error);
      });
  }

  getHeadingForDialog() {
    return `Sign in to ${this.tenantAlias}`;
  }

  render() {
    // TODO debug
    console.log(this.authStrategyInfo.enabledExternalStrategies);

    let externalAuth: any;
    if (this.authStrategyInfo.hasExternalAuth) {
      externalAuth = pipe(
        values,
        map(eachStrategy => <external-auth-strategy icon={eachStrategy.icon} id={eachStrategy.id} url={eachStrategy.url} name={eachStrategy.name} />),
      )(this.authStrategyInfo.enabledExternalStrategies);
    }

    let localAuth;
    if (this.authStrategyInfo.hasLocalAuth) {
      localAuth = (
        <form>
          <mwc-textfield id="username" minlength="3" maxlength="64" placeholder="Username" required></mwc-textfield>
          <mwc-textfield type="password" id="password" minlength="3" maxlength="64" placeholder="Password" required></mwc-textfield>
          <mwc-button id="primary-action-button" slot="primaryAction">
            Sign in
          </mwc-button>
        </form>
      );
    }

    return (
      <div>
        <mwc-dialog id="dialog" heading={this.getHeadingForDialog()}>
          {externalAuth}
          {localAuth}
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
