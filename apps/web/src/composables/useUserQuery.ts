import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

import useApi from "@/composables/useApi";
import {
  Configuration,
  DefaultApi,
  type CreateUserRequest,
  type CreateUserResponse,
  type GetUserResponse,
} from "@/services";

type CreateUserVariables = {
  userId: string;
  createUserRequest: CreateUserRequest;
  idToken: string;
};

const useUserQuery = (userId?: MaybeRefOrGetter<string | null>) => {
  const { apiConfig } = useApi();
  const usersApi = new DefaultApi(apiConfig);
  const queryClient = useQueryClient();
  const normalizedUserId = computed(() => toValue(userId) ?? null);
  const userQuery = useQuery<GetUserResponse>({
    queryKey: computed(() => ["user", normalizedUserId.value]),
    enabled: computed(() => normalizedUserId.value !== null),
    queryFn: async () => {
      return usersApi.getUser({ userId: normalizedUserId.value! });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async ({
      userId,
      createUserRequest,
      idToken,
    }: CreateUserVariables) => {
      const usersApi = new DefaultApi(
        new Configuration({
          basePath: import.meta.env.VITE_API_BASE_URL,
          accessToken: idToken,
        }),
      );

      return usersApi.createUser({
        userId,
        createUserRequest,
      });
    },
    onSuccess: (user: CreateUserResponse, variables) => {
      queryClient.setQueryData(["user", variables.userId], user);
    },
  });

  return {
    createUser: createUserMutation.mutate,
    createUserAsync: createUserMutation.mutateAsync,
    isCreatingUser: createUserMutation.isPending,
    isLoadingUser: userQuery.isLoading,
    refetchUser: userQuery.refetch,
    user: userQuery.data,
  };
};

export default useUserQuery;
