/**
 * TODO
 *
 * [ ] firefox debug on vscode
 * [ ] create types for authentication etc
 * [x] clear all linting errors
 * [x] store user on mobx
 *
 */
/* eslint-disable new-cap, @typescript-eslint/promise-function-async */
import { Component, h, Prop } from '@stencil/core';
import { flowResult } from 'mobx';

import { authenticationAPI } from '../../helpers/authentication';
import rootStore from '../../stores/root-store';

@Component({
  tag: 'oae-homepage',
  styleUrl: 'homepage.scss',
})
export class Homepage {
  @Prop({ mutable: true }) tenantConfig: Record<string, unknown> = {};
  @Prop({ mutable: true }) authStrategyInfo: Record<string, unknown> = {};

  componentWillLoad() {
    const userStore = rootStore.userStore;
    return fetch('/api/config')
      .then(response => {
        return response.json();
      })
      .then(data => {
        this.tenantConfig = data;

        // TODO debug
        console.log('this.tenantConfig:');
        console.log(this.tenantConfig);

        return data;
      })
      .then(tenantConfig => {
        const askAuthAPI = authenticationAPI();
        // Variable that holds the configured auth strategy information for the tenant
        this.authStrategyInfo = askAuthAPI.getStrategyInfo(tenantConfig);

        // TODO debug
        console.log('this.authStrategyInfo:');
        console.log(this.authStrategyInfo);

        return this.authStrategyInfo;
      })
      .then(() => {
        // Get data on the user visiting
        return flowResult(userStore.getCurrentUser());
      })
      .then(currentUser => {
        console.log('visiting user: ');
        console.log(currentUser);

        // Store this guy on mobX store
        userStore.setCurrentUser(currentUser);
        console.log(userStore.describeUser);
      })
      .catch(error => {
        // TODO exception handling
        console.error(error);
      });
  }

  render() {
    return (
      <section class="hero is-primary is-medium">
        <home-nav authStrategyInfo={this.authStrategyInfo} color="blue"></home-nav>
        <div class="hero-head"></div>
        <div class="hero-body main-area">
          <div class="container has-text-centered is-centered">
            <p class="title homepage-title">A new way to share, explore and connect</p>
            <home-search></home-search>
          </div>
        </div>
        <div class="hero-body section1-area">
          <div class="container has-text-centered is-centered">
            <p class="subtitle">
              The Open Academic Environment is the easiest way to communicate and share files with your classmates. Whether you're a student, investigator or professor, join us for
              free!
            </p>
          </div>
        </div>
      </section>
    );
  }
}
