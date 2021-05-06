import App from "./App.svelte";
import "ulog";
import "./styles/global.scss";
import "./i18n";

const app = new App({
  target: document.body,
  props: {},
});

export default app;
