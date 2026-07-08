import { signInAnonymously, signInWithPopup, signOut } from "firebase/auth";
import { computed } from "vue";
import {
  getCurrentUser,
  useCurrentUser,
  useIsCurrentUserLoaded,
} from "vuefire";

import useUserQuery from "@/composables/useUserQuery";
import { firebaseAuth, googleAuthProvider } from "@/lib/firebase";

export const signInAnonymouslyIfNeeded = async () => {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    return currentUser;
  }

  return (await signInAnonymously(firebaseAuth)).user;
};

export const useAuth = () => {
  const currentUser = useCurrentUser();
  const isCurrentUserLoaded = useIsCurrentUserLoaded();
  const { createUserAsync, isCreatingUser } = useUserQuery();

  const isAuthenticatedUser = computed(() => !!currentUser.value);
  const isAnonymousUser = computed(
    () => currentUser.value?.isAnonymous ?? false,
  );
  const username = computed(() => {
    if (currentUser.value?.isAnonymous) {
      return "Guest";
    }

    return currentUser.value?.displayName?.trim() || "Guest";
  });

  const signInWithGoogle = async () => {
    const currentFirebaseUser = await getCurrentUser();

    if (currentFirebaseUser?.isAnonymous) {
      await signOut(firebaseAuth);
    }

    const credential = await signInWithPopup(firebaseAuth, googleAuthProvider);
    const displayName = credential.user.displayName?.trim();

    if (!displayName) {
      await signOut(firebaseAuth);
      throw new Error("Authenticated user must have a display name.");
    }

    try {
      const idToken = await credential.user.getIdToken();

      // Create a new user if the user record does not exist. Otherwise, return the existing user record.
      await createUserAsync({
        userId: credential.user.uid,
        createUserRequest: {
          displayName,
        },
        idToken,
      });
    } catch (error) {
      await signOut(firebaseAuth);
      throw error;
    }

    return credential;
  };

  const signInAnonymously = async () => {
    return signInAnonymouslyIfNeeded();
  };

  const signOutUser = async () => {
    await signOut(firebaseAuth);
  };

  return {
    currentUser,
    isAnonymousUser,
    isAuthenticatedUser,
    isCreatingUser,
    isCurrentUserLoaded,
    signInAnonymously,
    signInWithGoogle,
    signOutUser,
    username,
  };
};
