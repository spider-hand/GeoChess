import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";

import PlayVsAiCard from "@/components/pages/Home/PlayVsAiCard.vue";
import { createAppI18n } from "@/i18n";

it("should render the default state properly", async () => {
  const { getByRole } = render(PlayVsAiCard, {
    props: {
      isStartingGame: false,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("heading", { name: "Play vs AI" }))
    .toBeInTheDocument();
  await expect.element(getByRole("button", { name: "Easy" })).toBeVisible();
  await expect.element(getByRole("button", { name: "Medium" })).toBeVisible();
  await expect.element(getByRole("button", { name: "Hard" })).toBeVisible();
  await expect
    .element(getByRole("button", { name: "Start Game" }))
    .toBeVisible();
});

it("should update the selected difficulty when a difficulty button is clicked", async () => {
  const { getByRole } = render(PlayVsAiCard, {
    props: {
      isStartingGame: false,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  const easyButton = getByRole("button", { name: "Easy" });
  const mediumButton = getByRole("button", { name: "Medium" });
  const hardButton = getByRole("button", { name: "Hard" });

  await expect
    .element(mediumButton)
    .toHaveClass("play-vs-ai-card__difficulty-button--selected");
  expect(
    easyButton
      .element()
      .classList.contains("play-vs-ai-card__difficulty-button--selected"),
  ).toBe(false);
  expect(
    hardButton
      .element()
      .classList.contains("play-vs-ai-card__difficulty-button--selected"),
  ).toBe(false);

  await hardButton.click();

  await expect
    .element(hardButton)
    .toHaveClass("play-vs-ai-card__difficulty-button--selected");
  expect(
    mediumButton
      .element()
      .classList.contains("play-vs-ai-card__difficulty-button--selected"),
  ).toBe(false);
});

it.each([
  { difficultyLabel: "Easy", emittedDifficulty: "easy" as const },
  { difficultyLabel: "Hard", emittedDifficulty: "hard" as const },
])(
  "should emit $emittedDifficulty when starting an ai match",
  async ({ difficultyLabel, emittedDifficulty }) => {
    const onStartAiMatch = vi.fn();
    const { getByRole } = render(PlayVsAiCard, {
      props: {
        isStartingGame: false,
        onStartAiMatch,
      },
      global: {
        plugins: [createAppI18n()],
      },
    });

    await getByRole("button", { name: difficultyLabel }).click();
    await getByRole("button", { name: "Start Game" }).click();

    expect(onStartAiMatch).toHaveBeenCalledWith(emittedDifficulty);
    expect(onStartAiMatch).toHaveBeenCalledTimes(1);
  },
);

it("should disable all actions while starting a game", async () => {
  const { getByRole } = render(PlayVsAiCard, {
    props: {
      isStartingGame: true,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("button", { name: "Start Game" }))
    .toBeDisabled();
  await expect
    .element(getByRole("button", { name: "Start Game" }))
    .toHaveAttribute("aria-busy", "true");
  await expect.element(getByRole("button", { name: "Easy" })).toBeDisabled();
  await expect.element(getByRole("button", { name: "Medium" })).toBeDisabled();
  await expect.element(getByRole("button", { name: "Hard" })).toBeDisabled();
});
