import { beforeEach, expect, test, vi } from "vitest";
import { ref } from "vue";

type MockFirebaseUser = {
  isAnonymous?: boolean;
  getIdToken: () => Promise<string>;
};

const currentUser = ref<MockFirebaseUser | null>(null);
const mockFirebaseAuth = {
  currentUser: null as MockFirebaseUser | null,
};

vi.mock("vuefire", () => ({
  useCurrentUser: () => currentUser,
}));

vi.mock("@/lib/firebase", () => ({
  firebaseAuth: mockFirebaseAuth,
}));

beforeEach(() => {
  currentUser.value = null;
  mockFirebaseAuth.currentUser = null;
});

test("returns an empty access token when there is no current user", async () => {
  const { default: useApi } = await import("@/composables/useApi");

  const { apiConfig } = useApi();

  await expect(apiConfig.accessToken?.()).resolves.toBe("");
});

test("returns the current user token by default", async () => {
  const getIdToken = vi.fn().mockResolvedValue("firebase-token");
  currentUser.value = { getIdToken };

  const { default: useApi } = await import("@/composables/useApi");

  const { apiConfig } = useApi();

  await expect(apiConfig.accessToken?.()).resolves.toBe("firebase-token");
  expect(getIdToken).toHaveBeenCalledTimes(1);
});

test("returns an access token for anonymous users", async () => {
  const getIdToken = vi.fn().mockResolvedValue("firebase-token");
  currentUser.value = { getIdToken, isAnonymous: true };

  const { default: useApi } = await import("@/composables/useApi");

  const { apiConfig } = useApi();

  await expect(apiConfig.accessToken?.()).resolves.toBe("firebase-token");
  expect(getIdToken).toHaveBeenCalledTimes(1);
});

test("prefers firebase auth current user when it is available", async () => {
  const currentUserToken = vi.fn().mockResolvedValue("current-user-token");
  const authUserToken = vi.fn().mockResolvedValue("auth-user-token");
  currentUser.value = { getIdToken: currentUserToken };
  mockFirebaseAuth.currentUser = { getIdToken: authUserToken };

  const { default: useApi } = await import("@/composables/useApi");

  const { apiConfig } = useApi();

  await expect(apiConfig.accessToken?.()).resolves.toBe("auth-user-token");
  expect(authUserToken).toHaveBeenCalledTimes(1);
  expect(currentUserToken).not.toHaveBeenCalled();
});
