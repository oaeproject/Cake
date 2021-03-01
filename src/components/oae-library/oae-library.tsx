import { Component, h } from '@stencil/core';

import '@polymer/iron-icons/iron-icons.js';

@Component({
  tag: 'oae-library',
  styleUrl: 'oae-library.scss',
})

export class Library {
  render() {
    return (
      <oae-layout>
        <section class="column activity-dashboard">
              <section class="is-flex">
                       <ul class="breadcrumb">
                         <li><a href="#">User Profile Area</a></li>
                         <li>Library</li>
                       </ul>
                      </section>
                      <div class="is-inline-flex">
                       <div>
                         <a class="button library-button">
                           <span class="icon is-medium">
                             <iron-icon icon="delete"></iron-icon>
                           </span>
                         </a>
                       </div>
                       <div>
                         <a class="button library-button">
                           <span class="icon">
                             <iron-icon icon="list"></iron-icon>
                           </span>
                         </a>
                       </div>
                      </div>
                      <oae-library-table></oae-library-table>
                     </section>
      </oae-layout>
    );
  }
}
