import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss',
  /**
   * If `true`, the component will use scoped stylesheets. Similar to shadow-dom,
   * but without native isolation. Defaults to `false`.
   */
  /* scoped?: boolean;*/

  /**
   * If `true`, the component will use native shadow-dom encapsulation, it will fallback to `scoped` if the browser
   * does not support shadow-dom natively. Defaults to `false`.
   */
  /* shadow?: boolean;*/
})
export class AppRoot {
  componentDidRender() {
    console.log('here, here!');
  }

  render() {
    return (
      <ion-app>
        <ion-router useHash={false}>
          <ion-route url="/" component="oae-homepage" />
          <ion-route url="/profile/:name" component="app-profile" />
          <ion-route url="/homepage" component="oae-homepage" />
          <ion-route url="/dashboard" component="oae-dashboard" />
          <ion-route url="/library" component="oae-library" />
          <ion-route url="/groups" component="oae-groups" />
          <ion-route url="/kitchen-sink" component="kitchen-sink" />
        </ion-router>
        <ion-nav />
      </ion-app>
    );
  }
}
