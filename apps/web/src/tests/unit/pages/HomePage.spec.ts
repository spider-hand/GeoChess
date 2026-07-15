import { beforeEach, expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { computed, ref } from "vue";

const mockCreateAiGame = vi.fn();
const mockCreateWithFriendsGame = vi.fn();
const mockJoinWithFriendsGame = vi.fn();
const mockRouterCurrentUser = vi.fn();
const mockSignInAnonymously = vi.fn();
const mockSignInWithGoogle = vi.fn();
const currentUser = ref<null | { isAnonymous: boolean }>(null);
const realtimeAiGame = ref({
  id: "game-123",
  userId: "user-123",
  difficulty: "medium",
  turn: "player",
  start: "BB",
  country: "BB",
  availableMoves: ["CC"],
  usedCountries: ["BB"],
  moves: {},
  createdAt: 1751155200000,
  updatedAt: 1751155200000,
});
const realtimeAiGameError = ref<Error | null>(null);
const isLoadingRealtimeAiGame = ref(false);

vi.mock("vuefire", async () => {
  const actual = await vi.importActual<typeof import("vuefire")>("vuefire");

  return {
    ...actual,
    getCurrentUser: (...args: unknown[]) => mockRouterCurrentUser(...args),
  };
});

vi.mock("@/composables/useAuth", () => ({
  signInAnonymouslyIfNeeded: vi.fn().mockResolvedValue({ isAnonymous: true }),
  useAuth: () => ({
    username: "Guest",
    userCountry: undefined,
    currentUser,
    isAnonymousUser: computed(() => currentUser.value?.isAnonymous ?? false),
    isAuthenticatedUser: computed(() => !!currentUser.value),
    isRegisteredUser: computed(
      () => !!currentUser.value && !currentUser.value.isAnonymous,
    ),
    isCurrentUserLoaded: ref(true),
    signInAnonymously: (...args: unknown[]) => mockSignInAnonymously(...args),
    signInWithGoogle: (...args: unknown[]) => mockSignInWithGoogle(...args),
    signOutUser: vi.fn(),
  }),
}));

vi.mock("@/composables/useAiGameQuery", () => ({
  default: () => ({
    createAiGame: (...args: unknown[]) => mockCreateAiGame(...args),
  }),
}));

vi.mock("@/composables/useWithFriendsGameQuery", () => ({
  default: () => ({
    createWithFriendsGame: (...args: unknown[]) =>
      mockCreateWithFriendsGame(...args),
    joinWithFriendsGame: (...args: unknown[]) =>
      mockJoinWithFriendsGame(...args),
  }),
}));

vi.mock("@/composables/useRealtimeAiGame", () => ({
  default: () => ({
    realtimeAiGame,
    realtimeAiGameError,
    isLoadingRealtimeAiGame,
  }),
}));

vi.mock("@/components/pages/Home/PlayVsAiCard.vue", () => ({
  default: {
    name: "PlayVsAiCard",
    props: ["disabled", "isStartingGame"],
    emits: ["start-ai-match"],
    template:
      '<div data-testid="play-vs-ai-card" :data-disabled="String(disabled)" :data-is-starting-game="String(isStartingGame)"><button @click="$emit(\'start-ai-match\', \'hard\')">Start mocked AI game</button></div>',
  },
}));

vi.mock("@/components/pages/Home/PlayWithFriendsCard.vue", () => ({
  default: {
    name: "PlayWithFriendsCard",
    props: ["disabled", "isCreatingRoom", "isEnteringRoom"],
    emits: ["create-friends-room", "enter-friends-room"],
    template:
      '<div data-testid="play-with-friends-card" :data-disabled="String(disabled)" :data-is-creating-room="String(isCreatingRoom)" :data-is-entering-room="String(isEnteringRoom)"><button @click="$emit(\'create-friends-room\')">Create Room</button><button @click="$emit(\'enter-friends-room\', \'654321\')">Enter Room</button></div>',
  },
}));

vi.mock("@/components/pages/Home/RandomMatchCard.vue", () => ({
  default: {
    name: "RandomMatchCard",
    props: ["disabled", "onlinePlayers"],
    emits: ["join-random-match"],
    template:
      '<div data-testid="random-match-card" :data-disabled="String(disabled)" :data-online-players="String(onlinePlayers)"><button @click="$emit(\'join-random-match\')">Join Lobby</button></div>',
  },
}));

vi.mock("@/components/shared/SignUpPromptModal.vue", () => ({
  default: {
    name: "SignUpPromptModal",
    props: ["isOpen", "isSigningUp"],
    emits: ["close", "sign-up"],
    template:
      '<div v-if="isOpen" data-testid="sign-up-prompt-modal" :data-is-signing-up="String(isSigningUp)"><button @click="$emit(\'sign-up\')">Sign Up</button><button @click="$emit(\'close\')">Close sign up prompt</button></div>',
  },
}));

import { createAppI18n } from "@/i18n";
import HomePage from "@/pages/HomePage.vue";
import router from "@/router";

beforeEach(() => {
  mockCreateAiGame.mockReset();
  mockCreateWithFriendsGame.mockReset();
  mockJoinWithFriendsGame.mockReset();
  mockRouterCurrentUser.mockReset();
  mockSignInAnonymously.mockReset();
  mockSignInWithGoogle.mockReset();
  mockSignInAnonymously.mockResolvedValue({ isAnonymous: true });
  mockSignInWithGoogle.mockResolvedValue({ user: { uid: "user-123" } });
  currentUser.value = null;
  mockRouterCurrentUser.mockImplementation(async () => {
    if (currentUser.value === null) {
      return null;
    }

    return {
      uid: "user-123",
      isAnonymous: currentUser.value.isAnonymous,
    };
  });
  realtimeAiGame.value = {
    id: "game-123",
    userId: "user-123",
    difficulty: "medium",
    turn: "player",
    start: "BB",
    country: "BB",
    availableMoves: ["CC"],
    usedCountries: ["BB"],
    moves: {},
    createdAt: 1751155200000,
    updatedAt: 1751155200000,
  };
  realtimeAiGameError.value = null;
  isLoadingRealtimeAiGame.value = false;
});

it("should render the default state properly", async () => {
  await router.push("/");
  await router.isReady();

  const { container } = render(HomePage, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  expect(container.querySelector(".home-page__hero-image")).not.toBeNull();
  expect(
    container.querySelector('[data-testid="play-vs-ai-card"]'),
  ).not.toBeNull();
  expect(
    container.querySelector('[data-testid="play-with-friends-card"]'),
  ).not.toBeNull();
  expect(
    container
      .querySelector('[data-testid="play-vs-ai-card"]')
      ?.getAttribute("data-disabled"),
  ).toBe("false");
  expect(
    container.querySelector('[data-testid="random-match-card"]'),
  ).not.toBeNull();
  expect(
    container
      .querySelector('[data-testid="random-match-card"]')
      ?.getAttribute("data-online-players"),
  ).toBe("40");
});

it("should create an ai game with the selected difficulty and navigate to the game route", async () => {
  mockCreateAiGame.mockResolvedValue({ id: "game-123" });

  await router.push("/");
  await router.isReady();

  const { getByRole } = render(HomePage, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await getByRole("button", { name: "Start mocked AI game" }).click();

  expect(mockSignInAnonymously).toHaveBeenCalledTimes(1);
  expect(mockCreateAiGame).toHaveBeenCalledWith({ difficulty: "hard" });
  await expect
    .poll(() => router.currentRoute.value.path)
    .toBe("/game/vs-ai/game-123");
});

it("should show the sign up prompt when an unauthenticated user tries to access multiplayer actions", async () => {
  await router.push("/");
  await router.isReady();

  const { getByRole, getByTestId } = render(HomePage, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await getByRole("button", { name: "Create Room" }).click();

  await expect.element(getByTestId("sign-up-prompt-modal")).toBeVisible();
});

it.each([
  ["Create Room", "create", "/game/with-friends/friends-123"],
  ["Enter Room", "join", "/game/with-friends/friends-456"],
])(
  "should create or join a with-friends game for authenticated users from %s",
  async (actionName, mode, expectedPath) => {
    currentUser.value = { isAnonymous: false };

    if (mode === "create") {
      mockCreateWithFriendsGame.mockResolvedValue({
        id: "friends-123",
        roomKey: "654321",
      });
    } else {
      mockJoinWithFriendsGame.mockResolvedValue({
        id: "friends-456",
      });
    }

    await router.push("/");
    await router.isReady();

    const { container, getByRole } = render(HomePage, {
      global: {
        plugins: [createAppI18n(), router],
      },
    });

    await getByRole("button", { name: actionName }).click();

    expect(
      container.querySelector('[data-testid="sign-up-prompt-modal"]'),
    ).toBe(null);
    if (mode === "create") {
      expect(mockCreateWithFriendsGame).toHaveBeenCalledTimes(1);
    } else {
      expect(mockJoinWithFriendsGame).toHaveBeenCalledWith({
        roomKey: "654321",
      });
    }
    await expect.poll(() => router.currentRoute.value.path).toBe(expectedPath);
  },
);

it("should navigate authenticated users to the random-match destination without opening the sign up prompt", async () => {
  currentUser.value = { isAnonymous: false };

  await router.push("/");
  await router.isReady();

  const { container, getByRole } = render(HomePage, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await getByRole("button", { name: "Join Lobby" }).click();

  expect(container.querySelector('[data-testid="sign-up-prompt-modal"]')).toBe(
    null,
  );
  await expect
    .poll(() => router.currentRoute.value.path)
    .toBe("/game/random-match");
});

it("should start the normal sign up flow from the prompt", async () => {
  await router.push("/");
  await router.isReady();

  const { container, getByRole, getByTestId } = render(HomePage, {
    global: {
      plugins: [createAppI18n(), router],
    },
  });

  await getByRole("button", { name: "Join Lobby" }).click();
  await expect.element(getByTestId("sign-up-prompt-modal")).toBeVisible();

  await getByRole("button", { name: "Sign Up", exact: true }).click();

  expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
  await expect
    .poll(() => container.querySelector('[data-testid="sign-up-prompt-modal"]'))
    .toBeNull();
  await expect.poll(() => router.currentRoute.value.path).toBe("/");
});
