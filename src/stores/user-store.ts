import { computed, autorun, makeObservable, observable, flow, action } from 'mobx';

import { Tenant } from '../models/tenant';
import { User } from '../models/user';
import { RootStore } from './root-store';

export class UserStore {
  rootStore: RootStore;
  currentUser: User;

  constructor(rootStore) {
    makeObservable(this, {
      currentUser: observable,
      setCurrentUser: action,
      getCurrentUser: flow,
      describeUser: computed,
    });
    autorun(() => {
      // Some action we might need to run just once
    });
    this.rootStore = rootStore;
  }

  setCurrentUser(visitingUser) {
    const tenantUserBelongsTo = new Tenant(this, visitingUser.tenant);
    this.currentUser = new User(this, { anonymous: visitingUser.anon, locale: visitingUser.locale, tenant: tenantUserBelongsTo });

    // TODO debug
    console.log(`Just set the current user locally!`);
  }

  /**
   * Using flow instead of async / await
   * Check more info here:
   * https://mobx.js.org/actions.html#using-flow-instead-of-async--await-
   */
  *getCurrentUser() {
    try {
      const response = yield fetch('/api/me');
      const data = yield response.json();
      return data;
    } catch (error: unknown) {
      // TODO better error handling
      console.error(error);
    }
  }

  get describeUser() {
    return `Current user is ${this.currentUser.anonymous ? 'a ghost' : 'logged in'} and belongs to tenant ${this.currentUser.tenant.displayName}`;
  }
}
