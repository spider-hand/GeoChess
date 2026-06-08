import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import TurnStatusStrip from "@/components/pages/Game/TurnStatusStrip.vue";
import { createAppI18n } from "@/i18n";

test("renders the your-turn status with the current turn", async () => {
  const { getByLabelText, getByText } = render(TurnStatusStrip, {
    props: {
      isYourTurn: true,
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

test("renders the opponent-turn branch and applies the opponent accent", async () => {
  const { container, getByLabelText, getByText } = render(TurnStatusStrip, {
    props: {
      isYourTurn: false,
      currentTurn: 11,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByLabelText("Opponent's Turn, Turn 11"))
    .toBeVisible();
  await expect.element(getByText("Opponent's Turn")).toBeVisible();
  await expect.element(getByText("Turn 11")).toBeVisible();
  await expect
    .element(container.querySelector(".turn-status-strip__status"))
    .toHaveClass("turn-status-strip__status--opponent");
});
