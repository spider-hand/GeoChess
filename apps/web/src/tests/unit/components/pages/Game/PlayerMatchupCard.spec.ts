import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import PlayerMatchupCard from "@/components/pages/Game/PlayerMatchupCard.vue";
import { createAppI18n } from "@/i18n";

test("renders the player card, AI card, and versus label", async () => {
  const { getByLabelText, getByTestId, getByText } = render(PlayerMatchupCard, {
    props: {
      playerName: "Taylor Swift",
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect.element(getByText("Taylor Swift")).toBeVisible();
  await expect.element(getByText("AI")).toBeVisible();
  await expect.element(getByText("vs")).toBeVisible();
  expect(getByTestId("player-matchup-card-player").length).toBe(2);
  expect(getByTestId("player-matchup-card-avatar").length).toBe(2);
  await expect.element(getByLabelText("versus")).toBeInTheDocument();
});
