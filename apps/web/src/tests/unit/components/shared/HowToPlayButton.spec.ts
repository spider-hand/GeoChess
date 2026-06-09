import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import HowToPlayButton from "../../../../components/shared/HowToPlayButton.vue";
import { createAppI18n } from "../../../../i18n";

async function nextTick() {
  await new Promise((resolve) => window.setTimeout(resolve, 0));
}

test("is closed by default", async () => {
  const { getByRole, container } = render(HowToPlayButton, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("button", { name: "How to play" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "How to play" }))
    .toHaveAttribute("aria-expanded", "false");
  expect(container.querySelector('[role="dialog"]')).toBeNull();
});

test("opens the dialog and renders the instructional lines", async () => {
  const { getByRole, getByText } = render(HowToPlayButton, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("button", { name: "How to play" }).click();

  await expect
    .element(getByRole("dialog", { name: "How to play" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "How to play" }))
    .toHaveAttribute("aria-expanded", "true");
  await expect
    .element(getByText("Claim a neighboring country each turn."))
    .toBeInTheDocument();
  await expect
    .element(getByText("No legal moves? You lose."))
    .toBeInTheDocument();
  await expect.element(getByText("That's it. Enjoy!")).toBeInTheDocument();
});

test("closes on toggle, outside click, and escape", async () => {
  const { getByRole, container } = render(HowToPlayButton, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  const trigger = getByRole("button", { name: "How to play" });

  await trigger.click();
  await expect
    .element(getByRole("dialog", { name: "How to play" }))
    .toBeInTheDocument();

  await trigger.click();
  expect(container.querySelector('[role="dialog"]')).toBeNull();

  await trigger.click();
  await expect
    .element(getByRole("dialog", { name: "How to play" }))
    .toBeInTheDocument();

  document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await nextTick();
  expect(container.querySelector('[role="dialog"]')).toBeNull();

  await trigger.click();
  await expect
    .element(getByRole("dialog", { name: "How to play" }))
    .toBeInTheDocument();

  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  await nextTick();
  expect(container.querySelector('[role="dialog"]')).toBeNull();
});
