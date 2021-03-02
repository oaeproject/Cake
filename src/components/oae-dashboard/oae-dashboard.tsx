import { Component, h } from '@stencil/core';

import '@polymer/iron-icons/iron-icons.js';

@Component({
  tag: 'oae-dashboard',
  styleUrl: 'oae-dashboard.scss',
})

export class Dashboard {
  render() {
    return (
      <oae-layout>
        <div>
          <oae-newsfeed></oae-newsfeed>
          <oae-newsfeed></oae-newsfeed>
          <oae-newsfeed></oae-newsfeed>
          <oae-newsfeed></oae-newsfeed>
          <oae-newsfeed></oae-newsfeed>
          <oae-newsfeed></oae-newsfeed>
          <oae-newsfeed></oae-newsfeed>
          <oae-newsfeed></oae-newsfeed>
          <oae-newsfeed></oae-newsfeed>
          <oae-newsfeed></oae-newsfeed>
          <oae-newsfeed></oae-newsfeed>
        </div>
        <div class="column options">
          <div class="menu sticky">
          </div>
        </div>
      </oae-layout>
    );
  }
}
