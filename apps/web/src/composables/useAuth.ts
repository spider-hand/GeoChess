import { signInAnonymously, signInWithPopup, signOut } from "firebase/auth";
import { computed } from "vue";
import {
  getCurrentUser,
  useCurrentUser,
  useIsCurrentUserLoaded,
} from "vuefire";

import { firebaseAuth, googleAuthProvider } from "@/lib/firebase";

export async function signInAnonymouslyIfNeeded() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    return currentUser;
  }

  return (await signInAnonymously(firebaseAuth)).user;
}

export function useAuth() {
  const currentUser = useCurrentUser();
  const isCurrentUserLoaded = useIsCurrentUserLoaded();

  const isAuthenticatedUser = computed(
    () => !!currentUser.value && !currentUser.value.isAnonymous,
  );
  const isAnonymousUser = computed(
    () => currentUser.value?.isAnonymous ?? false,
  );
  const authenticatedUserName = computed(
    () => currentUser.value?.displayName?.trim() || null,
  );

  async function signInWithGoogle() {
    return signInWithPopup(firebaseAuth, googleAuthProvider);
  }

  async function signInAnonymously() {
    return signInAnonymouslyIfNeeded();
  }

  async function signOutUser() {
    await signOut(firebaseAuth);
  }

  return {
    authenticatedUserName,
    currentUser,
    isAnonymousUser,
    isAuthenticatedUser,
    isCurrentUserLoaded,
    signInAnonymously,
    signInWithGoogle,
    signOutUser,
  };
}
