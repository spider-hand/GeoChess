import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import PathResultCard from "@/components/pages/Game/PathResultCard.vue";
import { createAppI18n } from "@/i18n";

test("renders the shared path-history header, legend, and six vertical result steps", async () => {
  const { getByRole, getByTestId, getByText } = render(PathResultCard, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("heading", { name: "Path History" }))
    .toBeInTheDocument();
  await expect.element(getByText("You")).toBeVisible();
  await expect.element(getByText("Opponent")).toBeVisible();
  await expect.element(getByText("Turn 1")).toBeVisible();
  await expect.element(getByText("Turn 6")).toBeVisible();
  await expect.element(getByText("United States")).toBeVisible();
  await expect.element(getByText("Canada")).toBeVisible();
  expect(getByRole("listitem").length).toBe(6);
  expect(getByTestId("path-result-card-line").length).toBe(5);
  await expect.element(getByRole("list")).toBeInTheDocument();
});

test("applies owner styling to both the timeline markers and step containers", async () => {
  const { getByTestId } = render(PathResultCard, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByTestId("path-result-card-marker-you").first())
    .toHaveClass("path-result-card__marker--you");
  await expect
    .element(getByTestId("path-result-card-marker-opponent").first())
    .toHaveClass("path-result-card__marker--opponent");
  await expect
    .element(getByTestId("path-result-card-step-you").first())
    .toHaveClass("path-result-card__step--you");
  await expect
    .element(getByTestId("path-result-card-step-opponent").first())
    .toHaveClass("path-result-card__step--opponent");
});
