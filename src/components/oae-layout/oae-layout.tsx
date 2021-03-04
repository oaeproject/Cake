import { Component, h } from '@stencil/core';

@Component({
  tag: 'oae-layout',
  styleUrl: 'oae-layout.scss',
})

export class MainLayout {
  render() {
    return (
      <div class="container main-container">
        <div class="columns columns-container">
          <div class="column is-one-fifth sidebar">
            <div class="menu sticky">
              <oae-sidebar></oae-sidebar>
            </div>
          </div>
          <div class="column main-wrapper">
            <div class="column is-three-fifths main-content">
              <slot />
            </div>
            <div class="column options">
            </div>
          </div>
        </div>
      </div>


    );
  }
}
