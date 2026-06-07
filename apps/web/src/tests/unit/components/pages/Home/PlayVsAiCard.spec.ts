import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

import PlayVsAiCard from "@/components/pages/Home/PlayVsAiCard.vue";
import { createAppI18n } from "@/i18n";

test("renders the card title and actions", async () => {
  const { getByRole } = render(PlayVsAiCard, {
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

test("defaults to medium and updates the selected branch on click", async () => {
  const { getByRole } = render(PlayVsAiCard, {
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
  await expect
    .element(easyButton)
    .not.toHaveClass("play-vs-ai-card__difficulty-button--selected");
  await expect
    .element(hardButton)
    .not.toHaveClass("play-vs-ai-card__difficulty-button--selected");

  await hardButton.click();

  await expect
    .element(hardButton)
    .toHaveClass("play-vs-ai-card__difficulty-button--selected");
  await expect
    .element(mediumButton)
    .not.toHaveClass("play-vs-ai-card__difficulty-button--selected");
});

test("emits the selected difficulty when starting an ai match", async () => {
  const onStartAiMatch = vi.fn();
  const { getByRole } = render(PlayVsAiCard, {
    props: {
      onStartAiMatch,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("button", { name: "Easy" }).click();
  await getByRole("button", { name: "Start Game" }).click();
  await getByRole("button", { name: "Hard" }).click();
  await getByRole("button", { name: "Start Game" }).click();

  expect(onStartAiMatch).toHaveBeenNthCalledWith(1, "easy");
  expect(onStartAiMatch).toHaveBeenNthCalledWith(2, "hard");
});
