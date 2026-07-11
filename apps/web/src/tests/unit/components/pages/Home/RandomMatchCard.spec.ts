import { expect, it, vi } from "vitest";
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
    .element(getByRole("button", { name: "Join Lobby" }))
    .toBeVisible();
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

it("should emit joinRandomMatch when joining the lobby", async () => {
  const onJoinRandomMatch = vi.fn();
  const { getByRole } = render(RandomMatchCard, {
    props: {
      disabled: false,
      onlinePlayers: 40,
      onJoinRandomMatch,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("button", { name: "Join Lobby" }).click();

  expect(onJoinRandomMatch).toHaveBeenCalledTimes(1);
});

it("should disable join action when disabled", async () => {
  const { getByRole } = render(RandomMatchCard, {
    props: {
      disabled: true,
      onlinePlayers: 40,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("button", { name: "Join Lobby" }))
    .toBeDisabled();
});
