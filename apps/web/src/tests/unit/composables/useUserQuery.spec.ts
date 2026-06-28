import { beforeEach, expect, test, vi } from "vitest";

const mockDefaultCreateUser = vi.fn();
const mockSetQueryData = vi.fn();
const mockConfiguration = vi.fn();

vi.mock("@tanstack/vue-query", () => ({
  useMutation: ({
    mutationFn,
    onSuccess,
  }: {
    mutationFn: (variables: unknown) => Promise<unknown>;
    onSuccess?: (data: unknown, variables: unknown) => void;
  }) => ({
    mutate: vi.fn(),
    mutateAsync: async (variables: unknown) => {
      const data = await mutationFn(variables);
      onSuccess?.(data, variables);
      return data;
    },
    isPending: false,
  }),
  useQueryClient: () => ({
    setQueryData: mockSetQueryData,
  }),
}));

vi.mock("@/services", async () => {
  const actual =
    await vi.importActual<typeof import("@/services")>("@/services");

  return {
    ...actual,
    Configuration: class {
      basePath: string;
      accessToken?: () => Promise<string>;

      constructor({
        basePath,
        accessToken,
      }: {
        basePath: string;
        accessToken?: () => Promise<string>;
      }) {
        this.basePath = basePath;
        this.accessToken = accessToken;
        mockConfiguration({ basePath, accessToken });
      }
    },
    DefaultApi: class {
      constructor() {}

      createUser(args: unknown) {
        return mockDefaultCreateUser(args);
      }
    },
  };
});

beforeEach(() => {
  mockDefaultCreateUser.mockReset();
  mockSetQueryData.mockReset();
  mockConfiguration.mockReset();
});

test("creates a user with the default authenticated api client", async () => {
  const createdUser = {
    userId: "user-123",
    displayName: "Taylor Swift",
    createdAt: new Date("2026-06-29T00:00:00Z"),
    updatedAt: new Date("2026-06-29T00:00:00Z"),
  };
  mockDefaultCreateUser.mockResolvedValue(createdUser);

  const { default: useUserQuery } = await import("@/composables/useUserQuery");

  const { createUserAsync } = useUserQuery();

  await expect(
    createUserAsync({
      userId: "user-123",
      createUserRequest: {
        displayName: "Taylor Swift",
      },
      idToken: "token-123",
    }),
  ).resolves.toEqual(createdUser);

  expect(mockConfiguration).toHaveBeenCalledTimes(1);
  expect(mockConfiguration.mock.calls[0]?.[0]?.accessToken).toBe("token-123");
  expect(mockDefaultCreateUser).toHaveBeenCalledWith({
    userId: "user-123",
    createUserRequest: {
      displayName: "Taylor Swift",
    },
  });
  expect(mockSetQueryData).toHaveBeenCalledWith(
    ["user", "user-123"],
    createdUser,
  );
});

test("creates a user with the shared authenticated api client", async () => {
  const createdUser = {
    userId: "user-456",
    displayName: "Alicia Keys",
    createdAt: new Date("2026-06-29T00:00:00Z"),
    updatedAt: new Date("2026-06-29T00:00:00Z"),
  };
  mockDefaultCreateUser.mockResolvedValue(createdUser);

  const { default: useUserQuery } = await import("@/composables/useUserQuery");

  const { createUserAsync } = useUserQuery();

  await expect(
    createUserAsync({
      userId: "user-456",
      createUserRequest: {
        displayName: "Alicia Keys",
      },
      idToken: "token-456",
    }),
  ).resolves.toEqual(createdUser);

  expect(mockConfiguration).toHaveBeenCalledTimes(1);
  expect(mockConfiguration.mock.calls[0]?.[0]?.accessToken).toBe("token-456");
  expect(mockDefaultCreateUser).toHaveBeenCalledWith({
    userId: "user-456",
    createUserRequest: {
      displayName: "Alicia Keys",
    },
  });
  expect(mockSetQueryData).toHaveBeenCalledWith(
    ["user", "user-456"],
    createdUser,
  );
});
