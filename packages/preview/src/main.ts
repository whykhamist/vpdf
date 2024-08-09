import { createApp } from "vue";
import App from "./App.vue";
import VPdf from "@whykhamist/vpdf";

import "./css/index.scss";

async function init() {
  const app = createApp(App);
  app.use(VPdf);
  app.mount("#app");
}

init();
