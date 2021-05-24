import { Tenant } from "./tenant";

export class Resource {
  displayName: string;
  tenant: Tenant;
  id: string; /* example: "d:guest:euAwbGM_cL" */
  apiUrl: string; /* example: "http://guest.oae.com/api/discussion/d:guest:euAwbGM_cL" */
  profilePath: string; /* example: "/discussion/guest/euAwbGM_cL" */
  objectType: string; /* in this case it should be 'discussion' */
  url: string; /* example: "http://guest.oae.com/discussion/guest/euAwbGM_cL" */
  visibility: "public" | "private" | "loggedin";

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
     * ​​url: "http://guest.oae.com/discussion/guest/euAwbGM_cL"
     */

    this.apiUrl = resourceData.id;
    this.id = resourceData["oae:id"];
    this.displayName = resourceData.displayName;
    this.profilePath = resourceData.profilePath;
    this.tenant = new Tenant(resourceData.tenant);
    this.visibility = resourceData["oae:visibility"];
    this.objectType = resourceData.objectType;
    this.url = resourceData.url;
  }
}
