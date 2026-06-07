<script setup lang="ts">
import { History } from "@lucide/vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

type StepOwner = "you" | "opponent";

type HistoryStep = {
  countryCode: string;
  owner: StepOwner;
  turn: number;
};

type DisplayStep =
  | (HistoryStep & { kind: "history" })
  | { kind: "ellipsis" }
  | { kind: "current"; turn: number };

defineOptions({
  name: "GamePathHistoryCard",
});

const DEFAULT_HISTORY_STEPS: HistoryStep[] = [
  { countryCode: "us", owner: "you", turn: 1 },
  { countryCode: "jp", owner: "opponent", turn: 2 },
  { countryCode: "fr", owner: "you", turn: 3 },
  { countryCode: "br", owner: "opponent", turn: 4 },
  { countryCode: "de", owner: "you", turn: 5 },
];

const props = withDefaults(
  defineProps<{
    currentTurn?: number;
    historySteps?: HistoryStep[];
  }>(),
  {
    currentTurn: 6,
  },
);

const { t } = useI18n();
const historySteps = computed(
  () => props.historySteps ?? DEFAULT_HISTORY_STEPS,
);

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

const displaySteps = computed<DisplayStep[]>(() => {
  const steps: DisplayStep[] = [];
  const previousTurn = props.currentTurn - 1;
  const firstVisibleTurn = Math.min(3, previousTurn);
  const previousStep =
    historySteps.value.find((step) => step.turn === previousTurn) ?? null;

  steps.push(
    ...historySteps.value
      .filter((step) => step.turn <= firstVisibleTurn)
      .map((step) => ({
        ...step,
        kind: "history" as const,
      })),
  );

  if (previousStep !== null && previousStep.turn > 3) {
    if (previousStep.turn > 4) {
      steps.push({ kind: "ellipsis" });
    }

    steps.push({
      ...previousStep,
      kind: "history" as const,
    });
  }

  steps.push({
    kind: "current",
    turn: props.currentTurn,
  });

  return steps;
});

function stepFlagSrc(countryCode: string) {
  return `/flags/${countryCode}.webp`;
}

function stepCode(countryCode: string) {
  return countryCode.toUpperCase();
}
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
      <template
        v-for="(step, index) in displaySteps"
        :key="step.kind === 'ellipsis' ? `ellipsis-${index}` : step.turn"
      >
        <div
          v-if="step.kind === 'ellipsis'"
          class="path-history-card__ellipsis"
          aria-hidden="true"
        >
          ...
        </div>

        <div
          v-else
          class="path-history-card__step"
          :class="[
            {
              'path-history-card__step--you':
                step.kind === 'history' && step.owner === 'you',
              'path-history-card__step--opponent':
                step.kind === 'history' && step.owner === 'opponent',
            },
          ]"
          role="listitem"
        >
          <span class="path-history-card__turn">TURN {{ step.turn }}</span>

          <template v-if="step.kind === 'history'">
            <img
              class="path-history-card__flag"
              :src="stepFlagSrc(step.countryCode)"
              :alt="`${stepCode(step.countryCode)} flag`"
              width="24"
              height="18"
            />
            <span class="path-history-card__country-code">{{
              stepCode(step.countryCode)
            }}</span>
          </template>
        </div>

        <div
          v-if="index < displaySteps.length - 1"
          class="path-history-card__connector"
          aria-hidden="true"
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

.path-history-card__legend-badge--you {
  background-color: var(--primary);
  color: var(--on-primary);
}

.path-history-card__legend-badge--opponent {
  background-color: var(--surface-elevated-dark);
  color: var(--on-dark);
}

.path-history-card__body {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  overflow-x: auto;
  padding-bottom: var(--spacing-xs);
}

.path-history-card__step {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  min-width: 96px;
  min-height: 112px;
  padding: var(--spacing-md);
  border: 1px solid transparent;
  border-radius: var(--radius-token-lg);
  background-color: var(--surface-elevated-dark);
  text-align: center;
}

.path-history-card__step--you {
  border-color: color-mix(in srgb, var(--primary) 34%, transparent);
}

.path-history-card__step--opponent {
  border-color: var(--hairline);
}

.path-history-card__turn {
  color: var(--muted);
  font-family: var(--font-body);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-copy);
}

.path-history-card__flag {
  width: 24px;
  height: 18px;
  border-radius: 2px;
  object-fit: cover;
}

.path-history-card__country-code {
  color: var(--on-dark);
  font-family: var(--font-body);
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-body);
}

.path-history-card__connector {
  flex: 0 0 24px;
  height: 1px;
  background-color: var(--hairline);
}

.path-history-card__ellipsis {
  color: var(--muted);
  font-family: var(--font-body);
  font-size: var(--font-size-title-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-md);
}

@media (max-width: 640px) {
  .path-history-card {
    padding: var(--spacing-md);
  }

  .path-history-card__header {
    flex-direction: column;
    align-items: stretch;
  }

  .path-history-card__legend {
    justify-content: flex-end;
  }
}
</style>
