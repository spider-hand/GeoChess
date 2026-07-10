<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "GameResultBadge",
});

const props = defineProps<{
  result: "won" | "lost";
}>();

const { t } = useI18n();

const RESULT_LABEL_KEYS: Record<
  "won" | "lost",
  `components.pages.Game.ResultBadge.${string}`
> = {
  won: "components.pages.Game.ResultBadge.youWin",
  lost: "components.pages.Game.ResultBadge.youLose",
};

const resultLabel = computed(() => t(RESULT_LABEL_KEYS[props.result]));
</script>

<template>
  <div
    class="result-badge"
    :class="{
      'result-badge--won': result === 'won',
      'result-badge--lost': result === 'lost',
    }"
  >
    {{ resultLabel }}
  </div>
</template>

<style scoped>
.result-badge {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 var(--spacing-md);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-md);
  color: var(--on-primary);
  font-family: var(--font-body);
  font-size: var(--font-size-button);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-button);
  white-space: nowrap;
}

.result-badge--won {
  background-color: var(--primary);
}

.result-badge--lost {
  background-color: var(--danger);
}

@media (max-width: 480px) {
  .result-badge {
    padding: 0 var(--spacing-sm);
  }
}
</style>
