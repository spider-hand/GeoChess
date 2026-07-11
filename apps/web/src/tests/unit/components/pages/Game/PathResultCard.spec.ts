import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import PathResultCard from "@/components/pages/Game/PathResultCard.vue";
import { createAppI18n } from "@/i18n";

test("renders the shared header, legend, and realtime result steps", async () => {
  const { getByRole, getByTestId, getByText } = render(PathResultCard, {
    props: {
      resultSteps: [
        { countryCode: "bb", owner: "neutral", turn: 0 },
        { countryCode: "jp", owner: "player", turn: 1 },
        { countryCode: "fr", owner: "ai", turn: 2 },
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
  await expect.element(getByText("Barbados")).toBeVisible();
  await expect.element(getByText("JP")).toBeVisible();
  await expect.element(getByText("France")).toBeVisible();
  expect(getByRole("listitem").length).toBe(3);
  expect(getByTestId("path-result-card-line").length).toBe(2);
  await expect.element(getByRole("list")).toBeInTheDocument();
});

test("falls back to the uppercased country code when the localized name is missing", async () => {
  const { getByText } = render(PathResultCard, {
    props: {
      resultSteps: [{ countryCode: "zz", owner: "neutral", turn: 0 }],
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect.element(getByText("ZZ")).toBeVisible();
});
