import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import App from "@/App.vue";
import { createAppI18n } from "@/i18n";
import router from "@/router";

test("renders the game vs ai page route", async () => {
  await router.push("/game/vs-ai");
  await router.isReady();

  const { container, getByRole, getByText } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await expect
    .element(getByRole("heading", { name: "Available Moves" }))
    .toBeInTheDocument();
  expect(
    Array.from(container.querySelectorAll("h2")).filter(
      (heading) => heading.textContent === "Path History",
    ),
  ).toHaveLength(2);
  await expect.element(getByText("vs")).toBeInTheDocument();
  await expect.element(getByRole("button", { name: "Select" })).toBeDisabled();
  await expect
    .element(getByRole("navigation", { name: "Footer navigation" }))
    .toBeInTheDocument();
});
