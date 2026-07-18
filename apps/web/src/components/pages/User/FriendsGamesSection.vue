<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ArrowRight } from "@lucide/vue";

import Avatar from "@/components/shared/Avatar.vue";
import useWithFriendsGameQuery from "@/composables/useWithFriendsGameQuery";
import useWithFriendsGameStatsQuery from "@/composables/useWithFriendsGameStatsQuery";
import { formatMediumDate } from "@/utils/formatMediumDate";

const { locale, t } = useI18n();
const {
  data: games,
  isError: isGamesError,
  isLoading: isGamesLoading,
} = useWithFriendsGameQuery();
const {
  data: stats,
  isError: isStatsError,
  isLoading: isStatsLoading,
} = useWithFriendsGameStatsQuery();
const resultLabel = (result: "win" | "lose") =>
  t(`components.pages.User.FriendsGamesSection.${result}`);
</script>

<template>
  <section class="friends-games-section">
    <p v-if="isGamesLoading || isStatsLoading">
      {{ t("components.pages.User.FriendsGamesSection.loading") }}
    </p>
    <p v-else-if="isGamesError || isStatsError">
      {{ t("components.pages.User.FriendsGamesSection.loadError") }}
    </p>
    <template v-else-if="games && stats">
      <section v-if="stats.length" class="friends-games-section__top-friends">
        <h2>{{ t("components.pages.User.FriendsGamesSection.topFriends") }}</h2>
        <div class="friends-games-section__friend-records">
          <article
            v-for="friend in stats"
            :key="friend.displayName"
            class="friends-games-section__record-card"
          >
            <div class="friends-games-section__record-content">
              <div class="friends-games-section__friend">
                <Avatar :name="friend.displayName" size="sm" />
                <p>{{ friend.displayName }}</p>
              </div>
              <div class="friends-games-section__outcomes">
                <div
                  class="friends-games-section__outcome friends-games-section__outcome--won"
                >
                  <strong>{{ friend.wins }}</strong>
                  <span>{{
                    t("components.pages.User.FriendsGamesSection.winsLabel")
                  }}</span>
                </div>
                <div
                  class="friends-games-section__outcome friends-games-section__outcome--lost"
                >
                  <strong>{{ friend.losses }}</strong>
                  <span>{{
                    t("components.pages.User.FriendsGamesSection.lossesLabel")
                  }}</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
      <article class="friends-games-section__history data-table-card">
        <h2>
          {{ t("components.pages.User.FriendsGamesSection.recentGames") }}
        </h2>
        <p v-if="games.length === 0">
          {{ t("components.pages.User.FriendsGamesSection.noRecentGames") }}
        </p>
        <ul v-else class="friends-games-section__games">
          <li v-for="game in games" :key="game.id">
            <div class="friends-games-section__game-summary">
              <Avatar :name="game.opponentDisplayName" size="sm" />
              <span class="friends-games-section__opponent">{{
                game.opponentDisplayName
              }}</span>
              <span
                class="friends-games-section__result"
                :class="`friends-games-section__result--${game.result}`"
              >
                {{ resultLabel(game.result) }}
              </span>
            </div>
            <time :datetime="game.createdAt.toISOString()">{{
              formatMediumDate(game.createdAt, locale)
            }}</time>
            <span v-if="game.expired" class="friends-games-section__archived">
              {{ t("components.pages.User.FriendsGamesSection.archived") }}
            </span>
            <a v-else :href="`/game/with-friends/${game.id}`">
              {{ t("components.pages.User.FriendsGamesSection.viewGame") }}
              <ArrowRight :size="16" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </article>
    </template>
  </section>
</template>

<style scoped>
.friends-games-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: min(100%, 720px);
  margin-top: var(--spacing-xl);
}
.friends-games-section__friend-records {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-md);
}
.friends-games-section__top-friends {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.friends-games-section__top-friends h2 {
  margin: 0;
}
.friends-games-section__record-card {
  min-height: 156px;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-lg);
  background-color: var(--surface-card-dark);
}
.friends-games-section__record-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: var(--spacing-lg);
}
.friends-games-section__friend,
.friends-games-section__game-summary,
.friends-games-section__outcomes {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}
.friends-games-section__friend p {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--on-dark);
  font-size: var(--font-size-title-sm);
  font-weight: var(--font-weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.friends-games-section__outcomes {
  gap: var(--spacing-xl);
}
.friends-games-section__outcome {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
}
.friends-games-section__outcome strong {
  min-height: var(--font-size-display-sm);
  color: var(--on-dark);
  font-family: var(--font-number);
  font-size: var(--font-size-display-sm);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.friends-games-section__outcome span,
.friends-games-section__result {
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
}
.friends-games-section__outcome span {
  color: var(--muted);
  text-transform: uppercase;
}
.friends-games-section__outcome--won strong,
.friends-games-section__result--win {
  color: var(--success);
}
.friends-games-section__outcome--lost strong,
.friends-games-section__result--lose {
  color: var(--danger);
}
.friends-games-section__history {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-lg);
}
.friends-games-section__history h2,
.friends-games-section__history p {
  margin: 0;
}
.friends-games-section__history p,
.friends-games-section__games,
.friends-games-section__archived {
  color: var(--muted);
}
.friends-games-section__games {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: 0;
  margin: 0;
  list-style: none;
}
.friends-games-section__games li {
  display: flex;
  align-items: center;
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--hairline);
}
.friends-games-section__game-summary {
  min-width: 0;
}
.friends-games-section__opponent {
  overflow: hidden;
  color: var(--on-dark);
  font-size: var(--font-size-number-md);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.friends-games-section__games time {
  margin-left: var(--spacing-md);
}
.friends-games-section__games a {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xxs);
  margin-left: auto;
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
}
.friends-games-section__archived {
  margin-left: auto;
  font-weight: var(--font-weight-semibold);
}
@media (max-width: 640px) {
  .friends-games-section__friend-records {
    grid-template-columns: 1fr;
  }
  .friends-games-section__games li {
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }
  .friends-games-section__game-summary {
    flex-basis: 100%;
  }
  .friends-games-section__games time,
  .friends-games-section__games a,
  .friends-games-section__archived {
    margin-left: 0;
  }
}
</style>
