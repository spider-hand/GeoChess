import { useQuery } from "@tanstack/vue-query";

import useApi from "@/composables/useApi";
import {
  DefaultApi,
  type CreateAiGame201Response,
  type CreateAiGameMoveRequest,
  type CreateAiGameRequest,
} from "@/services";

const useAiGameQuery = () => {
  const { apiConfig } = useApi();
  const aiGameApi = new DefaultApi(apiConfig);
  const aiGamesQuery = useQuery({
    queryKey: ["ai-games", 5, "updated_at", "desc"],
    queryFn: () =>
      aiGameApi.getAiGames({
        limit: 5,
        sortBy: "updated_at",
        orderBy: "desc",
      }),
    staleTime: Infinity,
  });

  const createAiGame = async (
    createAiGameRequest: CreateAiGameRequest,
  ): Promise<CreateAiGame201Response> => {
    return aiGameApi.createAiGame({ createAiGameRequest });
  };

  const createAiGameMove = async (
    gameId: string,
    createAiGameMoveRequest: CreateAiGameMoveRequest,
  ): Promise<void> => {
    await aiGameApi.createAiGameMove({ gameId, createAiGameMoveRequest });
  };

  return {
    createAiGame,
    createAiGameMove,
    data: aiGamesQuery.data,
    isError: aiGamesQuery.isError,
    isLoading: aiGamesQuery.isLoading,
  };
};

export default useAiGameQuery;
