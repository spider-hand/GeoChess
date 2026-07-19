import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { ref } from "vue";

import { createAppI18n } from "@/i18n";

const isRegisteredUser = ref(true);

vi.mock("@/composables/useAuth", () => ({
  useAuth: () => ({ isRegisteredUser }),
}));

const UserAvatarMenu = (await import("@/components/shared/UserAvatarMenu.vue"))
  .default;

const nextTick = async () => {
  await new Promise((resolve) => window.setTimeout(resolve, 0));
};

const renderUserAvatarMenu = (props: Record<string, unknown> = {}) =>
  render(UserAvatarMenu, {
    props: {
      displayName: "Taylor Swift",
      ...props,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

it("should render the default state properly", async () => {
  const { container, getByRole } = renderUserAvatarMenu();

  await expect
    .element(getByRole("button", { name: "Account menu" }))
    .toBeInTheDocument();
  expect(container.querySelector('[role="menu"]')).toBeNull();
});

it("should open the menu and emit sign out", async () => {
  const onSignOutClick = vi.fn();
  const { container, getByRole, getByText } = renderUserAvatarMenu({
    onSignOutClick,
  });

  await getByRole("button", { name: "Account menu" }).click();

  await expect.element(getByRole("menu")).toBeInTheDocument();
  await expect.element(getByText("Taylor Swift")).toBeInTheDocument();

  await getByRole("menuitem", { name: "Sign Out" }).click();

  expect(onSignOutClick).toHaveBeenCalledTimes(1);
  expect(container.querySelector('[role="menu"]')).toBeNull();
});

it("should not render the profile item for an anonymous user", async () => {
  isRegisteredUser.value = false;
  const { getByRole } = renderUserAvatarMenu();

  await getByRole("button", { name: "Account menu" }).click();

  await expect
    .element(getByRole("menuitem", { name: "Sign Out" }))
    .toBeInTheDocument();
  expect(getByRole("menuitem", { name: "Profile" }).query()).toBeNull();
  isRegisteredUser.value = true;
});

it("should close the menu on outside click", async () => {
  const { container, getByRole } = renderUserAvatarMenu();

  await getByRole("button", { name: "Account menu" }).click();
  document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await nextTick();

  expect(container.querySelector('[role="menu"]')).toBeNull();
});

it("should close the menu on escape", async () => {
  const { container, getByRole } = renderUserAvatarMenu();

  await getByRole("button", { name: "Account menu" }).click();
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  await nextTick();

  expect(container.querySelector('[role="menu"]')).toBeNull();
});

it("should show the country flag when a country is provided", async () => {
  const { getByRole, container } = renderUserAvatarMenu({
    country: "JP",
  });

  await getByRole("button", { name: "Account menu" }).click();

  await expect
    .element(
      container.querySelector<HTMLImageElement>(".user-avatar-menu__flag")!,
    )
    .toHaveAttribute("src", "/flags/jp.webp");
});
