<script setup lang="ts">
import { computed } from "vue";

import AvailableMovesCard from "@/components/pages/Game/AvailableMovesCard.vue";
import CountdownTimer from "@/components/pages/Game/CountdownTimer.vue";
import GameMap from "@/components/pages/Game/GameMap.vue";
import PathHistoryCard from "@/components/pages/Game/PathHistoryCard.vue";
import PathResultCard from "@/components/pages/Game/PathResultCard.vue";
import PlayerMatchupCard from "@/components/pages/Game/PlayerMatchupCard.vue";
import TurnStatusStrip from "@/components/pages/Game/TurnStatusStrip.vue";
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

const turnStatus = computed<MultiplayerTurnStatus>(() => "opponent");
const historySteps = computed<Array<MultiplayerPathStep>>(() => [
  { countryCode: "bb", owner: "neutral", turn: 0 },
  { countryCode: "jp", owner: "player", turn: 1 },
  { countryCode: "kr", owner: "opponent", turn: 2 },
]);
const finishedMarkers = computed<Array<MultiplayerGameMapMarker>>(() => [
  { countryCode: "BB", owner: "neutral", label: "Start" },
  { countryCode: "JP", owner: "player", label: "Player" },
  { countryCode: "KR", owner: "opponent", label: "Opponent" },
]);
</script>

<template>
  <main class="game-page">
    <NavigationHeader />

    <section class="game-page__content">
      <TurnStatusStrip :status="turnStatus" :current-turn="3" />
      <CountdownTimer :started-at-ms="Date.now()" />

      <div class="game-page__map-card-row">
        <GameMap class="game-page__map" :is-finished="false" :markers="[]" />
        <AvailableMovesCard
          :available-moves="['us', 'jp']"
          :is-ai-turn="false"
          :is-selecting="false"
          :is-select-disabled="false"
        />
      </div>

      <PathHistoryCard :history-steps="historySteps" />

      <div class="game-page__map-card-row">
        <GameMap
          class="game-page__map"
          :is-finished="true"
          :markers="finishedMarkers"
        />
        <PathResultCard :result-steps="historySteps" />
      </div>

      <PlayerMatchupCard
        :player-one="{ name: 'Player', country: 'JP' }"
        :player-two="{ name: 'Opponent', country: 'KR' }"
      />
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
