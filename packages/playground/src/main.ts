import { createApp } from "vue";
import App from "./app.vue";
import router from "./router";
import "./assets/style.css";

const init = async () => {
  const app = createApp(App);
  app.use(router);

  app.mount("#app");
};

init();
