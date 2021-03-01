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
        <section class="column activity-dashboard">
          <section class="is-flex">
            <ul class="breadcrumb">
              <li><a href="#">User Profile Area</a></li>
              <li>Dashboard</li>
            </ul>
          </section>
          <nav class="level">
            <div class="level-left">
              <div class="level-item">
                <span class="dashboard-icon">
                  <iron-icon icon="icons:update"></iron-icon>
                </span>
                <h3>Recent Activity</h3>
              </div>
            </div>
            <div class="level-right">
              <div class="buttons">
                <button class="button filter-feed filter-active-feed">Most Recent</button>
                <button class="button filter-feed">Oldest</button>
              </div>
            </div>
          </nav>
          <oae-newsfeed></oae-newsfeed>
          <oae-newsfeed></oae-newsfeed>
          <oae-newsfeed></oae-newsfeed>
        </section>
        </oae-layout>
    );
  }
}
