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
            <p class="menu-label"><b>Quick Links</b></p>
            <ul id="menu" class="menu-list">
              <li><a href="#basic">Basic SEO Checklist</a></li>
              <li><a href="#keyword">Keyword Research Checklist</a></li>
              <li><a href="#onpage">On-Page SEO Checklist</a></li>
              <li><a href="#content">Content Checklist</a></li>
              <li><a href="#technical">Technical SEO Checklist</a></li>
              <li><a href="#link">Link Building Checklist</a></li>
            </ul>
          </div>
        </div>
      </oae-layout>
    );
  }
}
