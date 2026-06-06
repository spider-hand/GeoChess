import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

import Button from "@/components/shared/Button.vue";

test("renders slot content", async () => {
  const { getByRole } = render(Button, {
    slots: {
      default: "Launch",
    },
  });

  await expect
    .element(getByRole("button", { name: "Launch" }))
    .toBeInTheDocument();
});

test("applies variant branches", async () => {
  const { getByRole, rerender } = render(Button, {
    props: { variant: "primary" },
    slots: { default: "Action" },
  });

  const button = getByRole("button", { name: "Action" });

  await expect.element(button).toHaveClass("button--primary");

  await rerender({ variant: "secondary" });
  await expect.element(button).toHaveClass("button--secondary");

  await rerender({ variant: "tertiary" });
  await expect.element(button).toHaveClass("button--tertiary");

  await rerender({ variant: "success" });
  await expect.element(button).toHaveClass("button--success");

  await rerender({ variant: "danger" });
  await expect.element(button).toHaveClass("button--danger");
});

test("applies size and pill branches", async () => {
  const { getByRole, rerender } = render(Button, {
    props: { size: "compact", pill: false },
    slots: { default: "Size" },
  });

  const button = getByRole("button", { name: "Size" });

  await expect.element(button).toHaveClass("button--compact");
  await expect.element(button).not.toHaveClass("button--pill");

  await rerender({ size: "compact", pill: true });
  await expect.element(button).toHaveClass("button--pill");
});

test("forwards the native type prop", async () => {
  const { getByRole } = render(Button, {
    props: { type: "submit" },
    slots: { default: "Submit" },
  });

  await expect
    .element(getByRole("button", { name: "Submit" }))
    .toHaveAttribute("type", "submit");
});

test("emits click when enabled", async () => {
  const onClick = vi.fn();
  const { getByRole } = render(Button, {
    props: {
      onClick,
    },
    slots: { default: "Enabled" },
  });

  const button = getByRole("button", { name: "Enabled" });

  await button.click();

  expect(onClick).toHaveBeenCalledTimes(1);
});

test("applies the disabled branch", async () => {
  const { getByRole } = render(Button, {
    props: {
      disabled: true,
    },
    slots: { default: "Disabled" },
  });

  const button = getByRole("button", { name: "Disabled" });

  await expect.element(button).toBeDisabled();
  await expect.element(button).toHaveClass("button--disabled");
});
