import {
  path,
  pick,
  pipe,
  equals,
  length,
  mergeRight,
  objOf,
  and,
  intersection,
  isEmpty,
  not,
  keys,
} from "ramda";
import { authConstants } from "./constants";

import anylogger from "anylogger";
const log = anylogger("authentication");

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

/**
 * @function getConfigValue
 * @param  {Array} ...args Includes `moduleName`, `featureName` and `flagName`
 * @return {String} The tenant config for the flag / feature / module, if exists. `undefined` otherwise
 */
// const getTenantConfigValue = (tenantConfig, ...args) => path(args)(tenantConfig);
const getTenantConfigValue = (tenantConfig) => (...args) =>
  path(args)(tenantConfig);

/**
 * Get the list of all enabled authentication strategies for the current tenant
 *
 * @function getEnabledStrategies
 * @param  {String} [contextLabel]  Specifies in which context the strategy info is being requested.
 *                                  Either "SIGN_IN" or "SIGN_UP" (Default: SIGN_IN)
 * @return {Object}                 List of all enabled authentication strategies for the current tenant keyed by authentication strategy id. Each enabled authentication strategy will contain a `url` property with the URL to which to POST to initiate the authentication process for that strategy and a `name` property with the custom configured name for that strategy
 */
const getEnabledStrategies = (
  tenantConfig /* , contextLabel = 'SIGN_IN' */
) => {
  const getConfigValue = getTenantConfigValue(tenantConfig);

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

  let enabledStrategies = {};
  const addStrategy = (strategy, settings) =>
    mergeRight(enabledStrategies, objOf(strategy, settings));

  const isAuthTypeEnabled = (strategyType) =>
    getConfigValue("oae-authentication", strategyType, "enabled");
  const isJustTheOneAuthTypeEnabled = (strategy1, strategy2) =>
    and(isAuthTypeEnabled(strategy1), not(isAuthTypeEnabled(strategy2)));
  const areBothAuthTypesEnabled = (strategy1, strategy2) =>
    and(isAuthTypeEnabled(strategy1), isAuthTypeEnabled(strategy2));

  const CASAuthSettings = {
    id: STRATEGY_CAS,
    name: "with CAS",
    url: "/api/auth/cas",
  };

  const facebookAuthSettings = {
    id: STRATEGY_FACEBOOK,
    icon: "facebook",
    name: "with facebook",
    url: "/api/auth/facebook",
  };

  // Google authentication:
  // this will only be enabled when no Google Apps domain has been configured.
  const googleAuthSettings = {
    id: STRATEGY_GOOGLE,
    icon: "google-plus",
    name: "with google",
    url: "/api/auth/google",
  };

  const googleAppsAuthSettings = {
    id: STRATEGY_GOOGLE_APPS,
    icon: "google-plus",
    name: "with google apps",
    url: "/api/auth/google",
  };

  const ldapAuthSettings = {
    id: STRATEGY_LDAP,
    url: "/api/auth/ldap",
  };

  const shibbAuthSettings = {
    id: STRATEGY_SHIBBOLETH,
    name: "with Shibboleth",
    url: "/api/auth/shibboleth",
  };

  const twitterAuthSettings = {
    id: STRATEGY_TWITTER,
    icon: "twitter",
    name: "with twitter",
    url: "/api/auth/twitter",
  };

  const localAuthSettings = {
    id: STRATEGY_LOCAL,
    url: "/api/auth/login",
  };

  if (isAuthTypeEnabled(STRATEGY_CAS))
    enabledStrategies = addStrategy(STRATEGY_CAS, CASAuthSettings);

  if (isAuthTypeEnabled(STRATEGY_FACEBOOK))
    enabledStrategies = addStrategy(STRATEGY_FACEBOOK, facebookAuthSettings);

  if (isJustTheOneAuthTypeEnabled(STRATEGY_GOOGLE, STRATEGY_GOOGLE_APPS))
    enabledStrategies = addStrategy(STRATEGY_GOOGLE, googleAuthSettings);

  if (areBothAuthTypesEnabled(STRATEGY_GOOGLE, STRATEGY_GOOGLE_APPS))
    enabledStrategies = addStrategy(
      STRATEGY_GOOGLE_APPS,
      googleAppsAuthSettings
    );

  if (isAuthTypeEnabled(STRATEGY_LDAP))
    enabledStrategies = addStrategy(STRATEGY_LDAP, ldapAuthSettings);

  if (isAuthTypeEnabled(STRATEGY_SHIBBOLETH))
    enabledStrategies = addStrategy(STRATEGY_SHIBBOLETH, shibbAuthSettings);

  if (isAuthTypeEnabled(STRATEGY_TWITTER))
    enabledStrategies = addStrategy(STRATEGY_TWITTER, twitterAuthSettings);

  if (isAuthTypeEnabled(STRATEGY_LOCAL))
    enabledStrategies = addStrategy(STRATEGY_LOCAL, localAuthSettings);

  return enabledStrategies;
};

/**
 * Use the known authentication strategies to determine some important characteristics about how
 * to offer a user their authentication method
 *
 * @function getStrategyInfo
 * @param  {String}     [contextLabel] Specifies in which context the strategy info is being requested. It's used to identify the context-specific i18n key for the strategy info. Either "SIGN_IN" or "SIGN_UP" are acceptable (Default: SIGN_IN)
 * @return {Object}     authStrategyInfo Authentication strategy information
 * @return {Boolean}    authStrategyInfo.allowAccountCreation True if users are allowed to create their own accounts. False otherwise
 * @return {Object}     authStrategyInfo.enabledExternalStrategies All the enabled external strategies keyed by strategy id
 * @return {Object}     authStrategyInfo.enabledInstitutionalStrategies All the enabled institutional strategies keyed by strategy id
 * @return {Object}     authStrategyInfo.enabledStrategies All the enabled strategies keyed by strategy id
 * @return {Boolean}    authStrategyInfo.hasExternalAuth True if there is at least one external (e.g., cas, shibboleth, twitter, etc...) authentication method enabled
 * @return {Boolean}    authStrategyInfo.hasInstitutionalAuth True if there is at least one institutional (e.g., shibboleth, cas, google apps) authentication method enabled
 * @return {Boolean}    authStrategyInfo.hasLocalAuth True if there is at least one local (e.g., username and password, ldap) authentication method enabled
 * @return {Boolean}    authStrategyInfo.hasSingleExternalAuth True if there is only one authentication method enabled and it is external
 * @return {Boolean}    authStrategyInfo.hasSingleInstitutionalAuth True if there is only one authentication method enabled and it is institutional
 */
const getStrategyInfo = (tenantConfig /* , contextLabel = 'SIGN_IN' */) => {
  const enabledStrategies = getEnabledStrategies(
    tenantConfig /* , contextLabel */
  );
  const enabledStrategyNames = keys(enabledStrategies);

  const hasLocalAuth = pipe(
    intersection(STRATEGIES_LOCAL),
    isEmpty,
    not
  )(enabledStrategyNames);
  const hasExternalAuth = pipe(
    intersection(STRATEGIES_EXTERNAL),
    isEmpty,
    not
  )(enabledStrategyNames);
  const hasInstitutionalAuth = pipe(
    intersection(STRATEGIES_INSTITUTIONAL),
    isEmpty,
    not
  )(enabledStrategyNames);

  const justTheOne = pipe(length, equals(1));
  const hasSingleAuth = justTheOne(enabledStrategyNames);
  const hasSingleExternalAuth = hasSingleAuth && hasExternalAuth;
  const hasSingleInstitutionalAuth = hasSingleAuth && hasInstitutionalAuth;
  const enabledExternalStrategies = pick(
    STRATEGIES_EXTERNAL,
    enabledStrategies
  );
  const enabledInstitutionalStrategies = pick(
    STRATEGIES_INSTITUTIONAL,
    enabledStrategies
  );
  const allowAccountCreation = getTenantConfigValue(tenantConfig)(
    "oae-authentication",
    STRATEGY_LOCAL,
    "allowAccountCreation"
  );

  return {
    allowAccountCreation,
    enabledExternalStrategies,
    enabledInstitutionalStrategies,
    enabledStrategies,
    hasExternalAuth,
    hasInstitutionalAuth,
    hasLocalAuth,
    hasSingleExternalAuth,
    hasSingleInstitutionalAuth,
  };
};

const signInViaLDAP = async (
  username: string,
  password: string,
  ldapAuthSettings: { id: string; url: string }
) => {
  if (!username) {
    throw new Error("A valid username should be provided");
  } else if (!password) {
    throw new Error("A valid password should be provided");
  }

  try {
    const response = await fetch(ldapAuthSettings.url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    return response.status;
  } catch (error: unknown) {
    log.error(`LDAP sign in failed!`, error);
    throw error;
  }
};

const logout = async () => {
  try {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    return response.status;
  } catch (error) {
    log.error(`Logout failed!`, error);
    throw error;
  }
};

const signInViaLocalAuth = async (
  username: string,
  password: string,
  localAuthSettings: { id: string; url: string }
): Promise<number> => {
  if (!username) {
    throw new Error("A valid username should be provided");
  } else if (!password) {
    throw new Error("A valid password should be provided");
  }

  try {
    const response = await fetch(localAuthSettings.url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    return response.status;
  } catch (error: unknown) {
    log.error(`Local sign in failed!`, error);
    throw error;
  }
};

const tryLDAPFirstLocalAuthSecond = async (
  username,
  password,
  ldapSettings,
  localSettings
) => {
  let status;
  try {
    status = await signInViaLDAP(username, password, ldapSettings);
  } catch (error: unknown) {
    log.error(
      `Unable to sign in via LDAP, trying local authentication instead`,
      error
    );
  } finally {
    status = await signInViaLocalAuth(username, password, localSettings);
  }

  return status;
};

export function authenticationAPI() {
  return {
    getStrategyInfo,
    getEnabledStrategies,
    signInViaLDAP,
    signInViaLocalAuth,
    tryLDAPFirstLocalAuthSecond,
    logout,
  };
}
