import { UserStore } from './user-store';
// import { TenantStore } from './tenant-store';

export class RootStore {
  userStore: UserStore;
  // tenantStore;

  constructor() {
    this.userStore = new UserStore(this);
    // this.tenantStore = new TenantStore(this);
  }
}

/**
 * Modules are cached after the first time they are loaded.
 * This means (among other things) that every call to require('foo')
 * will get exactly the same object returned,
 * if it would resolve to the same file.
 *
 * And so this becomes a singleton!
 */
export default new RootStore();
