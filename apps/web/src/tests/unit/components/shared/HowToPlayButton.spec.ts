import { expect, it } from "vitest";
import { render } from "vitest-browser-vue";

import HowToPlayButton from "@/components/shared/HowToPlayButton.vue";
import { createAppI18n } from "@/i18n";

const nextTick = async () => {
  await new Promise((resolve) => window.setTimeout(resolve, 0));
};

const renderHowToPlayButton = () =>
  render(HowToPlayButton, {
    global: {
      plugins: [createAppI18n()],
    },
  });

it("should render the default state properly", async () => {
  const { container, getByRole } = renderHowToPlayButton();

  await expect
    .element(getByRole("button", { name: "How to play" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "How to play" }))
    .toHaveAttribute("aria-expanded", "false");
  expect(container.querySelector('[role="dialog"]')).toBeNull();
});

it("should open the dialog and render the instructional lines", async () => {
  const { getByRole, getByText } = renderHowToPlayButton();

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

it("should close the dialog when the trigger is clicked again", async () => {
  const { container, getByRole } = renderHowToPlayButton();
  const trigger = getByRole("button", { name: "How to play" });

  await trigger.click();
  await trigger.click();

  expect(container.querySelector('[role="dialog"]')).toBeNull();
});

it("should close the dialog on outside click", async () => {
  const { container, getByRole } = renderHowToPlayButton();

  await getByRole("button", { name: "How to play" }).click();
  document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await nextTick();

  expect(container.querySelector('[role="dialog"]')).toBeNull();
});

it("should close the dialog on escape", async () => {
  const { container, getByRole } = renderHowToPlayButton();

  await getByRole("button", { name: "How to play" }).click();
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  await nextTick();

  expect(container.querySelector('[role="dialog"]')).toBeNull();
});
