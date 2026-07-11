import { expect, it } from "vitest";
import { render } from "vitest-browser-vue";

import ResultBadge from "@/components/pages/Game/ResultBadge.vue";
import { createAppI18n } from "@/i18n";

const renderResultBadge = (result: "won" | "lost") =>
  render(ResultBadge, {
    props: {
      result,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

it("should render the winning result visibly", async () => {
  const { container, getByText } = renderResultBadge("won");

  await expect.element(getByText("You Win")).toBeVisible();
  await expect
    .element(container.querySelector(".result-badge") as HTMLElement)
    .toHaveClass("result-badge--won");
});

it("should render the losing result visibly", async () => {
  const { container, getByText } = renderResultBadge("lost");

  await expect.element(getByText("You Lose")).toBeVisible();
  await expect
    .element(container.querySelector(".result-badge") as HTMLElement)
    .toHaveClass("result-badge--lost");
});
