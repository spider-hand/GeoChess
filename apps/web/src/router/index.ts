import { createRouter, createWebHistory } from "vue-router";

import GameRandomMatchPage from "@/pages/GameRandomMatchPage.vue";
import GameVsAiPage from "@/pages/GameVsAiPage.vue";
import GameWithFriendsPage from "@/pages/GameWithFriendsPage.vue";
import HomePage from "@/pages/HomePage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: HomePage,
    },
    {
      path: "/game/vs-ai",
      component: GameVsAiPage,
    },
    {
      path: "/game/with-friends",
      component: GameWithFriendsPage,
    },
    {
      path: "/game/random-match",
      component: GameRandomMatchPage,
    },
  ],
});

export default router;
