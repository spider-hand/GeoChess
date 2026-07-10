import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import PathHistoryCard from "@/components/pages/Game/PathHistoryCard.vue";
import { createAppI18n } from "@/i18n";

test("renders the title, legend badges, and full history including the neutral start", async () => {
  const { getByRole, getByText, getByTestId } = render(PathHistoryCard, {
    props: {
      historySteps: [
        { countryCode: "bb", owner: "neutral", turn: 0 },
        { countryCode: "cc", owner: "player", turn: 1 },
        { countryCode: "dd", owner: "ai", turn: 2 },
      ],
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("heading", { name: "Path History" }))
    .toBeInTheDocument();
  await expect.element(getByText("You")).toBeVisible();
  await expect.element(getByText("AI")).toBeVisible();
  await expect.element(getByText("Start")).toBeVisible();
  await expect.element(getByText("Turn 1")).toBeVisible();
  await expect.element(getByText("Turn 2")).toBeVisible();
  await expect.element(getByText("BB")).toBeVisible();
  await expect.element(getByText("CC")).toBeVisible();
  await expect.element(getByText("DD")).toBeVisible();
  expect(getByRole("listitem").length).toBe(3);
  expect(getByTestId("path-history-card-connector").length).toBe(2);
});
