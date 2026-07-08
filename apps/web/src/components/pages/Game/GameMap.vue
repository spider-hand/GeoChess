<script setup lang="ts">
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from "vue";

defineOptions({
  name: "GameMap",
});

const props = defineProps<{
  showPlaceLabels: boolean;
}>();

const mapElement = useTemplateRef("mapElement");
let map: mapboxgl.Map | null = null;

const syncPlaceLabels = () => {
  if (map === null) {
    return;
  }

  map.setConfigProperty("basemap", "showPlaceLabels", props.showPlaceLabels);
};

onMounted(() => {
  if (mapElement.value === null) {
    return;
  }

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

  map = new mapboxgl.Map({
    container: mapElement.value,
    style: "mapbox://styles/mapbox/standard",
    config: {
      basemap: {
        showPlaceLabels: props.showPlaceLabels,
      },
    },
  });

  map.on("style.load", syncPlaceLabels);
});

watch(
  () => props.showPlaceLabels,
  () => {
    syncPlaceLabels();
  },
);

onBeforeUnmount(() => {
  map?.remove();
  map = null;
});
</script>

<template>
  <div ref="mapElement" class="game-map" data-testid="game-map" />
</template>

<style scoped>
.game-map {
  width: 100%;
  min-height: 320px;
  border-radius: var(--radius-token-xl);
  overflow: hidden;
}
</style>
