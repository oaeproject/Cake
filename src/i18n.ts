import { register, init, getLocaleFromNavigator } from "svelte-i18n";

register("en", () => import("./i18n/en.json"));
register("pt", () => import("./i18n/pt.json"));

init({
  fallbackLocale: "en",
  initialLocale: getLocaleFromNavigator(),
  // initialLocale: "pt",
});
