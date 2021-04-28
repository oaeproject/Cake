import { Tenant } from "./tenant";

import {
  has,
  __,
  prop,
  assoc,
  dissoc,
  isNil,
  compose,
  any,
  path,
  not,
} from "ramda";
const includesTenantData = compose(not, isNil, prop("tenant"));
const exists = compose(not, isNil);

const deleteOldAttribute = (oldAttribute) => dissoc(oldAttribute);
const copyToNewAttribute = (oldAttribute, newAttribute, object) =>
  assoc(newAttribute, __, object)(prop(oldAttribute, object));

const transferAttributeTo = (oldAttribute, newAttribute) => (object) => {
  return deleteOldAttribute(oldAttribute)(
    copyToNewAttribute(oldAttribute, newAttribute, object)
  );
};
const transferAttribute = (oldAttribute, newAttribute, object) =>
  transferAttributeTo(oldAttribute, newAttribute)(object);

const USER = "user";
const PICTURE = "picture";
const SMALL = "small";
const MEDIUM = "medium";
const LARGE = "large";

const getSmallPicture = path([PICTURE, SMALL]);
const getMediumPicture = path([PICTURE, MEDIUM]);
const getLargePicture = path([PICTURE, LARGE]);

export class User {
  anonymous: boolean;
  tenant: Tenant;
  locale: string; /* example: en_GB */
  authenticationStrategy:
    | "local"
    | "ldap"
    | "shibboleth"
    | "twitter"
    | "google"
    | "googleApps"
    | "facebook"
    | "cas";
  displayName: string;
  email: string;
  emailPreference: "immediate" | "daily" | "weekly" | "never";
  id: number; /* example: "u:guest:QGhEMXZoS3" */
  profilePath: string; /* example: "/user/guest/QGhEMXZoS3" */
  publicAlias: string;
  resourceType: string = USER;
  signatureExpiryDate: number;
  lastModified: Date;
  signature: string;
  smallPicture: string; /* example: "/api/download/signed?uri=...&expires=...&signature=..." */
  mediumPicture: string; /* example: "/api/download/signed?uri=...&expires=...&signature=..." */
  largePicture: string; /* example: "/api/download/signed?uri=...&expires=...&signature=..." */

  // These are potential observables in the future
  acceptedTC: boolean; /* AcceptedTC can be 0 or 1 */
  needsToAcceptTC: boolean;
  isGlobalAdmin: boolean;
  isTenantAdmin: boolean;
  visibility: "public" | "private" | "loggedin";
  isLoggedIn: boolean;

  constructor(userData = {}) {
    /**
     * Stuff coming from activity actor modelling:
     *
     * "oae:id": "u:guest:QGhEMXZoS3"
     * "oae:profilePath": "/user/guest/QGhEMXZoS3"
     * "oae:tenant": Object { alias: "guest", displayName: "Guest tenant", isGuestTenant: true, … }
     * "oae:visibility": "public"
     * objectType: "user"
     */

    /**
     * TODO:
     *
     * - [ ] Compose all these transfers
     * - [x] Display examples of attributes on top
     * - [x] Switch statement?
     */

    const OBJECT_TYPE = "objectType";
    const RESOURCE_TYPE = "resourceType";
    const VISIBILITY = "visibility";
    const OAE_VISIBILITY = "oae:visibility";
    const OAE_TENANT = "oae:tenant";
    const TENANT = "tenant";
    const OAE_ID = "oae:id";
    const ID = "id";
    const OAE_PROFILE_PATH = "oae:profilePath";
    const PROFILE_PATH = "profilePath";

    // when(predicate, whenTrueFn, X);

    if (has(OBJECT_TYPE, userData)) {
      userData = transferAttribute(OBJECT_TYPE, RESOURCE_TYPE, userData);
    }
    /*
    userData = when(has(OBJECT_TYPE), transferAttributeTo(OBJECT_TYPE, RESOURCE_TYPE), userData);
    */

    if (has(OAE_VISIBILITY, userData)) {
      userData = transferAttribute(OAE_VISIBILITY, VISIBILITY, userData);
    }

    if (has(OAE_TENANT, userData)) {
      userData = transferAttribute(OAE_TENANT, TENANT, userData);
    }

    if (has(OAE_ID, userData)) {
      userData = transferAttribute(OAE_ID, ID, userData);
    }

    if (has(OAE_PROFILE_PATH, userData)) {
      userData = transferAttribute(OAE_PROFILE_PATH, PROFILE_PATH, userData);
    }

    this.smallPicture = getSmallPicture(userData);
    this.mediumPicture = getMediumPicture(userData);
    this.largePicture = getLargePicture(userData);
    this.isGlobalAdmin = prop("isGlobalAdmin", userData);
    this.isTenantAdmin = prop("isTenantAdmin", userData);
    this.visibility = prop("visibility", userData);
    this.isLoggedIn = not(prop("anon", userData));
    this.anonymous = prop("anonymous", userData);
    this.locale = prop("locale", userData);
    this.lastModified = new Date(prop("lastModified", userData));
    this.needsToAcceptTC = prop("needsToAcceptTC", userData);
    this.acceptedTC = Boolean(prop("acceptedTC", userData));
    this.profilePath = prop("profilePath", userData);
    this.id = prop("id", userData);
    this.displayName = prop("displayName", userData);
    this.email = prop("email", userData);
    this.emailPreference = prop("emailPreference", userData);

    if (includesTenantData(userData)) {
      this.tenant = new Tenant(prop("tenant", userData));
    } else {
      this.tenant = new Tenant({});
    }
  }

  get hasAnyPicture() {
    return any(exists, [
      this.smallPicture,
      this.mediumPicture,
      this.largePicture,
    ]);
  }

  get asBackend() {
    return {
      anon: not(this.isLoggedIn),
      locale: this.locale,
      tenant: this.tenant.asBackend,
    };
  }
}
