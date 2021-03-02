import { Component, h } from '@stencil/core';

@Component({
  tag: 'oae-groups-header',
  styleUrl: 'oae-groups-header.scss',
})
export class GroupsHeader {
  render() {
    return (
      <div>
        <section class="level">
          <div class="level-left">
            <div class="level-item">
              <section class="title-header">
                <h1>Open Apereo 2020</h1>
              </section>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <oae-groups-join></oae-groups-join>
            </div>
          </div>
        </section>
        <section class="about-header">
          <p>
            The Open Apereo 2020 is scheduled for June 15-19. You’re probably aware of the significant changes to our major annual international event, Open Apereo 2020, we were
            planning this year. If you hadn’t heard about the changed shape of the event,
            <a href="https://www.apereo.org/content/open-apereo-2020-vision">you can read about it here.</a>
          </p>
        </section>
      </div>
    );
  }
}
