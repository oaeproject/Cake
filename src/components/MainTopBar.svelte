<script>
  import { _ } from 'svelte-i18n';
  import { afterUpdate, onMount } from 'svelte';

  const avatar = '/assets/logos/avatar.jpg';
  const DEFAULT_LOGO = 'oae-logo.svg';
  let tenantLogo;

  onMount(async () => {
    try {
      const response = await fetch('/api/ui/logo');
      const text = await response.text();

      // TODO we need to change the backend to deliver the correct filepath if default
      const isDefaultLogo = pipe(split('/'), last, equals(DEFAULT_LOGO))(text);

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

<nav class="navbar main-layoutNav">
  <div class="navbar-brand">
    <a class="navbar-item" href="https://bulma.io">
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
        <a class="navbar-link" href="#"> Home </a>
        <div class="navbar-dropdown is-boxed">
          <a class="navbar-item" href="#"> Design Matters </a>
          <a class="navbar-item" href="#"> OAE2021 </a>
          <a class="navbar-item" href="#"> OAE Internship </a>
          <hr class="navbar-divider" />
          <a class="navbar-item" href="#"> View recent groups </a>
          <a class="navbar-item is-active" href="#"> Recent Activity </a>
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
                <i class="fa fa-bell fas fa-lg" style="color: #EBEFFB;" />
              </span>
            </span>
          </p>
          <p class="control">
            <figure class="image">
              <img class="is-rounded" alt="user avatar" src={avatar} />
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
    border-bottom: 1px solid #D7D7D7 !important;
  }

  .main-search {
    margin-left: 4em;
    width: 50em;
  }

  .main-search-input {
    background: #EDEFFB;
    border: none;
  }

  .notifications-button {
    background-color: #212d62;
    border-radius: 45px;
  }
</style>
