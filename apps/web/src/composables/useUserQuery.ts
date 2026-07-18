import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

import useApi from "@/composables/useApi";
import {
  Configuration,
  DefaultApi,
  type CreateCurrentUserRequest,
  type GetCurrentUser200Response,
  type UpdateUserRequest,
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
    staleTime: Infinity,
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

  const updateUserMutation = useMutation({
    mutationFn: async (updateUserRequest: UpdateUserRequest) => {
      return usersApi.updateCurrentUser({
        createCurrentUserRequest: updateUserRequest,
      });
    },
    onSuccess: (user: GetCurrentUser200Response) => {
      queryClient.setQueryData(["user", user.userId], user);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      await usersApi.deleteCurrentUser();
    },
  });

  return {
    createUser: createUserMutation.mutate,
    createUserAsync: createUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutate,
    deleteUserAsync: deleteUserMutation.mutateAsync,
    isDeletingUser: deleteUserMutation.isPending,
    isCreatingUser: createUserMutation.isPending,
    isLoadingUser: userQuery.isLoading,
    refetchUser: userQuery.refetch,
    user: userQuery.data,
    updateUser: updateUserMutation.mutate,
    updateUserAsync: updateUserMutation.mutateAsync,
    isUpdatingUser: updateUserMutation.isPending,
  };
};

export default useUserQuery;
