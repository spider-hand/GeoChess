import { expect, it } from "vitest";
import { render } from "vitest-browser-vue";

import RandomMatchCard from "@/components/pages/Home/RandomMatchCard.vue";
import { createAppI18n } from "@/i18n";

it("should render the default state properly", async () => {
  const { getByRole, getByText } = render(RandomMatchCard, {
    props: {
      disabled: false,
      onlinePlayers: 40,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("heading", { name: "Random Match" }))
    .toBeInTheDocument();
  await expect.element(getByText("40 players online")).toBeVisible();
  await expect
    .element(getByRole("button", { name: "Coming Soon" }))
    .toBeDisabled();
});

it("should render singular and locale-formatted player counts", async () => {
  const { getByText, rerender } = render(RandomMatchCard, {
    props: {
      disabled: false,
      onlinePlayers: 1,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect.element(getByText("1 player online")).toBeVisible();

  await rerender({
    disabled: false,
    onlinePlayers: 1200,
  });

  await expect.element(getByText("1,200 players online")).toBeVisible();
});

it("should keep the join action disabled regardless of the card state", async () => {
  const { getByRole } = render(RandomMatchCard, {
    props: {
      disabled: false,
      onlinePlayers: 40,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("button", { name: "Coming Soon" }))
    .toBeDisabled();
});
