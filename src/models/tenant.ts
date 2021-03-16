import { computed, observable, makeObservable } from 'mobx';

export class Tenant {
  store: null;
  alias: string;
  displayName = 'interwebs';
  isGuestTenant: boolean;
  isPrivate: boolean;
  emailDomains: string[];

  constructor(store, tenantData) {
    makeObservable(this, {
      alias: observable,
      displayName: observable,
      isGuestTenant: observable,
      isPrivate: observable,
      asBackend: computed,
    });
    this.store = store;

    this.alias = tenantData.alias;
    this.displayName = tenantData.displayName;
    this.isGuestTenant = tenantData.isGuestTenant;
    this.isPrivate = tenantData.isPrivate;
    this.emailDomains = tenantData.emailDomains;
  }

  get asBackend() {
    return {
      alias: this.alias,
      displayName: this.displayName,
      isGuestTenant: this.isGuestTenant,
      isPrivate: this.isPrivate,
      emailDomains: this.emailDomains,
    };
  }
}
