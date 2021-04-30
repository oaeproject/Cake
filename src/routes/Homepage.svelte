<script lang="ts">
  import { _, isLoading } from "svelte-i18n";
  import { onMount } from "svelte";
  import { prop } from "ramda";
  import HomeTopBar from "../components/HomeTopBar.svelte";
  import anylogger from "anylogger";
  import {
    getCurrentUser,
    redirectUrl,
    user,
    tenantConfig,
    invitationInfo,
  } from "../stores/user";
  import { authenticationAPI } from "../helpers/authentication";
  import { getRedirectUrl, getInvitationInfo } from "../helpers/utils";
  import { useFocus } from "svelte-navigator";

  let log = anylogger("homepage");
  const registerFocus = useFocus();

  let authenticationStrategy = {};
  export let goToLogin: string;

  let pageTitle;
  $: if ($isLoading) {
    pageTitle = "...";
  } else {
    pageTitle = $_("page_title");
  }

  onMount(async () => {
    redirectUrl.set(getRedirectUrl(document.location.toString()));
    log.warn(`redirectUrl:`);
    log.warn($redirectUrl);

    // Variable that keeps track of the invitation info that is available in the page context, if any
    invitationInfo.set(getInvitationInfo(document.location.toString()));
    log.warn(
      `invitation info: ${prop("email", $invitationInfo)} / ${prop(
        "token",
        $invitationInfo
      )}`
    );

    try {
      const response = await fetch("/api/config");
      const data = await response.json();
      tenantConfig.set(data);
      log.warn(`tenant configuration: ${tenantConfig}`);

      const askAuthAPI = authenticationAPI();
      // Variable that holds the configured auth strategy information for the tenant
      authenticationStrategy = askAuthAPI.getStrategyInfo($tenantConfig);
      log.warn(`authStrategyInfo: ${authenticationStrategy}`);

      // Get data on the user visiting
      user.set(await getCurrentUser());
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
  <section class="hero is-primary is-medium">
    <HomeTopBar {goToLogin} {authenticationStrategy} />
    <div class="hero-head" />
    <div class="hero-body main-area">
      <div class="container has-text-centered is-centered">
        <p class="title homepage-title">
          {$_("welcome_phrase")}
        </p>
        <home-search use:registerFocus />
      </div>
    </div>
    <div class="hero-body section1-area">
      <div class="container has-text-centered is-centered">
        <p class="subtitle">
          The Open Academic Environment is the easiest way to communicate and
          share files with your classmates. Whether you're a student,
          investigator or professor, join us for free!
        </p>
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
  @import url("https://fonts.googleapis.com/css?family=Roboto:700&display=swap");
  @import url("https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@800&display=swap");

  .hero-body.main-area {
    height: 100px;
    overflow: hidden;
    background-image: url("../assets/images/cool-background.svg");
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

  .hero.is-primary .title {
    color: white;
    margin-bottom: 35px;
  }

  .hero .navbar {
    background-color: white;
  }

  // Main Section
  // Title
  .hero-body.main-area.title {
    color: #212121;
  }

  .control.has-icons-left.home-searchIcon {
    text-align: center;
  }

  .input {
    width: 70%;
    border: none;
    box-shadow: none;
    font-weight: bold;
    border-radius: 2px;
  }

  .input.input:hover {
    border: none;
    box-shadow: none;
    -webkit-box-shadow: 0px 1px 6px 0px rgba(50, 50, 50, 0.52);
    -moz-box-shadow: 0px 1px 6px 0px rgba(50, 50, 50, 0.52);
    box-shadow: 0px 1px 6px 0px rgba(50, 50, 50, 0.52);
  }

  .input.input:focus {
    border: none;
    -webkit-box-shadow: 0px 1px 6px 0px rgba(50, 50, 50, 0.52);
    -moz-box-shadow: 0px 1px 6px 0px rgba(50, 50, 50, 0.52);
    box-shadow: 0px 1px 6px 0px rgba(50, 50, 50, 0.52);
  }
</style>
