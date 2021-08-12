<script>
  import { _ } from 'svelte-i18n';
  import anylogger from 'anylogger';
  import { useNavigate } from 'svelte-navigator';
  import { authenticationAPI } from '../helpers/authentication';
  import { equals } from 'ramda';
  import { user } from '../stores/user';

  const navigate = useNavigate();
  const askAuthAPI = authenticationAPI();
  const { logout } = askAuthAPI;

  const log = anylogger('sidebar');

  const didLogout = equals(200);

  const logoutUser = async () => {
    try {
      const status = await logout();
      if (didLogout(status)) {
        navigate('/');
      } else {
        // TODO: trouble logging out
        log.warn(`Logout returned unexpected status: ${status}`);
      }
    } catch (error) {
      // TODO make something visible to indicate logout
      log.warn(`Unable to logout.`);
    }
  };
</script>

<aside class="menu">
  <ul class="menu-list sidebar-topList">
    <li>
      <span class="icon sidebar-icon fa-lg">
        <i class="fas fa-cloud-upload-alt" />
      </span>
      <a href="/dashboard" class="dashboard">{$_('packages.oae-core.upload.bundles.UPLOAD_FILES')}</a>
    </li>
    <li>
      <span class="icon sidebar-icon fa-lg">
        <i class="fas fa-plus-circle" />
      </span>
      <a href="/library" class="library"> Create </a>
    </li>
  </ul>
  <p class="menu-label sidebar-label">Navigation</p>
  <ul class="menu-list">
    <li>
      <span class="icon sidebar-icon fa-lg">
        <i class="fas fa-chart-line" />
      </span>
      <a href="/dashboard" class="dashboard"> Activity Feed </a>
    </li>
    <li>
      <span class="icon sidebar-icon fa-lg">
        <i class="fas fa-folder-open" />
      </span>
      <a href="/library" class="library"> Library </a>
    </li>
    <li>
      <span class="icon sidebar-icon fa-lg">
        <i class="fas fa-comments" />
      </span>
      <a href="/discussions" class="discussions"> Discussions </a>
    </li>
    <li>
      <span class="icon sidebar-icon fa-lg">
        <i class="fas fa-users" />
      </span>
      <a href="/groups" class="groups"> Groups </a>
    </li>
    <li>
      <span class="icon sidebar-icon fa-lg">
        <i class="fas fa-cog" />
      </span>
      <a href="/groups" class="groups">Settings</a>
    </li>
  </ul>
  <footer class="footer sidebar-footer">
    <button class="button logout-button">
      <span class="icon">
        <iron-icon icon="power-settings-new" />
      </span>
      {#if $user.isLoggedIn}
        <span class="logout-button-text" on:click|preventDefault={logoutUser}>Sign Out</span>
      {/if}
    </button>
  </footer>
</aside>

<style lang="scss">
  .sidebar-topList {
    margin-top: 8%;
  }

  .menu-list li {
    padding: 2%;
    margin-top: 2%;
    border-radius: 5px;
    height: 45px;
    display: flex;
    align-items: center;

    &:hover {
      color: white;
      background-color: #0060df;
    }

    &:active {
      color: #0060df;
      background-color: #0060df;
    }

    &:focus {
      color: #0060df;
      background-color: #0060df;
    }
  }

  a {
    padding-left: 1.3em;

    &:hover {
      color: #0060df;
    }
  }

  .menu-list a {
    color: #212121;
  }

  li:hover a {
    color: white;
    font-weight: 500;
  }

  .menu-list span {
    padding-left: 3%;
  }

  .sidebar-label {
    margin-top: 8%;
    color: #aeadae;
    text-transform: uppercase;
    font-size: 0.8em;
    margin-left: 3%;
    font-weight: 600;
  }

  .logout-button {
    background-color: transparent;
    border: none;
  }

  .logout-button-text {
    padding-left: 10px;
    text-transform: capitalize;
  }

  // Footer
  .footer.sidebar-footer {
    position: absolute;
    bottom: 0;
    padding: 0;
    background-color: transparent;
    margin-left: 3%;
  }
</style>
