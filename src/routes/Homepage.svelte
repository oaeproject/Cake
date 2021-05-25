<script lang="ts">
  import { _, isLoading } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import { prop } from 'ramda';
  import HomeTopBar from '../components/HomeTopBar.svelte';
  import anylogger from 'anylogger';
  import { getCurrentUser, redirectUrl, user, tenantConfig, invitationInfo } from '../stores/user';
  import { authenticationAPI } from '../helpers/authentication';
  import { getRedirectUrl, getInvitationInfo } from '../helpers/utils';
  import { useFocus } from 'svelte-navigator';
  import { locale } from 'svelte-i18n';

  let log = anylogger('homepage');
  const registerFocus = useFocus();

  let authenticationStrategy = {};
  export let goToLogin: string;

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
      <div class="container has-text-centered">
        <p class="title">Title</p>
        <p class="subtitle">Subtitle</p>
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

  .hero-background {
    background-color: #F6F6F6;
  }
</style>
