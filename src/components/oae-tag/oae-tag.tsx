import { Component, h } from '@stencil/core';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';

@Component({
  tag: 'oae-tag',
  styleUrl: 'oae-tag.scss',
})

export class Tag {
  render() {
    return (
      <div class="tag-structure is-inline-flex">
        <p class="buttons tag-buttons">
          <a class="button is-small is-rounded tag-button-colors">
            <span class="icon tag-icons">
              <iron-icon icon="label-outline"></iron-icon>
            </span>
            <span class="tag-label">class project</span>
          </a>
        </p>
      </div>
    );
  }
}
