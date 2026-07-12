import { expect, it } from "vitest";
import { render } from "vitest-browser-vue";

import PlayerMatchupCard from "@/components/pages/Game/PlayerMatchupCard.vue";
import { createAppI18n } from "@/i18n";

const renderPlayerMatchupCard = (props: Record<string, unknown> = {}) =>
  render(PlayerMatchupCard, {
    props: {
      playerName: "Taylor Swift",
      ...props,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

it("should render the default state properly", async () => {
  const { container, getByTestId, getByText } = renderPlayerMatchupCard();

  await expect.element(getByText("Taylor Swift")).toBeVisible();
  await expect.element(getByText("AI")).toBeVisible();
  await expect.element(getByText("vs")).toBeVisible();
  expect(getByTestId("player-matchup-card-player")).toHaveLength(2);
  expect(getByTestId("player-matchup-card-avatar")).toHaveLength(2);
  expect(
    container.querySelector(".player-matchup-card__avatar--ai"),
  ).not.toBeNull();
});

it("should show the player country flag when a country is provided", async () => {
  const { container } = renderPlayerMatchupCard({
    playerCountry: "JP",
  });

  await expect
    .element(container.querySelector(".player-matchup-card__flag")!)
    .toHaveAttribute("src", "/flags/jp.webp");
});
