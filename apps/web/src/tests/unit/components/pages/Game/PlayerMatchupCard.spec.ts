import { expect, it } from "vitest";
import { render } from "vitest-browser-vue";

import PlayerMatchupCard from "@/components/pages/Game/PlayerMatchupCard.vue";
import { createAppI18n } from "@/i18n";

const renderPlayerMatchupCard = (props: Record<string, unknown> = {}) =>
  render(PlayerMatchupCard, {
    props: {
      playerOne: {
        name: "Taylor Swift",
      },
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

it("should show the ai difficulty when one is provided", async () => {
  const { getByText } = renderPlayerMatchupCard({
    difficulty: "medium",
  });

  await expect.element(getByText("AI")).toBeVisible();
  await expect.element(getByText("Medium")).toBeVisible();
});

it("should render both human players when playerTwo is passed", async () => {
  const { container, getByText } = renderPlayerMatchupCard({
    playerOne: {
      name: "Taylor Swift",
      country: "JP",
    },
    playerTwo: {
      name: "Opponent",
      country: "KR",
    },
  });

  await expect.element(getByText("Opponent")).toBeVisible();
  expect(container.querySelectorAll(".player-matchup-card__flag")).toHaveLength(
    2,
  );
});

it("should not render the ai bot ui when playerTwo is passed", async () => {
  const { container } = renderPlayerMatchupCard({
    playerTwo: {
      name: "Opponent",
    },
  });

  expect(
    container.querySelector(".player-matchup-card__avatar--ai"),
  ).toBeNull();
  expect(container.textContent).not.toContain("AI");
});

it("should show the player country flag when one is provided", async () => {
  const { container } = renderPlayerMatchupCard({
    playerOne: {
      name: "Taylor Swift",
      country: "JP",
    },
  });

  await expect
    .element(container.querySelector(".player-matchup-card__flag")!)
    .toHaveAttribute("src", "/flags/jp.webp");
});
