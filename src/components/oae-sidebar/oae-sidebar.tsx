import { Component, h, Prop, getAssetPath } from '@stencil/core';

import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/social-icons.js';
import '@polymer/iron-icons/av-icons.js';

@Component({
  tag: 'oae-sidebar',
  styleUrl: 'oae-sidebar.scss',
  assetsDirs: ['assets'],
})

export class Sidebar {
  @Prop() image = 'oae-logo.svg';
  @Prop() avatar = 'user.jpg';
  render() {
    return (
      <aside class="menu">
        <nav class="level sidebar-dropdown">
          <div class="level-left">
            <div class="level-item">
              <figure class="image is-64x64">
                <img src={getAssetPath(`./assets/${this.image}`)} />
              </figure>
            </div>
            <div class="level-item">
              <div class="dropdown is-hoverable">
                <div class="dropdown-trigger">
                  <button class="button dropdown-sidebar" aria-haspopup="true" aria-controls="dropdown-menu4">
                    <span>Home</span>
                    <span class="icon is-small">
                      <i class="fas fa-angle-down" aria-hidden="true"></i>
                    </span>
                  </button>
                </div>
                <div class="dropdown-menu" id="dropdown-menu4" role="menu">
                  <div class="dropdown-content">
                    <div class="dropdown-item">
                      <p>You can insert <strong>any type of content</strong> within the dropdown menu.</p>
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
              <iron-icon icon="cloud-upload"></iron-icon>
            </span>
            <a class="dashboard">
              New File
          </a>
          </li>
          <li>
            <span class="icon sidebar-icon">
              <iron-icon icon="create"></iron-icon>
            </span>
            <a class="library">
              Create
          </a>
          </li>
          <li>
            <span class="icon sidebar-icon">
              <iron-icon icon="settings"></iron-icon>
            </span>
            <a class="groups">
              Settings
          </a>
          </li>
        </ul>
        <hr class="navbar-divider sidebar-divider" />
        <ul class="menu-list">
          <li>
            <span class="icon sidebar-icon">
              <iron-icon icon="dashboard"></iron-icon>
            </span>
            <a class="dashboard">
              Dashboard
          </a>
          </li>
          <li>
            <span class="icon sidebar-icon">
              <iron-icon icon="av:library-books"></iron-icon>
            </span>
            <a class="library">
              Library
          </a>
          </li>
          <li>
            <span class="icon sidebar-icon">
              <iron-icon icon="content-paste"></iron-icon>
            </span>
            <a class="discussions">
              Discussions
          </a>
          </li>
          <li>
            <span class="icon sidebar-icon">
              <iron-icon icon="social:people-outline"></iron-icon>
            </span>
            <a class="groups">
              Groups
          </a>
          </li>
        </ul>
        <footer class="footer sidebar-footer">
          <nav class="level sidebar-avatar-logout">
            <div class="level-left">
              <div class="level-item">
                <figure class="image is-48x48">
                  <img class="is-rounded" src={getAssetPath(`./assets/${this.avatar}`)} />
                </figure>
              </div>
              <div class="level-item">
                <div class="dropdown is-hoverable dropdown is-up">
                  <div class="dropdown-trigger">
                    <button class="button dropdown-sidebar" aria-haspopup="true" aria-controls="dropdown-menu4">
                      <span>Sarah Jones</span>
                      <span class="icon is-small">
                        <i class="fas fa-angle-down" aria-hidden="true"></i>
                      </span>
                    </button>
                  </div>
                  <div class="dropdown-menu" id="dropdown-menu4" role="menu">
                    <div class="dropdown-content">
                      <div class="dropdown-item">
                        <button class="button logout-button">
                          <span class="icon">
                            <iron-icon icon="power-settings-new"></iron-icon>
                          </span>
                          <span class="logout-button-text">Logout</span>
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
    );
  }
}
