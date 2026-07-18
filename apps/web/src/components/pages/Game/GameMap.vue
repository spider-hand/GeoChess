<script setup lang="ts">
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { Bot } from "@lucide/vue";
import {
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  render,
  useTemplateRef,
  watch,
} from "vue";

import Avatar from "@/components/shared/Avatar.vue";
import countryCoordinates from "@/constants/countryCoordinates";
import type { AiGameMapMarker, MultiplayerGameMapMarker } from "@/types/game";

defineOptions({
  name: "GameMap",
});

const props = withDefaults(
  defineProps<{
    isFinished: boolean;
    isFullscreen?: boolean;
    markers: Array<AiGameMapMarker | MultiplayerGameMapMarker>;
  }>(),
  {
    isFullscreen: false,
  },
);

const mapElement = useTemplateRef("mapElement");
const isMapReady = ref(false);
let map: mapboxgl.Map | null = null;
const mapMarkers: Array<{
  marker: mapboxgl.Marker;
  cleanup: () => void;
}> = [];

const syncPlaceLabels = () => {
  map?.setConfigProperty("basemap", "showPlaceLabels", props.isFinished);
};

const syncCamera = () => {
  if (map === null) {
    return;
  }

  const startMarker = props.markers.find(
    (marker) => marker.owner === "neutral",
  );
  if (!startMarker) {
    return;
  }

  const coordinates =
    countryCoordinates[
      startMarker.countryCode.toUpperCase() as keyof typeof countryCoordinates
    ];

  if (!coordinates) {
    return;
  }

  map.easeTo({
    center: [coordinates.lng, coordinates.lat],
    zoom: 3.5,
    duration: 1500,
    essential: true,
  });
};

const removeMarkers = () => {
  for (const mapMarker of mapMarkers.splice(0)) {
    mapMarker.cleanup();
    mapMarker.marker.remove();
  }
};

const createMarkerElement = (
  marker: AiGameMapMarker | MultiplayerGameMapMarker,
) => {
  const element = document.createElement("div");
  element.className = `game-map-marker game-map-marker--${marker.owner}`;
  element.dataset.countryCode = marker.countryCode;
  element.dataset.owner = marker.owner;
  element.title = marker.label;

  if (marker.owner === "neutral") {
    const pin = document.createElement("span");
    pin.className = "game-map-marker__neutral-pin";
    pin.setAttribute("aria-hidden", "true");
    element.append(pin);

    return {
      element,
      cleanup: () => {},
    };
  }

  const mountNode = document.createElement("span");
  mountNode.className = `game-map-marker__content game-map-marker__content--${marker.owner}`;
  element.append(mountNode);

  render(
    marker.owner === "player"
      ? h(Avatar, { name: marker.label, size: "sm" })
      : marker.owner === "opponent"
        ? h(Avatar, { name: marker.label, size: "sm" })
        : h(Bot, { size: 16 }),
    mountNode,
  );

  return {
    element,
    cleanup: () => {
      render(null, mountNode);
    },
  };
};

const syncMarkers = () => {
  removeMarkers();

  if (map === null) {
    return;
  }

  for (const marker of props.markers) {
    const coordinates =
      countryCoordinates[
        marker.countryCode.toUpperCase() as keyof typeof countryCoordinates
      ];

    if (!coordinates) {
      continue;
    }

    const { element, cleanup } = createMarkerElement(marker);
    const mapMarker = new mapboxgl.Marker({
      anchor: "bottom",
      element,
    })
      .setLngLat([coordinates.lng, coordinates.lat])
      .addTo(map);

    mapMarkers.push({
      marker: mapMarker,
      cleanup,
    });
  }
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
        showPlaceLabels: props.isFinished,
      },
    },
  });

  map.on("style.load", syncPlaceLabels);
  isMapReady.value = true;
  if (props.isFinished) {
    syncMarkers();
    syncCamera();
  }
});

watch(
  [() => isMapReady.value, () => props.isFinished, () => props.markers],
  () => {
    if (!isMapReady.value) {
      return;
    }

    syncPlaceLabels();

    if (!props.isFinished) {
      removeMarkers();
      return;
    }

    syncMarkers();
    syncCamera();
  },
  { deep: true, immediate: true },
);

onBeforeUnmount(() => {
  isMapReady.value = false;
  removeMarkers();
  map?.remove();
  map = null;
});
</script>

<template>
  <div
    ref="mapElement"
    class="game-map"
    :class="{ 'game-map--fullscreen': props.isFullscreen }"
    data-testid="game-map"
  />
</template>

<style scoped>
.game-map {
  height: 420px;
  width: 100%;
  border-radius: var(--radius-token-xl);
  overflow: hidden;
}

.game-map--fullscreen {
  height: 100%;
  border-radius: 0;
}

:global(.game-map-marker) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: transparent;
  border: 2px solid var(--on-dark);
  border-radius: var(--radius-token-full);
  box-shadow: 0 10px 24px rgb(0 0 0 / 0.28);
  transform: translateY(-6px);
}

:global(.game-map-marker--ai) {
  color: var(--on-dark);
}

:global(.game-map-marker--opponent) {
  color: var(--on-dark);
}

:global(.game-map-marker--neutral) {
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 0;
  background-color: transparent;
  box-shadow: none;
}

:global(.game-map-marker__content) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

:global(.game-map-marker__content--player) {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  overflow: hidden;
}

:global(.game-map-marker__content--opponent) {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  overflow: hidden;
}

:global(.game-map-marker__content--player .avatar) {
  width: 36px;
  height: 36px;
}

:global(.game-map-marker__content--opponent .avatar) {
  width: 36px;
  height: 36px;
}

:global(.game-map-marker__content--ai) {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background-color: var(--surface-elevated-dark);
  color: var(--on-dark);
}

:global(.game-map-marker__neutral-pin) {
  position: relative;
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border-radius: 999px 999px 999px 0;
  border: 2px solid var(--on-dark);
  background-color: var(--primary);
  transform: rotate(-45deg);
  box-shadow: 0 10px 24px rgb(0 0 0 / 0.28);
}

:global(.game-map-marker__neutral-pin::after) {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background-color: var(--on-primary);
  content: "";
}
</style>
