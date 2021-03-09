import { makeAutoObservable, observable, computed, autorun, action } from 'mobx';

export class UserStore {
  rootStore;
  anonymous;
  locale;
  shortDescription: string;
  tenantIbelongTo = { displayName: 'nowhere' };

  constructor(rootStore) {
    makeAutoObservable(this, {
      anonymous: observable,
      locale: observable,
      tenantIbelongTo: observable,
      describeUser: computed,
      updateUser: action,
      getUser: computed,
    });
    autorun(() => {
      // TODO debug
      console.log(this.describeUser);
    });
    this.rootStore = rootStore;
  }

  updateUser(user) {
    this.anonymous = user.anon;
    this.locale = user.locale;
    this.tenantIbelongTo = user.tenant;
  }

  get getUser() {
    return { anonymous: this.anonymous, locale: this.locale, tenant: this.tenantIbelongTo };
  }

  get describeUser() {
    return `User is ${this.anonymous ? 'anonymous' : 'unknown'} and belongs to tenant ${this.tenantIbelongTo.displayName}`;
  }

  /*
  GetTodos(user) {
    // Access todoStore through the root store.
    return this.rootStore.todoStore.todos.filter(todo => todo.author === user);
  }
  */
}
