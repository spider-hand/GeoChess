import useApi from "@/composables/useApi";
import { DefaultApi } from "@/services";

const useWithFriendsGameQuery = () => {
  const { apiConfig } = useApi();
  const withFriendsGamesApi = new DefaultApi(apiConfig);

  const createWithFriendsGame = async (): Promise<{
    id: string;
    roomKey: string;
  }> => {
    return withFriendsGamesApi.createWithFriendsGame();
  };

  const joinWithFriendsGame = async (joinWithFriendsGameRequest: {
    roomKey: string;
  }): Promise<{
    id: string;
  }> => {
    return withFriendsGamesApi.joinWithFriendsGame({
      joinWithFriendsGameRequest,
    });
  };

  const createWithFriendsGameMove = async (
    gameId: string,
    createWithFriendsGameMoveRequest: { countryCode: string },
  ): Promise<void> => {
    await withFriendsGamesApi.createWithFriendsGameMove({
      gameId,
      createWithFriendsGameMoveRequest,
    });
  };

  return {
    createWithFriendsGame,
    joinWithFriendsGame,
    createWithFriendsGameMove,
  };
};

export default useWithFriendsGameQuery;
