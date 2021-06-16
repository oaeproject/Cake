// @ts-check
import { Tenant } from './tenant';
import { pipe, when, has, __, prop, assoc, dissoc, isNil, compose, any, path, not } from 'ramda';

const includesTenantData = compose(not, isNil, prop('tenant'));
const exists = compose(not, isNil);
const deleteOldAttribute = oldAttribute => dissoc(oldAttribute);
const copyToNewAttribute = (oldAttribute, newAttribute, object) =>
  assoc(newAttribute, __, object)(prop(oldAttribute, object));
const transferAttributeTo = (oldAttribute, newAttribute) => object => {
  return deleteOldAttribute(oldAttribute)(copyToNewAttribute(oldAttribute, newAttribute, object));
};

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
    const copyApiUrlIfPresent = when(hasId, transferAttributeTo(ID, API_URL));
    const copyIdIfPresent = when(hasOaeId, transferAttributeTo(OAE_ID, ID));
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

    this.smallPicture = getSmallPicture(userData);
    this.mediumPicture = getMediumPicture(userData);
    this.largePicture = getLargePicture(userData);
    this.isGlobalAdmin = userData?.isGlobalAdmin;
    this.isTenantAdmin = userData?.isTenantAdmin;
    this.visibility = userData?.visibility;
    this.isLoggedIn = !userData?.anon;
    this.anonymous = userData?.anonymous;
    this.locale = userData?.locale;
    this.lastModified = new Date(userData?.lastModified);
    this.needsToAcceptTC = userData?.needsToAcceptTC;
    this.acceptedTC = userData?.acceptedTC;
    this.profilePath = userData?.profilePath;
    this.displayName = userData?.displayName;
    this.email = userData?.email;
    this.emailPreference = userData?.emailPreference;

    if (includesTenantData(userData)) {
      this.tenant = new Tenant(userData?.tenant);
    } else {
      this.tenant = new Tenant({});
    }
  }

  get hasAnyPicture() {
    return any(exists, [this.smallPicture, this.mediumPicture, this.largePicture]);
  }
}
