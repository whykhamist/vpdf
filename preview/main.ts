import { createApp } from "vue";
import App from "./app.vue";
import VPdf from "../src";

import "./css/main.scss";
import "../src/css/index.scss";

async function init() {
  const app = createApp(App);
  app.use(VPdf);
  app.mount("#app");
}

init();
