import { makeObservable, computed, observable } from 'mobx';
import { Tenant } from './tenant';

export class User {
  store: null;
  anonymous: boolean;
  tenant: Tenant;
  locale: string;

  constructor(store, userData) {
    makeObservable(this, {
      anonymous: observable,
      tenant: observable,
      locale: observable,
      asBackend: computed,
    });
    this.store = store;

    this.anonymous = userData.anonymous;
    this.locale = userData.locale;
    this.tenant = userData.tenant;
  }

  get asBackend() {
    return {
      anon: this.anonymous,
      locale: this.locale,
      tenant: this.tenant.asBackend,
    };
  }
}
