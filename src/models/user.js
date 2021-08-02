// @ts-check
import { Tenant } from './tenant';
import { last, split, concat, pipe, when, has, prop, isNil, compose, any, path, not } from 'ramda';

const includesTenantData = compose(not, isNil, prop('tenant'));
const exists = compose(not, isNil);
const transferAttributeTo =
  (oldAttribute, newAttribute, deleteOldAttribute = true) =>
  object => {
    object[newAttribute] = object[oldAttribute];
    if (deleteOldAttribute) delete object[oldAttribute];
    return object;
    // return deleteOldAttribute(oldAttribute)(copyToNewAttribute(oldAttribute, newAttribute, object));
  };

/** @type {String} */
const USER_API_PREFFIX = '/api/user/';

/** @type {String} */
const USER = 'user';

/** @type {String} */
const PICTURE = 'picture';

/** @type {String} */
const SMALL = 'small';

/** @type {String} */
const MEDIUM = 'medium';

/** @type {String} */
const LARGE = 'large';

const getSmallPicture = path([PICTURE, SMALL]);
const getMediumPicture = path([PICTURE, MEDIUM]);
const getLargePicture = path([PICTURE, LARGE]);

export class User {
  /** @type {boolean} */
  anonymous;

  /** @type {Tenant} */
  tenant;

  /** @type {string} */
  locale; // example: en_GB

  /**
   * @type {string}
   * "local"
   * "ldap"
   * "shibboleth"
   * "twitter"
   * "google"
   * "googleApps"
   * "facebook"
   * "cas";
   */
  authenticationStrategy;

  /** @type {string} */
  displayName;

  /** @type {string} */
  email;

  /**
   * @type {string}
   * "immediate"
   * "daily"
   * "weekly"
   * "never";
   */
  emailPreference;

  /**
   * @type {string}
   * example: "u:guest:QGhEMXZoS3"
   */
  id;

  /**
   * @type {string}
   * example: "/user/guest/QGhEMXZoS3"
   */
  profilePath;

  /** @type {string} */
  publicAlias;

  /** @type {string} */
  resourceType = USER;

  /** @type {number} */
  signatureExpiryDate;

  /** @type {Date} */
  lastModified;

  /** @type {string} */
  signature;

  /**
   * @type {string}
   * example: "/api/download/signed?uri=...&expires=...&signature=..."
   */
  smallPicture;

  /**
   * @type {string}
   * example: "/api/download/signed?uri=...&expires=...&signature=..."
   */
  mediumPicture;

  /**
   * @type {string}
   * example: "/api/download/signed?uri=...&expires=...&signature=..."
   */
  largePicture;

  /**
   * @type {number}
   * AcceptedTC can be 0 or 1
   */
  acceptedTC;

  /** @type {boolean} */
  needsToAcceptTC;

  /** @type {boolean} */
  isGlobalAdmin;

  /** @type {boolean} */
  isTenantAdmin;

  /**
   * @type {string}
   * "public" | "private" | "loggedin";
   */
  visibility;

  /** @type {boolean} */
  isLoggedIn;

  constructor(userData = {}) {
    /**
     * Stuff coming from activity actor modelling:
     *
     * "oae:id": "u:guest:QGhEMXZoS3"
     * "oae:profilePath": "/user/guest/QGhEMXZoS3"
     * "oae:tenant": Object { alias: "guest", displayName: "Guest tenant", isGuestTenant: true, … }
     * "oae:visibility": "public"
     * "objectType": "user"
     */

    /** @type {string} */
    const OBJECT_TYPE = 'objectType';

    /** @type {string} */
    const RESOURCE_TYPE = 'resourceType';

    /** @type {string} */
    const VISIBILITY = 'visibility';

    /** @type {string} */
    const OAE_VISIBILITY = 'oae:visibility';

    /** @type {string} */
    const OAE_TENANT = 'oae:tenant';

    /** @type {string} */
    const TENANT = 'tenant';

    /** @type {string} */
    const OAE_ID = 'oae:id';

    /** @type {string} */
    const ID = 'id';

    /** @type {string} */
    const API_URL = 'apiUrl';

    /** @type {string} */
    const OAE_PROFILE_PATH = 'oae:profilePath';

    /** @type {string} */
    const PROFILE_PATH = 'profilePath';

    const hasObjectType = userData => has(OBJECT_TYPE, userData);
    const hasVisibility = userData => has(OAE_VISIBILITY, userData);
    const hasTenant = userData => has(OAE_TENANT, userData);
    const hasId = userData => has(ID, userData);
    const hasOaeId = userData => has(OAE_ID, userData);
    const hasProfilePath = userData => has(OAE_PROFILE_PATH, userData);

    const copyObjectTypeIfPresent = when(hasObjectType, transferAttributeTo(OBJECT_TYPE, RESOURCE_TYPE));
    const copyVisibilityIfPresent = when(hasVisibility, transferAttributeTo(OAE_VISIBILITY, VISIBILITY));
    const copyTenantIfPresent = when(hasTenant, transferAttributeTo(OAE_TENANT, TENANT));
    const copyIdIfPresent = when(hasOaeId, transferAttributeTo(OAE_ID, ID));
    const copyApiUrlIfPresent = when(hasId, transferAttributeTo(ID, API_URL, false));
    const copyProfilePathIfPresent = when(hasProfilePath, transferAttributeTo(OAE_PROFILE_PATH, PROFILE_PATH));

    /**
     * Here we transform some attributes coming from the backend into new simpler ones
     */
    userData = pipe(
      copyObjectTypeIfPresent,
      copyVisibilityIfPresent,
      copyTenantIfPresent,
      copyApiUrlIfPresent,
      copyIdIfPresent,
      copyProfilePathIfPresent,
    )(userData);

    this.resourceType = userData?.resourceType;
    this.visibility = userData?.visibility;

    this.apiUrl = when(
      data => has(API_URL, data),
      compose(data => concat(USER_API_PREFFIX, String(data)), last, split('/'), prop(API_URL)),
    )(userData);

    this.url = userData?.url;
    this.id = userData?.id;
    this.profilePath = userData?.profilePath;
    this.smallPicture = getSmallPicture(userData);
    this.mediumPicture = getMediumPicture(userData);
    this.largePicture = getLargePicture(userData);
    this.isGlobalAdmin = userData?.isGlobalAdmin;
    this.isTenantAdmin = userData?.isTenantAdmin;
    this.isLoggedIn = !userData?.anon;
    this.anonymous = userData?.anonymous;
    this.locale = userData?.locale;
    if (userData.lastModified) this.lastModified = new Date(userData?.lastModified);
    this.needsToAcceptTC = userData?.needsToAcceptTC;
    this.acceptedTC = userData?.acceptedTC;
    this.displayName = userData?.displayName;
    this.email = userData?.email;
    this.emailPreference = userData?.emailPreference;
    this.authenticationStrategy = userData?.authenticationStrategy;
    this.signature = userData?.signature;

    if (includesTenantData(userData)) {
      this.tenant = new Tenant(userData?.tenant);
    } else {
      this.tenant = new Tenant({});
    }
  }

  get hasAnyPicture() {
    return any(exists, [this.smallPicture, this.mediumPicture, this.largePicture]);
  }

  get hasNoPicture() {
    return not(this.hasAnyPicture);
  }
}
