import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { ref } from "vue";

import { createAppI18n } from "@/i18n";

const username = ref<string | null>(null);
const userCountry = ref<string | undefined>(undefined);
const isAuthenticatedUser = ref(false);
const isCurrentUserLoaded = ref(true);
const signInWithGoogle = vi.fn();
const signOutUser = vi.fn();
const push = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/composables/useAuth", () => ({
  useAuth: () => ({
    username,
    userCountry,
    isAuthenticatedUser,
    isCurrentUserLoaded,
    signInWithGoogle,
    signOutUser,
  }),
}));

const NavigationHeader = (
  await import("@/components/shared/NavigationHeader.vue")
).default;

const resetAuthState = () => {
  username.value = null;
  userCountry.value = undefined;
  isAuthenticatedUser.value = false;
  isCurrentUserLoaded.value = true;
  push.mockReset();
  signInWithGoogle.mockReset();
  signOutUser.mockReset();
};

const renderNavigationHeader = (props: Record<string, unknown> = {}) =>
  render(NavigationHeader, {
    props,
    global: {
      plugins: [createAppI18n()],
    },
  });

it("should render the default state properly", async () => {
  resetAuthState();
  const { container, getByRole, getByText } = renderNavigationHeader();

  await expect
    .element(getByRole("button", { name: "GeoChess" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Open navigation menu" }))
    .toBeInTheDocument();
  await expect.element(getByText("Sign Up")).toBeInTheDocument();
  expect(container.querySelector(".how-to-play-button")).not.toBeNull();
  expect(
    container.querySelector('[aria-label="GitHub repository link"]'),
  ).not.toBeNull();
  expect(
    container.querySelector('[aria-label="Discord server link"]'),
  ).not.toBeNull();
  expect(container.querySelector(".language-selector")).not.toBeNull();
});

it("should navigate home when the title is clicked", async () => {
  resetAuthState();
  const { getByRole } = renderNavigationHeader();

  await getByRole("button", { name: "GeoChess" }).click();

  expect(push).toHaveBeenCalledWith("/");
});

it("should open and close the mobile menu", async () => {
  resetAuthState();
  const { container, getByRole, getByTestId } = renderNavigationHeader();

  await getByRole("button", { name: "Open navigation menu" }).click();

  await expect
    .element(getByRole("button", { name: "Close navigation menu" }))
    .toBeInTheDocument();
  await expect
    .element(getByTestId("navigation-header-mobile-panel"))
    .toBeInTheDocument();

  await getByRole("button", { name: "Close navigation menu" }).click();

  expect(
    container.querySelector('[data-testid="navigation-header-mobile-panel"]'),
  ).toBeNull();
});

it("should not render the user section when not logged in", async () => {
  resetAuthState();
  const { container, getByRole } = renderNavigationHeader();

  await getByRole("button", { name: "Open navigation menu" }).click();

  await expect
    .element(getByRole("button", { name: "GitHub", exact: true }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Discord", exact: true }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Sign Up" }))
    .toBeInTheDocument();
  expect(
    container.querySelector('[data-testid="navigation-header-mobile-user"]'),
  ).toBeNull();
});

it("should show the mobile how to play accordion content", async () => {
  resetAuthState();
  const { container, getByRole, getByTestId, getByText } =
    renderNavigationHeader();

  await getByRole("button", { name: "Open navigation menu" }).click();

  await expect
    .element(getByTestId("navigation-header-mobile-how-to-play-chevron-down"))
    .toBeInTheDocument();
  expect(
    container.querySelector(
      '[data-testid="navigation-header-mobile-how-to-play-chevron-up"]',
    ),
  ).toBeNull();

  await getByTestId("navigation-header-mobile-how-to-play-toggle").click();

  await expect
    .element(getByTestId("navigation-header-mobile-how-to-play-chevron-up"))
    .toBeInTheDocument();
  await expect
    .element(getByText("Claim a neighboring country each turn."))
    .toBeInTheDocument();
  await expect
    .element(getByText("No legal moves? You lose."))
    .toBeInTheDocument();
  await expect.element(getByText("That's it. Enjoy!")).toBeInTheDocument();
});

it("should emit Discord from the mobile menu", async () => {
  resetAuthState();
  const handler = vi.fn();
  const { getByRole } = renderNavigationHeader({
    onDiscordClick: handler,
  });

  await getByRole("button", { name: "Open navigation menu" }).click();
  await getByRole("button", { name: "Discord", exact: true }).click();

  expect(handler).toHaveBeenCalledTimes(1);
});

it("should open GitHub from the mobile control", async () => {
  resetAuthState();
  const open = vi.spyOn(window, "open").mockImplementation(() => null);
  const { getByRole } = renderNavigationHeader();

  await getByRole("button", { name: "Open navigation menu" }).click();
  await getByRole("button", { name: "GitHub", exact: true }).click();

  expect(open).toHaveBeenCalledTimes(1);
  expect(open).toHaveBeenCalledWith(
    "https://github.com/spider-hand/GeoChess",
    "_blank",
    "noopener,noreferrer",
  );

  open.mockRestore();
});

it("should emit the selected language on the mobile menu", async () => {
  resetAuthState();
  const onLanguageSelect = vi.fn();
  const { getByRole, getByTestId } = renderNavigationHeader({
    onLanguageSelect,
  });

  await getByRole("button", { name: "Open navigation menu" }).click();
  await getByTestId("navigation-header-mobile-language-toggle").click();
  await getByRole("button", { name: "日本語" }).click();

  expect(onLanguageSelect).toHaveBeenCalledWith("ja");
});

it("should render the user section when logged in", async () => {
  resetAuthState();
  username.value = "Taylor Swift";
  userCountry.value = "JP";
  isAuthenticatedUser.value = true;
  const { container, getByRole, getByTestId } = renderNavigationHeader();

  expect(container.querySelector('[aria-label="Account menu"]')).not.toBeNull();

  await getByRole("button", { name: "Open navigation menu" }).click();

  await expect
    .element(getByTestId("navigation-header-mobile-user"))
    .toBeInTheDocument();
  await expect
    .element(getByTestId("navigation-header-mobile-username"))
    .toHaveTextContent("Taylor Swift");
  await expect
    .element(getByRole("button", { name: "Sign Out" }))
    .toBeInTheDocument();
});

it("should navigate to the profile page from the mobile menu", async () => {
  resetAuthState();
  username.value = "Taylor Swift";
  isAuthenticatedUser.value = true;
  const { container, getByRole } = renderNavigationHeader();

  await getByRole("button", { name: "Open navigation menu" }).click();
  await getByRole("button", { name: "Profile" }).click();

  expect(push).toHaveBeenCalledWith("/user");
  expect(
    container.querySelector('[data-testid="navigation-header-mobile-panel"]'),
  ).toBeNull();
});

it("should not render the user section when the authentication is in progress", async () => {
  resetAuthState();
  isCurrentUserLoaded.value = false;
  const { container } = renderNavigationHeader();

  expect(container.textContent).not.toContain("Sign Up");
  expect(container.querySelector('[aria-label="Account menu"]')).toBeNull();
});

it("should render the loading state when signing up", async () => {
  resetAuthState();
  let finishSignIn!: () => void;
  signInWithGoogle.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finishSignIn = () => resolve();
      }),
  );

  const { container, getByRole } = renderNavigationHeader();

  await getByRole("button", { name: "Open navigation menu" }).click();
  await getByRole("button", { name: "Sign Up" }).click();

  await expect
    .poll(() =>
      container
        .querySelector(".navigation-header__cta-actions--desktop .button")
        ?.getAttribute("aria-busy"),
    )
    .toBe("true");

  finishSignIn();

  await expect
    .poll(() =>
      container
        .querySelector(".navigation-header__cta-actions--desktop .button")
        ?.getAttribute("aria-busy"),
    )
    .toBe("false");
});
