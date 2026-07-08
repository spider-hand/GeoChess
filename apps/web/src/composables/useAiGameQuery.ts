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

  async function createAiGame(
    createAiGameRequest: CreateAiGameRequest,
  ): Promise<CreateAiGame201Response> {
    return aiGameApi.createAiGame({ createAiGameRequest });
  }

  async function createAiGameMove(
    gameId: string,
    createAiGameMoveRequest: CreateAiGameMoveRequest,
  ): Promise<void> {
    await aiGameApi.createAiGameMove({ gameId, createAiGameMoveRequest });
  }

  async function timeoutAiGame(gameId: string): Promise<void> {
    await aiGameApi.timeoutAiGame({ gameId });
  }

  return {
    createAiGame,
    createAiGameMove,
    timeoutAiGame,
  };
};

export default useAiGameQuery;
