import { register, init, getLocaleFromNavigator } from "svelte-i18n";

register("en", () => import("./i18n/en_GB.json"));
register("pt", () => import("./i18n/pt_PT.json"));
register("fr", () => import("./i18n/fr_FR.json"));

init({
  fallbackLocale: "en",
  initialLocale: getLocaleFromNavigator(),
  // initialLocale: "pt",
});
