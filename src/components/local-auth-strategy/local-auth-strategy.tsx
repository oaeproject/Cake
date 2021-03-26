/* eslint-disable import/no-unassigned-import, new-cap, */
/**
 * TODOs
 * [ ] Disable on submit button on click
 * [x] Submit form and parse response
 * [ ] Spinner somewhere while loading
 * [ ] Display warning if bad credentials
 * [ ] Clear password field after submit if 401 is returned
 * [ ] Focus on username input on loading the modal window
 */
import { State, Prop, Component, h, Element } from '@stencil/core';
import '@material/mwc-button';
import '@material/mwc-textfield';

import rootStore from '../../stores/root-store';
import { equals, defaultTo, prop, compose, isEmpty, not } from 'ramda';
const isNotEmpty = compose(not, isEmpty);

import { authenticationAPI } from '../../helpers/authentication';
const askAuthAPI = authenticationAPI();
const { tryLDAPFirstLocalAuthSecond, signInViaLDAP: tryLDAPLogin, signInViaLocalAuth: tryLocalAuthLogin } = askAuthAPI;

import { authConstants } from '../../helpers/constants';
const { STRATEGY_LDAP, STRATEGY_LOCAL } = authConstants;

@Component({
  tag: 'local-auth-strategy',
  styleUrl: 'local-auth-strategy.css',
})
export class LocalAuthStrategy {
  @Prop() enabledStrategies: any;
  @Element() element: HTMLElement;
  @State() validationFailed = false;

  /**
   * Attempt to log the user in with the provided username and password onto the current
   * tenant using either the LDAP login strategy or the local login strategy. If only one of
   * them is enabled, only that strategy will be attempted. If both of them are enabled, an
   * LDAP login will be attempted first. If that is unsuccessful, a local login will be
   * attempted next.
   */
  async handleSubmit(event: Event) {
    event.preventDefault();

    const usernameField: HTMLInputElement = this.element.querySelector('#username');
    const username = usernameField.value;
    const passwordField: HTMLInputElement = this.element.querySelector('#password');
    const password = passwordField.value;

    const ldapSettings = compose(defaultTo({}), prop(STRATEGY_LDAP))(this.enabledStrategies);
    const isLDAPEnabled: boolean = isNotEmpty(ldapSettings);

    const localSettings = compose(defaultTo({}), prop(STRATEGY_LOCAL))(this.enabledStrategies);
    const isLocalEnabled: boolean = isNotEmpty(localSettings);

    const areBothEnabled = isLocalEnabled && isLDAPEnabled;

    const responseStatus: number = await (async () => {
      switch (true) {
        case areBothEnabled:
          return tryLDAPFirstLocalAuthSecond(username, password, ldapSettings, localSettings);
        case isLDAPEnabled:
          return tryLDAPLogin(username, password, ldapSettings);
        default:
          return tryLocalAuthLogin(username, password, localSettings);
      }
    })();

    this.postLogin(responseStatus);
  }

  /**
   * Finish the login process by showing the correct validation message in case of a failed
   * login attempt, or by redirecting the user in case of a successful login attempt
   */
  postLogin(status) {
    const succededAuthentication = equals(200, status);
    const failedAuthentication = equals(401, status);

    if (succededAuthentication) {
      /**
       * Eventually we will redirect the user to the redirect url
       * In the meantime, while we don't implement all the routes,
       * we'll just move to the activity feed instead
       *
       * TODO: uncomment these lines, one day
       * const userStore = rootStore.userStore;
       * window.location.href = userStore.getUserRedirectUrl();
       */

      window.location.href = '/dashboard';
    } else if (failedAuthentication) {
      // show alert message saying credentials not valid
    }
  }

  componentDidLoad() {
    const button = this.element.querySelector('#submit-button');
    button.addEventListener('click', async event => {
      await this.handleSubmit(event);
    });
  }

  render() {
    let loginFailed;
    if (this.validationFailed) {
      loginFailed = <div>Ouch! credentials not valid</div>;
    }
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <mwc-textfield id="username" minlength="3" maxlength="64" placeholder="Username" required></mwc-textfield>
          <mwc-textfield type="password" id="password" minlength="3" maxlength="64" placeholder="Password" required></mwc-textfield>
          <mwc-button id="submit-button" slot="primaryAction">
            Sign in
          </mwc-button>
          {loginFailed}
        </form>
      </div>
    );
  }
}
