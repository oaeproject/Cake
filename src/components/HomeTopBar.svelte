<script>
  import { _ } from 'svelte-i18n';
  import ExternalAuthStrategy from './ExternalAuthStrategy.svelte';
  import LocalAuthStrategy from './LocalAuthStrategy.svelte';
  import { and, not, values, pipe, init, join, split, equals } from 'ramda';
  import anylogger from 'anylogger';
  import { afterUpdate, onMount } from 'svelte';
  import { user } from '../stores/user';

  import '@material/mwc-dialog';
  import '@material/mwc-button';
  import '@material/mwc-textfield';

  const log = anylogger('home-nav');
  const DEFAULT_LOGO = '/shared/oae/img';

  export let goToLogin;
  export let authenticationStrategy;
  $: {
    enabledExternalStrategies = values(authenticationStrategy.enabledExternalStrategies);
  }

  let tenantLogo;
  let modalWindow;
  let enabledExternalStrategies;
  /* TODO: add type like this
   {
    id, //: string;
    icon, //: string;
    url, //: string;
    name, //: string;
  }[];
  */

  const showSignInModal = () => {
    modalWindow.open = true;
  };

  const getHeadingForDialog = () => `${$user.tenant.alias}`;

  afterUpdate(() => {
    const shouldOpenLoginWindow = equals('true', goToLogin);
    const isNotLoggedInYet = not($user.isLoggedIn);
    if (and(shouldOpenLoginWindow, isNotLoggedInYet)) {
      showSignInModal();
    }
  });

  onMount(async () => {
    try {
      const response = await fetch('/api/ui/logo');
      const text = await response.text();

      // TODO we need to change the backend to deliver the correct filepath if default
      const isDefaultLogo = pipe(split('/'), init, join('/'), equals(DEFAULT_LOGO))(text);

      let logoToDisplay;
      if (isDefaultLogo) {
        logoToDisplay = './assets/logos/oae-logo.svg';
      } else {
        logoToDisplay = text;
      }
      tenantLogo = logoToDisplay;
    } catch (error) {
      log.error(`Error fetching the tenant logo`, error);
    }
  });
</script>

<div>
  <nav class="navbar home-nav">
    <div class="navbar-brand">
      <a class="navbar-item logo" href="/">
        <img alt="tenant logo" src={tenantLogo} />
      </a>
    </div>
    <div class="navbar-end navEnd">
      <div class="navbar-item">
        {#if $user && $user.isLoggedIn}
          <span class="warning">{$user.displayName} is logged in</span>
        {:else}
          <div class="buttons">
            <mwc-dialog
              bind:this={modalWindow}
              id="dialog"
              class="dialogue-buttons styled"
              heading={getHeadingForDialog()}
            >
              <h1 class="modal-title">Sign in to OAE</h1>
              {#if authenticationStrategy.hasExternalAuth}
                {#each enabledExternalStrategies as eachStrategy}
                  <ExternalAuthStrategy
                    icon={eachStrategy.icon}
                    id={eachStrategy.id}
                    url={eachStrategy.url}
                    name={eachStrategy.name}
                  />
                {/each}
              {/if}

              {#if authenticationStrategy.hasLocalAuth}
                <LocalAuthStrategy enabledStrategies={authenticationStrategy.enabledStrategies} />
              {/if}
            </mwc-dialog>
            <a class="button is-round register-button" href="/">{$_('shared.oae.bundles.ui.SIGN_UP')}</a>
            <a href="/" on:click|preventDefault={showSignInModal} class="button is-round signIn-button is-info">
              {$_('shared.oae.bundles.ui.SIGN_IN')}
            </a>
          </div>
        {/if}
      </div>
    </div>
  </nav>
</div>

<style lang="scss">
  .navbar-brand {
    padding-left: 3em;
  }

  .navEnd {
    padding-right: 3em;
  }

  .navbar-item img {
    width: 100%;
    height: 400px;
    max-height: 3.2rem;
  }

  .home-nav {
    background: white;
  }

  .register-button {
    font-size: 1em;
    border-radius: 25px;
    color: #00253d;
    background-color: white;
    border: none;

    &:hover {
      color: #2e98d5;
      background-color: transparent;
      border: none;
    }
  }

  .signIn-button {
    font-size: 1em;
    color: white;
    width: 120px;
    background-color: #3a72e9;

    &:hover,
    &:focus,
    &:active {
      background-color: #03254e;
    }
  }

  .styled {
    --mdc-dialog-min-width: 450px;
  }

  .dialogue-buttons {
    --mdc-theme-primary: blue;
    --mdc-theme-on-primary: white;
    --mdc-button-outline-color: rgba(20, 20, 200, 0.2);
    --mdc-dialog-heading-ink-color: #c4c4c4;

    width: 560px;
  }

  .modal-title {
    margin-top: 1%;
    font-style: normal;
    font-weight: bold;
    font-size: 36px;
    line-height: 72px;
    color: #3a72e9;
  }
</style>
