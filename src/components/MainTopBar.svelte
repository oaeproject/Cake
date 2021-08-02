<script>
  import { onMount } from 'svelte';
  import anylogger from 'anylogger';
  import { pipe, init, join, split, equals } from 'ramda';
  import { defaultToTemplateAvatar } from '../helpers/utils';
  import { cachedFetch } from '../stores/users';
  import { user } from '../stores/user';

  const DEFAULT_LOGO = '/shared/oae/img';
  const log = anylogger('maintopbar');
  let tenantLogo;
  let userAvatar;

  onMount(async () => {
    try {
      userAvatar = defaultToTemplateAvatar((await cachedFetch($user.id, $user.apiUrl)).small);
      const response = await fetch('/api/ui/logo');
      const tenantLogoUrl = await response.text();

      // TODO we need to change the backend to deliver the correct filepath if default
      const isDefaultLogo = pipe(split('/'), init, join('/'), equals(DEFAULT_LOGO))(tenantLogoUrl);

      switch (isDefaultLogo) {
        case true:
          tenantLogo = 'assets/logos/oae-logo.svg';
          break;
        default:
          tenantLogo = tenantLogoUrl;
          break;
      }
    } catch (error) {
      log.error(`Error fetching the tenant logo`, error);
    }
  });
</script>

<nav class="navbar main-layoutNav">
  <div class="navbar-brand">
    <a class="navbar-item" href="dashboard">
      <img alt="oae-logo" src={tenantLogo} />
    </a>
    <div class="navbar-burger" data-target="navbarExampleTransparentExample">
      <span />
      <span />
      <span />
    </div>
  </div>

  <div id="navbarExampleTransparentExample" class="navbar-menu">
    <div class="navbar-start">
      <div class="navbar-item has-dropdown is-hoverable">
        <a class="navbar-link" href="Home"> Home </a>
        <div class="navbar-dropdown is-boxed">
          <a class="navbar-item" href="Group-1"> Design Matters </a>
          <a class="navbar-item" href="Group-2"> OAE2021 </a>
          <a class="navbar-item" href="Group-3"> OAE Internship </a>
          <hr class="navbar-divider" />
          <a class="navbar-item" href="View recent groups"> View recent groups </a>
          <a class="navbar-item is-active" href="Recent Activity"> Recent Activity </a>
        </div>
      </div>
      <div class="navbar-item">
        <div class="control has-icons-left has-icons-right main-search">
          <input class="input is-rounded main-search-input" type="search" placeholder="Search for anything" />
          <span class="icon is-small is-left">
            <i class="fas fa-search" />
          </span>
          <span class="icon is-small is-right">
            <i class="fas fa-filter" />
          </span>
        </div>
      </div>
    </div>

    <div class="navbar-end">
      <div class="navbar-item">
        <div class="field is-grouped">
          <p class="control">
            <span class="button notifications-button">
              <span class="icon">
                <i class="fa fa-bell fas fa-lg" style="color: #131614;" />
              </span>
            </span>
          </p>
          <p class="control">
            <figure class="image">
              <img class="is-rounded" alt="user avatar" src={userAvatar} />
            </figure>
          </p>
        </div>
      </div>
    </div>
  </div>
</nav>

<style lang="scss">
  .main-layoutNav {
    background-color: #fdfdfd;
    border-bottom: 1px solid #d7d7d7 !important;
  }

  .main-search {
    margin-left: 4em;
    width: 50em;
  }

  .main-search-input {
    background: #edeffb;
    border: none;
  }

  .notifications-button {
    // background-color: grey; TO REVISE LATER
    border-radius: 45px;
    border: none;
  }
</style>
