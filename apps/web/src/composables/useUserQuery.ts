import { useMutation, useQueryClient } from "@tanstack/vue-query";

import {
  Configuration,
  DefaultApi,
  type CreateUserRequest,
  type User,
} from "@/services";

type CreateUserVariables = {
  userId: string;
  createUserRequest: CreateUserRequest;
  idToken: string;
};

const useUserQuery = () => {
  const queryClient = useQueryClient();

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
    onSuccess: (user: User, variables) => {
      queryClient.setQueryData(["user", variables.userId], user);
    },
  });

  return {
    createUser: createUserMutation.mutate,
    createUserAsync: createUserMutation.mutateAsync,
    isCreatingUser: createUserMutation.isPending,
  };
};

export default useUserQuery;
