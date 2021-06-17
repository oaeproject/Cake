import { Tenant } from './tenant';

/** @type {string} */
const DISCUSSION = 'discussion';

export class Resource {
  /** @type {string} */
  displayName;

  /** @type {Tenant} */
  tenant;

  /**
   * @type {string}
   * example: "d:guest:euAwbGM_cL"
   */
  id;

  /**
   * @type {string}
   * example: "http://guest.oae.com/api/discussion/d:guest:euAwbGM_cL"
   */
  apiUrl;

  /**
   * @type {string}
   * example: "/discussion/guest/euAwbGM_cL"
   */
  profilePath;

  /**
   * @type {string}
   * in this case it should be 'discussion'
   */
  objectType = DISCUSSION;

  /**
   * @type {string}
   * example: "http://guest.oae.com/discussion/guest/euAwbGM_cL"
   */
  url;

  /**
   * @type {string}
   * 'public' | 'private' | 'loggedin';
   * */
  visibility;

  constructor(resourceData) {
    /**
     * Stuff coming from activity object modelling:
     *
     * object: {…}
     * displayName: "popopo"
     * id: "http://guest.oae.com/api/discussion/d:guest:euAwbGM_cL"
     * "oae:id": "d:guest:euAwbGM_cL"
     * "oae:profilePath": "/discussion/guest/euAwbGM_cL"
     * "oae:tenant": Object { alias: "guest", displayName: "Guest tenant", isGuestTenant: true, … }
     * "oae:visibility": "public"
     * objectType: "discussion"
     * url: "http://guest.oae.com/discussion/guest/euAwbGM_cL"
     */

    this.apiUrl = resourceData?.id;
    this.id = resourceData['oae:id'];
    this.displayName = resourceData?.displayName;
    this.profilePath = resourceData?.profilePath;
    this.tenant = new Tenant(resourceData?.tenant);
    this.visibility = resourceData['oae:visibility'];
    this.objectType = resourceData?.objectType;
    this.url = resourceData?.url;
  }
}
