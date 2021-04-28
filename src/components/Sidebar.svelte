<script lang="ts">
  import "@polymer/iron-icons/iron-icons.js";
  import "@polymer/iron-icons/social-icons.js";
  import "@polymer/iron-icons/av-icons.js";

  import anylogger from "anylogger";
  import { useNavigate } from "svelte-navigator";
  import { authenticationAPI } from "../helpers/authentication";
  import { equals } from "ramda";
  import { user } from "../stores/user";

  const navigate = useNavigate();
  const askAuthAPI = authenticationAPI();
  const { logout } = askAuthAPI;

  const log = anylogger("sidebar");
  const oaeLogo = `/assets/logos/oae-logo.svg`;
  // TODO use default image if no avatar defined

  const didLogout = equals(200);

  const logoutUser = async () => {
    try {
      const status = await logout();
      if (didLogout(status)) {
        navigate("/");
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
  <nav class="level sidebar-dropdown">
    <div class="level-left">
      <div class="level-item">
        <figure class="image is-64x64">
          <img alt="oae-logo" src={oaeLogo} />
        </figure>
      </div>
      <div class="level-item">
        <div class="dropdown is-hoverable">
          <div class="dropdown-trigger">
            <button
              class="button dropdown-sidebar"
              aria-haspopup="true"
              aria-controls="dropdown-menu4"
            >
              <span>Home</span>
              <span class="icon is-small">
                <i class="fas fa-angle-down" aria-hidden="true" />
              </span>
            </button>
          </div>
          <div class="dropdown-menu" id="dropdown-menu4" role="menu">
            <div class="dropdown-content">
              <div class="dropdown-item">
                <p>
                  You can insert <strong>any type of content</strong> within the
                  dropdown menu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <ul class="menu-list">
    <li>
      <span class="icon sidebar-icon">
        <iron-icon icon="cloud-upload" />
      </span>
      <a href="/dashboard" class="dashboard"> New File </a>
    </li>
    <li>
      <span class="icon sidebar-icon">
        <iron-icon icon="create" />
      </span>
      <a href="/library" class="library"> Create </a>
    </li>
    <li>
      <span class="icon sidebar-icon">
        <iron-icon icon="settings" />
      </span>
      <a href="/groups" class="groups">Settings</a>
    </li>
  </ul>
  <hr class="navbar-divider sidebar-divider" />
  <ul class="menu-list">
    <li>
      <span class="icon sidebar-icon">
        <iron-icon icon="dashboard" />
      </span>
      <a href="/dashboard" class="dashboard"> Dashboard </a>
    </li>
    <li>
      <span class="icon sidebar-icon">
        <iron-icon icon="av:library-books" />
      </span>
      <a href="/library" class="library"> Library </a>
    </li>
    <li>
      <span class="icon sidebar-icon">
        <iron-icon icon="content-paste" />
      </span>
      <a href="/discussions" class="discussions"> Discussions </a>
    </li>
    <li>
      <span class="icon sidebar-icon">
        <iron-icon icon="social:people-outline" />
      </span>
      <a href="/groups" class="groups"> Groups </a>
    </li>
  </ul>
  <footer class="footer sidebar-footer">
    <nav class="level sidebar-avatar-logout">
      <div class="level-left">
        <div class="level-item">
          <figure class="image is-48x48">
            <img
              alt="user-avatar"
              class="is-rounded"
              src={$user.mediumPicture}
            />
          </figure>
        </div>
        <div class="level-item">
          <div class="dropdown is-hoverable dropdown is-up">
            <div class="dropdown-trigger">
              <button
                class="button dropdown-sidebar"
                aria-haspopup="true"
                aria-controls="dropdown-menu4"
              >
                <span>{$user.displayName}</span>
                <span class="icon is-small">
                  <i class="fas fa-angle-down" aria-hidden="true" />
                </span>
              </button>
            </div>
            <div class="dropdown-menu" id="dropdown-menu4" role="menu">
              <div class="dropdown-content">
                <div class="dropdown-item">
                  <button class="button logout-button">
                    <span class="icon">
                      <iron-icon icon="power-settings-new" />
                    </span>
                    {#if $user.isLoggedIn}
                      <span
                        class="logout-button-text"
                        on:click|preventDefault={logoutUser}>Logout</span
                      >
                    {/if}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </footer>
</aside>

<style lang="scss">
  .menu-list li {
    padding: 2%;
    margin-left: 2%;
    margin-bottom: 1%;
    border-radius: 5px;
    height: 30px;
    color: #212121;
    display: flex;
    align-items: center;
    &:hover {
      color: #0060df;
      background-color: #f6f8f7;
    }
    &:active {
      color: #0060df;
      background-color: #f6f8f7;
    }
    &:focus {
      color: #0060df;
      background-color: #f6f8f7;
    }
  }

  .menu-list a {
    color: #212121;
  }

  .menu-list span {
    padding-left: 1%;
  }

  a.dashboard,
  a.library,
  a.discussions,
  a.groups,
  a.user-settings,
  a.network {
    padding-left: 0.8em;
    &:hover {
      color: #0060df;
    }
  }
  .sidebar-dropdown {
    padding: 1%;
    margin-left: 1%;
  }

  // Sidebar Dropdown
  button.button.dropdown-sidebar {
    background-color: white;
  }

  button.button.dropdown-sidebar {
    background-color: transparent;
    border: none;
  }

  .logout-button {
    background-color: transparent;
    border: none;
  }

  .logout-button-text {
    padding-left: 10px;
    text-transform: capitalize;
  }

  .level.sidebar-dropdown {
    margin-bottom: 0;
  }

  // Sidebar Avatar
  .sidebar-avatar-logout {
    padding-left: 2%;
  }

  .sidebar-notifications {
    width: 50px;
    height: 50px;
    border-radius: 50%;
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
