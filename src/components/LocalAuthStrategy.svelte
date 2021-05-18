<script lang="ts">
  import anylogger from "anylogger";
  import "@material/mwc-button";
  import "@material/mwc-textfield";
  import { when, equals, defaultTo, prop, compose, isEmpty, not } from "ramda";
  import { useLocation, useNavigate } from "svelte-navigator";
  import { getCurrentUser, redirectUrl, user } from "../stores/user";

  import { resetField } from "../helpers/form";
  import { authenticationAPI } from "../helpers/authentication";
  import { authConstants } from "../helpers/constants";
  import { onMount } from "svelte";

  const navigate = useNavigate();
  const location = useLocation();
  const log = anylogger("local-auth-strategy");

  const { STRATEGY_LDAP, STRATEGY_LOCAL } = authConstants;
  const askAuthAPI = authenticationAPI();
  const {
    tryLDAPFirstLocalAuthSecond: tryLocalIfLdapFails,
    signInViaLDAP: tryLDAPLogin,
    signInViaLocalAuth: tryLocalAuthLogin,
  } = askAuthAPI;

  const ENTER_KEY = "Enter";
  const KEY = "key";

  const isNotEmpty = compose(not, isEmpty);
  const getLdapSettings = compose(defaultTo({}), prop(STRATEGY_LDAP));
  const getLocalSettings = compose(defaultTo({}), prop(STRATEGY_LOCAL));
  const wasEnterKeyPressed = compose(equals(ENTER_KEY), prop(KEY));
  const succededAuthentication = equals(200);
  const failedAuthentication = equals(401);

  export let enabledStrategies;
  let formValidation = { failed: true, message: "" };
  let localAuthForm;
  let usernameField;
  let passwordField;
  let submitButton;

  /**
   * Attempt to log the user in with the provided username and password onto the current
   * tenant using either the LDAP login strategy or the local login strategy. If only one of
   * them is enabled, only that strategy will be attempted. If both of them are enabled, an
   * LDAP login will be attempted first. If that is unsuccessful, a local login will be
   * attempted next.
   */
  const handleSubmit = async (event: Event) => {
    const username = usernameField.value;
    const password = passwordField.value;

    const ldapSettings = getLdapSettings(enabledStrategies);
    const localSettings = getLocalSettings(enabledStrategies);

    const isLocalEnabled: boolean = isNotEmpty(localSettings);
    const isLDAPEnabled: boolean = isNotEmpty(ldapSettings);
    const areBothEnabled = isLocalEnabled && isLDAPEnabled;

    const attemptLogin = async () => {
      switch (true) {
        case areBothEnabled:
          return tryLocalIfLdapFails(
            username,
            password,
            ldapSettings,
            localSettings
          );
        case isLDAPEnabled:
          return tryLDAPLogin(username, password, ldapSettings);
        default:
          return tryLocalAuthLogin(username, password, localSettings);
      }
    };

    try {
      postLogin(await attemptLogin());
    } catch (error) {
      // Username and/or password are missing
      formValidation = { failed: true, message: error.message };
    }
  };

  /**
   * Finish the login process by showing the correct validation message in case of a failed
   * login attempt, or by redirecting the user in case of a successful login attempt
   */
  const postLogin = async (status) => {
    if (succededAuthentication(status)) {
      /**
       * Eventually we will redirect the user to the redirect url
       * In the meantime, while we don't implement all the routes,
       * we'll just move to the activity feed instead
       *
       * TODO: uncomment this line and place it below, one day
       * navigate($redirectUrl);
       */
      formValidation = { failed: false, message: "" };
      log.warn(`Authentication succeeded, redirecting to the activity feed..`);

      const from = ($location.state && $location.state.from) || "/dashboard";
      navigate(from, { replace: true });
    } else if (failedAuthentication(status)) {
      formValidation = { failed: true, message: "Wrong credentials" };
      clearPasswordField();
    }
  };

  const clearPasswordField = () => {
    resetField(passwordField);
    passwordField.focus();
  };

  onMount(async () => {
    submitButton.addEventListener("click", async (event) => {
      await handleSubmit(event);
    });
  });

  const onKeyPress = async (event: KeyboardEvent) => {
    when(wasEnterKeyPressed, handleSubmit, event);
  };
</script>
<div id="or">or</div>
<div class="form-entries is-fullwidth">
  <form bind:this={localAuthForm} on:submit|preventDefault={handleSubmit}>
    <h3>Username</h3>
    <mwc-textfield
      bind:this={usernameField}
      on:keypress={onKeyPress}
      dialogInitialFocus
      id="username"
      class="username-entry"
      minlength="3"
      maxlength="64"
      placeholder="ex: JohnDoe"
      required
      stacked
    />
    <h3>Password</h3>
    <mwc-textfield
      bind:this={passwordField}
      on:keypress={onKeyPress}
      type="password"
      id="password"
      class="password-entry"
      minlength="3"
      maxlength="64"
      placeholder="Password"
      required
      stacked
    />
    <mwc-button
      bind:this={submitButton}
      id="submit-button"
      on:click={handleSubmit}
      class="login-button"
    >
      Sign in to OAE
    </mwc-button>

    {#if formValidation.failed}
      <div class="wrong-credentials">{formValidation.message}</div>
    {/if}
  </form>
</div>

<style lang="scss">
  #or {
    position: relative;
    width: 80%;
    height: 50px;
    margin-left: 8.5%;
    line-height: 50px;
    text-align: center;
    font-size: 14px;
  }

  #or::before,
  #or::after {
    position: absolute;
    width: 130px;
    height: 1px;
    top: 24px;
    background-color: #aaa;
    content: '';
  }

  #or::before {
    left: 0;
  }

  #or::after {
    right: 0;
  }

  .username-entry,
  .password-entry {
    padding-right: 2%;
    padding-top: 2%;
    padding-bottom: 2%;
    width: 98%;
  }

  .login-button {
    margin-top: 2%;
  }

  .wrong-credentials {
    font: Poppins;
    color: #3A72E9;
    margin-top: 5%;
    font-weight: medium;
  }
</style>
