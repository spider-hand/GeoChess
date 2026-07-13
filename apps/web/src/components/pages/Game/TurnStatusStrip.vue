<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { AiTurnStatus, MultiplayerTurnStatus } from "@/types/game";

defineOptions({
  name: "GameTurnStatusStrip",
});

const props = defineProps<{
  status: AiTurnStatus | MultiplayerTurnStatus;
  currentTurn: number;
}>();

const { t } = useI18n();

const STATUS_LABEL_KEYS: Record<
  AiTurnStatus | MultiplayerTurnStatus,
  `components.pages.Game.TurnStatusStrip.${string}`
> = {
  player: "components.pages.Game.TurnStatusStrip.yourTurn",
  ai: "components.pages.Game.TurnStatusStrip.aiTurn",
  opponent: "components.pages.Game.TurnStatusStrip.opponentTurn",
};

const statusLabel = computed(() => t(STATUS_LABEL_KEYS[props.status]));

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
        'turn-status-strip__status--player': status === 'player',
        'turn-status-strip__status--ai': status === 'ai',
        'turn-status-strip__status--opponent': status === 'opponent',
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
  min-width: 0;
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
  min-height: 44px;
  padding: 0 var(--spacing-md);
  font-family: var(--font-body);
  font-size: var(--font-size-button);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-button);
}

.turn-status-strip__status {
  color: var(--on-primary);
}

.turn-status-strip__status--player {
  background-color: var(--primary);
}

.turn-status-strip__status--ai {
  background-color: var(--primary-active);
}

.turn-status-strip__status--opponent {
  background-color: var(--primary-active);
}

.turn-status-strip__turn {
  justify-content: center;
  background-color: var(--surface-elevated-dark);
  color: var(--on-dark);
}

@media (max-width: 480px) {
  .turn-status-strip__status,
  .turn-status-strip__turn {
    padding: 0 var(--spacing-sm);
  }
}
</style>
