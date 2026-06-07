import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

import RandomMatchCard from "@/components/pages/Home/RandomMatchCard.vue";
import { createAppI18n } from "@/i18n";

test("renders the title, badge, and join action", async () => {
  const { getByRole, getByText } = render(RandomMatchCard, {
    props: {
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

test("renders singular and locale-formatted player counts", async () => {
  const { getByText, rerender } = render(RandomMatchCard, {
    props: {
      onlinePlayers: 1,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect.element(getByText("1 player online")).toBeVisible();

  await rerender({
    onlinePlayers: 1200,
  });

  await expect.element(getByText("1,200 players online")).toBeVisible();
});

test("emits joinRandomMatch when joining the lobby", async () => {
  const onJoinRandomMatch = vi.fn();
  const { getByRole } = render(RandomMatchCard, {
    props: {
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
