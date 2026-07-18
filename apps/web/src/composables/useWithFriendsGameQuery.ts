import { useQuery } from "@tanstack/vue-query";

import useApi from "@/composables/useApi";
import { useAuth } from "@/composables/useAuth";
import { DefaultApi } from "@/services";

const useWithFriendsGameQuery = () => {
  const { apiConfig } = useApi();
  const { isRegisteredUser } = useAuth();
  const withFriendsGameApi = new DefaultApi(apiConfig);

  const createWithFriendsGame = async (): Promise<{
    id: string;
    roomKey: string;
  }> => {
    return withFriendsGameApi.createWithFriendsGame();
  };

  const joinWithFriendsGame = async (joinWithFriendsGameRequest: {
    roomKey: string;
  }): Promise<{
    id: string;
  }> => {
    return withFriendsGameApi.joinWithFriendsGame({
      joinWithFriendsGameRequest,
    });
  };

  const createWithFriendsGameMove = async (
    gameId: string,
    createWithFriendsGameMoveRequest: { countryCode: string },
  ): Promise<void> => {
    await withFriendsGameApi.createWithFriendsGameMove({
      gameId,
      createWithFriendsGameMoveRequest,
    });
  };

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
    createWithFriendsGame,
    joinWithFriendsGame,
    createWithFriendsGameMove,
  };
};

export default useWithFriendsGameQuery;
