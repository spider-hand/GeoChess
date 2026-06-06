import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

import IconButton from "../../../../components/shared/IconButton.vue";

test("renders slot content with the accessibility label", async () => {
  const { getByRole } = render(IconButton, {
    props: {
      ariaLabel: "Language settings",
    },
    slots: {
      default:
        '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>',
    },
  });

  await expect
    .element(getByRole("button", { name: "Language settings" }))
    .toBeInTheDocument();
});

test("applies size branches", async () => {
  const { getByRole, rerender } = render(IconButton, {
    props: {
      ariaLabel: "Settings",
      size: "md",
    },
    slots: {
      default: '<svg aria-hidden="true" viewBox="0 0 24 24"></svg>',
    },
  });

  const button = getByRole("button", { name: "Settings" });

  await expect.element(button).toHaveClass("icon-button--md");

  await rerender({
    ariaLabel: "Settings",
    size: "compact",
  });
  await expect.element(button).toHaveClass("icon-button--compact");
});

test("emits click when enabled", async () => {
  const onClick = vi.fn();
  const { getByRole } = render(IconButton, {
    props: {
      ariaLabel: "Language settings",
      onClick,
    },
    slots: {
      default: '<svg aria-hidden="true" viewBox="0 0 24 24"></svg>',
    },
  });

  await getByRole("button", { name: "Language settings" }).click();

  expect(onClick).toHaveBeenCalledTimes(1);
});

test("applies the disabled branch", async () => {
  const { getByRole } = render(IconButton, {
    props: {
      ariaLabel: "Language settings",
      disabled: true,
    },
    slots: {
      default: '<svg aria-hidden="true" viewBox="0 0 24 24"></svg>',
    },
  });

  const button = getByRole("button", { name: "Language settings" });

  await expect.element(button).toBeDisabled();
  await expect.element(button).toHaveClass("icon-button--disabled");
});
