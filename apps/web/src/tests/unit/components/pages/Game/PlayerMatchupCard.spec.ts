import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import PlayerMatchupCard from "@/components/pages/Game/PlayerMatchupCard.vue";
import { createAppI18n } from "@/i18n";

test("renders two player cards with a versus label and rounded flags", async () => {
  const { container, getByLabelText, getByText } = render(PlayerMatchupCard, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect.element(getByText("Aki")).toBeVisible();
  await expect.element(getByText("Sam")).toBeVisible();
  await expect.element(getByText("vs")).toBeVisible();
  expect(
    container.querySelectorAll(".player-matchup-card__player"),
  ).toHaveLength(2);
  expect(
    container.querySelector(".player-matchup-card__avatar"),
  ).not.toBeNull();
  await expect.element(getByLabelText("versus")).toBeInTheDocument();
  expect(container.querySelector('img[src="/flags/jp.webp"]')).not.toBeNull();
  expect(container.querySelector('img[src="/flags/us.webp"]')).not.toBeNull();
});
