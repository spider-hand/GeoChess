import { beforeEach, expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";

import GameMap from "@/components/pages/Game/GameMap.vue";
import type { AiGameMapMarker, MultiplayerGameMapMarker } from "@/types/game";

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
    addLayer: ReturnType<typeof vi.fn>;
    addSource: ReturnType<typeof vi.fn>;
    getLayer: ReturnType<typeof vi.fn>;
    getSource: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    setConfigProperty: ReturnType<typeof vi.fn>;
    setPaintProperty: ReturnType<typeof vi.fn>;
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
    addLayer = vi.fn();
    addSource = vi.fn();
    getLayer = vi.fn(() => ({}));
    getSource = vi.fn();
    setConfigProperty = vi.fn();
    setPaintProperty = vi.fn();
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

    on(event: string, callback: () => void) {
      if (event === "style.load") {
        callback();
      }
    }
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

const finishedMarkers: Array<AiGameMapMarker> = [
  { countryCode: "JP", owner: "neutral" as const, label: "Start" },
  { countryCode: "KR", owner: "player" as const, label: "Taylor Swift" },
  { countryCode: "CN", owner: "ai" as const, label: "AI" },
];

const multiplayerFinishedMarkers: Array<MultiplayerGameMapMarker> = [
  { countryCode: "JP", owner: "neutral" as const, label: "Start" },
  { countryCode: "KR", owner: "player" as const, label: "Taylor Swift" },
  { countryCode: "CN", owner: "opponent" as const, label: "Opponent" },
];

const renderGameMap = (
  props: Partial<{
    isFinished: boolean;
    markers: Array<AiGameMapMarker | MultiplayerGameMapMarker>;
  }> = {},
) =>
  render(GameMap, {
    props: {
      isFinished: false,
      markers: [],
      ...props,
    },
  });

beforeEach(() => {
  mapboxMockState.maps.length = 0;
  mapboxMockState.addedMarkers.length = 0;
  mapboxMockState.removedMarkers.length = 0;
});

it("should show path markers while keeping place labels hidden", async () => {
  const { container } = renderGameMap({
    isFinished: false,
    markers: finishedMarkers,
  });

  expect(mapboxMockState.maps[0]?.options.config.basemap.showPlaceLabels).toBe(
    false,
  );
  expect(container.querySelectorAll(".game-map-marker")).toHaveLength(3);
});

it("should focus on the starting marker when the game is active", async () => {
  renderGameMap({
    isFinished: false,
    markers: finishedMarkers,
  });

  expect(mapboxMockState.maps[0]?.easeTo).toHaveBeenCalledWith({
    center: [138, 36],
    zoom: 3.5,
    duration: 1500,
    essential: true,
  });
});

it("should show place labels when the game is finished", async () => {
  const { container } = renderGameMap({
    isFinished: true,
    markers: finishedMarkers,
  });

  expect(mapboxMockState.maps[0]?.options.config.basemap.showPlaceLabels).toBe(
    true,
  );
  expect(container.querySelectorAll(".game-map-marker")).toHaveLength(3);
});

it("should apply the styles properly to player, ai and neutral markers", async () => {
  const { container } = renderGameMap({
    isFinished: true,
    markers: finishedMarkers,
  });

  expect(
    container.querySelector(
      '[data-country-code="JP"] .game-map-marker__neutral-pin',
    ),
  ).not.toBeNull();
  expect(
    container.querySelector(
      '[data-country-code="KR"] .game-map-marker__content--player .avatar',
    ),
  ).not.toBeNull();
  expect(
    container.querySelector(
      '[data-country-code="CN"] .game-map-marker__content--ai svg',
    ),
  ).not.toBeNull();
});

it("should focus on the starting marker when the game is finished", async () => {
  renderGameMap({
    isFinished: true,
    markers: finishedMarkers,
  });

  expect(mapboxMockState.maps[0]?.easeTo).toHaveBeenCalledWith({
    center: [138, 36],
    zoom: 3.5,
    duration: 1500,
    essential: true,
  });
});

it("should add country highlight layers and emphasize the latest country", async () => {
  renderGameMap({ markers: finishedMarkers });

  expect(mapboxMockState.maps[0]?.addSource).toHaveBeenCalledWith(
    "game-map-countries",
    {
      type: "vector",
      url: "mapbox://mapbox.country-boundaries-v1",
    },
  );
  expect(mapboxMockState.maps[0]?.addLayer).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      filter: [
        "all",
        ["==", ["get", "disputed"], "false"],
        [
          "any",
          ["==", "all", ["get", "worldview"]],
          ["in", "US", ["get", "worldview"]],
        ],
      ],
    }),
  );
  expect(mapboxMockState.maps[0]?.addLayer).toHaveBeenCalledTimes(2);
  expect(mapboxMockState.maps[0]?.setPaintProperty).toHaveBeenCalledWith(
    "game-map-country-outlines",
    "line-width",
    ["match", ["get", "iso_3166_1"], "CN", 4, 2],
  );
});

it("should render avatar marker content for opponent markers", async () => {
  const { container } = renderGameMap({
    isFinished: true,
    markers: multiplayerFinishedMarkers,
  });

  expect(
    container.querySelector(
      '[data-country-code="CN"] .game-map-marker__content--opponent .avatar',
    ),
  ).not.toBeNull();
});

it("should center the current country when the path advances", async () => {
  const { container, rerender } = renderGameMap({
    markers: finishedMarkers.slice(0, 2),
  });

  expect(container.querySelectorAll(".game-map-marker")).toHaveLength(2);

  await rerender({
    markers: finishedMarkers,
  });

  expect(container.querySelectorAll(".game-map-marker")).toHaveLength(3);
  expect(mapboxMockState.maps[0]?.easeTo).toHaveBeenLastCalledWith({
    center: [105, 35],
    duration: 1500,
    essential: true,
  });
  expect(mapboxMockState.maps[0]?.setPaintProperty).toHaveBeenLastCalledWith(
    "game-map-country-outlines",
    "line-width",
    ["match", ["get", "iso_3166_1"], "CN", 4, 2],
  );
});
