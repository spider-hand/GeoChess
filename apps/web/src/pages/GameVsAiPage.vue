<script setup lang="ts">
import confetti from "canvas-confetti";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
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
import ResultBadge from "@/components/pages/Game/ResultBadge.vue";
import TurnStatusStrip from "@/components/pages/Game/TurnStatusStrip.vue";
import Button from "@/components/shared/Button.vue";
import NavigationFooter from "@/components/shared/NavigationFooter.vue";
import NavigationHeader from "@/components/shared/NavigationHeader.vue";
import type { PathStep, TurnStatus } from "@/types/game";

defineOptions({
  name: "GameVsAiPage",
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const aiGameQuery = useAiGameQuery();
const createAiGame = aiGameQuery.createAiGame;
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
const isStartingNewGame = ref(false);
const timeoutRequestKey = ref<string | null>(null);

const isFinished = computed(() => {
  if (realtimeAiGame.value === null) {
    return false;
  }

  if (realtimeAiGame.value.availableMoves.length === 0) {
    return true;
  }

  return false;
});
const turnStatus = computed<TurnStatus>(() =>
  realtimeAiGame.value?.turn === "ai" ? "ai" : "player",
);
const result = computed<"won" | "lost" | null>(() => {
  if (!isFinished.value || realtimeAiGame.value === null) {
    return null;
  }

  return realtimeAiGame.value.turn === "player" ? "lost" : "won";
});
const currentTurn = computed(
  () => realtimeAiGame.value?.usedCountries.length ?? 0,
);
const isMoveSelectionDisabled = computed(
  () =>
    turnStatus.value !== "player" ||
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

  const orderedMoves = Object.entries(realtimeAiGame.value.moves).sort(
    (left, right) => left[1].createdAt - right[1].createdAt,
  );

  return [
    {
      countryCode: realtimeAiGame.value.start,
      owner: "neutral" as const,
      turn: 0,
    },
    ...orderedMoves.map(([, move], index) => ({
      countryCode: move.country,
      owner: move.actor === "player" ? ("player" as const) : ("ai" as const),
      turn: index + 1,
    })),
  ];
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

watch(
  result,
  (nextResult) => {
    if (nextResult !== "won") {
      return;
    }

    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
    });
  },
  { immediate: true },
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
    turnStatus.value !== "player" ||
    isFinished.value
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

const handlePlayAgain = async () => {
  if (
    realtimeAiGame.value === null ||
    isStartingNewGame.value ||
    !isFinished.value
  ) {
    return;
  }

  isStartingNewGame.value = true;

  try {
    const aiGame = await createAiGame({
      difficulty: realtimeAiGame.value.difficulty,
    });
    await router.push(`/game/vs-ai/${aiGame.id}`);
  } catch (error) {
    console.error(error);
  } finally {
    isStartingNewGame.value = false;
  }
};

const handleExit = async () => {
  await router.push("/");
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
          <TurnStatusStrip
            v-if="!isFinished"
            :status="turnStatus"
            :current-turn="currentTurn"
          />
          <ResultBadge v-else-if="result" :result="result" />
          <CountdownTimer
            v-if="!isFinished"
            :started-at-ms="timerStartedAtMs"
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
          :is-ai-turn="turnStatus === 'ai'"
          :is-selecting="isSubmittingMove"
          :is-select-disabled="isMoveSelectionDisabled"
          @select="handleSelect"
        />
        <PathResultCard v-else :result-steps="historySteps" />
      </div>

      <PathHistoryCard v-if="!isFinished" :history-steps="historySteps" />
      <div v-else class="game-page__finished-actions">
        <Button :loading="isStartingNewGame" @click="handlePlayAgain">
          {{ t("components.pages.Game.GameVsAiPage.playAgain") }}
        </Button>
        <Button variant="secondary" @click="handleExit">
          {{ t("components.pages.Game.GameVsAiPage.exit") }}
        </Button>
      </div>
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

.game-page__finished-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  width: 100%;
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
  .game-page__finished-actions {
    flex-direction: column;
  }

  .game-page__finished-actions :deep(.button) {
    width: 100%;
  }

  .game-page__status-group {
    gap: var(--spacing-xs);
  }
}
</style>
