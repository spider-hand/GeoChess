<script setup lang="ts">
import AvailableMovesCard from "@/components/pages/Game/AvailableMovesCard.vue";
import PathHistoryCard from "@/components/pages/Game/PathHistoryCard.vue";
import PlayerMatchupCard from "@/components/pages/Game/PlayerMatchupCard.vue";
import TurnStatusStrip from "@/components/pages/Game/TurnStatusStrip.vue";
import NavigationFooter from "@/components/shared/NavigationFooter.vue";
import NavigationHeader from "@/components/shared/NavigationHeader.vue";

defineOptions({
  name: "GameRandomMatchPage",
});
</script>

<template>
  <main class="game-page">
    <NavigationHeader />

    <section class="game-page__content">
      <TurnStatusStrip :current-turn="10" :is-your-turn="true" />
      <AvailableMovesCard />
      <PathHistoryCard />
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
</style>
