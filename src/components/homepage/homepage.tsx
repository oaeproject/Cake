import { Component, h, Prop } from '@stencil/core';


@Component({
  tag: 'oae-homepage',
  styleUrl: 'homepage.scss',
  assetsDirs: ['imgs'],
})

export class Homepage {
  @Prop() image = 'home-back9.jpg';

  render() {
    return (
      <section class="hero is-primary is-medium">
        <home-nav></home-nav>
        <div class="hero-head">
        </div>
        <div class="hero-body main-area">

            <div class="container has-text-centered is-centered">
              <p class="title homepage-title">
                A new way to share, explore and connect
            </p>
              <home-search></home-search>
            </div>
          </div>
          <div class="hero-body section1-area">
            <div class="container has-text-centered is-centered">
              <p class="subtitle">
                The Open Academic Environment is the easiest way to communicate and share files with your classmates.
                Whether you're a student, investigator or professor, join us for free!
            </p>
            </div>
          </div>
        </section>
    );
  }
}
