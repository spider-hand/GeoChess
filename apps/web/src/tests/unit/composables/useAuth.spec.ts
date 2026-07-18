import { beforeEach, expect, it, vi } from "vitest";
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
const user = ref<{ displayName: string; country?: string } | undefined>(
  undefined,
);

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
    refetchUser: vi.fn(),
    user,
  }),
}));

beforeEach(() => {
  currentUser.value = null;
  mockGetCurrentUser.mockReset();
  mockSignInAnonymously.mockReset();
  mockSignInWithPopup.mockReset();
  mockSignOut.mockReset();
  mockCreateUserAsync.mockReset();
  user.value = undefined;
});

it.each([
  {
    currentUser: { uid: "user-123" },
    expectedUsername: "Guest",
    expectedCountry: undefined,
    isAnonymousUser: false,
    isAuthenticatedUser: true,
    isRegisteredUser: false,
  },
  {
    currentUser: { uid: "guest-123", isAnonymous: true },
    expectedUsername: "Guest",
    expectedCountry: undefined,
    isAnonymousUser: true,
    isAuthenticatedUser: true,
    isRegisteredUser: false,
  },
  {
    currentUser: { uid: "user-456", displayName: "  Taylor Swift  " },
    expectedUsername: "Taylor Swift",
    expectedCountry: undefined,
    isAnonymousUser: false,
    isAuthenticatedUser: true,
    isRegisteredUser: false,
  },
  {
    currentUser: { uid: "user-789", displayName: "Ignored Firebase Name" },
    expectedUsername: "Taylor Swift",
    expectedCountry: "JP",
    isAnonymousUser: false,
    isAuthenticatedUser: true,
    isRegisteredUser: true,
    user: { displayName: "Taylor Swift", country: "JP" },
  },
])(
  "should expose the public auth state for $expectedUsername",
  async ({
    currentUser: nextCurrentUser,
    expectedUsername,
    expectedCountry,
    isAnonymousUser,
    isAuthenticatedUser,
    isRegisteredUser,
    user: nextUser,
  }) => {
    currentUser.value = nextCurrentUser;
    user.value = nextUser;

    const { useAuth } = await import("@/composables/useAuth");

    const auth = useAuth();

    expect(auth.username.value).toBe(expectedUsername);
    expect(auth.userCountry.value).toBe(expectedCountry);
    expect(auth.isAnonymousUser.value).toBe(isAnonymousUser);
    expect(auth.isAuthenticatedUser.value).toBe(isAuthenticatedUser);
    expect(auth.isRegisteredUser.value).toBe(isRegisteredUser);
    expect(auth.isCurrentUserLoaded.value).toBe(true);
  },
);

it("should reuse the current user for anonymous sign in when already authenticated", async () => {
  const existingUser = { uid: "user-123" };
  mockGetCurrentUser.mockResolvedValue(existingUser);

  const { signInAnonymouslyIfNeeded } = await import("@/composables/useAuth");

  await expect(signInAnonymouslyIfNeeded()).resolves.toBe(existingUser);
  expect(mockSignInAnonymously).not.toHaveBeenCalled();
});

it("should sign in anonymously when there is no current user", async () => {
  mockGetCurrentUser.mockResolvedValue(null);
  mockSignInAnonymously.mockResolvedValue({ user: { uid: "guest-123" } });

  const { signInAnonymouslyIfNeeded } = await import("@/composables/useAuth");

  await expect(signInAnonymouslyIfNeeded()).resolves.toEqual({
    uid: "guest-123",
  });
  expect(mockSignInAnonymously).toHaveBeenCalledTimes(1);
});

it("should sign out the anonymous user before starting google sign in and save the user record", async () => {
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
    createCurrentUserRequest: {
      displayName: "Taylor Swift",
    },
    idToken: "token",
  });
});

it("should sign the user out when the authenticated user has no display name", async () => {
  mockGetCurrentUser.mockResolvedValue(null);
  mockSignInWithPopup.mockResolvedValue({
    user: {
      uid: "user-123",
      displayName: "   ",
      getIdToken: vi.fn().mockResolvedValue("token"),
    },
  });

  const { useAuth } = await import("@/composables/useAuth");

  await expect(useAuth().signInWithGoogle()).rejects.toThrow(
    "Authenticated user must have a display name.",
  );
  expect(mockCreateUserAsync).not.toHaveBeenCalled();
  expect(mockSignOut).toHaveBeenCalledTimes(1);
});

it("should sign the user out when saving the authenticated user fails", async () => {
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
