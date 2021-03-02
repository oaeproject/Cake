import { Component, h } from '@stencil/core';

@Component({
  tag: 'oae-groups-banner',
  styleUrl: 'oae-groups-banner.scss',
  shadow: true
})

export class GroupsBanner {
  render() {
    return (
      <section>
        <figure class="image banner">
          <img src="https://images.pexels.com/photos/3184660/pexels-photo-3184660.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" />
        </figure>
      </section>
    );
  }
}

