import { beforeEach, expect, it, vi } from "vitest";
import { ref } from "vue";

const mockCreateWithFriendsGame = vi.fn();
const mockJoinWithFriendsGame = vi.fn();
const isRegisteredUser = ref(false);

vi.mock("@tanstack/vue-query", () => ({
  useQuery: () => ({
    data: ref(undefined),
    isError: ref(false),
    isLoading: ref(false),
  }),
}));

vi.mock("@/composables/useApi", () => ({
  default: () => ({
    apiConfig: { basePath: "http://example.test" },
  }),
}));

vi.mock("@/composables/useAuth", () => ({
  useAuth: () => ({ isRegisteredUser }),
}));

vi.mock("@/services", () => ({
  DefaultApi: class {
    createWithFriendsGame(...args: unknown[]) {
      return mockCreateWithFriendsGame(...args);
    }

    joinWithFriendsGame(...args: unknown[]) {
      return mockJoinWithFriendsGame(...args);
    }
  },
}));

beforeEach(() => {
  mockCreateWithFriendsGame.mockReset();
  mockJoinWithFriendsGame.mockReset();
});

it("should create a with-friends game", async () => {
  mockCreateWithFriendsGame.mockResolvedValue({ id: "game-123" });

  const { default: useWithFriendsGameQuery } =
    await import("@/composables/useWithFriendsGameQuery");

  await useWithFriendsGameQuery().createWithFriendsGame();

  expect(mockCreateWithFriendsGame).toHaveBeenCalledWith();
});

it("should join a with-friends game with the room key", async () => {
  mockJoinWithFriendsGame.mockResolvedValue({ id: "game-123" });

  const { default: useWithFriendsGameQuery } =
    await import("@/composables/useWithFriendsGameQuery");

  await useWithFriendsGameQuery().joinWithFriendsGame({ roomKey: "654321" });

  expect(mockJoinWithFriendsGame).toHaveBeenCalledWith({
    joinWithFriendsGameRequest: { roomKey: "654321" },
  });
});
