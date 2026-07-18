import { onValue, ref as databaseRef } from "firebase/database";
import {
  onScopeDispose,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from "vue";

import { getFirebaseDatabase } from "@/lib/firebase";
import type { GameStatus } from "@/types/game";

type RealtimeWithFriendsGameMove = {
  country: string;
  actor: "player1" | "player2";
  createdAt: number;
};

type RealtimeWithFriendsGameSnapshot = {
  id: string;
  roomKey?: string;
  player1UserId: string;
  player2UserId?: string;
  participants: Record<"player1" | "player2", string>;
  status: GameStatus;
  turn: "player1" | "player2";
  start: string;
  country: string;
  availableMoves?: Array<string>;
  usedCountries: Array<string>;
  moves?: Record<string, RealtimeWithFriendsGameMove>;
  createdAt: number;
  updatedAt: number;
};

export type RealtimeWithFriendsGame = Omit<
  RealtimeWithFriendsGameSnapshot,
  "availableMoves" | "moves"
> & {
  availableMoves: Array<string>;
  moves: Record<string, RealtimeWithFriendsGameMove>;
};

const normalizeRealtimeWithFriendsGame = (
  game: RealtimeWithFriendsGameSnapshot,
): RealtimeWithFriendsGame => ({
  ...game,
  availableMoves: game.availableMoves ?? [],
  moves: game.moves ?? {},
});

const useRealtimeWithFriendsGame = (
  gameId: MaybeRefOrGetter<string | null>,
) => {
  const realtimeWithFriendsGame = ref<RealtimeWithFriendsGame | null>(null);
  const realtimeWithFriendsGameError = ref<Error | null>(null);
  const isLoadingRealtimeWithFriendsGame = ref(true);
  let unsubscribe: (() => void) | null = null;

  watch(
    () => toValue(gameId),
    (nextGameId) => {
      unsubscribe?.();
      realtimeWithFriendsGame.value = null;
      realtimeWithFriendsGameError.value = null;

      if (!nextGameId) {
        isLoadingRealtimeWithFriendsGame.value = false;
        return;
      }

      isLoadingRealtimeWithFriendsGame.value = true;
      unsubscribe = onValue(
        databaseRef(getFirebaseDatabase(), `withFriendsGames/${nextGameId}`),
        (snapshot) => {
          if (!snapshot.exists()) {
            realtimeWithFriendsGameError.value = new Error(
              "Realtime with-friends game was not found.",
            );
            realtimeWithFriendsGame.value = null;
            isLoadingRealtimeWithFriendsGame.value = false;
            return;
          }

          realtimeWithFriendsGame.value = normalizeRealtimeWithFriendsGame(
            snapshot.val() as RealtimeWithFriendsGameSnapshot,
          );
          realtimeWithFriendsGameError.value = null;
          isLoadingRealtimeWithFriendsGame.value = false;
        },
        (error) => {
          realtimeWithFriendsGameError.value = error;
          realtimeWithFriendsGame.value = null;
          isLoadingRealtimeWithFriendsGame.value = false;
        },
      );
    },
    { immediate: true },
  );

  onScopeDispose(() => {
    unsubscribe?.();
  });

  return {
    realtimeWithFriendsGame,
    realtimeWithFriendsGameError,
    isLoadingRealtimeWithFriendsGame,
  };
};

export default useRealtimeWithFriendsGame;
