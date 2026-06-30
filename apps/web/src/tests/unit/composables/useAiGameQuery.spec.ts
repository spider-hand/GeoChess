import { beforeEach, expect, test, vi } from "vitest";

const mockCreateAiGame = vi.fn();
const mockUseApi = vi.fn();

vi.mock("@/composables/useApi", () => ({
  default: () => mockUseApi(),
}));

class MockDefaultApi {
  createAiGame(...args: unknown[]) {
    return mockCreateAiGame(...args);
  }
}

vi.mock("@/services", () => ({
  DefaultApi: MockDefaultApi,
}));

beforeEach(() => {
  mockCreateAiGame.mockReset();
  mockUseApi.mockReset();
  mockUseApi.mockReturnValue({
    apiConfig: { basePath: "http://example.test" },
  });
});

test("calls createAiGame with the selected difficulty", async () => {
  mockCreateAiGame.mockResolvedValue({ id: "game-123" });

  const { default: useAiGameQuery } =
    await import("@/composables/useAiGameQuery");

  await useAiGameQuery().createAiGame({ difficulty: "hard" });

  expect(mockCreateAiGame).toHaveBeenCalledWith({
    createAiGameRequest: { difficulty: "hard" },
  });
});
