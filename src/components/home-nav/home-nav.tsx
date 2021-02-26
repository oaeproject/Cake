import { Component, h, Prop, getAssetPath,} from '@stencil/core';

@Component({
  tag: 'home-nav',
  styleUrl: 'home-nav.scss',
  assetsDirs: ['assets'],
})

export class HomeNav {
  @Prop() image = "oae-logo.svg";

  render() {
    return (
      <nav class="navbar home-nav">
        <div class="navbar-brand">
          <a class="navbar-item logo" href="#">
            <img src={getAssetPath(`./assets/${this.image}`)} />
          </a>
        </div>
        <div class="navbar-end navEnd">
          <div class="navbar-item">
            <div class="buttons">
              <a class="button is-round register-button">Register</a>
              <a class="button is-round signIn-button">Sign In</a>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}
