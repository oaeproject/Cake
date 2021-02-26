import { Component, h } from '@stencil/core';


@Component({
  tag: 'oae-homepage',
  styleUrl: 'homepage.scss',
})

export class Homepage {
  render() {
    return (
      <div>
        <home-nav></home-nav>
        <section class="hero is-fullheight">
          <div class="hero-body">
            <div class="container">
              <div class="columns is-vcentered">
                <div class="column is-5 landing-caption left-landing">
                  <h1 class="title is-2 is-bold is-spaced bold-title ">
                    A new way to share, explore and connect</h1>
                  <h2 class="subtitle is-5">
                    <strong>The Open Academic Environment</strong> is the easiest way to communicate and share files with your classmates. Whether you're a student, investigator or professor, <strong>join us for free!</strong>
                  </h2>
                  <home-search></home-search>
                  <div class="button-wrap buttons-landing">
                    <a class="button cta is-rounded primary-btn button-start">
                    Search
                    </a>
                    <a class="button cta is-rounded button-filter">
                    Filter
                    </a>
                  </div>
                  </div>
                  <div class="column is-5 landing-image">
                    <figure class="image is-4by5 cover">
                      <img src="images/illustration.svg" alt="Description"/>
                    </figure>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
    );
  }
}
