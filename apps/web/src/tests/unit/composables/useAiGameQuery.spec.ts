import { beforeEach, expect, it, vi } from "vitest";

const mockCreateAiGame = vi.fn();
const mockCreateAiGameMove = vi.fn();
const mockTimeoutAiGame = vi.fn();
const mockUseApi = vi.fn();

vi.mock("@/composables/useApi", () => ({
  default: () => mockUseApi(),
}));

class MockDefaultApi {
  createAiGame(...args: unknown[]) {
    return mockCreateAiGame(...args);
  }

  createAiGameMove(...args: unknown[]) {
    return mockCreateAiGameMove(...args);
  }

  timeoutAiGame(...args: unknown[]) {
    return mockTimeoutAiGame(...args);
  }
}

vi.mock("@/services", () => ({
  DefaultApi: MockDefaultApi,
}));

beforeEach(() => {
  mockCreateAiGame.mockReset();
  mockCreateAiGameMove.mockReset();
  mockTimeoutAiGame.mockReset();
  mockUseApi.mockReset();
  mockUseApi.mockReturnValue({
    apiConfig: { basePath: "http://example.test" },
  });
});

it("should create an ai game with the provided difficulty", async () => {
  mockCreateAiGame.mockResolvedValue({ id: "game-123" });

  const { default: useAiGameQuery } =
    await import("@/composables/useAiGameQuery");

  await useAiGameQuery().createAiGame({ difficulty: "hard" });

  expect(mockCreateAiGame).toHaveBeenCalledWith({
    createAiGameRequest: { difficulty: "hard" },
  });
});

it("should create an ai move with the provided game id and country code", async () => {
  mockCreateAiGameMove.mockResolvedValue(undefined);

  const { default: useAiGameQuery } =
    await import("@/composables/useAiGameQuery");

  await useAiGameQuery().createAiGameMove("game-123", { countryCode: "CC" });

  expect(mockCreateAiGameMove).toHaveBeenCalledWith({
    gameId: "game-123",
    createAiGameMoveRequest: { countryCode: "CC" },
  });
});

it("should timeout an ai game with the provided game id", async () => {
  mockTimeoutAiGame.mockResolvedValue(undefined);

  const { default: useAiGameQuery } =
    await import("@/composables/useAiGameQuery");

  await useAiGameQuery().timeoutAiGame("game-123");

  expect(mockTimeoutAiGame).toHaveBeenCalledWith({
    gameId: "game-123",
  });
});
