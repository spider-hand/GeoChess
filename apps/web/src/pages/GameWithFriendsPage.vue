<script setup lang="ts">
import confetti from "canvas-confetti";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import { useAuth } from "@/composables/useAuth";
import useRealtimeWithFriendsGame from "@/composables/useRealtimeWithFriendsGame";
import useUserApi from "@/composables/useUserApi";
import useWithFriendsGameQuery from "@/composables/useWithFriendsGameQuery";
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
import type {
  MultiplayerGameMapMarker,
  MultiplayerPathStep,
  MultiplayerTurnStatus,
} from "@/types/game";

defineOptions({
  name: "GameWithFriendsPage",
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { currentUser, isCurrentUserLoaded, userCountry, username } = useAuth();
const { createWithFriendsGame, createWithFriendsGameMove } =
  useWithFriendsGameQuery();
const { getUser } = useUserApi();

const isSubmittingMove = ref(false);
const isStartingNewRoom = ref(false);
const opponentName = ref(t("components.pages.Game.PathHistoryCard.opponent"));
const opponentCountry = ref<string | undefined>(undefined);

const gameId = computed(() =>
  typeof route.params.gameId === "string" ? route.params.gameId : null,
);
const {
  realtimeWithFriendsGame,
  realtimeWithFriendsGameError,
  isLoadingRealtimeWithFriendsGame,
} = useRealtimeWithFriendsGame(gameId);

const currentPlayerRole = computed<"player1" | "player2" | null>(() => {
  const userId = currentUser.value?.uid;

  if (!userId || realtimeWithFriendsGame.value === null) {
    return null;
  }

  if (realtimeWithFriendsGame.value.player1UserId === userId) {
    return "player1";
  }

  if (realtimeWithFriendsGame.value.player2UserId === userId) {
    return "player2";
  }

  return null;
});
const opponentUserId = computed(() => {
  if (
    realtimeWithFriendsGame.value === null ||
    currentPlayerRole.value === null
  ) {
    return null;
  }

  return currentPlayerRole.value === "player1"
    ? (realtimeWithFriendsGame.value.player2UserId ?? null)
    : realtimeWithFriendsGame.value.player1UserId;
});
const isFinished = computed(() => {
  if (realtimeWithFriendsGame.value === null) {
    return false;
  }

  return (
    realtimeWithFriendsGame.value.status === "finished" ||
    realtimeWithFriendsGame.value.availableMoves.length === 0
  );
});
const isPreGame = computed(() => {
  if (realtimeWithFriendsGame.value === null) {
    return false;
  }

  return realtimeWithFriendsGame.value.status !== "active" && !isFinished.value;
});
const turnStatus = computed<MultiplayerTurnStatus>(() => {
  if (
    realtimeWithFriendsGame.value === null ||
    currentPlayerRole.value === null ||
    realtimeWithFriendsGame.value.turn === currentPlayerRole.value
  ) {
    return "player";
  }

  return "opponent";
});
const result = computed<"won" | "lost" | null>(() => {
  if (
    !isFinished.value ||
    currentPlayerRole.value === null ||
    realtimeWithFriendsGame.value === null
  ) {
    return null;
  }

  return realtimeWithFriendsGame.value.turn === currentPlayerRole.value
    ? "lost"
    : "won";
});
const currentTurn = computed(
  () => realtimeWithFriendsGame.value?.usedCountries.length ?? 0,
);
const timerStartedAtMs = computed(
  () => realtimeWithFriendsGame.value?.updatedAt ?? 0,
);
const isMoveSelectionDisabled = computed(
  () => turnStatus.value !== "player" || isSubmittingMove.value,
);

const historySteps = computed<Array<MultiplayerPathStep>>(() => {
  if (
    realtimeWithFriendsGame.value === null ||
    currentPlayerRole.value === null
  ) {
    return [];
  }

  const orderedMoves = Object.entries(realtimeWithFriendsGame.value.moves).sort(
    (left, right) => left[1].createdAt - right[1].createdAt,
  );

  return [
    {
      countryCode: realtimeWithFriendsGame.value.start,
      owner: "neutral" as const,
      turn: 0,
    },
    ...orderedMoves.map(([, move], index) => ({
      countryCode: move.country,
      owner:
        move.actor === currentPlayerRole.value
          ? ("player" as const)
          : ("opponent" as const),
      turn: index + 1,
    })),
  ];
});
const mapMarkers = computed<Array<MultiplayerGameMapMarker>>(() =>
  historySteps.value.map((step) => ({
    countryCode: step.countryCode,
    owner: step.owner,
    label:
      step.owner === "player"
        ? username.value
        : step.owner === "opponent"
          ? opponentName.value
          : t("components.pages.Game.PathResultCard.start"),
  })),
);

watch(
  [
    gameId,
    isCurrentUserLoaded,
    isLoadingRealtimeWithFriendsGame,
    realtimeWithFriendsGame,
    realtimeWithFriendsGameError,
  ],
  async ([
    currentGameId,
    isCurrentUserReady,
    isLoading,
    realtimeGame,
    loadError,
  ]) => {
    if (!currentGameId || !isCurrentUserReady || isLoading) {
      return;
    }

    if (loadError || !realtimeGame) {
      await router.replace("/");
      return;
    }

    if (currentPlayerRole.value === null) {
      await router.replace("/");
    }
  },
  { immediate: true },
);

watch(
  () => realtimeWithFriendsGame.value?.updatedAt,
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

watch(
  opponentUserId,
  async (nextOpponentUserId) => {
    if (nextOpponentUserId === null) {
      opponentName.value = t("components.pages.Game.PathHistoryCard.opponent");
      opponentCountry.value = undefined;
      return;
    }

    try {
      const opponent = await getUser(nextOpponentUserId);
      opponentName.value = opponent.displayName;
      opponentCountry.value = opponent.country;
    } catch (error) {
      console.error(error);
      opponentName.value = t("components.pages.Game.PathHistoryCard.opponent");
      opponentCountry.value = undefined;
    }
  },
  { immediate: true },
);

const handleSelect = async (countryCode: string) => {
  if (
    gameId.value === null ||
    realtimeWithFriendsGame.value === null ||
    isMoveSelectionDisabled.value
  ) {
    return;
  }

  isSubmittingMove.value = true;

  try {
    await createWithFriendsGameMove(gameId.value, { countryCode });
  } catch (error) {
    console.error(error);
    isSubmittingMove.value = false;
  }
};

const handleCreateRoom = async () => {
  if (isStartingNewRoom.value || currentPlayerRole.value !== "player1") {
    return;
  }

  isStartingNewRoom.value = true;

  try {
    const createdGame = await createWithFriendsGame();
    await router.push(`/game/with-friends/${createdGame.id}`);
  } catch (error) {
    console.error(error);
  } finally {
    isStartingNewRoom.value = false;
  }
};

const handleExit = async () => {
  await router.push("/");
};
</script>

<template>
  <main
    v-if="realtimeWithFriendsGame && currentPlayerRole"
    class="game-page"
    :class="{ 'game-page--finished': isFinished }"
  >
    <NavigationHeader />

    <section class="game-page__content">
      <div class="game-page__top-row">
        <div v-if="isPreGame" class="game-page__waiting-banner">
          {{
            t("components.pages.Game.GameWithFriendsPage.waitingForOpponent")
          }}
        </div>
        <PlayerMatchupCard
          v-else
          :player-one="{
            name: username,
            country: userCountry,
          }"
          :player-two="{
            name: opponentName,
            country: opponentCountry,
          }"
        />

        <div class="game-page__status-group">
          <TurnStatusStrip
            v-if="!isPreGame && !isFinished"
            :status="turnStatus"
            :current-turn="currentTurn"
          />
          <ResultBadge v-else-if="result" :result="result" />
          <CountdownTimer
            v-if="!isPreGame && !isFinished"
            :started-at-ms="timerStartedAtMs"
          />
        </div>
      </div>

      <div
        class="game-page__map-card-row"
        :class="{
          'game-page__map-card-row--fill-remaining': isFinished,
        }"
      >
        <GameMap
          class="game-page__map"
          :is-finished="isFinished"
          :markers="mapMarkers"
        />
        <AvailableMovesCard
          v-if="!isFinished"
          :available-moves="realtimeWithFriendsGame.availableMoves"
          :is-ai-turn="turnStatus === 'opponent'"
          :is-selecting="isSubmittingMove"
          :is-select-disabled="isMoveSelectionDisabled"
          @select="handleSelect"
        />
        <PathResultCard v-else :result-steps="historySteps" />
      </div>

      <PathHistoryCard
        v-if="!isPreGame && !isFinished"
        :history-steps="historySteps"
      />
      <div v-else class="game-page__finished-actions">
        <Button
          v-if="currentPlayerRole === 'player1'"
          :loading="isStartingNewRoom"
          @click="handleCreateRoom"
        >
          {{ t("components.pages.Game.GameWithFriendsPage.createRoom") }}
        </Button>
        <Button variant="secondary" @click="handleExit">
          {{ t("components.pages.Game.GameWithFriendsPage.exit") }}
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

.game-page__waiting-banner {
  display: flex;
  align-items: center;
  min-height: 72px;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: var(--font-size-title-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-title-sm);
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
