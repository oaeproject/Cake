// @ts-check
export class Tenant {
  /** @type {string} */
  alias;

  /** @type {string} */
  displayName;

  /** @type {boolean} */
  isGuestTenant;

  /** @type {boolean} */
  isPrivate;

  /** @type {string[]} */
  emailDomains;

  constructor(tenantData) {
    this.alias = tenantData?.alias;
    this.displayName = tenantData?.displayName;
    this.isGuestTenant = tenantData?.isGuestTenant;
    this.isPrivate = tenantData?.isPrivate;
    this.emailDomains = tenantData?.emailDomains;
  }

  /**
   * Dummy method
   */
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
