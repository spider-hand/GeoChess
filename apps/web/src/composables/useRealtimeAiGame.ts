import { onValue, ref as databaseRef } from "firebase/database";
import {
  onScopeDispose,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from "vue";

import { getFirebaseDatabase } from "@/lib/firebase";

type RealtimeAiGameMove = {
  country: string;
  actor: "player" | "ai";
  createdAt: number;
};

export type RealtimeAiGame = {
  id: string;
  userId: string;
  difficulty: "easy" | "medium" | "hard";
  turn: "player" | "ai";
  start: string;
  country: string;
  availableMoves?: Array<string>;
  usedCountries: Array<string>;
  moves?: Record<string, RealtimeAiGameMove>;
  createdAt: number;
  updatedAt: number;
};

const useRealtimeAiGame = (gameId: MaybeRefOrGetter<string | null>) => {
  const realtimeAiGame = ref<RealtimeAiGame | null>(null);
  const realtimeAiGameError = ref<Error | null>(null);
  const isLoadingRealtimeAiGame = ref(true);
  let unsubscribe: (() => void) | null = null;

  watch(
    () => toValue(gameId),
    (nextGameId) => {
      unsubscribe?.();
      realtimeAiGame.value = null;
      realtimeAiGameError.value = null;

      if (!nextGameId) {
        isLoadingRealtimeAiGame.value = false;
        return;
      }

      isLoadingRealtimeAiGame.value = true;
      unsubscribe = onValue(
        databaseRef(getFirebaseDatabase(), `aiGames/${nextGameId}`),
        (snapshot) => {
          if (!snapshot.exists()) {
            realtimeAiGameError.value = new Error(
              "Realtime AI game was not found.",
            );
            realtimeAiGame.value = null;
            isLoadingRealtimeAiGame.value = false;
            return;
          }

          realtimeAiGame.value = snapshot.val() as RealtimeAiGame;
          realtimeAiGameError.value = null;
          isLoadingRealtimeAiGame.value = false;
        },
        (error) => {
          realtimeAiGameError.value = error;
          realtimeAiGame.value = null;
          isLoadingRealtimeAiGame.value = false;
        },
      );
    },
    { immediate: true },
  );

  onScopeDispose(() => {
    unsubscribe?.();
  });

  return {
    realtimeAiGame,
    realtimeAiGameError,
    isLoadingRealtimeAiGame,
  };
};

export default useRealtimeAiGame;
