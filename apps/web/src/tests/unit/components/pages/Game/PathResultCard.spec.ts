import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import PathResultCard from "@/components/pages/Game/PathResultCard.vue";
import { createAppI18n } from "@/i18n";

test("renders the shared path-history header, legend, and six vertical result steps", async () => {
  const { container, getByRole, getByText } = render(PathResultCard, {
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
  expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(6);
  expect(container.querySelectorAll(".path-result-card__line")).toHaveLength(5);
  expect(container.querySelector(".path-result-card__body")).not.toBeNull();
});

test("applies owner styling to both the timeline markers and step containers", async () => {
  const { container } = render(PathResultCard, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(container.querySelector(".path-result-card__marker--you"))
    .toHaveClass("path-result-card__marker--you");
  await expect
    .element(container.querySelector(".path-result-card__marker--opponent"))
    .toHaveClass("path-result-card__marker--opponent");
  await expect
    .element(container.querySelector(".path-result-card__step--you"))
    .toHaveClass("path-result-card__step--you");
  await expect
    .element(container.querySelector(".path-result-card__step--opponent"))
    .toHaveClass("path-result-card__step--opponent");
});
