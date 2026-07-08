<script setup lang="ts">
import { History } from "@lucide/vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { PathStep } from "@/types/game";
import { countryFlagSrc } from "@/utils/game";

defineOptions({
  name: "GamePathHistoryCard",
});

const props = defineProps<{
  historySteps: Array<PathStep>;
}>();

const { t } = useI18n();

const legendItems = computed(() => [
  {
    key: "player",
    label: t("components.pages.Game.PathHistoryCard.you"),
    owner: "player" as const,
  },
  {
    key: "ai",
    label: t("components.pages.Game.PathHistoryCard.ai"),
    owner: "ai" as const,
  },
]);
</script>

<template>
  <section class="path-history-card">
    <div class="path-history-card__header">
      <div class="path-history-card__title">
        <History class="path-history-card__title-icon" :size="20" />
        <h2 class="path-history-card__title-label">
          {{ t("components.pages.Game.PathHistoryCard.title") }}
        </h2>
      </div>

      <div
        class="path-history-card__legend"
        :aria-label="t('components.pages.Game.PathHistoryCard.legendLabel')"
      >
        <span
          v-for="item in legendItems"
          :key="item.key"
          class="path-history-card__legend-badge"
          :class="`path-history-card__legend-badge--${item.owner}`"
        >
          {{ item.label }}
        </span>
      </div>
    </div>

    <div class="path-history-card__body" role="list">
      <template v-for="(step, index) in props.historySteps" :key="step.turn">
        <div
          class="path-history-card__step"
          :class="{
            'path-history-card__step--player': step.owner === 'player',
            'path-history-card__step--ai': step.owner === 'ai',
            'path-history-card__step--neutral': step.owner === 'neutral',
          }"
          role="listitem"
        >
          <span class="path-history-card__turn">TURN {{ step.turn }}</span>
          <img
            class="path-history-card__flag"
            :src="countryFlagSrc(step.countryCode)"
            :alt="`${step.countryCode} flag`"
            width="24"
            height="18"
          />
          <span class="path-history-card__country-code">{{
            step.countryCode
          }}</span>
        </div>

        <div
          v-if="index < props.historySteps.length - 1"
          class="path-history-card__connector"
          aria-hidden="true"
          data-testid="path-history-card-connector"
        />
      </template>
    </div>
  </section>
</template>

<style scoped>
.path-history-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;
  padding: var(--spacing-lg);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-xl);
  background-color: var(--surface-card-dark);
  color: var(--on-dark);
}

.path-history-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.path-history-card__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.path-history-card__title-icon {
  flex-shrink: 0;
}

.path-history-card__title-label {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--font-size-title-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-md);
  color: var(--on-dark);
}

.path-history-card__legend {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.path-history-card__legend-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 6px 12px;
  border-radius: var(--radius-token-pill);
  font-family: var(--font-body);
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-copy);
}

.path-history-card__legend-badge--player {
  background-color: var(--primary);
  color: var(--on-primary);
}

.path-history-card__legend-badge--ai {
  background-color: var(--surface-elevated-dark);
  color: var(--on-dark);
}

.path-history-card__body {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  overflow-x: auto;
  padding-bottom: var(--spacing-xs);
}

.path-history-card__step {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 0 0 auto;
  min-height: 52px;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-token-lg);
  color: var(--on-dark);
}

.path-history-card__step--neutral {
  background-color: var(--surface-elevated-dark);
}

.path-history-card__step--player {
  background-color: color-mix(in srgb, var(--primary) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--primary) 45%, transparent);
}

.path-history-card__step--ai {
  background-color: color-mix(
    in srgb,
    var(--surface-elevated-dark) 85%,
    transparent
  );
  border: 1px solid var(--hairline);
}

.path-history-card__turn {
  color: var(--muted);
  font-family: var(--font-body);
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-copy);
}

.path-history-card__flag {
  flex-shrink: 0;
  border-radius: 2px;
  object-fit: cover;
}

.path-history-card__country-code {
  font-family: var(--font-body);
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-copy);
}

.path-history-card__connector {
  flex: 0 0 24px;
  height: 1px;
  background-color: var(--hairline);
}

@media (max-width: 640px) {
  .path-history-card__header {
    flex-direction: column;
    align-items: stretch;
  }

  .path-history-card__legend {
    flex-wrap: wrap;
  }
}
</style>
