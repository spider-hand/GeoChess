<script setup lang="ts">
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { onBeforeUnmount, onMounted, useTemplateRef } from "vue";

defineOptions({
  name: "GameMap",
});

const mapElement = useTemplateRef("mapElement");
let map: mapboxgl.Map | null = null;

onMounted(() => {
  if (mapElement.value === null) {
    return;
  }

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

  map = new mapboxgl.Map({
    container: mapElement.value,
    style: "mapbox://styles/mapbox/standard",
  });
});

onBeforeUnmount(() => {
  map?.remove();
  map = null;
});
</script>

<template>
  <div ref="mapElement" class="game-map" data-testid="game-map" />
</template>
