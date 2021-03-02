import { Component, h } from '@stencil/core';

import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/social-icons.js';

@Component({
  tag: 'oae-groups-join',
  styleUrl: 'oae-groups-join.scss',
})
export class GroupsJoin {
  render() {
    return (
      <button class="button group-join-button">
        <span class="icon is-small group-join-icon">
          <iron-icon icon="social:group-add"></iron-icon>
        </span>
        <span>Join Group</span>
      </button>
    );
  }
}
