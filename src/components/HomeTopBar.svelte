<script lang="ts">
  import ExternalAuthStrategy from "./ExternalAuthStrategy.svelte";
  import LocalAuthStrategy from "./LocalAuthStrategy.svelte";
  import { values, pipe, last, split, equals } from "ramda";
  import anylogger from "anylogger";
  import { afterUpdate, onMount } from "svelte";
  import { user } from "../stores/user";

  import "@material/mwc-dialog";
  import "@material/mwc-button";
  import "@material/mwc-textfield";

  const log = anylogger("home-nav");
  const DEFAULT_LOGO = "oae-logo.svg";

  export let goToLogin: string;
  export let authenticationStrategy;
  $: {
    enabledExternalStrategies = values(
      authenticationStrategy.enabledExternalStrategies
    );
  }

  let tenantLogo;
  let modalWindow;
  let enabledExternalStrategies: {
    id: string;
    icon: string;
    url: string;
    name: string;
  }[];

  const showSignInModal = () => {
    modalWindow.open = true;
  };

  const getHeadingForDialog = () => `Sign in to ${$user.tenant.alias}`;

  afterUpdate(() => {
    if (equals("true", goToLogin)) {
      showSignInModal();
    }
  });

  onMount(async () => {
    try {
      const response = await fetch("/api/ui/logo");
      const text = await response.text();

      // TODO we need to change the backend to deliver the correct filepath if default
      const isDefaultLogo = pipe(split("/"), last, equals(DEFAULT_LOGO))(text);

      let logoToDisplay;
      if (isDefaultLogo) {
        logoToDisplay = "./assets/logos/oae-logo.svg";
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
              heading={getHeadingForDialog()}
            >
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
                <LocalAuthStrategy
                  enabledStrategies={authenticationStrategy.enabledStrategies}
                />;
              {/if}
              <mwc-button slot="secondaryAction" dialogAction="close">
                Cancel
              </mwc-button>
            </mwc-dialog>
            <a class="button is-round register-button" href="/">Register</a>
            <a
              href="/"
              on:click|preventDefault={showSignInModal}
              class="button is-round signIn-button"
            >
              Sign In
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
    border-width: medium;
    font-weight: bold;
    border-color: #3a71ed;
    border-radius: 2px;
    color: #3a71ed;
    height: 30px;
    width: 80px;
    &:hover {
      background-color: #3a71ed;
      border-color: #3a71ed;
      color: white;
    }
  }

  // Experiments
  .warning {
    color: darkred;
  }
</style>
