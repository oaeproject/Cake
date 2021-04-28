import App from "./App.svelte";
import "ulog";
import "./styles/global.scss";
// import "./i18n";
import { register, init, getLocaleFromNavigator } from "svelte-i18n";

/*
register("en", () => import("./i18n/en.json"));
register("pt", () => import("./i18n/pt.json"));

console.log("Locale from navigator:");
console.log(getLocaleFromNavigator());

init({
  fallbackLocale: "en",
  initialLocale: getLocaleFromNavigator(),
});
*/

const app = new App({
  target: document.body,
  props: {},
});

export default app;
