import { createApp } from "vue";
import App from "./app.vue";

import "./css/main.scss";

async function init() {
  const app = createApp(App);
  app.mount("#app");
}

init();
