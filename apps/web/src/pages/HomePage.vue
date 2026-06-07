<script setup lang="ts">
import PlayVsAiCard from "@/components/pages/Home/PlayVsAiCard.vue";
import NavigationHeader from "@/components/shared/NavigationHeader.vue";
</script>

<template>
  <main class="home-page">
    <NavigationHeader />

    <section class="home-page__content">
      <PlayVsAiCard />
    </section>
  </main>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at top,
      color-mix(in srgb, var(--primary) 14%, transparent),
      transparent 28%
    ),
    var(--canvas-dark);
}

.home-page__content {
  padding: var(--spacing-xl);
}
</style>
