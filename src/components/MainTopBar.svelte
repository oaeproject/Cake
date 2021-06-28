<script>
  import { _ } from 'svelte-i18n';
  import anylogger from 'anylogger';

  const log = anylogger('maintopbar');
  const oaeLogo = '/assets/logos/oae-logo.svg';
  const avatar = '/assets/logos/avatar.jpg';
</script>

<nav class="navbar main-layoutNav">
  <div class="navbar-brand">
    <a class="navbar-item" href="https://bulma.io">
      <img alt="oae-logo" src={oaeLogo} />
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
              <img class="is-rounded" src={avatar}/>
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
  }

  .notifications-button {
    background-color: #212d62;
    border-radius: 45px;
  }
</style>
