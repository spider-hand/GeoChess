<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import useAiGameQuery from "@/composables/useAiGameQuery";
import { useAuth } from "@/composables/useAuth";
import useRealtimeAiGame from "@/composables/useRealtimeAiGame";
import AvailableMovesCard from "@/components/pages/Game/AvailableMovesCard.vue";
import CountdownTimer from "@/components/pages/Game/CountdownTimer.vue";
import GameMap from "@/components/pages/Game/GameMap.vue";
import PathHistoryCard from "@/components/pages/Game/PathHistoryCard.vue";
import PathResultCard from "@/components/pages/Game/PathResultCard.vue";
import PlayerMatchupCard from "@/components/pages/Game/PlayerMatchupCard.vue";
import TurnStatusStrip from "@/components/pages/Game/TurnStatusStrip.vue";
import NavigationFooter from "@/components/shared/NavigationFooter.vue";
import NavigationHeader from "@/components/shared/NavigationHeader.vue";
import type { PathStep, TurnStatus } from "@/types/game";

defineOptions({
  name: "GameVsAiPage",
});

const PLAYER_TURN_TIMEOUT_MS = 60_000;
const PLAYER_TURN_TIMEOUT_BUFFER_MS = 500;

const route = useRoute();
const router = useRouter();
const aiGameQuery = useAiGameQuery();
const createAiGameMove = aiGameQuery.createAiGameMove;
const timeoutAiGame = aiGameQuery.timeoutAiGame;
const { username } = useAuth();
const gameId = computed(() =>
  typeof route.params.gameId === "string" ? route.params.gameId : null,
);
const { realtimeAiGame, realtimeAiGameError, isLoadingRealtimeAiGame } =
  useRealtimeAiGame(gameId);

const isSubmittingMove = ref(false);
const isSubmittingTimeout = ref(false);
const timeoutRequestKey = ref<string | null>(null);

const pageState = computed<TurnStatus>(() => {
  if (realtimeAiGame.value === null) {
    return "player";
  }

  if (realtimeAiGame.value.availableMoves.length === 0) {
    return realtimeAiGame.value.turn === "player" ? "lost" : "won";
  }

  return realtimeAiGame.value.turn === "player" ? "player" : "ai";
});

const currentTurn = computed(
  () => realtimeAiGame.value?.usedCountries.length ?? 0,
);
const isFinished = computed(
  () => pageState.value === "won" || pageState.value === "lost",
);
const timerMode = computed(() =>
  pageState.value === "player" ? "countdown" : "elapsed",
);
const isMoveSelectionDisabled = computed(
  () =>
    pageState.value !== "player" ||
    isSubmittingMove.value ||
    isSubmittingTimeout.value,
);
const timerStartedAtMs = computed(() => realtimeAiGame.value?.updatedAt ?? 0);
const timeoutWindowKey = computed(() =>
  realtimeAiGame.value === null
    ? null
    : `${realtimeAiGame.value.id}:${realtimeAiGame.value.updatedAt}`,
);

const historySteps = computed<Array<PathStep>>(() => {
  if (realtimeAiGame.value === null) {
    return [];
  }

  const steps: Array<PathStep> = [
    {
      countryCode: realtimeAiGame.value.start,
      owner: "neutral" as const,
      turn: 1,
    },
  ];
  const orderedMoves = Object.entries(realtimeAiGame.value.moves).sort(
    (left, right) => left[1].createdAt - right[1].createdAt,
  );

  steps.push(
    ...orderedMoves.map(([, move], index) => ({
      countryCode: move.country,
      owner: move.actor === "player" ? ("player" as const) : ("ai" as const),
      turn: index + 2,
    })),
  );

  return steps;
});

// Leave the page when the realtime game could not be loaded.
watch(
  [gameId, isLoadingRealtimeAiGame, realtimeAiGame, realtimeAiGameError],
  ([currentGameId, isLoading, gameSession, loadError]) => {
    if (isLoading) {
      return;
    }

    if (!currentGameId || loadError || !gameSession) {
      void router.replace("/");
    }
  },
  { immediate: true },
);

// Reset the timeout request lock after the realtime node moves to a new turn.
watch(
  timeoutWindowKey,
  (nextTimeoutWindowKey) => {
    if (nextTimeoutWindowKey !== timeoutRequestKey.value) {
      isSubmittingTimeout.value = false;
    }
  },
  { immediate: true },
);

// Reset the move request lock after any realtime game update arrives.
watch(
  () => realtimeAiGame.value?.updatedAt,
  () => {
    isSubmittingMove.value = false;
  },
);

const handleSelect = async (countryCode: string) => {
  if (
    gameId.value === null ||
    realtimeAiGame.value === null ||
    isMoveSelectionDisabled.value
  ) {
    return;
  }

  isSubmittingMove.value = true;

  try {
    await createAiGameMove(gameId.value, {
      countryCode,
    });
  } catch (error) {
    console.error(error);
    isSubmittingMove.value = false;
  }
};

const handleTimeUp = async () => {
  if (
    gameId.value === null ||
    realtimeAiGame.value === null ||
    pageState.value !== "player"
  ) {
    return;
  }

  const nextTimeoutWindowKey = timeoutWindowKey.value;
  if (
    nextTimeoutWindowKey === null ||
    timeoutRequestKey.value === nextTimeoutWindowKey ||
    isSubmittingTimeout.value
  ) {
    return;
  }

  timeoutRequestKey.value = nextTimeoutWindowKey;
  isSubmittingTimeout.value = true;

  try {
    await timeoutAiGame(gameId.value);
  } catch (error) {
    console.error(error);
    isSubmittingTimeout.value = false;
  }
};
</script>

<template>
  <main
    v-if="realtimeAiGame"
    class="game-page"
    :class="{ 'game-page--finished': isFinished }"
  >
    <NavigationHeader />

    <section class="game-page__content">
      <div class="game-page__top-row">
        <PlayerMatchupCard :player-name="username" />

        <div class="game-page__status-group">
          <TurnStatusStrip :status="pageState" :current-turn="currentTurn" />
          <CountdownTimer
            v-if="!isFinished"
            :mode="timerMode"
            :started-at-ms="timerStartedAtMs"
            :duration-ms="PLAYER_TURN_TIMEOUT_MS"
            :buffer-ms="PLAYER_TURN_TIMEOUT_BUFFER_MS"
            @time-up="handleTimeUp"
          />
        </div>
      </div>

      <div
        class="game-page__map-card-row"
        :class="{
          'game-page__map-card-row--fill-remaining': isFinished,
        }"
      >
        <GameMap class="game-page__map" :show-place-labels="isFinished" />
        <AvailableMovesCard
          v-if="!isFinished"
          :available-moves="realtimeAiGame.availableMoves"
          :is-ai-turn="pageState === 'ai'"
          :is-selecting="isSubmittingMove"
          :is-select-disabled="isMoveSelectionDisabled"
          @select="handleSelect"
        />
        <PathResultCard v-else :result-steps="historySteps" />
      </div>

      <PathHistoryCard v-if="!isFinished" :history-steps="historySteps" />
    </section>

    <NavigationFooter />
  </main>
</template>

<style scoped>
.game-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--on-primary);
}

.game-page--finished {
  height: 100vh;
  overflow: hidden;
}

.game-page__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  gap: var(--spacing-xl);
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.game-page__top-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--spacing-lg);
  width: 100%;
}

.game-page__status-group {
  display: inline-flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  flex-wrap: nowrap;
  min-width: 0;
}

.game-page__map-card-row {
  display: flex;
  align-items: stretch;
  gap: var(--spacing-xl);
  width: 100%;
}

.game-page__map-card-row--fill-remaining {
  flex: 1;
  min-height: 0;
}

.game-page__map {
  flex: 1 1 0;
  min-width: 0;
}

@media (max-width: 960px) {
  .game-page__map-card-row {
    flex-direction: column;
  }
}

@media (max-width: 720px) {
  .game-page__content {
    padding: var(--spacing-lg);
  }

  .game-page__top-row {
    flex-wrap: wrap;
  }

  .game-page__status-group {
    margin-left: auto;
  }
}

@media (max-width: 480px) {
  .game-page__status-group {
    gap: var(--spacing-xs);
  }
}
</style>
