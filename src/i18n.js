import { register, init, getLocaleFromNavigator } from "svelte-i18n";

register("fr_FR", () => import("./i18n/fr_FR.json"));
register("en_GB", () => import("./i18n/en_GB.json"));

init({
  fallbackLocale: "fr_FR",
  initialLocale: getLocaleFromNavigator(),
});
