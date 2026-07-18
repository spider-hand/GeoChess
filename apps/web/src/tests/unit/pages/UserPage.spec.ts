import { beforeEach, expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { computed, ref } from "vue";

import { createAppI18n } from "@/i18n";

const mocks = vi.hoisted(() => ({
  country: "JP" as string | undefined,
  deleteUserAsync: vi.fn(),
  isDeleting: false,
  isUpdating: false,
  push: vi.fn(),
  signOutUser: vi.fn(),
  updateUserAsync: vi.fn(),
  username: "Taylor Swift",
}));

vi.mock("@/components/pages/User/CountrySelect.vue", () => ({
  default: {
    emits: ["select"],
    template:
      "<button type=\"button\" @click=\"$emit('select', 'US')\">Select United States</button>",
  },
}));

vi.mock("@/components/shared/NavigationHeader.vue", () => ({
  default: {
    template: '<header data-testid="navigation-header" />',
  },
}));

vi.mock("@/components/shared/NavigationFooter.vue", () => ({
  default: {
    template: '<footer data-testid="navigation-footer" />',
  },
}));

vi.mock("vue-router", () => ({ useRouter: () => ({ push: mocks.push }) }));

vi.mock("@/composables/useAuth", () => ({
  useAuth: () => ({
    signOutUser: mocks.signOutUser,
    userCountry: computed(() => mocks.country),
    username: computed(() => mocks.username),
  }),
}));

vi.mock("@/composables/useUserQuery", () => ({
  default: () => ({
    deleteUserAsync: mocks.deleteUserAsync,
    isDeletingUser: ref(mocks.isDeleting),
    isUpdatingUser: ref(mocks.isUpdating),
    updateUserAsync: mocks.updateUserAsync,
  }),
}));

const UserPage = (await import("@/pages/UserPage.vue")).default;

const renderUserPage = () =>
  render(UserPage, {
    global: {
      plugins: [createAppI18n()],
    },
  });

const openDeleteAccountModal = async () => {
  const page = renderUserPage();

  await page.getByRole("button", { name: "Delete Account" }).click();

  return page;
};

beforeEach(() => {
  mocks.country = "JP";
  mocks.isDeleting = false;
  mocks.isUpdating = false;
  mocks.username = "Taylor Swift";
  mocks.deleteUserAsync.mockReset();
  mocks.deleteUserAsync.mockResolvedValue(undefined);
  mocks.push.mockReset();
  mocks.signOutUser.mockReset();
  mocks.signOutUser.mockResolvedValue(undefined);
  mocks.updateUserAsync.mockReset();
  mocks.updateUserAsync.mockResolvedValue(undefined);
});

it("should render the default state properly", async () => {
  const { getByRole, getByText } = renderUserPage();

  await expect
    .element(getByRole("tab", { name: "Profile" }))
    .toHaveAttribute("aria-selected", "true");
  await expect
    .element(getByRole("tab", { name: "AI Games" }))
    .toHaveAttribute("aria-selected", "false");
  await expect
    .element(getByRole("tab", { name: "Friends Games" }))
    .toHaveAttribute("aria-selected", "false");
  await expect.element(getByText("Taylor Swift")).toBeVisible();
  await expect.element(getByRole("img", { name: "JP flag" })).toBeVisible();
  await expect
    .element(getByRole("button", { name: "Edit Profile" }))
    .toBeVisible();
  await expect
    .element(getByRole("button", { name: "Delete Account" }))
    .toBeVisible();
});

it("should not render a country flag when the user has no country", async () => {
  mocks.country = undefined;
  renderUserPage();

  expect(document.querySelector(".user-page__profile-flag")).toBeNull();
});

it.each([
  ["AI Games", "Profile"],
  ["Friends Games", "AI Games"],
])("should select %s when it is clicked", async (tabName, inactiveTabName) => {
  const { getByRole } = renderUserPage();

  await getByRole("tab", { name: tabName }).click();

  await expect
    .element(getByRole("tab", { name: tabName }))
    .toHaveAttribute("aria-selected", "true");
  await expect
    .element(getByRole("tab", { name: inactiveTabName }))
    .toHaveAttribute("aria-selected", "false");
});

it("should show profile editing controls when editing starts", async () => {
  const { getByRole } = renderUserPage();

  await getByRole("button", { name: "Edit Profile" }).click();

  await expect.element(getByRole("textbox")).toHaveValue("Taylor Swift");
  await expect
    .element(getByRole("button", { name: "Select United States" }))
    .toBeVisible();
  await expect.element(getByRole("button", { name: "Cancel" })).toBeVisible();
  await expect
    .element(getByRole("button", { name: "Save Changes" }))
    .toBeDisabled();
});

it("should discard profile changes when editing is cancelled", async () => {
  const { getByRole, getByText } = renderUserPage();

  await getByRole("button", { name: "Edit Profile" }).click();
  await getByRole("textbox").fill("Updated name");
  await getByRole("button", { name: "Cancel" }).click();

  expect(mocks.updateUserAsync).not.toHaveBeenCalled();
  await expect.element(getByText("Taylor Swift")).toBeVisible();
  await expect
    .element(getByRole("button", { name: "Edit Profile" }))
    .toBeVisible();
});

it.each([
  ["the name is unchanged", undefined],
  ["the name is empty", ""],
])("should disable saving when %s", async (_scenario, displayName) => {
  const { getByRole } = renderUserPage();

  await getByRole("button", { name: "Edit Profile" }).click();

  if (displayName !== undefined) {
    await getByRole("textbox").fill(displayName);
  }

  await expect
    .element(getByRole("button", { name: "Save Changes" }))
    .toBeDisabled();
});

it("should save the changed name and selected country", async () => {
  const { getByRole } = renderUserPage();

  await getByRole("button", { name: "Edit Profile" }).click();
  await getByRole("textbox").fill("  Updated name  ");
  await getByRole("button", { name: "Select United States" }).click();
  await getByRole("button", { name: "Save Changes" }).click();

  expect(mocks.updateUserAsync).toHaveBeenCalledWith({
    country: "US",
    displayName: "Updated name",
  });
  await expect
    .element(getByRole("button", { name: "Edit Profile" }))
    .toBeVisible();
});

it("should show an error and remain in edit mode when saving fails", async () => {
  mocks.updateUserAsync.mockRejectedValueOnce(new Error("Update failed"));
  const { getByRole, getByText } = renderUserPage();

  await getByRole("button", { name: "Edit Profile" }).click();
  await getByRole("textbox").fill("Updated name");
  await getByRole("button", { name: "Save Changes" }).click();

  await expect
    .element(getByText("Unable to save your profile. Please try again."))
    .toBeVisible();
  await expect.element(getByRole("textbox")).toBeVisible();
});

it("should open the delete account dialog", async () => {
  const { getByRole } = await openDeleteAccountModal();

  await expect
    .element(getByRole("dialog", { name: "Delete Account" }))
    .toBeVisible();
});

it("should delete the account, sign out, and return home", async () => {
  const { getByRole } = await openDeleteAccountModal();

  await getByRole("textbox").fill("Delete");
  await getByRole("button", { name: "Delete", exact: true }).click();

  expect(mocks.deleteUserAsync).toHaveBeenCalledTimes(1);
  expect(mocks.signOutUser).toHaveBeenCalledTimes(1);
  expect(mocks.push).toHaveBeenCalledWith("/");
});

it("should show an error when deleting the account fails", async () => {
  mocks.deleteUserAsync.mockRejectedValueOnce(new Error("Delete failed"));
  const { getByRole, getByText } = await openDeleteAccountModal();

  await getByRole("textbox").fill("Delete");
  await getByRole("button", { name: "Delete", exact: true }).click();

  await expect
    .element(getByText("Unable to delete your account. Please try again."))
    .toBeVisible();
  await expect
    .element(getByRole("dialog", { name: "Delete Account" }))
    .toBeVisible();
});

it("should prevent closing the delete account dialog while deletion is pending", async () => {
  mocks.isDeleting = true;
  const { getByRole } = await openDeleteAccountModal();

  await expect
    .element(getByRole("button", { name: "Close delete account dialog" }))
    .toBeDisabled();
  await expect.element(getByRole("button", { name: "Cancel" })).toBeDisabled();
});
