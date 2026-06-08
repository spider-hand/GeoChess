<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "GameTurnStatusStrip",
});

const props = defineProps<{
  isYourTurn: boolean;
  currentTurn: number;
}>();

const { t } = useI18n();

const statusLabel = computed(() =>
  props.isYourTurn
    ? t("components.pages.Game.TurnStatusStrip.yourTurn")
    : t("components.pages.Game.TurnStatusStrip.opponentTurn"),
);

const turnLabel = computed(() =>
  t("components.pages.Game.TurnStatusStrip.turn", {
    turn: props.currentTurn,
  }),
);

const ariaLabel = computed(() => `${statusLabel.value}, ${turnLabel.value}`);
</script>

<template>
  <section class="turn-status-strip" :aria-label="ariaLabel">
    <div
      class="turn-status-strip__status"
      :class="{
        'turn-status-strip__status--your': isYourTurn,
        'turn-status-strip__status--opponent': !isYourTurn,
      }"
    >
      {{ statusLabel }}
    </div>

    <div class="turn-status-strip__turn">
      {{ turnLabel }}
    </div>
  </section>
</template>

<style scoped>
.turn-status-strip {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-md);
  background-color: var(--surface-card-dark);
  overflow: hidden;
  white-space: nowrap;
}

.turn-status-strip__status,
.turn-status-strip__turn {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 var(--spacing-sm);
  font-family: var(--font-body);
  font-size: var(--font-size-button);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-button);
}

.turn-status-strip__status {
  flex: 1;
  justify-content: flex-start;
  color: var(--on-primary);
}

.turn-status-strip__status--your {
  background-color: var(--primary);
}

.turn-status-strip__status--opponent {
  background-color: var(--primary-active);
}

.turn-status-strip__turn {
  flex: 0 0 auto;
  justify-content: center;
  background-color: var(--surface-elevated-dark);
  color: var(--on-dark);
}

@media (max-width: 480px) {
  .turn-status-strip__status,
  .turn-status-strip__turn {
    padding: 0 var(--spacing-xs);
  }
}
</style>
