import { beforeEach, expect, it, vi } from "vitest";
import { ref } from "vue";

const mockDefaultCreateCurrentUser = vi.fn();
const mockDefaultGetUser = vi.fn();
const mockSetQueryData = vi.fn();
const mockConfiguration = vi.fn();
const mockUseQuery = vi.fn();

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
  useQuery: ({
    queryFn,
    enabled,
    ...options
  }: {
    queryFn: () => Promise<unknown>;
    enabled: { value: boolean };
  }) => {
    mockUseQuery(options);

    return {
      data: ref(undefined),
      isLoading: ref(false),
      refetch: async () => {
        if (!enabled.value) {
          return { data: undefined };
        }

        return { data: await queryFn() };
      },
    };
  },
}));

vi.mock("@/composables/useApi", () => ({
  default: () => ({
    apiConfig: { basePath: "https://example.com" },
  }),
}));

vi.mock("@/services", async () => {
  const actual =
    await vi.importActual<typeof import("@/services")>("@/services");

  return {
    ...actual,
    Configuration: class {
      basePath: string;
      accessToken?: string;

      constructor({
        basePath,
        accessToken,
      }: {
        basePath: string;
        accessToken?: string;
      }) {
        this.basePath = basePath;
        this.accessToken = accessToken;
        mockConfiguration({ basePath, accessToken });
      }
    },
    DefaultApi: class {
      constructor() {}

      createCurrentUser(args: unknown) {
        return mockDefaultCreateCurrentUser(args);
      }

      getCurrentUser(args: unknown) {
        return mockDefaultGetUser(args);
      }
    },
  };
});

beforeEach(() => {
  mockDefaultCreateCurrentUser.mockReset();
  mockDefaultGetUser.mockReset();
  mockSetQueryData.mockReset();
  mockConfiguration.mockReset();
  mockUseQuery.mockReset();
});

it("should create a user with the provided id token and cache the created user", async () => {
  const createdUser = {
    userId: "user-123",
    displayName: "Taylor Swift",
    createdAt: new Date("2026-06-29T00:00:00Z"),
    updatedAt: new Date("2026-06-29T00:00:00Z"),
  };
  mockDefaultCreateCurrentUser.mockResolvedValue(createdUser);

  const { default: useUserQuery } = await import("@/composables/useUserQuery");

  const { createUserAsync } = useUserQuery();

  await expect(
    createUserAsync({
      createCurrentUserRequest: {
        displayName: "Taylor Swift",
      },
      idToken: "token-123",
    }),
  ).resolves.toEqual(createdUser);

  expect(mockConfiguration).toHaveBeenCalledTimes(1);
  expect(mockConfiguration.mock.calls[0]?.[0]?.accessToken).toBe("token-123");
  expect(mockDefaultCreateCurrentUser).toHaveBeenCalledWith({
    createCurrentUserRequest: {
      displayName: "Taylor Swift",
    },
  });
  expect(mockSetQueryData).toHaveBeenCalledWith(
    ["user", "user-123"],
    createdUser,
  );
});

it("should fetch the current user when a current user id is available", async () => {
  const fetchedUser = {
    userId: "user-123",
    displayName: "Taylor Swift",
    country: "JP",
    createdAt: new Date("2026-06-29T00:00:00Z"),
    updatedAt: new Date("2026-06-29T00:00:00Z"),
  };
  mockDefaultGetUser.mockResolvedValue(fetchedUser);

  const { default: useUserQuery } = await import("@/composables/useUserQuery");

  const { refetchUser } = useUserQuery("user-123");

  await expect(refetchUser()).resolves.toEqual({ data: fetchedUser });
  expect(mockDefaultGetUser).toHaveBeenCalledWith(undefined);
});

it("should keep the current user fresh while switching user-page tabs", async () => {
  const { default: useUserQuery } = await import("@/composables/useUserQuery");

  useUserQuery("user-123");

  expect(mockUseQuery).toHaveBeenCalledWith(
    expect.objectContaining({ staleTime: Infinity }),
  );
});
