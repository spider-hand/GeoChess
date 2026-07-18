import { useQuery } from "@tanstack/vue-query";

import useApi from "@/composables/useApi";
import { useAuth } from "@/composables/useAuth";
import { DefaultApi } from "@/services";

const useWithFriendsGameStatsQuery = () => {
  const { apiConfig } = useApi();
  const { isRegisteredUser } = useAuth();
  const withFriendsGameApi = new DefaultApi(apiConfig);
  const statsQuery = useQuery({
    queryKey: ["with-friends-games", "stats"],
    queryFn: () => withFriendsGameApi.getWithFriendsGameStats(),
    enabled: isRegisteredUser,
    staleTime: Infinity,
  });

  return {
    data: statsQuery.data,
    isError: statsQuery.isError,
    isLoading: statsQuery.isLoading,
  };
};

export default useWithFriendsGameStatsQuery;
