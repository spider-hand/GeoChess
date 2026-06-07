import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import App from "@/App.vue";
import { createAppI18n } from "@/i18n";
import router from "@/router";

test("renders the game with friends page route", async () => {
  await router.push("/game/with-friends");
  await router.isReady();

  const { getByRole } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await expect
    .element(getByRole("heading", { name: "Available Moves" }))
    .toBeInTheDocument();
  await expect.element(getByRole("button", { name: "Select" })).toBeDisabled();
  await expect
    .element(getByRole("navigation", { name: "Footer navigation" }))
    .toBeInTheDocument();
});
