import { Component, h } from '@stencil/core';

@Component({
  tag: 'oae-layout',
  styleUrl: 'oae-layout.scss',
})

export class MainLayout {
  render() {
    return (
      <section class="hero is-fullheight">
        <div class="hero-body">
          <div class="container content-wrapResponsive is-fluid">
            <div class="columns dasboard">
              <div class="column is-one-fifth sidebar is-fullheight">
                <oae-sidebar></oae-sidebar>
              </div>
              <div class="column content-base">
                <div class=" column content-wrap">
                  <div class=" columns is-flex main-content">
                    <div class="column is-three-quarters main-left">
                      <slot/>
                    </div>
                    <div class="column">
                      <info-card></info-card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
