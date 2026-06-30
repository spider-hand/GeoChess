<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

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

defineOptions({
  name: "GameVsAiPage",
});

const route = useRoute();
const router = useRouter();
const gameId = computed(() =>
  typeof route.params.gameId === "string" ? route.params.gameId : null,
);
const { realtimeAiGame, realtimeAiGameError, isLoadingRealtimeAiGame } =
  useRealtimeAiGame(gameId);

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
</script>

<template>
  <main v-if="realtimeAiGame" class="game-page">
    <NavigationHeader />

    <section class="game-page__content">
      <TurnStatusStrip :current-turn="10" :is-your-turn="true" />
      <CountdownTimer />

      <div class="game-page__map-card-row">
        <GameMap class="game-page__map" />
        <AvailableMovesCard />
      </div>

      <PathHistoryCard />

      <div class="game-page__map-card-row">
        <GameMap class="game-page__map" />
        <PathResultCard />
      </div>

      <PlayerMatchupCard />
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

.game-page__content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: center;
  gap: var(--spacing-xl);
  padding: var(--spacing-xl);
}

.game-page__map-card-row {
  display: flex;
  align-items: stretch;
  gap: var(--spacing-xl);
  width: min(100%, 1120px);
}

.game-page__map {
  flex: 1 1 0;
  min-width: 0;
  min-height: 320px;
}

@media (max-width: 960px) {
  .game-page__map-card-row {
    flex-direction: column;
  }
}
</style>
