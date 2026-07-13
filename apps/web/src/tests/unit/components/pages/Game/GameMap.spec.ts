import { beforeEach, expect, it, vi } from "vitest";
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
import type { AiGameMapMarker, MultiplayerGameMapMarker } from "@/types/game";

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

it("should not show place labels and markers when the game is active", async () => {
  const { container } = renderGameMap({
    isFinished: false,
    markers: finishedMarkers,
  });

  expect(mapboxMockState.maps[0]?.options.config.basemap.showPlaceLabels).toBe(
    false,
  );
  expect(container.querySelectorAll(".game-map-marker")).toHaveLength(0);
});

it("should not focus on the start marker when the game is active", async () => {
  renderGameMap({
    isFinished: false,
    markers: finishedMarkers,
  });

  expect(mapboxMockState.maps[0]?.easeTo).not.toHaveBeenCalled();
});

it("should show place labels and markers when the game is finished", async () => {
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

it("should focus on the start marker when the game is finished", async () => {
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

it("should remove markers when the game is reverted back to active state", async () => {
  const { container, rerender } = renderGameMap({
    isFinished: true,
    markers: finishedMarkers,
  });

  expect(container.querySelectorAll(".game-map-marker")).toHaveLength(3);

  await rerender({
    isFinished: false,
    markers: finishedMarkers,
  });

  expect(mapboxMockState.maps[0]?.setConfigProperty).toHaveBeenCalledWith(
    "basemap",
    "showPlaceLabels",
    false,
  );
  expect(container.querySelectorAll(".game-map-marker")).toHaveLength(0);
});
