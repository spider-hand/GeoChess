import { beforeEach, expect, it, vi } from "vitest";
import { ref } from "vue";

type MockFirebaseUser = {
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

it("should return an empty access token when there is no current user", async () => {
  const { default: useApi } = await import("@/composables/useApi");

  const { apiConfig } = useApi();

  await expect(apiConfig.accessToken?.()).resolves.toBe("");
});

it("should return the current user token when firebase auth has no current user", async () => {
  const getIdToken = vi.fn().mockResolvedValue("firebase-token");
  currentUser.value = { getIdToken };

  const { default: useApi } = await import("@/composables/useApi");

  const { apiConfig } = useApi();

  await expect(apiConfig.accessToken?.()).resolves.toBe("firebase-token");
  expect(getIdToken).toHaveBeenCalledTimes(1);
});

it("should prefer the firebase auth current user token when it is available", async () => {
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
