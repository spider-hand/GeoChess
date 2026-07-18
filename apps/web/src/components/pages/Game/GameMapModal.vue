<script setup lang="ts">
import { Map, X } from "@lucide/vue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import GameMap from "@/components/pages/Game/GameMap.vue";
import IconButton from "@/components/shared/IconButton.vue";
import type { AiGameMapMarker, MultiplayerGameMapMarker } from "@/types/game";

defineOptions({
  name: "GameMapModal",
});

const props = defineProps<{
  isFinished: boolean;
  isOpen: boolean;
  markers: Array<AiGameMapMarker | MultiplayerGameMapMarker>;
}>();

const emit = defineEmits<{
  close: [];
  open: [];
}>();

const { t } = useI18n();
const hasOpened = ref(props.isOpen);

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      hasOpened.value = true;
    }
  },
);

const emitClose = () => {
  emit("close");
};

const emitOpen = () => {
  emit("open");
};
</script>

<template>
  <IconButton
    class="game-map-modal__trigger"
    :ariaLabel="t('components.pages.Game.GameMapModal.showMap')"
    @click="emitOpen"
  >
    <Map :size="20" aria-hidden="true" />
  </IconButton>

  <div
    v-if="hasOpened"
    v-show="props.isOpen"
    class="game-map-modal"
    role="presentation"
  >
    <div
      class="game-map-modal__panel"
      role="dialog"
      aria-modal="true"
      :ariaLabel="t('components.pages.Game.GameMapModal.showMap')"
    >
      <IconButton
        class="game-map-modal__close-button"
        :ariaLabel="t('components.pages.Game.GameMapModal.close')"
        @click="emitClose"
      >
        <X :size="20" aria-hidden="true" />
      </IconButton>

      <GameMap
        class="game-map-modal__map"
        :is-finished="props.isFinished"
        :is-fullscreen="true"
        :markers="props.markers"
      />
    </div>
  </div>
</template>

<style scoped>
.game-map-modal__trigger {
  display: none;
  position: fixed;
  right: var(--spacing-lg);
  bottom: var(--spacing-lg);
  z-index: 10;
  width: 48px;
  height: 48px;
  border: 1px solid var(--primary);
  background-color: var(--primary);
  color: var(--on-primary);
  box-shadow: 0 12px 24px rgb(0 0 0 / 0.28);
}

.game-map-modal__trigger.icon-button:hover:not(.icon-button--disabled) {
  background-color: var(--primary-active);
  color: var(--on-primary);
}

@media (max-width: 960px) {
  .game-map-modal__trigger {
    display: inline-flex;
  }
}

.game-map-modal {
  position: fixed;
  inset: 0;
  z-index: 30;
  background-color: var(--surface-card-dark);
}

.game-map-modal__panel {
  position: relative;
  width: 100%;
  height: 100%;
}

.game-map-modal__close-button {
  position: absolute;
  z-index: 1;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  width: 40px;
  height: 40px;
  border: 1px solid var(--hairline);
  background-color: var(--surface-card-dark);
  box-shadow: 0 8px 20px rgb(0 0 0 / 0.24);
}

.game-map-modal__map {
  width: 100%;
  height: 100%;
}
</style>
