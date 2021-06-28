<script>
  import { _, isLoading } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import { prop } from 'ramda';
  import HomeTopBar from '../components/HomeTopBar.svelte';
  import anylogger from 'anylogger';
  import { getCurrentUser, redirectUrl, user, tenantConfig, invitationInfo } from '../stores/user';
  import { authenticationAPI } from '../helpers/authentication';
  import { getRedirectUrl, getInvitationInfo } from '../helpers/utils';
  import { locale } from 'svelte-i18n';

  let log = anylogger('homepage');

  let authenticationStrategy = {};
  export let goToLogin;

  let pageTitle;
  $: if ($isLoading) {
    pageTitle = '...';
  } else {
    pageTitle = $_('packages.oae-core.footer.bundles.OPEN_ACADEMIC_ENVIRONMENT');
  }

  onMount(async () => {
    redirectUrl.set(getRedirectUrl(document.location.toString()));
    log.warn(`redirectUrl:`);
    log.warn($redirectUrl);

    // Variable that keeps track of the invitation info that is available in the page context, if any
    invitationInfo.set(getInvitationInfo(document.location.toString()));
    log.warn(`invitation info: ${prop('email', $invitationInfo)} / ${prop('token', $invitationInfo)}`);

    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      tenantConfig.set(data);
      log.warn(`tenant configuration: ${tenantConfig}`);

      const askAuthAPI = authenticationAPI();
      // Variable that holds the configured auth strategy information for the tenant
      authenticationStrategy = askAuthAPI.getStrategyInfo($tenantConfig);
      log.warn(`authStrategyInfo: ${authenticationStrategy}`);

      // Get data on the user visiting
      user.set(await getCurrentUser());

      locale.set($user.locale);
    } catch (error) {
      // TODO exception handling
      log.error(`Unable to fetch tenant configuration`, error);
    }
  });
</script>

<svelte:head><title>{pageTitle}</title></svelte:head>

{#if $isLoading}
  Please wait...
{:else}
  <section class="hero is-fullheight hero-background">
    <!-- Hero head: will stick at the top -->
    <div class="hero-head">
      <HomeTopBar {goToLogin} {authenticationStrategy} />
    </div>

    <!-- Hero content: will be in the middle -->
    <div class="hero-body">
      <div class="container">
        <div class="columns">
          <div class="column is-half left-column">
            <p>
              The <span>Open Academic Environment</span> is the easiest way to communicate and share files with your classmates.
            </p>
            <button class="button is-medium button-register">
              <span class="icon">
                <i class="fas fa-long-arrow-alt-right" />
              </span>
              <span>Join us for free</span>
            </button>
          </div>
          <div class="column">
            <figure class="image">
              <img alt="background" src="../assets/images/home.svg" />
            </figure>
          </div>
        </div>
      </div>
    </div>
  </section>
{/if}

<style lang="scss">
  // Font Colour
  $fontColour: #212121;
  $secondaryFontColor: #424242;

  // Import Roboto Slab for Title
  // Single Use
  @import url('https://fonts.googleapis.com/css?family=Roboto:700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@800&display=swap');

  .hero-body.main-area {
    height: 100px;
    overflow: hidden;
    background-image: url('../assets/images/cool-background.svg');
    background-repeat: no-repeat;
    background-position: right;
    background-size: cover;
    background-color: white;
  }

  .img.background-img {
    visibility: hidden;
  }

  .hero-body.section1-area {
    background-color: hotpink;
  }

  .hero-background {
    background-color: #f6f6f6;
  }

  .left-column p {
    font-family: Poppins;
    font-style: normal;
    font-weight: 500;
    font-size: 48px;
    line-height: 72px;
    color: #000;
  }

  .left-column span {
    font-weight: bold;
    color: #3a72e9;
  }

  .button-register {
    margin-top: 1em;
    background: #fff;
    border: 3px solid #3a72e9;
    box-sizing: border-box;
  }
</style>
