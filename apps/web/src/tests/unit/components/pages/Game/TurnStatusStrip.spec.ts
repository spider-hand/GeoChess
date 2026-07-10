import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import TurnStatusStrip from "@/components/pages/Game/TurnStatusStrip.vue";
import { createAppI18n } from "@/i18n";

test("renders the player-turn status with the current turn", async () => {
  const { getByLabelText, getByText } = render(TurnStatusStrip, {
    props: {
      status: "player",
      currentTurn: 10,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect.element(getByLabelText("Your Turn, Turn 10")).toBeVisible();
  await expect.element(getByText("Your Turn")).toBeVisible();
  await expect.element(getByText("Turn 10")).toBeVisible();
});

test("renders the AI-turn branch and applies the AI accent", async () => {
  const { container, getByLabelText, getByText } = render(TurnStatusStrip, {
    props: {
      status: "ai",
      currentTurn: 11,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect.element(getByLabelText("AI Turn, Turn 11")).toBeVisible();
  await expect.element(getByText("AI Turn")).toBeVisible();
  await expect.element(getByText("Turn 11")).toBeVisible();
  await expect
    .element(
      container.querySelector(".turn-status-strip__status") as HTMLElement,
    )
    .toHaveClass("turn-status-strip__status--ai");
});
