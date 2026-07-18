import { beforeEach, expect, it, vi } from "vitest";

const mockEnsureVsAiAccess = vi.fn();
const mockGetCurrentUser = vi.fn();

vi.mock("@/composables/useAuth", () => ({
  signInAnonymouslyIfNeeded: mockEnsureVsAiAccess,
  useAuth: () => ({
    username: null,
    userCountry: undefined,
    currentUser: { value: null },
    isAnonymousUser: false,
    isAuthenticatedUser: false,
    isCurrentUserLoaded: true,
    signInAnonymously: vi.fn().mockResolvedValue({ isAnonymous: true }),
    signInWithGoogle: vi.fn(),
    signOutUser: vi.fn(),
  }),
}));

vi.mock("vuefire", async () => {
  const actual = await vi.importActual<typeof import("vuefire")>("vuefire");

  return {
    ...actual,
    getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
  };
});

beforeEach(() => {
  vi.resetModules();
  mockEnsureVsAiAccess.mockReset();
  mockGetCurrentUser.mockReset();
  mockGetCurrentUser.mockResolvedValue({ isAnonymous: false });
});

it.each(["/", "/privacy", "/terms", "/game/random-match"])(
  "should allow navigation to %s without requiring vs ai auth",
  async (path) => {
    const { default: router } = await import("@/router");

    await router.push(path);
    await router.isReady();

    expect(mockEnsureVsAiAccess).not.toHaveBeenCalled();
    expect(router.currentRoute.value.path).toBe(path);
  },
);

it("should allow entry to the vs ai route after auth is ensured", async () => {
  mockEnsureVsAiAccess.mockResolvedValue({ isAnonymous: true });

  const { default: router } = await import("@/router");

  await router.push("/");
  await router.isReady();
  await router.push("/game/vs-ai/game-123");

  expect(mockEnsureVsAiAccess).toHaveBeenCalledTimes(1);
  expect(router.currentRoute.value.path).toBe("/game/vs-ai/game-123");
});

it("should redirect to home when the vs ai auth guard fails", async () => {
  mockEnsureVsAiAccess.mockRejectedValue(new Error("auth failed"));

  const { default: router } = await import("@/router");

  await router.push("/");
  await router.isReady();
  await router.push("/game/vs-ai/game-123");

  expect(mockEnsureVsAiAccess).toHaveBeenCalledTimes(1);
  expect(router.currentRoute.value.path).toBe("/");
});

it("should redirect guest users away from with-friends routes", async () => {
  mockGetCurrentUser.mockResolvedValue({ isAnonymous: true });

  const { default: router } = await import("@/router");

  await router.push("/");
  await router.isReady();
  await router.push("/game/with-friends/game-123");

  expect(router.currentRoute.value.path).toBe("/");
  expect(mockEnsureVsAiAccess).not.toHaveBeenCalled();
});
