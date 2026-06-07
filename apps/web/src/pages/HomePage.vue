<script setup lang="ts">
import PlayVsAiCard from "@/components/pages/Home/PlayVsAiCard.vue";
import PlayWithFriendsCard from "@/components/pages/Home/PlayWithFriendsCard.vue";
import RandomMatchCard from "@/components/pages/Home/RandomMatchCard.vue";
import NavigationFooter from "@/components/shared/NavigationFooter.vue";
import NavigationHeader from "@/components/shared/NavigationHeader.vue";
</script>

<template>
  <main class="home-page">
    <NavigationHeader />

    <section class="home-page__content">
      <PlayVsAiCard />
      <PlayWithFriendsCard />
      <RandomMatchCard :online-players="40" />
    </section>

    <NavigationFooter />
  </main>
</template>

<style scoped>
.home-page {
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

.home-page__content {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 440px));
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
}
</style>
