import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

const mapboxMockState = vi.hoisted(() => ({
  addedMarkers: [] as Array<{ element: HTMLElement }>,
  maps: [] as Array<{
    container: HTMLElement;
    options: {
      config: {
        basemap: {
          showPlaceLabels: boolean;
        };
      };
    };
    easeTo: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    setConfigProperty: ReturnType<typeof vi.fn>;
  }>,
  removedMarkers: [] as Array<{ element: HTMLElement }>,
}));

vi.mock("mapbox-gl", () => {
  class MockMap {
    container: HTMLElement;
    options: {
      config: {
        basemap: {
          showPlaceLabels: boolean;
        };
      };
    };
    easeTo = vi.fn();
    setConfigProperty = vi.fn();
    remove = vi.fn();

    constructor(options: {
      container: HTMLElement;
      config: {
        basemap: {
          showPlaceLabels: boolean;
        };
      };
    }) {
      this.container = options.container;
      this.options = {
        config: options.config,
      };
      mapboxMockState.maps.push(this);
    }

    on() {}
  }

  class MockMarker {
    element: HTMLElement;

    constructor(options: { element: HTMLElement }) {
      this.element = options.element;
    }

    setLngLat() {
      return this;
    }

    addTo(map: MockMap) {
      map.container.append(this.element);
      mapboxMockState.addedMarkers.push(this);

      return this;
    }

    remove() {
      this.element.remove();
      mapboxMockState.removedMarkers.push(this);
    }
  }

  const mockMapbox = {
    accessToken: "",
    Map: MockMap,
    Marker: MockMarker,
  };

  return {
    __esModule: true,
    Map: MockMap,
    Marker: MockMarker,
    accessToken: "",
    default: mockMapbox,
  };
});

import GameMap from "@/components/pages/Game/GameMap.vue";

beforeEach(() => {
  mapboxMockState.maps.length = 0;
  mapboxMockState.addedMarkers.length = 0;
  mapboxMockState.removedMarkers.length = 0;
});

test("mounts in labels-only mode without creating markers", async () => {
  const { container, rerender } = render(GameMap, {
    props: {
      isFinished: false,
      markers: [],
    },
  });

  expect(container.querySelector('[data-testid="game-map"]')).not.toBeNull();
  expect(mapboxMockState.addedMarkers).toHaveLength(0);
  expect(mapboxMockState.maps[0]?.options.config.basemap.showPlaceLabels).toBe(
    false,
  );

  await rerender({
    isFinished: true,
    markers: [{ countryCode: "JP", owner: "neutral", label: "Start" }],
  });

  expect(mapboxMockState.maps[0]?.setConfigProperty).toHaveBeenCalledWith(
    "basemap",
    "showPlaceLabels",
    true,
  );
  expect(mapboxMockState.addedMarkers).toHaveLength(1);
  expect(mapboxMockState.maps[0]?.easeTo).toHaveBeenCalledWith({
    center: [138, 36],
    zoom: 3.5,
    duration: 1500,
    essential: true,
  });
});

test("keeps markers hidden while active even when marker data exists", async () => {
  const { container } = render(GameMap, {
    props: {
      isFinished: false,
      markers: [
        { countryCode: "JP", owner: "neutral", label: "Start" },
        { countryCode: "KR", owner: "player", label: "Taylor Swift" },
        { countryCode: "CN", owner: "ai", label: "AI" },
      ],
    },
  });

  expect(mapboxMockState.addedMarkers).toHaveLength(0);
  expect(mapboxMockState.maps[0]?.easeTo).not.toHaveBeenCalled();
  expect(container.querySelectorAll(".game-map-marker")).toHaveLength(0);
});

test("renders player, ai, and neutral markers when finished", async () => {
  const { container } = render(GameMap, {
    props: {
      isFinished: true,
      markers: [
        { countryCode: "JP", owner: "neutral", label: "Start" },
        { countryCode: "KR", owner: "player", label: "Taylor Swift" },
        { countryCode: "CN", owner: "ai", label: "AI" },
      ],
    },
  });

  expect(mapboxMockState.addedMarkers).toHaveLength(3);
  expect(mapboxMockState.maps[0]?.easeTo).toHaveBeenCalledWith({
    center: [138, 36],
    zoom: 3.5,
    duration: 1500,
    essential: true,
  });
  expect(container.querySelectorAll(".game-map-marker")).toHaveLength(3);
  expect(
    container.querySelector(
      '[data-country-code="JP"] .game-map-marker__neutral-pin',
    ),
  ).not.toBeNull();
  expect(
    container.querySelector('[data-country-code="KR"] .avatar'),
  ).not.toBeNull();
  expect(
    container.querySelector('[data-country-code="CN"] svg'),
  ).not.toBeNull();
});

test("replaces marker instances cleanly when marker props change", async () => {
  const { container, rerender } = render(GameMap, {
    props: {
      isFinished: true,
      markers: [
        { countryCode: "JP", owner: "neutral", label: "Start" },
        { countryCode: "KR", owner: "player", label: "Taylor Swift" },
      ],
    },
  });

  expect(container.querySelectorAll(".game-map-marker")).toHaveLength(2);

  await rerender({
    isFinished: true,
    markers: [{ countryCode: "CN", owner: "ai", label: "AI" }],
  });

  expect(mapboxMockState.removedMarkers).toHaveLength(2);
  expect(mapboxMockState.maps[0]?.easeTo).toHaveBeenCalledWith({
    center: [138, 36],
    zoom: 3.5,
    duration: 1500,
    essential: true,
  });
  expect(container.querySelectorAll(".game-map-marker")).toHaveLength(1);
  expect(container.querySelector('[data-country-code="CN"]')).not.toBeNull();
  expect(container.querySelector('[data-country-code="JP"]')).toBeNull();
});

test("skips markers when coordinates are unavailable", async () => {
  const { container } = render(GameMap, {
    props: {
      isFinished: true,
      markers: [
        { countryCode: "??", owner: "player", label: "Taylor Swift" },
        { countryCode: "JP", owner: "neutral", label: "Start" },
      ],
    },
  });

  expect(mapboxMockState.addedMarkers).toHaveLength(1);
  expect(container.querySelectorAll(".game-map-marker")).toHaveLength(1);
  expect(container.querySelector('[data-country-code="JP"]')).not.toBeNull();
  expect(mapboxMockState.maps[0]?.easeTo).toHaveBeenCalledWith({
    center: [138, 36],
    zoom: 3.5,
    duration: 1500,
    essential: true,
  });
});

test("skips camera focus when the start marker is missing", async () => {
  render(GameMap, {
    props: {
      isFinished: true,
      markers: [{ countryCode: "KR", owner: "player", label: "Taylor Swift" }],
    },
  });

  expect(mapboxMockState.addedMarkers).toHaveLength(1);
  expect(mapboxMockState.maps[0]?.easeTo).not.toHaveBeenCalled();
});

test("clears result markers when reverting back to active state", async () => {
  const { container, rerender } = render(GameMap, {
    props: {
      isFinished: true,
      markers: [{ countryCode: "JP", owner: "neutral", label: "Start" }],
    },
  });

  expect(container.querySelectorAll(".game-map-marker")).toHaveLength(1);

  await rerender({
    isFinished: false,
    markers: [{ countryCode: "JP", owner: "neutral", label: "Start" }],
  });

  expect(mapboxMockState.maps[0]?.setConfigProperty).toHaveBeenCalledWith(
    "basemap",
    "showPlaceLabels",
    false,
  );
  expect(mapboxMockState.removedMarkers).toHaveLength(1);
  expect(container.querySelectorAll(".game-map-marker")).toHaveLength(0);
});
