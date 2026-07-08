<script setup lang="ts">
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
  name: "GameWithFriendsPage",
});
</script>

<template>
  <main class="game-page">
    <NavigationHeader />

    <section class="game-page__content">
      <TurnStatusStrip status="player" :current-turn="3" />
      <CountdownTimer mode="countdown" :started-at-ms="Date.now()" />

      <div class="game-page__map-card-row">
        <GameMap class="game-page__map" :show-place-labels="false" />
        <AvailableMovesCard
          :available-moves="['us', 'jp']"
          :is-ai-turn="false"
          :is-selecting="false"
          :is-select-disabled="false"
        />
      </div>

      <PathHistoryCard :history-steps="[]" />

      <div class="game-page__map-card-row">
        <GameMap class="game-page__map" :show-place-labels="true" />
        <PathResultCard :result-steps="[]" />
      </div>

      <PlayerMatchupCard player-name="Player" />
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
