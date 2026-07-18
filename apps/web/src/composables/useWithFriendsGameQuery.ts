import { useQuery } from "@tanstack/vue-query";

import useApi from "@/composables/useApi";
import { useAuth } from "@/composables/useAuth";
import { DefaultApi } from "@/services";

const useWithFriendsGameQuery = () => {
  const { apiConfig } = useApi();
  const { isRegisteredUser } = useAuth();
  const withFriendsGameApi = new DefaultApi(apiConfig);
  const gamesQuery = useQuery({
    queryKey: ["with-friends-games", 5, "updated_at", "desc"],
    queryFn: () =>
      withFriendsGameApi.getWithFriendsGames({
        limit: 5,
        sortBy: "updated_at",
        orderBy: "desc",
      }),
    enabled: isRegisteredUser,
    staleTime: Infinity,
  });

  return {
    data: gamesQuery.data,
    isError: gamesQuery.isError,
    isLoading: gamesQuery.isLoading,
  };
};

export default useWithFriendsGameQuery;
