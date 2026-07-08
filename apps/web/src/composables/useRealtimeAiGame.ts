import { onValue, ref as databaseRef } from "firebase/database";
import {
  onScopeDispose,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from "vue";
import type { Difficulty } from "@/types/game";

import { getFirebaseDatabase } from "@/lib/firebase";

type RealtimeAiGameMove = {
  country: string;
  actor: "player" | "ai";
  createdAt: number;
};

type RealtimeAiGameSnapshot = {
  id: string;
  userId: string;
  difficulty: Difficulty;
  turn: "player" | "ai";
  start: string;
  country: string;
  availableMoves?: Array<string>;
  usedCountries: Array<string>;
  moves?: Record<string, RealtimeAiGameMove>;
  createdAt: number;
  updatedAt: number;
};

export type RealtimeAiGame = Omit<
  RealtimeAiGameSnapshot,
  "availableMoves" | "moves"
> & {
  availableMoves: Array<string>;
  moves: Record<string, RealtimeAiGameMove>;
};

// Firebase Realtime Database doesn't allow empty arrays and empty objects
// so we normalize the data here to avoid repeated nullish checks outside this composable.
const normalizeRealtimeAiGame = (
  game: RealtimeAiGameSnapshot,
): RealtimeAiGame => ({
  ...game,
  availableMoves: game.availableMoves ?? [],
  moves: game.moves ?? {},
});

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

          realtimeAiGame.value = normalizeRealtimeAiGame(
            snapshot.val() as RealtimeAiGameSnapshot,
          );
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
