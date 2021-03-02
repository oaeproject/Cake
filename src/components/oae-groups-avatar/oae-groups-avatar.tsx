import { Component, h } from '@stencil/core';

@Component({
  tag: 'oae-groups-avatar',
  styleUrl: 'oae-groups-avatar.scss',
  shadow: true,
})
export class GroupsAvatar {
  render() {
    return (
      <section class="avatar">
        <figure class="image is-128x128 avatar-figure">
          <img class="is-rounded" src="../../assets/images/avatar.jpg" />
        </figure>
      </section>
    );
  }
}
