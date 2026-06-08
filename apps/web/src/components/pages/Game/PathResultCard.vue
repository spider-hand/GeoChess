<script setup lang="ts">
import { History } from "@lucide/vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

type StepOwner = "you" | "opponent";

type ResultStep = {
  countryCode: string;
  countryNameKey: string;
  owner: StepOwner;
  turn: number;
};

defineOptions({
  name: "GamePathResultCard",
});

const RESULT_STEPS: ResultStep[] = [
  {
    countryCode: "us",
    countryNameKey: "components.pages.Game.PathResultCard.countries.us",
    owner: "you",
    turn: 1,
  },
  {
    countryCode: "jp",
    countryNameKey: "components.pages.Game.PathResultCard.countries.jp",
    owner: "opponent",
    turn: 2,
  },
  {
    countryCode: "fr",
    countryNameKey: "components.pages.Game.PathResultCard.countries.fr",
    owner: "you",
    turn: 3,
  },
  {
    countryCode: "br",
    countryNameKey: "components.pages.Game.PathResultCard.countries.br",
    owner: "opponent",
    turn: 4,
  },
  {
    countryCode: "de",
    countryNameKey: "components.pages.Game.PathResultCard.countries.de",
    owner: "you",
    turn: 5,
  },
  {
    countryCode: "ca",
    countryNameKey: "components.pages.Game.PathResultCard.countries.ca",
    owner: "opponent",
    turn: 6,
  },
];

const { t } = useI18n();

const legendItems = computed(() => [
  {
    key: "you",
    label: t("components.pages.Game.PathHistoryCard.you"),
    owner: "you" as const,
  },
  {
    key: "opponent",
    label: t("components.pages.Game.PathHistoryCard.opponent"),
    owner: "opponent" as const,
  },
]);

function stepFlagSrc(countryCode: string) {
  return `/flags/${countryCode}.webp`;
}
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
        v-for="(step, index) in RESULT_STEPS"
        :key="step.turn"
        class="path-result-card__row"
        role="listitem"
      >
        <div class="path-result-card__rail" aria-hidden="true">
          <span
            class="path-result-card__marker"
            :class="`path-result-card__marker--${step.owner}`"
            :data-testid="`path-result-card-marker-${step.owner}`"
          />
          <span
            v-if="index < RESULT_STEPS.length - 1"
            class="path-result-card__line"
            :class="{ 'path-result-card__line--you': step.owner === 'you' }"
            data-testid="path-result-card-line"
          />
        </div>

        <article
          class="path-result-card__step"
          :class="`path-result-card__step--${step.owner}`"
          :data-testid="`path-result-card-step-${step.owner}`"
        >
          <span class="path-result-card__turn">
            {{
              t("components.pages.Game.PathResultCard.turn", {
                turn: step.turn,
              })
            }}
          </span>

          <div class="path-result-card__country">
            <img
              class="path-result-card__flag"
              :src="stepFlagSrc(step.countryCode)"
              :alt="`${t(step.countryNameKey)} flag`"
              width="24"
              height="18"
            />
            <span class="path-result-card__country-name">
              {{ t(step.countryNameKey) }}
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
  width: min(100%, 440px);
  padding: var(--spacing-lg);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-xl);
  background-color: var(--surface-card-dark);
  color: var(--on-dark);
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

.path-result-card__legend-badge--you {
  background-color: var(--primary);
  color: var(--on-primary);
}

.path-result-card__legend-badge--opponent {
  background-color: var(--surface-elevated-dark);
  color: var(--on-dark);
}

.path-result-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-height: 360px;
  max-height: 360px;
  overflow-y: auto;
  padding-right: var(--spacing-xs);
}

.path-result-card__row {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  align-items: stretch;
  gap: var(--spacing-sm);
}

.path-result-card__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
}

.path-result-card__marker {
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-radius: var(--radius-token-full);
  flex-shrink: 0;
}

.path-result-card__marker--you {
  border-color: var(--primary);
  background-color: var(--primary);
}

.path-result-card__marker--opponent {
  border-color: var(--hairline);
  background-color: var(--surface-elevated-dark);
}

.path-result-card__line {
  width: 1px;
  flex: 1;
  margin-top: var(--spacing-xxs);
  background-color: var(--hairline);
}

.path-result-card__line--you {
  background-color: var(--primary);
}

.path-result-card__step {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: var(--spacing-xs);
  min-height: 64px;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid transparent;
  border-radius: var(--radius-token-lg);
  background-color: var(--surface-elevated-dark);
  text-align: left;
}

.path-result-card__step--you {
  border-color: color-mix(in srgb, var(--primary) 34%, transparent);
}

.path-result-card__step--opponent {
  border-color: var(--hairline);
}

.path-result-card__turn {
  color: var(--muted);
  font-family: var(--font-body);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-copy);
}

.path-result-card__country {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.path-result-card__flag {
  width: 24px;
  height: 18px;
  border-radius: var(--radius-token-xs);
  object-fit: cover;
}

.path-result-card__country-name {
  color: var(--on-dark);
  font-family: var(--font-body);
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-body);
}

@media (max-width: 640px) {
  .path-result-card {
    padding: var(--spacing-md);
  }

  .path-result-card__header {
    flex-direction: column;
    align-items: stretch;
  }

  .path-result-card__legend {
    justify-content: flex-end;
  }
}
</style>
