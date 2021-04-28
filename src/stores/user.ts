import { writable } from "svelte/store";
import { User } from "../models/user";
import anylogger from "anylogger";

const log = anylogger("user-store");
const user = writable(new User());
const redirectUrl = writable("");
const invitationInfo = writable({ email: "", token: "" });

const getCurrentUser = async () => {
  try {
    const response = await fetch("/api/me");
    const data = await response.json();
    return new User(data);
  } catch (error: unknown) {
    log.error(`Unable to get current user from the API`, error);
  }
};

function createTenantConfig() {
  const { subscribe, set } = writable({});

  return {
    subscribe,
    set: (value) => set(value),
  };
}
const tenantConfig = createTenantConfig();

export { getCurrentUser, user, redirectUrl, invitationInfo, tenantConfig };
