<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import UserProfileSection from "@/components/pages/User/UserProfileSection.vue";
import AiGamesSection from "@/components/pages/User/AiGamesSection.vue";
import FriendsGamesSection from "@/components/pages/User/FriendsGamesSection.vue";
import NavigationFooter from "@/components/shared/NavigationFooter.vue";
import NavigationHeader from "@/components/shared/NavigationHeader.vue";

type UserTab = "profile" | "aiGames" | "friendsGames";

const { t } = useI18n();
const activeTab = ref<UserTab>("profile");

const selectTab = (tab: UserTab) => {
  activeTab.value = tab;
};
</script>

<template>
  <main class="user-page">
    <NavigationHeader />

    <section class="user-page__content">
      <div class="user-page__tabs-scroll">
        <div class="user-page__tabs" role="tablist">
          <button
            class="user-page__tab"
            :class="{ 'user-page__tab--selected': activeTab === 'profile' }"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'profile'"
            @click="selectTab('profile')"
          >
            {{ t("components.pages.User.profile") }}
          </button>
          <button
            class="user-page__tab"
            :class="{ 'user-page__tab--selected': activeTab === 'aiGames' }"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'aiGames'"
            @click="selectTab('aiGames')"
          >
            {{ t("components.pages.User.aiGames") }}
          </button>
          <button
            class="user-page__tab"
            :class="{
              'user-page__tab--selected': activeTab === 'friendsGames',
            }"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'friendsGames'"
            @click="selectTab('friendsGames')"
          >
            {{ t("components.pages.User.friendsGames") }}
          </button>
        </div>
      </div>

      <UserProfileSection v-if="activeTab === 'profile'" />
      <AiGamesSection v-else-if="activeTab === 'aiGames'" />
      <FriendsGamesSection v-else-if="activeTab === 'friendsGames'" />
    </section>

    <NavigationFooter />
  </main>
</template>

<style scoped>
.user-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--on-primary);
}

.user-page__content {
  flex: 1;
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.user-page__tabs-scroll {
  max-width: 100%;
  overflow-x: auto;
}

.user-page__tabs {
  display: flex;
  gap: var(--spacing-xs);
  width: max-content;
}

.user-page__tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  flex: 0 0 auto;
  min-height: 40px;
  padding: 0 var(--spacing-xs) var(--spacing-xs);
  border: 0;
  background: transparent;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: var(--font-size-button);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-button);
  white-space: nowrap;
  cursor: pointer;
  transition: color 160ms ease;
}

.user-page__tab::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 25%;
  height: 3px;
  background-color: transparent;
  transform: translateX(-50%);
}

.user-page__tab:hover,
.user-page__tab:focus-visible,
.user-page__tab--selected {
  color: var(--on-dark);
}

.user-page__tab:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}

.user-page__tab--selected::after {
  background-color: var(--primary);
}
</style>
