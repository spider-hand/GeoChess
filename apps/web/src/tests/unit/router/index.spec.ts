import { beforeEach, expect, it, vi } from "vitest";

const mockEnsureVsAiAccess = vi.fn();

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

beforeEach(() => {
  vi.resetModules();
  mockEnsureVsAiAccess.mockReset();
});

it.each(["/", "/game/with-friends", "/game/random-match"])(
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
