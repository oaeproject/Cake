import { Component, h } from '@stencil/core';

import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/social-icons.js';
import '@polymer/iron-icons/av-icons.js';

@Component({
  tag: 'oae-groups-tabs',
  styleUrl: 'oae-groups-tabs.scss',
})

export class GroupsTabs {
  render() {
    return (
      <div>
      <div class="tab">
        <button class="tablinks">
          <span class="icon is-small button-icon">
            <iron-icon icon="icons:home"></iron-icon>
          </span>
          <span>Home</span>
        </button>
        <button class="tablinks">
          <span class="icon is-small button-icon">
            <iron-icon icon="icons:error-outline"></iron-icon>
          </span>
          <span>About</span>
        </button>
        <button class="tablinks">
          <span class="icon is-small button-icon">
            <iron-icon icon="av:library-books"></iron-icon>
          </span>
          <span>Library</span>
        </button>
        <button class="tablinks">
          <span class="icon is-small button-icon">
            <iron-icon icon="social:people-outline"></iron-icon>
          </span>
          <span>Members</span>
        </button>
        <button class="tablinks">
          <span class="icon is-small button-icon">
            <iron-icon icon="icons:settings"></iron-icon>
          </span>
          <span>Settings</span>
        </button>
      </div>

      <hr class="section-divider"/>
      </div>
    );
  }
}

