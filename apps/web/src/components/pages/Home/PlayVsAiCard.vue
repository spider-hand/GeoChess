<script setup lang="ts">
import { Bot, Flame, Leaf, Swords } from "@lucide/vue";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import Button from "@/components/shared/Button.vue";

type Difficulty = "easy" | "medium" | "hard";

defineOptions({
  name: "HomePlayVsAiCard",
});

const { t } = useI18n();

const selectedDifficulty = ref<Difficulty>("medium");

const emit = defineEmits<{
  startAiMatch: [difficulty: Difficulty];
}>();

const difficultyOptions = computed(() => [
  {
    icon: Leaf,
    label: t("components.pages.Home.PlayVsAiCard.easy"),
    value: "easy" as const,
  },
  {
    icon: Swords,
    label: t("components.pages.Home.PlayVsAiCard.medium"),
    value: "medium" as const,
  },
  {
    icon: Flame,
    label: t("components.pages.Home.PlayVsAiCard.hard"),
    value: "hard" as const,
  },
]);

function selectDifficulty(difficulty: Difficulty) {
  selectedDifficulty.value = difficulty;
}

function emitStartAiMatch() {
  emit("startAiMatch", selectedDifficulty.value);
}
</script>

<template>
  <section class="play-vs-ai-card">
    <div class="play-vs-ai-card__title">
      <Bot class="play-vs-ai-card__title-icon" :size="20" />
      <h2 class="play-vs-ai-card__title-label">
        {{ t("components.pages.Home.PlayVsAiCard.title") }}
      </h2>
    </div>

    <div class="play-vs-ai-card__difficulty" role="group">
      <Button
        v-for="option in difficultyOptions"
        :key="option.value"
        class="play-vs-ai-card__difficulty-button"
        :class="{
          'play-vs-ai-card__difficulty-button--selected':
            selectedDifficulty === option.value,
        }"
        variant="secondary"
        @click="selectDifficulty(option.value)"
      >
        <component :is="option.icon" :size="16" />
        <span>{{ option.label }}</span>
      </Button>
    </div>

    <Button class="play-vs-ai-card__start-button" @click="emitStartAiMatch">
      {{ t("components.pages.Home.PlayVsAiCard.startGame") }}
    </Button>
  </section>
</template>

<style scoped>
.play-vs-ai-card {
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

.play-vs-ai-card__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.play-vs-ai-card__title-icon {
  flex-shrink: 0;
}

.play-vs-ai-card__title-label {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--font-size-title-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-md);
  color: var(--on-dark);
}

.play-vs-ai-card__difficulty {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-sm);
}

.play-vs-ai-card__difficulty-button {
  width: 100%;
  padding-inline: var(--spacing-sm);
}

.play-vs-ai-card__difficulty-button--selected {
  border-color: var(--primary);
  background-color: var(--primary);
  color: var(--on-primary);
}

.play-vs-ai-card__difficulty-button--selected:hover:not(.button--disabled) {
  background-color: var(--primary-active);
}

.play-vs-ai-card__start-button {
  width: 100%;
}

@media (max-width: 480px) {
  .play-vs-ai-card {
    padding: var(--spacing-md);
  }

  .play-vs-ai-card__difficulty {
    gap: var(--spacing-xs);
  }

  .play-vs-ai-card__difficulty-button {
    padding-inline: var(--spacing-xs);
  }
}
</style>
