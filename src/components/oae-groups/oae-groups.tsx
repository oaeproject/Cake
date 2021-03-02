import { Component, h } from '@stencil/core';

import '@polymer/iron-icons/iron-icons.js';

@Component({
  tag: 'oae-groups',
  styleUrl: 'oae-groups.scss',
})
export class Groups {
  render() {
    return (
      <oae-layout>
        <section class="is-flex">
          <ul class="breadcrumb">
            <li>
              <a href="#">Groups</a>
            </li>
            <li>Open Apereo 2021</li>
          </ul>
        </section>
        <oae-groups-banner></oae-groups-banner>
        <oae-groups-avatar></oae-groups-avatar>
        <oae-groups-header></oae-groups-header>
        <oae-groups-tabs></oae-groups-tabs>
        <section>
          <div class="level">
            <div class="level-left">
              <div class="level-item activity">
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
          </div>
        </section>
        <oae-newsfeed></oae-newsfeed>
        <oae-newsfeed></oae-newsfeed>
        <oae-newsfeed></oae-newsfeed>
      </oae-layout>
    );
  }
}
