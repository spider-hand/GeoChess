import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { ref } from "vue";

import { createAppI18n } from "../../../../i18n";

const username = ref<string | null>(null);
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
    isAuthenticatedUser,
    isCurrentUserLoaded,
    signInWithGoogle,
    signOutUser,
  }),
}));

const NavigationHeader = (
  await import("../../../../components/shared/NavigationHeader.vue")
).default;

const resetAuthState = () => {
  username.value = null;
  isAuthenticatedUser.value = false;
  isCurrentUserLoaded.value = true;
  push.mockReset();
  signInWithGoogle.mockReset();
  signOutUser.mockReset();
};

test("renders the header structure for desktop and mobile layouts", async () => {
  resetAuthState();
  const { container, getByRole } = render(NavigationHeader, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("button", { name: "GeoChess" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Open navigation menu" }))
    .toBeInTheDocument();

  expect(container.querySelector(".how-to-play-button")).not.toBeNull();
  expect(
    container.querySelector('[aria-label="GitHub repository link"]'),
  ).not.toBeNull();
  expect(
    container.querySelector('[aria-label="Discord server link"]'),
  ).not.toBeNull();
  expect(container.querySelector(".language-selector")).not.toBeNull();
  expect(container.querySelector(".button--pill")).not.toBeNull();
});

test("opens and closes the mobile menu", async () => {
  resetAuthState();
  const { container, getByRole, getByTestId } = render(NavigationHeader, {
    global: {
      plugins: [createAppI18n()],
    },
  });

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

test("shows the mobile how to play accordion content", async () => {
  resetAuthState();
  const { container, getByRole, getByTestId, getByText } = render(
    NavigationHeader,
    {
      global: {
        plugins: [createAppI18n()],
      },
    },
  );

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
  expect(
    container.querySelector(
      '[data-testid="navigation-header-mobile-how-to-play-chevron-down"]',
    ),
  ).toBeNull();

  await expect
    .element(getByText("Claim a neighboring country each turn."))
    .toBeInTheDocument();
  await expect
    .element(getByText("No legal moves? You lose."))
    .toBeInTheDocument();
  await expect.element(getByText("That's it. Enjoy!")).toBeInTheDocument();
});

test("shows the guest mobile menu branch", async () => {
  resetAuthState();
  const { container, getByRole } = render(NavigationHeader, {
    global: {
      plugins: [createAppI18n()],
    },
  });

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
    getByRole("button", { name: "GitHub", exact: true })
      .element()
      .querySelector("svg"),
  ).toBeNull();
  expect(
    getByRole("button", { name: "Discord", exact: true })
      .element()
      .querySelector("svg"),
  ).toBeNull();
  expect(
    container.querySelector('[data-testid="navigation-header-mobile-user"]'),
  ).toBeNull();
});

test("emits mobile navigation events and language changes", async () => {
  resetAuthState();
  const onGithubClick = vi.fn();
  const onDiscordClick = vi.fn();
  const onLanguageSelect = vi.fn();

  const { getByRole, getByTestId } = render(NavigationHeader, {
    props: {
      onGithubClick,
      onDiscordClick,
      onLanguageSelect,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("button", { name: "Open navigation menu" }).click();
  await expect
    .element(getByTestId("navigation-header-mobile-language-chevron-down"))
    .toBeInTheDocument();

  await getByTestId("navigation-header-mobile-language-toggle").click();
  await expect
    .element(getByTestId("navigation-header-mobile-language-chevron-up"))
    .toBeInTheDocument();
  await getByRole("button", { name: "GitHub", exact: true }).click();
  await getByRole("button", { name: "Open navigation menu" }).click();
  await getByRole("button", { name: "Discord", exact: true }).click();
  await getByRole("button", { name: "Open navigation menu" }).click();
  await getByTestId("navigation-header-mobile-language-toggle").click();
  await getByRole("button", { name: "日本語" }).click();

  expect(onGithubClick).toHaveBeenCalledTimes(1);
  expect(onDiscordClick).toHaveBeenCalledTimes(1);
  expect(onLanguageSelect).toHaveBeenCalledWith("ja");
});

test("renders the authenticated menu branches", async () => {
  resetAuthState();
  username.value = "Taylor Swift";
  isAuthenticatedUser.value = true;
  const { container, getByRole, getByTestId } = render(NavigationHeader, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  expect(container.querySelector('[aria-label="Account menu"]')).not.toBeNull();

  await getByRole("button", { name: "Open navigation menu" }).click();

  await expect
    .element(getByTestId("navigation-header-mobile-user"))
    .toBeInTheDocument();
  await expect
    .element(getByTestId("navigation-header-mobile-username"))
    .toHaveTextContent("Taylor Swift");
  await expect
    .element(getByTestId("navigation-header-mobile-username"))
    .toHaveClass("navigation-header__mobile-username");
  await expect
    .element(getByRole("button", { name: "Sign Out" }))
    .toBeInTheDocument();
  expect(
    container.querySelector(
      '[data-testid="navigation-header-mobile-panel"] > [data-testid="navigation-header-mobile-user"]',
    ),
  ).not.toBeNull();
});

test("keeps the long authenticated username in the mobile summary row", async () => {
  resetAuthState();
  username.value = "A very very very very long player name";
  isAuthenticatedUser.value = true;
  const { getByRole, getByTestId } = render(NavigationHeader, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("button", { name: "Open navigation menu" }).click();

  await expect
    .element(getByTestId("navigation-header-mobile-username"))
    .toHaveTextContent("A very very very very long player name");
  await expect
    .element(getByTestId("navigation-header-mobile-username"))
    .toHaveClass("navigation-header__mobile-username");
});

test("hides the auth control until the auth state is resolved", async () => {
  resetAuthState();
  isCurrentUserLoaded.value = false;
  const { container } = render(NavigationHeader, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  expect(container.textContent).not.toContain("Sign Up");
  expect(container.querySelector('[aria-label="Account menu"]')).toBeNull();
});

test("passes the loading state through to sign up", async () => {
  resetAuthState();
  let resolveSignIn: (() => void) | null = null;
  signInWithGoogle.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        resolveSignIn = resolve;
      }),
  );

  const { container, getByRole } = render(NavigationHeader, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("button", { name: "Open navigation menu" }).click();
  await getByRole("button", { name: "Sign Up" }).click();

  await expect
    .poll(() =>
      container
        .querySelector(".navigation-header__cta-actions--desktop .button")
        ?.getAttribute("aria-busy"),
    )
    .toBe("true");

  resolveSignIn?.();
});
