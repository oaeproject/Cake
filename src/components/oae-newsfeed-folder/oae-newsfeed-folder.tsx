import { Component, h } from '@stencil/core';

import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/social-icons.js';
import '@polymer/iron-icons/editor-icons.js';
import '@polymer/iron-icons/av-icons.js';
import '@polymer/iron-icons/hardware-icons.js';
import '@polymer/iron-icons/communication-icons.js';

@Component({
    tag: 'oae-newsfeed-folder',
    styleUrl: 'oae-newsfeed-folder.scss',
})

export class NewsFeed {
    render() {
        return (
            <div class="box box-feed">
                <div class="content news-feed">
                    <nav class="level news-feed-top">
                        <div class="level-left">
                            <div class="level-item">
                                <div class="column is-flex news-feed-nav">
                                    <figure class="image avatar-news-feed">
                                        <img class="is-rounded avatar-news-feed" src="assets/images/avatar3.jpg" />
                                    </figure>
                                    <section>
                                        <p class="user-info">
                                            <a class="feed-user">Rita Oak </a>
                      created folder <a class="feed-user"> Design Matters</a>
                                            <span class="panel-icon icon-feed">
                                                <iron-icon icon="icons:folder-open"></iron-icon>
                                            </span>
                                             in <a class="feed-user"> internship</a>
                                            <span class="panel-icon icon-feed">
                                                <iron-icon icon="social:group"></iron-icon>
                                            </span>
                                        </p>
                                        <p>
                                            25 March 2021
                    </p>
                                    </section>
                                </div>
                            </div>
                        </div>
                        <div class="level-right">
                            <p class="level-item">
                                <button class="button news-pin">
                                    <iron-icon icon="icons:more-vert"></iron-icon>
                                </button>
                            </p>
                        </div>
                    </nav>
                </div>
            </div>
        );
    }
}
