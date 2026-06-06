import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import App from "../../../App.vue";
import router from "../../../router";

test("renders the home page for the root route", async () => {
  await router.push("/");
  await router.isReady();

  const { getByText } = render(App, {
    global: {
      plugins: [router],
    },
  });

  await expect.element(getByText("Hello world")).toBeInTheDocument();
});
