// import { computed, observable, makeAutoObservable } from 'mobx';
import { prop } from "ramda";

export class Tenant {
  store: null;
  alias: string;
  displayName: string;
  isGuestTenant: boolean;
  isPrivate: boolean;
  emailDomains: string[];

  constructor(tenantData) {
    // TODO do we need all these attributes to be observable?
    /*
    makeAutoObservable(this, {
      // alias: observable,
      displayName: observable,
      isGuestTenant: observable,
      isPrivate: observable,
      asBackend: computed,
    });
    */

    this.alias = prop("alias", tenantData);
    this.displayName = prop("displayName", tenantData);
    this.isGuestTenant = prop("isGuestTenant", tenantData);
    this.isPrivate = prop("isPrivate", tenantData);
    this.emailDomains = prop("emailDomains", tenantData);
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
