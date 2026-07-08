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

  const timeoutAiGame = async (gameId: string): Promise<void> => {
    await aiGameApi.timeoutAiGame({ gameId });
  };

  return {
    createAiGame,
    createAiGameMove,
    timeoutAiGame,
  };
};

export default useAiGameQuery;
