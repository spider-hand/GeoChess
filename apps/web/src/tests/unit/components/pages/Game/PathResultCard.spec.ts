import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import PathResultCard from "@/components/pages/Game/PathResultCard.vue";
import { createAppI18n } from "@/i18n";

test("renders the shared header, legend, and realtime result steps", async () => {
  const { getByRole, getByTestId, getByText } = render(PathResultCard, {
    props: {
      resultSteps: [
        { countryCode: "bb", owner: "neutral", turn: 1 },
        { countryCode: "cc", owner: "player", turn: 2 },
        { countryCode: "dd", owner: "ai", turn: 3 },
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
  await expect.element(getByText("Turn 1")).toBeVisible();
  await expect.element(getByText("Turn 3")).toBeVisible();
  await expect.element(getByText("BB")).toBeVisible();
  await expect.element(getByText("DD")).toBeVisible();
  expect(getByRole("listitem").length).toBe(3);
  expect(getByTestId("path-result-card-line").length).toBe(2);
  await expect.element(getByRole("list")).toBeInTheDocument();
});
