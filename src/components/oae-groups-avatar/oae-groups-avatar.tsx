import { Component, h } from '@stencil/core';

@Component({
  tag: 'oae-groups-avatar',
  styleUrl: 'oae-groups-avatar.scss',
})

export class GroupsAvatar {
  render() {
    return (
            <section class="avatar">
        <figure class="image is-128x128 avatar-figure">
          <img class="is-rounded" src="https://scontent.fopo1-1.fna.fbcdn.net/v/l/t1.0-9/537484_224892540989084_1267897031_n.jpg?_nc_cat=104&_nc_sid=09cbfe&_nc_ohc=XFXRaFbyn0AAX84b7iF&_nc_ht=scontent.fopo1-1.fna&oh=a63ebf898d71c55443aab13cb60ce95d&oe=5EFFF95A" />
        </figure>
      </section>
    );
  }
}
