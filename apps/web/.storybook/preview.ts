import { setup } from "@storybook/vue3-vite";
import type { Preview } from "@storybook/vue3-vite";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { VueFire, VueFireAuth } from "vuefire";

import { appI18n } from "../src/i18n";
import { firebaseApp, firebaseAuth } from "../src/lib/firebase";
import router from "../src/router";
import "mapbox-gl/dist/mapbox-gl.css";
import "../src/main.css";

setup((app) => {
  app.use(VueQueryPlugin);
  app.use(appI18n);
  app.use(VueFire, {
    firebaseApp,
    modules: [VueFireAuth({ auth: firebaseAuth })],
  });
  app.use(router);
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
