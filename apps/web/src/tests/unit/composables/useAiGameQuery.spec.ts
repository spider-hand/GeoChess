import { beforeEach, expect, it, vi } from "vitest";
import { ref } from "vue";

const mockCreateAiGame = vi.fn();
const mockCreateAiGameMove = vi.fn();
const mockUseApi = vi.fn();
const mockUseQuery = vi.fn();
const isRegisteredUser = ref(false);

vi.mock("@tanstack/vue-query", () => ({
  useQuery: (options: unknown) => {
    mockUseQuery(options);

    return {
      data: ref(undefined),
      isError: ref(false),
      isLoading: ref(false),
    };
  },
}));

vi.mock("@/composables/useApi", () => ({
  default: () => mockUseApi(),
}));

vi.mock("@/composables/useAuth", () => ({
  useAuth: () => ({ isRegisteredUser }),
}));

class MockDefaultApi {
  createAiGame(...args: unknown[]) {
    return mockCreateAiGame(...args);
  }

  createAiGameMove(...args: unknown[]) {
    return mockCreateAiGameMove(...args);
  }
}

vi.mock("@/services", () => ({
  DefaultApi: MockDefaultApi,
}));

beforeEach(() => {
  mockCreateAiGame.mockReset();
  mockCreateAiGameMove.mockReset();
  mockUseQuery.mockReset();
  mockUseApi.mockReset();
  isRegisteredUser.value = false;
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

it.each([false, true])(
  "should only fetch AI games for registered users",
  async (registered) => {
    isRegisteredUser.value = registered;
    const { default: useAiGameQuery } =
      await import("@/composables/useAiGameQuery");

    useAiGameQuery();

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: expect.objectContaining({ value: registered }),
        staleTime: Infinity,
      }),
    );
  },
);

it("should create an ai move with the provided game id and country code", async () => {
  mockCreateAiGameMove.mockResolvedValue(undefined);

  const { default: useAiGameQuery } =
    await import("@/composables/useAiGameQuery");

  await useAiGameQuery().createAiGameMove("game-123", {
    countryCode: "CC",
  });

  expect(mockCreateAiGameMove).toHaveBeenCalledWith({
    gameId: "game-123",
    createAiGameMoveRequest: { countryCode: "CC" },
  });
});
