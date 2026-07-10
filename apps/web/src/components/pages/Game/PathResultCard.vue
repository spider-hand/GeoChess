<script setup lang="ts">
import { History } from "@lucide/vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { PathStep } from "@/types/game";
import { countryFlagSrc } from "@/utils/game";

defineOptions({
  name: "GamePathResultCard",
});

const props = defineProps<{
  resultSteps: Array<PathStep>;
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

const turnLabel = (turn: number) =>
  turn === 0
    ? t("components.pages.Game.PathResultCard.start")
    : t("components.pages.Game.PathResultCard.turn", {
        turn,
      });
</script>

<template>
  <section class="path-result-card">
    <div class="path-result-card__header">
      <div class="path-result-card__title">
        <History class="path-result-card__title-icon" :size="20" />
        <h2 class="path-result-card__title-label">
          {{ t("components.pages.Game.PathHistoryCard.title") }}
        </h2>
      </div>

      <div
        class="path-result-card__legend"
        :aria-label="t('components.pages.Game.PathHistoryCard.legendLabel')"
      >
        <span
          v-for="item in legendItems"
          :key="item.key"
          class="path-result-card__legend-badge"
          :class="`path-result-card__legend-badge--${item.owner}`"
        >
          {{ item.label }}
        </span>
      </div>
    </div>

    <div class="path-result-card__body" role="list">
      <div
        v-for="(step, index) in props.resultSteps"
        :key="step.turn"
        class="path-result-card__row"
        role="listitem"
      >
        <div class="path-result-card__rail" aria-hidden="true">
          <span
            class="path-result-card__marker"
            :class="{
              'path-result-card__marker--player': step.owner === 'player',
              'path-result-card__marker--ai': step.owner === 'ai',
              'path-result-card__marker--neutral': step.owner === 'neutral',
            }"
          />
          <span
            v-if="index < props.resultSteps.length - 1"
            class="path-result-card__line"
            data-testid="path-result-card-line"
          />
        </div>

        <article
          class="path-result-card__step"
          :class="{
            'path-result-card__step--player': step.owner === 'player',
            'path-result-card__step--ai': step.owner === 'ai',
            'path-result-card__step--neutral': step.owner === 'neutral',
          }"
        >
          <span class="path-result-card__turn">
            {{ turnLabel(step.turn) }}
          </span>

          <div class="path-result-card__country">
            <img
              class="path-result-card__flag"
              :src="countryFlagSrc(step.countryCode)"
              :alt="`${step.countryCode} flag`"
              width="24"
              height="18"
            />
            <span class="path-result-card__country-name">
              {{ step.countryCode }}
            </span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.path-result-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: min(100%, 360px);
  min-height: 320px;
  padding: var(--spacing-lg);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-xl);
  background-color: var(--surface-card-dark);
  color: var(--on-dark);
  overflow: hidden;
}

.path-result-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.path-result-card__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.path-result-card__title-icon {
  flex-shrink: 0;
}

.path-result-card__title-label {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--font-size-title-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-md);
  color: var(--on-dark);
}

.path-result-card__legend {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.path-result-card__legend-badge {
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

.path-result-card__legend-badge--player {
  background-color: var(--primary);
  color: var(--on-primary);
}

.path-result-card__legend-badge--ai {
  background-color: var(--surface-elevated-dark);
  color: var(--on-dark);
}

.path-result-card__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: var(--spacing-sm);
  min-height: 0;
  overflow-y: auto;
  padding-right: var(--spacing-xs);
}

.path-result-card__row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: stretch;
  gap: var(--spacing-sm);
}

.path-result-card__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 16px;
}

.path-result-card__marker {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background-color: var(--surface-elevated-dark);
  border: 1px solid var(--hairline);
}

.path-result-card__marker--player {
  background-color: var(--primary);
  border-color: var(--primary);
}

.path-result-card__marker--ai {
  background-color: var(--surface-elevated-dark);
}

.path-result-card__line {
  flex: 1;
  width: 1px;
  margin-top: var(--spacing-xs);
  background-color: var(--hairline);
}

.path-result-card__step {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
  padding: var(--spacing-md);
  border-radius: var(--radius-token-lg);
}

.path-result-card__step--neutral {
  background-color: var(--surface-elevated-dark);
}

.path-result-card__step--player {
  background-color: color-mix(in srgb, var(--primary) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--primary) 45%, transparent);
}

.path-result-card__step--ai {
  background-color: color-mix(
    in srgb,
    var(--surface-elevated-dark) 85%,
    transparent
  );
  border: 1px solid var(--hairline);
}

.path-result-card__turn {
  color: var(--muted);
  font-family: var(--font-body);
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-copy);
}

.path-result-card__country {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
}

.path-result-card__flag {
  flex-shrink: 0;
  border-radius: 2px;
  object-fit: cover;
}

.path-result-card__country-name {
  font-family: var(--font-body);
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-copy);
}

@media (max-width: 640px) {
  .path-result-card {
    width: 100%;
  }

  .path-result-card__header {
    flex-direction: column;
    align-items: stretch;
  }

  .path-result-card__legend {
    flex-wrap: wrap;
  }
}
</style>
