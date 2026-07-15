import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

import useApi from "@/composables/useApi";
import {
  Configuration,
  DefaultApi,
  type CreateCurrentUserRequest,
  type GetCurrentUser200Response,
} from "@/services";

type CreateUserVariables = {
  createCurrentUserRequest: CreateCurrentUserRequest;
  idToken: string;
};

const useUserQuery = (userId?: MaybeRefOrGetter<string | null>) => {
  const { apiConfig } = useApi();
  const usersApi = new DefaultApi(apiConfig);
  const queryClient = useQueryClient();
  const normalizedUserId = computed(() => toValue(userId) ?? null);
  const userQuery = useQuery<GetCurrentUser200Response>({
    queryKey: computed(() => ["user", normalizedUserId.value]),
    enabled: computed(() => normalizedUserId.value !== null),
    queryFn: async () => {
      return usersApi.getCurrentUser();
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async ({
      createCurrentUserRequest,
      idToken,
    }: CreateUserVariables) => {
      const usersApi = new DefaultApi(
        new Configuration({
          basePath: import.meta.env.VITE_API_BASE_URL,
          accessToken: idToken,
        }),
      );

      return usersApi.createCurrentUser({
        createCurrentUserRequest,
      });
    },
    onSuccess: (user: GetCurrentUser200Response) => {
      queryClient.setQueryData(["user", user.userId], user);
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
