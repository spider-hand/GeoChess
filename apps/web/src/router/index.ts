import { createRouter, createWebHistory } from "vue-router";

import { signInAnonymouslyIfNeeded } from "@/composables/useAuth";
import GameRandomMatchPage from "@/pages/GameRandomMatchPage.vue";
import GameVsAiPage from "@/pages/GameVsAiPage.vue";
import GameWithFriendsPage from "@/pages/GameWithFriendsPage.vue";
import HomePage from "@/pages/HomePage.vue";

declare module "vue-router" {
  interface RouteMeta {
    requiresVsAiAuth?: boolean;
  }
}

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
      meta: {
        requiresVsAiAuth: true,
      },
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

router.beforeEach(async (to) => {
  if (!to.meta.requiresVsAiAuth) {
    return true;
  }

  try {
    await signInAnonymouslyIfNeeded();
    return true;
  } catch (error) {
    console.error(error);
    return "/";
  }
});

export default router;
