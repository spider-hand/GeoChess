<script setup lang="ts">
import { useI18n } from "vue-i18n";

import NavigationFooter from "@/components/shared/NavigationFooter.vue";
import NavigationHeader from "@/components/shared/NavigationHeader.vue";

defineOptions({
  name: "GameVsAiPage",
});

const { t } = useI18n();
</script>

<template>
  <main class="game-page">
    <NavigationHeader />

    <section class="game-page__content">
      <h1 class="game-page__title">
        {{ t("pages.GameVsAiPage.title") }}
      </h1>
      <p class="game-page__description">
        {{ t("pages.GameVsAiPage.placeholder") }}
      </p>
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  text-align: center;
}

.game-page__title {
  margin: 0;
  color: var(--on-dark);
  font-family: var(--font-body);
  font-size: var(--font-size-title-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-lg);
}

.game-page__description {
  margin: 0;
  max-width: 32rem;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-body);
}
</style>
