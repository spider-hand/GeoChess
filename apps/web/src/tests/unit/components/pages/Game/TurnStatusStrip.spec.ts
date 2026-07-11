import { expect, it } from "vitest";
import { render } from "vitest-browser-vue";

import TurnStatusStrip from "@/components/pages/Game/TurnStatusStrip.vue";
import { createAppI18n } from "@/i18n";

const renderTurnStatusStrip = (status: "player" | "ai", currentTurn: number) =>
  render(TurnStatusStrip, {
    props: {
      status,
      currentTurn,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

it("should render the player turn status and current turn", async () => {
  const { container, getByLabelText, getByText } = renderTurnStatusStrip(
    "player",
    10,
  );

  await expect.element(getByLabelText("Your Turn, Turn 10")).toBeVisible();
  await expect.element(getByText("Your Turn")).toBeVisible();
  await expect.element(getByText("Turn 10")).toBeVisible();
  await expect
    .element(
      container.querySelector(".turn-status-strip__status") as HTMLElement,
    )
    .toHaveClass("turn-status-strip__status--player");
});

it("should render the ai turn status and current turn", async () => {
  const { container, getByLabelText, getByText } = renderTurnStatusStrip(
    "ai",
    11,
  );

  await expect.element(getByLabelText("AI Turn, Turn 11")).toBeVisible();
  await expect.element(getByText("AI Turn")).toBeVisible();
  await expect.element(getByText("Turn 11")).toBeVisible();
  await expect
    .element(
      container.querySelector(".turn-status-strip__status") as HTMLElement,
    )
    .toHaveClass("turn-status-strip__status--ai");
});
