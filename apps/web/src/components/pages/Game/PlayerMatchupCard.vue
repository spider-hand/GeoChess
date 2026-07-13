<script setup lang="ts">
import { Bot } from "@lucide/vue";
import { useI18n } from "vue-i18n";

import useCountry from "@/composables/useCountry";
import Avatar from "@/components/shared/Avatar.vue";
import type { Difficulty } from "@/types/game";

defineOptions({
  name: "GamePlayerMatchupCard",
});

const props = defineProps<{
  playerOne: {
    name: string;
    country?: string;
  };
  difficulty?: Difficulty;
  playerTwo?: {
    name: string;
    country?: string;
  };
}>();

const { t } = useI18n();
const { countryFlagAlt, countryFlagSrc } = useCountry();
</script>

<template>
  <section class="player-matchup-card">
    <div class="player-matchup-card__content">
      <article
        class="player-matchup-card__player"
        data-testid="player-matchup-card-player"
      >
        <Avatar
          class="player-matchup-card__avatar"
          :name="props.playerOne.name"
          size="md"
          data-testid="player-matchup-card-avatar"
        />

        <div class="player-matchup-card__identity">
          <p class="player-matchup-card__name">
            <span>{{ props.playerOne.name }}</span>
            <img
              v-if="props.playerOne.country"
              class="player-matchup-card__flag"
              :src="countryFlagSrc(props.playerOne.country)"
              :alt="countryFlagAlt(props.playerOne.country)"
            />
          </p>
        </div>
      </article>

      <span class="player-matchup-card__vs" aria-label="versus">
        {{ t("components.pages.Game.PlayerMatchupCard.versus") }}
      </span>

      <article
        class="player-matchup-card__player"
        data-testid="player-matchup-card-player"
      >
        <span
          v-if="!props.playerTwo"
          class="player-matchup-card__avatar player-matchup-card__avatar--ai"
          aria-hidden="true"
          data-testid="player-matchup-card-avatar"
        >
          <Bot :size="20" />
        </span>
        <Avatar
          v-else
          class="player-matchup-card__avatar"
          :name="props.playerTwo.name"
          size="md"
          data-testid="player-matchup-card-avatar"
        />

        <div class="player-matchup-card__identity">
          <p class="player-matchup-card__name">
            <span>
              {{
                props.playerTwo?.name ??
                t("components.pages.Game.PlayerMatchupCard.ai")
              }}
            </span>
            <img
              v-if="props.playerTwo?.country"
              class="player-matchup-card__flag"
              :src="countryFlagSrc(props.playerTwo.country)"
              :alt="countryFlagAlt(props.playerTwo.country)"
            />
            <span
              v-if="!props.playerTwo && props.difficulty"
              class="player-matchup-card__meta"
            >
              {{
                t(`components.pages.Game.PlayerMatchupCard.${props.difficulty}`)
              }}
            </span>
          </p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.player-matchup-card {
  width: min(100%, 520px);
}

.player-matchup-card__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: var(--spacing-sm);
}

.player-matchup-card__player {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
  padding: var(--spacing-md);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-xl);
  background-color: var(--surface-card-dark);
}

.player-matchup-card__avatar {
  flex-shrink: 0;
}

.player-matchup-card__avatar--ai {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background-color: var(--surface-elevated-dark);
  color: var(--on-dark);
}

.player-matchup-card__identity {
  min-width: 0;
}

.player-matchup-card__name {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin: 0;
  color: var(--on-dark);
  font-family: var(--font-body);
  font-size: var(--font-size-title-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-sm);
  text-align: left;
}

.player-matchup-card__meta {
  margin: 0;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-body-sm);
  text-align: left;
}

.player-matchup-card__flag {
  height: 16px;
  width: auto;
}

.player-matchup-card__vs {
  color: var(--muted);
  font-family: var(--font-body);
  font-size: var(--font-size-title-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-sm);
  text-transform: lowercase;
}

@media (max-width: 560px) {
  .player-matchup-card {
    width: 100%;
  }
}
</style>
