import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import PlayerMatchupCard from "@/components/pages/Game/PlayerMatchupCard.vue";
import { createAppI18n } from "@/i18n";

test("renders two player cards with a versus label and rounded flags", async () => {
  const { getByAltText, getByLabelText, getByTestId, getByText } = render(
    PlayerMatchupCard,
    {
      global: {
        plugins: [createAppI18n()],
      },
    },
  );

  await expect.element(getByText("Aki")).toBeVisible();
  await expect.element(getByText("Sam")).toBeVisible();
  await expect.element(getByText("vs")).toBeVisible();
  expect(getByTestId("player-matchup-card-player").length).toBe(2);
  expect(getByTestId("player-matchup-card-avatar").length).toBe(2);
  await expect.element(getByLabelText("versus")).toBeInTheDocument();
  await expect.element(getByAltText("JP flag")).toBeInTheDocument();
  await expect.element(getByAltText("US flag")).toBeInTheDocument();
});
