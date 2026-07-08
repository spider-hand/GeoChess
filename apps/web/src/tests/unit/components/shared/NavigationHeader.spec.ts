import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { ref } from "vue";

import { createAppI18n } from "../../../../i18n";

const username = ref<string | null>(null);
const isAuthenticatedUser = ref(false);
const isCurrentUserLoaded = ref(true);
const signInWithGoogle = vi.fn();
const signOutUser = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: vi.fn(),
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

function resetAuthState() {
  username.value = null;
  isAuthenticatedUser.value = false;
  isCurrentUserLoaded.value = true;
  signInWithGoogle.mockReset();
  signOutUser.mockReset();
}

test("renders the product name and controls", async () => {
  resetAuthState();
  const { getByRole } = render(NavigationHeader, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("button", { name: "GeoChess" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "How to play" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Github repository link" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Discord server link" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Language settings" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Sign Up" }))
    .toBeInTheDocument();
});

test("emits branch events for non-auth actions", async () => {
  resetAuthState();
  const onBrandClick = vi.fn();
  const onGithubClick = vi.fn();
  const onDiscordClick = vi.fn();
  const onLanguageSelect = vi.fn();

  const { getByRole } = render(NavigationHeader, {
    props: {
      onBrandClick,
      onGithubClick,
      onDiscordClick,
      onLanguageSelect,
    },
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("button", { name: "GeoChess" }).click();
  await getByRole("button", { name: "How to play" }).click();
  await getByRole("button", { name: "Github repository link" }).click();
  await getByRole("button", { name: "Discord server link" }).click();
  await getByRole("button", { name: "Language settings" }).click();
  await getByRole("menuitemradio", { name: /日本語/ }).click();

  expect(onBrandClick).toHaveBeenCalledTimes(1);
  expect(onGithubClick).toHaveBeenCalledTimes(1);
  expect(onDiscordClick).toHaveBeenCalledTimes(1);
  expect(onLanguageSelect).toHaveBeenCalledWith("ja");
});

test("composes the shared button branches for the text actions", async () => {
  resetAuthState();
  const { getByRole } = render(NavigationHeader, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await expect
    .element(getByRole("button", { name: "How to play" }))
    .toHaveClass("button--tertiary");
  await expect
    .element(getByRole("button", { name: "Sign Up" }))
    .toHaveClass("button--primary", "button--pill");
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

test("renders the authenticated menu branch", async () => {
  resetAuthState();
  username.value = "Taylor Swift";
  isAuthenticatedUser.value = true;
  const { getByRole, getByText } = render(NavigationHeader, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("button", { name: "Account menu" }).click();

  await expect.element(getByRole("menu")).toBeInTheDocument();
  await expect.element(getByText("Taylor Swift")).toBeInTheDocument();
  await expect
    .element(getByRole("menuitem", { name: "Sign Out" }))
    .toBeInTheDocument();
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

  const { getByRole } = render(NavigationHeader, {
    global: {
      plugins: [createAppI18n()],
    },
  });

  await getByRole("button", { name: "Sign Up" }).click();
  await expect
    .element(getByRole("button", { name: "Sign Up" }))
    .toHaveAttribute("aria-busy", "true");

  resolveSignIn?.();
});
