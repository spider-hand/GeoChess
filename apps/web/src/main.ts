import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { VueFire, VueFireAuth } from "vuefire";
import App from "@/App.vue";
import { appI18n } from "@/i18n";
import { firebaseApp } from "@/lib/firebase";
import "./main.css";
import router from "@/router";

const app = createApp(App);

app.use(VueQueryPlugin);
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
});
app.use(appI18n);
app.use(router);

app.mount("#app");
