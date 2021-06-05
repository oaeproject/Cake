<script>
  import { _ } from 'svelte-i18n';
</script>

<nav class="navbar navbar-settings" role="navigation" aria-label="main navigation">
  <div id="navbarBasicExample" class="navbar-menu">
    <div class="navbar-item search-area">
      <div class="field search-bar">
        <p class="control has-icons-right">
          <input class="input is-rounded search-settings" type="search" placeholder="Search for anything" />
          <span class="icon is-right push-left">
            <i class="fas fa-sliders-h" />
          </span>
          <span class="icon is-right">
            <i class="fas fa-search" />
          </span>
        </p>
      </div>
    </div>
  </div>
</nav>

<style lang="scss">
  .navbar-settings {
    background: none;
  }

  .search-area {
    width: 500px;
  }

  .search-bar {
    width: 100%;
  }

  .search-settings {
    background: #e5e5e5;
    color: #4F4F4F;
    border: none;
  }

  .push-left {
    margin-right: 30px;
  }
</style>
