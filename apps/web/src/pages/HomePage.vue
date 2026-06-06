<script setup lang="ts">
import NavigationHeader from "@/components/shared/NavigationHeader.vue";
</script>

<template>
  <main class="home-page">
    <NavigationHeader />
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
</style>
