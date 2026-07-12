import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";

import SignUpPromptModal from "@/components/shared/SignUpPromptModal.vue";
import { createAppI18n } from "@/i18n";

it("should render the default state properly", async () => {
  const { getByRole, getByText } = render(SignUpPromptModal, {
    props: {
      isOpen: true,
      isSigningUp: false,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("dialog", { name: "Welcome to GeoChess" }))
    .toBeVisible();
  await expect.element(getByText("Welcome to GeoChess")).toBeVisible();
  await expect
    .element(getByText("Sign up to play with friends and join online matches."))
    .toBeVisible();
  await expect
    .element(getByRole("button", { name: "Sign Up", exact: true }))
    .toBeVisible();
});

it("should not render when closed", async () => {
  const { container } = render(SignUpPromptModal, {
    props: {
      isOpen: false,
      isSigningUp: false,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  expect(container.querySelector('[role="dialog"]')).toBeNull();
});

it("should emit close when the close button, overlay, or escape key is used", async () => {
  const onClose = vi.fn();
  const { getByRole, container } = render(SignUpPromptModal, {
    props: {
      isOpen: true,
      isSigningUp: false,
      onClose,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("button", { name: "Close sign up prompt" }).click();
  container
    .querySelector(".sign-up-prompt-modal")
    ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

  expect(onClose).toHaveBeenCalledTimes(3);
});

it("should emit signUp when the primary action is clicked", async () => {
  const onSignUp = vi.fn();
  const { getByRole } = render(SignUpPromptModal, {
    props: {
      isOpen: true,
      isSigningUp: false,
      onSignUp,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("button", { name: "Sign Up", exact: true }).click();

  expect(onSignUp).toHaveBeenCalledTimes(1);
});
