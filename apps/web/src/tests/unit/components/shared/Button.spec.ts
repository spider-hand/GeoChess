import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";

import Button from "@/components/shared/Button.vue";

const renderButton = (props: Record<string, unknown> = {}, label = "Action") =>
  render(Button, {
    props,
    slots: {
      default: label,
    },
  });

it("should render the default state properly", async () => {
  const { getByRole } = renderButton();

  await expect
    .element(getByRole("button", { name: "Action" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Action" }))
    .toHaveAttribute("type", "button");
  await expect
    .element(getByRole("button", { name: "Action" }))
    .toHaveClass("button--primary");
});

it.each(["primary", "secondary", "tertiary", "success", "danger"] as const)(
  "should apply the %s variant",
  async (variant) => {
    const { getByRole } = renderButton({ variant });

    await expect
      .element(getByRole("button", { name: "Action" }))
      .toHaveClass(`button--${variant}`);
  },
);

it("should apply the compact pill state", async () => {
  const { getByRole } = renderButton({ size: "compact", pill: true }, "Size");

  await expect
    .element(getByRole("button", { name: "Size" }))
    .toHaveClass("button--compact");
  await expect
    .element(getByRole("button", { name: "Size" }))
    .toHaveClass("button--pill");
});

it("should forward a submit type", async () => {
  const { getByRole } = renderButton({ type: "submit" }, "Submit");

  await expect
    .element(getByRole("button", { name: "Submit" }))
    .toHaveAttribute("type", "submit");
});

it("should emit click when enabled", async () => {
  const onClick = vi.fn();
  const { getByRole } = renderButton({ onClick }, "Enabled");

  await getByRole("button", { name: "Enabled" }).click();

  expect(onClick).toHaveBeenCalledTimes(1);
});

it("should apply the disabled state", async () => {
  const { getByRole } = renderButton({ disabled: true }, "Disabled");

  await expect
    .element(getByRole("button", { name: "Disabled" }))
    .toBeDisabled();
  await expect
    .element(getByRole("button", { name: "Disabled" }))
    .toHaveClass("button--disabled");
});

it("should apply the loading state", async () => {
  const onClick = vi.fn();
  const { getByRole } = renderButton(
    {
      loading: true,
      onClick,
    },
    "Loading",
  );

  await expect.element(getByRole("button", { name: "Loading" })).toBeDisabled();
  await expect
    .element(getByRole("button", { name: "Loading" }))
    .toHaveAttribute("aria-busy", "true");
  await expect
    .element(getByRole("button", { name: "Loading" }))
    .toHaveClass("button--loading");
  expect(onClick).not.toHaveBeenCalled();
});
