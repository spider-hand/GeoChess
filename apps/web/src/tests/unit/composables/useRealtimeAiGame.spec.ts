import { afterEach, expect, test, vi } from "vitest";
import { effectScope, nextTick } from "vue";

const mockOnValue = vi.fn();
const mockDatabaseRef = vi.fn();

vi.mock("firebase/database", () => ({
  onValue: (...args: unknown[]) => mockOnValue(...args),
  ref: (...args: unknown[]) => mockDatabaseRef(...args),
}));

vi.mock("@/lib/firebase", () => ({
  getFirebaseDatabase: () => ({ name: "database" }),
}));

afterEach(() => {
  mockOnValue.mockReset();
  mockDatabaseRef.mockReset();
});

test("accepts a realtime game payload when moves is missing", async () => {
  mockOnValue.mockImplementation((_, callback) => {
    callback({
      exists: () => true,
      val: () => ({
        id: "game-123",
        userId: "user-123",
        difficulty: "medium",
        turn: "player",
        start: "BB",
        country: "BB",
        availableMoves: ["CC"],
        usedCountries: ["BB"],
        createdAt: 1751155200000,
        updatedAt: 1751155200000,
      }),
    });

    return vi.fn();
  });

  const scope = effectScope();
  const { default: useRealtimeAiGame } =
    await import("@/composables/useRealtimeAiGame");

  const state = scope.run(() => useRealtimeAiGame("game-123"));
  await nextTick();

  expect(state?.realtimeAiGame.value).toMatchObject({
    id: "game-123",
  });
  expect(state?.realtimeAiGame.value?.moves).toBeUndefined();
  expect(state?.realtimeAiGameError.value).toBeNull();
  expect(state?.isLoadingRealtimeAiGame.value).toBe(false);
  expect(mockDatabaseRef).toHaveBeenCalledWith(
    { name: "database" },
    "aiGames/game-123",
  );

  scope.stop();
});
