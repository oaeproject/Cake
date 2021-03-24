import { Component, h } from '@stencil/core';
import '@polymer/iron-icons/iron-icons.js';

@Component({
    tag: 'oae-library-mosaic',
    styleUrl: 'oae-library-mosaic.scss',
})

export class LibraryMosaic {
    render() {
        return (
            <div class="card mosaic-card">
                <div class="card-image">
                    <figure class="image is-2by1 mosaic-card-corners">
                        <img src="https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Placeholder image" />
                    </figure>
                </div>
                <div class="card-content">
                    <div class="media-content">
                        <p class="title is-5">background.jpg</p>
                    </div>
                    <div class="media is-inline-flex mosaic-card-bottom">
                        <div class="media-left">
                            <div class="box is-48x48 mosaic-box">
                                
                            </div>
                        </div>
                        <div class="is-left mosaic-card-bottom-label">
                            <p class="title is-6">personal</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
