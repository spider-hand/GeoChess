import { createRouter, createWebHistory } from "vue-router";
import { getCurrentUser } from "vuefire";

import { signInAnonymouslyIfNeeded } from "@/composables/useAuth";
import GameRandomMatchPage from "@/pages/GameRandomMatchPage.vue";
import GameVsAiPage from "@/pages/GameVsAiPage.vue";
import GameWithFriendsPage from "@/pages/GameWithFriendsPage.vue";
import HomePage from "@/pages/HomePage.vue";
import UserPage from "@/pages/UserPage.vue";

declare module "vue-router" {
  interface RouteMeta {
    requiresRegisteredAuth?: boolean;
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
      path: "/user",
      component: UserPage,
      meta: {
        requiresRegisteredAuth: true,
      },
    },
    {
      path: "/game/vs-ai/:gameId",
      component: GameVsAiPage,
      meta: {
        requiresVsAiAuth: true,
      },
    },
    {
      path: "/game/with-friends/:gameId",
      component: GameWithFriendsPage,
      meta: {
        requiresRegisteredAuth: true,
      },
    },
    {
      path: "/game/random-match",
      component: GameRandomMatchPage,
    },
  ],
});

router.beforeEach(async (to) => {
  if (to.meta.requiresRegisteredAuth) {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.isAnonymous) {
      return "/";
    }
  }

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
