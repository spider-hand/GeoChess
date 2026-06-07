import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import App from "@/App.vue";
import { appI18n } from "@/i18n";
import "./main.css";
import router from "@/router";

const app = createApp(App);

app.use(VueQueryPlugin);
app.use(appI18n);
app.use(router);

app.mount("#app");
