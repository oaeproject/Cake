import { Tenant } from './tenant';

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
   */
  objectType;

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

  mimeType;
  image;
  wideImage;
  subType;
  revisionId;

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

    this.displayName = resourceData?.displayName;
    this.apiUrl = resourceData?.id;
    this.image = resourceData?.image;
    this.wideImage = resourceData?.wideImage;
    this.id = resourceData['oae:id'];
    this.mimeType = resourceData['oae:mimeType'];
    this.profilePath = resourceData['oae:profilePath'];
    this.subType = resourceData['oae:resourceSubType'];
    this.revisionId = resourceData['oae:revisionId'];
    this.tenant = new Tenant(resourceData['oae:tenant']);
    this.visibility = resourceData['oae:visibility'];
    this.objectType = resourceData?.objectType;
    this.url = resourceData?.url;
  }
}
