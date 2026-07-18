<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { ArrowRight, Signal, SignalHigh, SignalMedium } from "@lucide/vue";

import useAiGameQuery from "@/composables/useAiGameQuery";

const { locale, t } = useI18n();
const { data, isError, isLoading } = useAiGameQuery();
const difficulties = ["easy", "medium", "hard"] as const;
const difficultyIcons = {
  easy: SignalMedium,
  medium: SignalHigh,
  hard: Signal,
};
const dateFormatter = computed(
  () => new Intl.DateTimeFormat(locale.value, { dateStyle: "medium" }),
);

const difficultyLabel = (difficulty: "easy" | "medium" | "hard") =>
  t(`components.pages.User.AiGamesSection.${difficulty}`);

const resultLabel = (result: "win" | "lose") =>
  t(`components.pages.User.AiGamesSection.${result}`);
</script>

<template>
  <section class="ai-games-section">
    <p v-if="isLoading">
      {{ t("components.pages.User.AiGamesSection.loading") }}
    </p>
    <p v-else-if="isError">
      {{ t("components.pages.User.AiGamesSection.loadError") }}
    </p>
    <template v-else-if="data">
      <div class="ai-games-section__difficulty-records">
        <article
          v-for="difficulty in difficulties"
          :key="difficulty"
          class="ai-games-section__record-card"
        >
          <div class="ai-games-section__record-content">
            <p class="ai-games-section__record-label">
              <component :is="difficultyIcons[difficulty]" :size="16" />
              {{ difficultyLabel(difficulty) }}
            </p>
            <div class="ai-games-section__outcomes">
              <div
                class="ai-games-section__outcome ai-games-section__outcome--won"
              >
                <strong>{{ data.byDifficulty[difficulty].wins }}</strong>
                <span>{{
                  t("components.pages.User.AiGamesSection.winsLabel")
                }}</span>
              </div>
              <div
                class="ai-games-section__outcome ai-games-section__outcome--lost"
              >
                <strong>{{ data.byDifficulty[difficulty].losses }}</strong>
                <span>{{
                  t("components.pages.User.AiGamesSection.lossesLabel")
                }}</span>
              </div>
            </div>
          </div>
        </article>
      </div>
      <article class="ai-games-section__history data-table-card">
        <h2>{{ t("components.pages.User.AiGamesSection.recentGames") }}</h2>
        <p v-if="data.recentGames.length === 0">
          {{ t("components.pages.User.AiGamesSection.noRecentGames") }}
        </p>
        <ul v-else class="ai-games-section__games">
          <li v-for="game in data.recentGames" :key="game.id">
            <div class="ai-games-section__game-summary">
              <span class="ai-games-section__difficulty">
                {{ difficultyLabel(game.difficulty) }}
              </span>
              <span
                class="ai-games-section__result"
                :class="{
                  'ai-games-section__result--win': game.result === 'win',
                  'ai-games-section__result--lose': game.result === 'lose',
                }"
              >
                {{ resultLabel(game.result) }}
              </span>
            </div>
            <time :datetime="game.createdAt.toISOString()">{{
              dateFormatter.format(game.createdAt)
            }}</time>
            <a :href="`/game/vs-ai/${game.id}`">
              {{ t("components.pages.User.AiGamesSection.viewGame") }}
              <ArrowRight :size="16" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </article>
    </template>
  </section>
</template>

<style scoped>
.ai-games-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: min(100%, 720px);
  margin-top: var(--spacing-xl);
}
.ai-games-section__difficulty-records {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-md);
}
.ai-games-section__record-card {
  min-height: 156px;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-lg);
  background-color: var(--surface-card-dark);
}
.ai-games-section__record-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: var(--spacing-lg);
}
.ai-games-section__record-label {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin: 0;
  color: var(--on-dark);
  font-size: var(--font-size-title-sm);
  font-weight: var(--font-weight-semibold);
}
.ai-games-section__outcomes {
  display: flex;
  gap: var(--spacing-xl);
}
.ai-games-section__outcome {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
}
.ai-games-section__outcome strong {
  display: flex;
  align-items: flex-end;
  min-height: var(--font-size-display-sm);
  font-family: var(--font-number);
  font-size: var(--font-size-display-sm);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.ai-games-section__outcome span {
  color: var(--muted);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
}
.ai-games-section__outcome--won strong {
  color: var(--success);
}
.ai-games-section__outcome--lost strong {
  color: var(--danger);
}
.ai-games-section__history {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-lg);
}
.ai-games-section__history h2,
.ai-games-section__history p {
  margin: 0;
}
.ai-games-section__history p,
.ai-games-section__games {
  color: var(--muted);
}
.ai-games-section__games {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: 0;
  margin: 0;
  list-style: none;
}
.ai-games-section__games li {
  display: flex;
  align-items: center;
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--hairline);
}
.ai-games-section__game-summary {
  display: inline-flex;
  align-items: baseline;
  gap: var(--spacing-xs);
  min-width: 0;
}
.ai-games-section__games time {
  margin-left: var(--spacing-md);
}
.ai-games-section__difficulty {
  color: var(--on-dark);
  font-size: var(--font-size-number-md);
  font-weight: var(--font-weight-medium);
}
.ai-games-section__result {
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
}
.ai-games-section__result--win {
  color: var(--success);
}
.ai-games-section__result--lose {
  color: var(--danger);
}
.ai-games-section__games a {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xxs);
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
  margin-left: auto;
}
@media (max-width: 640px) {
  .ai-games-section__difficulty-records {
    grid-template-columns: 1fr;
  }
  .ai-games-section__games li {
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }
  .ai-games-section__game-summary {
    flex-basis: 100%;
  }
  .ai-games-section__games time,
  .ai-games-section__games a {
    margin-left: 0;
  }
}
</style>
