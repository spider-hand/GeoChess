import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import ResultBadge from "@/components/pages/Game/ResultBadge.vue";
import { createAppI18n } from "@/i18n";

test("renders the winning branch with the success accent", async () => {
  const { container, getByText } = render(ResultBadge, {
    props: {
      result: "won",
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect.element(getByText("You Win")).toBeVisible();
  await expect
    .element(container.querySelector(".result-badge") as HTMLElement)
    .toHaveClass("result-badge--won");
});

test("renders the losing branch with the danger accent", async () => {
  const { container, getByText } = render(ResultBadge, {
    props: {
      result: "lost",
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect.element(getByText("You Lose")).toBeVisible();
  await expect
    .element(container.querySelector(".result-badge") as HTMLElement)
    .toHaveClass("result-badge--lost");
});
