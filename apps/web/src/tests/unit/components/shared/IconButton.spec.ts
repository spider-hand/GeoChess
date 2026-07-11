import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";

import IconButton from "@/components/shared/IconButton.vue";

const renderIconButton = (props: Record<string, unknown> = {}) =>
  render(IconButton, {
    props: {
      ariaLabel: "Language",
      ...props,
    },
    slots: {
      default:
        '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>',
    },
  });

it("should render the default state properly", async () => {
  const { getByRole } = renderIconButton();

  await expect
    .element(getByRole("button", { name: "Language" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Language" }))
    .toHaveClass("icon-button--md");
});

it("should apply the compact size", async () => {
  const { getByRole } = renderIconButton({ size: "compact" });

  await expect
    .element(getByRole("button", { name: "Language" }))
    .toHaveClass("icon-button--compact");
});

it("should emit click when enabled", async () => {
  const onClick = vi.fn();
  const { getByRole } = renderIconButton({ onClick });

  await getByRole("button", { name: "Language" }).click();

  expect(onClick).toHaveBeenCalledTimes(1);
});

it("should apply the disabled state", async () => {
  const { getByRole } = renderIconButton({ disabled: true });

  await expect
    .element(getByRole("button", { name: "Language" }))
    .toBeDisabled();
  await expect
    .element(getByRole("button", { name: "Language" }))
    .toHaveClass("icon-button--disabled");
});
