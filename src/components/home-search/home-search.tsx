import { Component, h } from '@stencil/core';
import '@polymer/iron-icons/iron-icons.js';

@Component({
  tag: 'home-search',
  styleUrl: 'home-search.scss',
})

export class HomeSearch {
  render() {
    return (
      <div class="field home-search">
        <div class="control has-icons-left home-searchIcon">
          <input class="input is-rounded" type="search" placeholder="Search for keywords like 'open apereo' " />
          <span class="icon is-left ">
            <iron-icon icon="search"></iron-icon>
          </span>
        </div>
      </div>
    );
  }
}
