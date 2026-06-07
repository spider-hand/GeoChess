<script setup lang="ts">
import AvailableMovesCard from "@/components/pages/Game/AvailableMovesCard.vue";
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
      <AvailableMovesCard />
    </section>

    <NavigationFooter />
  </main>
</template>

<style scoped>
.game-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background:
    radial-gradient(
      circle at top,
      color-mix(in srgb, var(--primary) 14%, transparent),
      transparent 28%
    ),
    var(--canvas-dark);
}

.game-page__content {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: var(--spacing-xl);
}
</style>
