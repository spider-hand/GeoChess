import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

import { createAppI18n } from "@/i18n";
import UserAvatarMenu from "@/components/shared/UserAvatarMenu.vue";

const nextTick = async () => {
  await new Promise((resolve) => window.setTimeout(resolve, 0));
};

test("is closed by default", async () => {
  const { getByRole, container } = render(UserAvatarMenu, {
    props: {
      displayName: "Taylor Swift",
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("button", { name: "Account menu" }))
    .toBeInTheDocument();
  expect(container.querySelector('[role="menu"]')).toBeNull();
});

test("opens the menu and emits sign out", async () => {
  const onSignOutClick = vi.fn();
  const { getByRole, getByText, container } = render(UserAvatarMenu, {
    props: {
      displayName: "Taylor Swift",
      onSignOutClick,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("button", { name: "Account menu" }).click();

  await expect.element(getByRole("menu")).toBeInTheDocument();
  await expect.element(getByText("Taylor Swift")).toBeInTheDocument();

  await getByRole("menuitem", { name: "Sign Out" }).click();

  expect(onSignOutClick).toHaveBeenCalledTimes(1);
  expect(container.querySelector('[role="menu"]')).toBeNull();
});

test("closes on outside click and escape", async () => {
  const { getByRole, container } = render(UserAvatarMenu, {
    props: {
      displayName: "Taylor Swift",
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("button", { name: "Account menu" }).click();
  await expect.element(getByRole("menu")).toBeInTheDocument();

  document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await nextTick();
  expect(container.querySelector('[role="menu"]')).toBeNull();

  await getByRole("button", { name: "Account menu" }).click();
  await expect.element(getByRole("menu")).toBeInTheDocument();

  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  await nextTick();
  expect(container.querySelector('[role="menu"]')).toBeNull();
});
