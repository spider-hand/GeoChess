import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import App from "@/App.vue";
import { createAppI18n } from "@/i18n";
import router from "@/router";

test("renders the home page for the root route", async () => {
  await router.push("/");
  await router.isReady();

  const { getByRole, getByText } = render(App, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await expect
    .element(getByRole("button", { name: "GeoChess" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "How to play" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Language settings" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Sign Up" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("heading", { name: "Play vs AI" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Medium" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Start Game" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("heading", { name: "Play with Friends" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Create Room" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Enter Room" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("heading", { name: "Random Match" }))
    .toBeInTheDocument();
  await expect.element(getByText("40 players online")).toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Join Lobby" }))
    .toBeInTheDocument();
});
