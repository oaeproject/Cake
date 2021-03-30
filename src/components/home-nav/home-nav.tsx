/* eslint-disable import/no-unassigned-import, new-cap, @typescript-eslint/promise-function-async */
import { Component, h, Prop, Element } from '@stencil/core';

import '@material/mwc-dialog';
import '@material/mwc-button';
import '@material/mwc-textfield';

import { map, values, pipe, last, split, equals } from 'ramda';
import anylogger from 'anylogger';
const log = anylogger('home-nav');

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
        log.error(`Error fetching the tenant logo`, error);
      });
  }

  getHeadingForDialog() {
    return `Sign in to ${this.tenantAlias}`;
  }

  render() {
    let externalAuth: any;
    if (this.authStrategyInfo.hasExternalAuth) {
      externalAuth = pipe(
        values,
        map(eachStrategy => <external-auth-strategy icon={eachStrategy.icon} id={eachStrategy.id} url={eachStrategy.url} name={eachStrategy.name} />),
      )(this.authStrategyInfo.enabledExternalStrategies);
    }

    let localAuth;
    if (this.authStrategyInfo.hasLocalAuth) {
      localAuth = <local-auth-strategy enabledStrategies={this.authStrategyInfo.enabledStrategies} />;
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
