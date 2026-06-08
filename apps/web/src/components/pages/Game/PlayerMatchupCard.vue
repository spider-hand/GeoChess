<script setup lang="ts">
import { useI18n } from "vue-i18n";

type PlayerSummary = {
  countryCode: string;
  name: string;
};

defineOptions({
  name: "GamePlayerMatchupCard",
});

const { t } = useI18n();

const players: PlayerSummary[] = [
  {
    countryCode: "jp",
    name: "Aki",
  },
  {
    countryCode: "us",
    name: "Sam",
  },
];

function flagSrc(countryCode: string) {
  return `/flags/${countryCode}.webp`;
}
</script>

<template>
  <section class="player-matchup-card">
    <div class="player-matchup-card__content">
      <article
        class="player-matchup-card__player"
        data-testid="player-matchup-card-player"
      >
        <div
          class="player-matchup-card__avatar"
          aria-hidden="true"
          data-testid="player-matchup-card-avatar"
        />

        <div class="player-matchup-card__identity">
          <p class="player-matchup-card__name">
            {{ players[0].name }}
          </p>
          <img
            class="player-matchup-card__flag"
            :src="flagSrc(players[0].countryCode)"
            :alt="`${players[0].countryCode.toUpperCase()} flag`"
          />
        </div>
      </article>

      <span class="player-matchup-card__vs" aria-label="versus">
        {{ t("components.pages.Game.PlayerMatchupCard.versus") }}
      </span>

      <article
        class="player-matchup-card__player"
        data-testid="player-matchup-card-player"
      >
        <div
          class="player-matchup-card__avatar"
          aria-hidden="true"
          data-testid="player-matchup-card-avatar"
        />

        <div class="player-matchup-card__identity">
          <p class="player-matchup-card__name">
            {{ players[1].name }}
          </p>
          <img
            class="player-matchup-card__flag"
            :src="flagSrc(players[1].countryCode)"
            :alt="`${players[1].countryCode.toUpperCase()} flag`"
          />
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.player-matchup-card {
  width: min(100%, 520px);
  padding: var(--spacing-md);
}

.player-matchup-card__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: var(--spacing-sm);
}

.player-matchup-card__player {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-xl);
}

.player-matchup-card__avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background-color: var(--canvas-dark);
}

.player-matchup-card__identity {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 0;
}

.player-matchup-card__flag {
  width: auto;
  height: 14px;
  flex-shrink: 0;
}

.player-matchup-card__name {
  margin: 0;
  color: var(--on-dark);
  font-family: var(--font-body);
  font-size: var(--font-size-title-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-sm);
  text-align: left;
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
    padding: var(--spacing-sm);
  }

  .player-matchup-card__content {
    grid-template-columns: 1fr;
    justify-items: stretch;
  }

  .player-matchup-card__player {
    width: 100%;
    justify-content: flex-start;
  }

  .player-matchup-card__vs {
    justify-self: center;
  }
}
</style>
