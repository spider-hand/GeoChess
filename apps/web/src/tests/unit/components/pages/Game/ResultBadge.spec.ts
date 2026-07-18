import { expect, it } from "vitest";
import { render } from "vitest-browser-vue";

import ResultBadge from "@/components/pages/Game/ResultBadge.vue";
import { createAppI18n } from "@/i18n";

const renderResultBadge = (result: "won" | "lost") =>
  render(ResultBadge, {
    props: { result },
    global: { plugins: [createAppI18n()] },
  });

it.each([
  ["won", "You Win", "result-badge--won"],
  ["lost", "You Lose", "result-badge--lost"],
])("should render the %s result visibly", async (result, label, className) => {
  const { container, getByText } = renderResultBadge(result as "won" | "lost");

  await expect.element(getByText(label)).toBeVisible();
  await expect
    .element(container.querySelector(".result-badge") as HTMLElement)
    .toHaveClass(className);
});
