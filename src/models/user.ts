import { makeAutoObservable, computed, observable } from 'mobx';
import { Tenant } from './tenant';

export class User {
  store: null;
  anonymous: boolean;
  tenant: Tenant;
  locale: string;

  constructor(store, { anonymous, locale, tenant }: { anonymous: boolean; locale: string; tenant: Tenant }) {
    // TODO do we need all these attributes to be observable?
    makeAutoObservable(this, {
      anonymous: observable,
      // tenant: observable,
      locale: observable,
      asBackend: computed,
    });
    this.store = store;

    this.anonymous = anonymous;
    this.locale = locale;
    this.tenant = tenant;
  }

  get asBackend() {
    return {
      anon: this.anonymous,
      locale: this.locale,
      tenant: this.tenant.asBackend,
    };
  }
}
