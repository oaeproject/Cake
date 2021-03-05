import { Component, h, Prop, Element } from '@stencil/core';

import '@material/mwc-dialog';
import '@material/mwc-button';
import '@material/mwc-textfield';

import { objOf, mergeRight, not, isEmpty, intersection, pick, and, path, length, keys, pipe, last, split, equals, defaultTo } from 'ramda';
import { authConstants } from './constants';
const {
  STRATEGY_CAS,
  STRATEGY_FACEBOOK,
  STRATEGY_GOOGLE,
  STRATEGY_GOOGLE_APPS,
  STRATEGY_LDAP,
  STRATEGY_LOCAL,
  STRATEGY_SHIBBOLETH,
  STRATEGY_TWITTER,
  STRATEGIES_LOCAL,
  STRATEGIES_EXTERNAL,
  STRATEGIES_INSTITUTIONAL,
} = authConstants;

@Component({
  tag: 'home-nav',
  styleUrl: 'home-nav.scss',
  assetsDirs: ['assets'],
})
export class HomeNav {
  @Prop() tenantLogo: string;
  @Prop() tenantConfig: Object;
  @Prop() authStrategyInfo: Object;
  @Element() element;

  showSignInModal = () => {
    const dialog = this.element.querySelector('mwc-dialog');
    dialog.open = true;
  };

  /**
   * @function getConfigValue
   * @param  {Array} ...args Includes `moduleName`, `featureName` and `flagName`
   * @return {String} The tenant config for the flag / feature / module, if exists. `undefined` otherwise
   */
  getConfigValue = (...args) => path(args)(this.tenantConfig);

  /**
   * Get the list of all enabled authentication strategies for the current tenant
   *
   * @param  {String} [contextLabel]  Specifies in which context the strategy info is being requested.
   *                                  Either "SIGN_IN" or "SIGN_UP" (Default: SIGN_IN)
   * @return {Object}                 List of all enabled authentication strategies for the current tenant keyed
   *                                  by authentication strategy id. Each enabled authentication strategy will contain
   *                                  a `url` property with the URL to which to POST to initiate the authentication process
   *                                  for that strategy and a `name` property with the custom configured name for that strategy
   */
  getEnabledStrategies = contextLabel => {
    contextLabel = defaultTo('SIGN_IN', contextLabel);

    /*!
     * Between the different context label and authentication strategy permutations, we have the
     * following possible permutations of i18n message keys for strategy name:
     *
     *  * __MSG__SIGN_IN_WITH_STRATEGY
     *  * __MSG__SIGN_IN_WITH_FACEBOOK
     *  * __MSG__SIGN_IN_WITH_GOOGLE
     *  * __MSG__SIGN_IN_WITH_TWITTER
     *  * __MSG__SIGN_UP_WITH_STRATEGY
     *  * __MSG__SIGN_UP_WITH_FACEBOOK
     *  * __MSG__SIGN_UP_WITH_GOOGLE
     *  * __MSG__SIGN_UP_WITH_TWITTER
     *
     * In the case of `__MSG__*_WITH_STRATEGY` keys, the `strategyName` method is used to
     * determine the organization-specific name for their authentication strategy to get a more
     * context-sensitive strategy name.
     */

    var enabledStrategies = {};
    const addStrategy = (strategy, settings) => mergeRight(enabledStrategies, objOf(strategy, settings));

    const isAuthTypeEnabled = strategyType => this.getConfigValue('oae-authentication', strategyType, 'enabled');
    const isJustTheOneAuthTypeEnabled = (strategy1, strategy2) => and(isAuthTypeEnabled(strategy1), not(isAuthTypeEnabled(strategy2)));
    const areBothAuthTypesEnabled = (strategy1, strategy2) => and(isAuthTypeEnabled(strategy1), isAuthTypeEnabled(strategy2));

    const CASAuthSettings = {
      id: STRATEGY_CAS,
      name: 'with CAS',
      url: '/api/auth/cas',
    };

    const facebookAuthSettings = {
      id: STRATEGY_FACEBOOK,
      icon: 'facebook',
      name: 'with facebook',
      url: '/api/auth/facebook',
    };

    // Google authentication:
    // this will only be enabled when no Google Apps domain has been configured.
    const googleAuthSettings = {
      id: STRATEGY_GOOGLE,
      icon: 'google-plus',
      name: 'with google',
      url: '/api/auth/google',
    };

    const googleAppsAuthSettings = {
      id: STRATEGY_GOOGLE_APPS,
      icon: 'google-plus',
      name: 'with google apps',
      url: '/api/auth/google',
    };

    const ldapAuthSettings = {
      id: STRATEGY_LDAP,
      url: '/api/auth/ldap',
    };

    const shibbAuthSettings = {
      id: STRATEGY_SHIBBOLETH,
      name: 'with Shibboleth',
      url: '/api/auth/shibboleth',
    };

    const twitterAuthSettings = {
      id: STRATEGY_TWITTER,
      icon: 'twitter',
      name: 'with twitter',
      url: '/api/auth/twitter',
    };

    const localAuthSettings = {
      id: STRATEGY_LOCAL,
      url: '/api/auth/login',
    };

    switch (true) {
      case isAuthTypeEnabled(STRATEGY_CAS):
        enabledStrategies = addStrategy(STRATEGY_CAS, CASAuthSettings);

      case isAuthTypeEnabled(STRATEGY_FACEBOOK):
        enabledStrategies = addStrategy(STRATEGY_FACEBOOK, facebookAuthSettings);

      case isJustTheOneAuthTypeEnabled(STRATEGY_GOOGLE, STRATEGY_GOOGLE_APPS):
        enabledStrategies = addStrategy(STRATEGY_GOOGLE, googleAuthSettings);

      case areBothAuthTypesEnabled(STRATEGY_GOOGLE, STRATEGY_GOOGLE_APPS):
        enabledStrategies = addStrategy(STRATEGY_GOOGLE_APPS, googleAppsAuthSettings);

      case isAuthTypeEnabled(STRATEGY_LDAP):
        enabledStrategies = addStrategy(STRATEGY_LDAP, ldapAuthSettings);

      case isAuthTypeEnabled(STRATEGY_SHIBBOLETH):
        enabledStrategies = addStrategy(STRATEGY_SHIBBOLETH, shibbAuthSettings);

      case isAuthTypeEnabled(STRATEGY_TWITTER):
        enabledStrategies = addStrategy(STRATEGY_TWITTER, twitterAuthSettings);

      case isAuthTypeEnabled(STRATEGY_LOCAL):
        enabledStrategies = addStrategy(STRATEGY_LOCAL, localAuthSettings);

      default:
        return enabledStrategies;
    }
  };

  /**
   * Use the known authentication strategies to determine some important characteristics about how
   * to offer a user their authentication method
   *
   * @param  {String}     [contextLabel]                                      Specifies in which context the strategy info is being requested. It's used to identify the context-specific i18n key for the strategy info. Either "SIGN_IN" or "SIGN_UP" are acceptable (Default: SIGN_IN)
   * @return {Object}     authStrategyInfo                                    Authentication strategy information
   * @return {Boolean}    authStrategyInfo.allowAccountCreation               True if users are allowed to create their own accounts. False otherwise
   * @return {Object}     authStrategyInfo.enabledExternalStrategies          All the enabled external strategies keyed by strategy id
   * @return {Object}     authStrategyInfo.enabledInstitutionalStrategies     All the enabled institutional strategies keyed by strategy id
   * @return {Object}     authStrategyInfo.enabledStrategies                  All the enabled strategies keyed by strategy id
   * @return {Boolean}    authStrategyInfo.hasExternalAuth                    True if there is at least one external (e.g., cas, shibboleth, twitter, etc...) authentication method enabled
   * @return {Boolean}    authStrategyInfo.hasInstitutionalAuth               True if there is at least one institutional (e.g., shibboleth, cas, google apps) authentication method enabled
   * @return {Boolean}    authStrategyInfo.hasLocalAuth                       True if there is at least one local (e.g., username and password, ldap) authentication method enabled
   * @return {Boolean}    authStrategyInfo.hasSingleExternalAuth              True if there is only one authentication method enabled and it is external
   * @return {Boolean}    authStrategyInfo.hasSingleInstitutionalAuth         True if there is only one authentication method enabled and it is institutional
   */
  getStrategyInfo = (contextLabel = 'SIGN_IN') => {
    const enabledStrategies = this.getEnabledStrategies(contextLabel);
    const enabledStrategyNames = keys(enabledStrategies);

    const hasLocalAuth = pipe(intersection(STRATEGIES_LOCAL), isEmpty, not)(enabledStrategyNames);
    const hasExternalAuth = pipe(intersection(STRATEGIES_EXTERNAL), isEmpty, not)(enabledStrategyNames);
    const hasInstitutionalAuth = pipe(intersection(STRATEGIES_INSTITUTIONAL), isEmpty, not)(enabledStrategyNames);

    const justTheOne = pipe(length, equals(1));
    const hasSingleAuth = justTheOne(enabledStrategyNames);
    const hasSingleExternalAuth = hasSingleAuth && hasExternalAuth;
    const hasSingleInstitutionalAuth = hasSingleAuth && hasInstitutionalAuth;

    return {
      allowAccountCreation: this.getConfigValue('oae-authentication', STRATEGY_LOCAL, 'allowAccountCreation'),
      enabledExternalStrategies: pick(STRATEGIES_EXTERNAL, enabledStrategies),
      enabledInstitutionalStrategies: pick(STRATEGIES_INSTITUTIONAL, enabledStrategies),
      enabledStrategies: enabledStrategies,
      hasExternalAuth: hasExternalAuth,
      hasInstitutionalAuth: hasInstitutionalAuth,
      hasLocalAuth: hasLocalAuth,
      hasSingleExternalAuth: hasSingleExternalAuth,
      hasSingleInstitutionalAuth: hasSingleInstitutionalAuth,
    };
  };

  componentWillLoad() {
    // Variable that holds the configured auth strategy information for the tenant
    let authStrategyInfo = this.getStrategyInfo();

    return (
      fetch('/api/ui/logo')
        .then(response => response.text())
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
        .catch(err => console.error(err))
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
