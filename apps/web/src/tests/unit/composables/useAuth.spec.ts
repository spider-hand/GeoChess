import { beforeEach, expect, test, vi } from "vitest";
import { ref } from "vue";

type MockFirebaseUser = {
  displayName?: string | null;
  getIdToken?: () => Promise<string>;
  isAnonymous?: boolean;
  uid?: string;
};

const currentUser = ref<MockFirebaseUser | null>(null);
const mockGetCurrentUser = vi.fn();
const mockSignInAnonymously = vi.fn();
const mockSignInWithPopup = vi.fn();
const mockSignOut = vi.fn();
const mockCreateUserAsync = vi.fn();

vi.mock("vuefire", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  useCurrentUser: () => currentUser,
  useIsCurrentUserLoaded: () => ref(true),
}));

vi.mock("firebase/auth", () => ({
  signInAnonymously: (...args: unknown[]) => mockSignInAnonymously(...args),
  signInWithPopup: (...args: unknown[]) => mockSignInWithPopup(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

vi.mock("@/lib/firebase", () => ({
  firebaseAuth: { name: "auth" },
  googleAuthProvider: { name: "google" },
}));

vi.mock("@/composables/useUserQuery", () => ({
  default: () => ({
    createUserAsync: (...args: unknown[]) => mockCreateUserAsync(...args),
    isCreatingUser: ref(false),
  }),
}));

beforeEach(() => {
  currentUser.value = null;
  mockGetCurrentUser.mockReset();
  mockSignInAnonymously.mockReset();
  mockSignInWithPopup.mockReset();
  mockSignOut.mockReset();
  mockCreateUserAsync.mockReset();
});

test("reuses the current user for anonymous sign in when already authenticated", async () => {
  const existingUser = { uid: "user-123" };
  mockGetCurrentUser.mockResolvedValue(existingUser);

  const { signInAnonymouslyIfNeeded } = await import("@/composables/useAuth");

  await expect(signInAnonymouslyIfNeeded()).resolves.toBe(existingUser);
  expect(mockSignInAnonymously).not.toHaveBeenCalled();
});

test("signs in anonymously when there is no current user", async () => {
  mockGetCurrentUser.mockResolvedValue(null);
  mockSignInAnonymously.mockResolvedValue({ user: { uid: "guest-123" } });

  const { signInAnonymouslyIfNeeded } = await import("@/composables/useAuth");

  await expect(signInAnonymouslyIfNeeded()).resolves.toEqual({
    uid: "guest-123",
  });
  expect(mockSignInAnonymously).toHaveBeenCalledTimes(1);
});

test("signs out the anonymous user before starting google sign in and saves the user record", async () => {
  mockGetCurrentUser.mockResolvedValue({ isAnonymous: true });
  mockSignInWithPopup.mockResolvedValue({
    user: {
      uid: "user-123",
      displayName: "Taylor Swift",
      getIdToken: vi.fn().mockResolvedValue("token"),
    },
  });
  mockCreateUserAsync.mockResolvedValue({});

  const { useAuth } = await import("@/composables/useAuth");

  await useAuth().signInWithGoogle();

  expect(mockSignOut).toHaveBeenCalledTimes(1);
  expect(mockSignInWithPopup).toHaveBeenCalledTimes(1);
  expect(mockCreateUserAsync).toHaveBeenCalledWith({
    userId: "user-123",
    createUserRequest: {
      displayName: "Taylor Swift",
    },
    idToken: "token",
  });
});

test("signs the user back out when user creation fails", async () => {
  mockGetCurrentUser.mockResolvedValue(null);
  mockSignInWithPopup.mockResolvedValue({
    user: {
      uid: "user-123",
      displayName: "Taylor Swift",
      getIdToken: vi.fn().mockResolvedValue("token"),
    },
  });
  mockCreateUserAsync.mockRejectedValue(new Error("failed"));

  const { useAuth } = await import("@/composables/useAuth");

  await expect(useAuth().signInWithGoogle()).rejects.toThrow("failed");
  expect(mockSignOut).toHaveBeenCalledTimes(1);
});
