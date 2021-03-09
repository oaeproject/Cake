import { UserStore } from './user-store';

export class RootStore {
  userStore;
  constructor() {
    this.userStore = new UserStore(this);
    // This.todoStore = new TodoStore(this);
  }
}
