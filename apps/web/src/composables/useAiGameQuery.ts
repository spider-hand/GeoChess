import useApi from "@/composables/useApi";
import {
  DefaultApi,
  type CreateAiGameRequest,
  type RealtimeAiGame,
} from "@/services";

const useAiGameQuery = () => {
  const { apiConfig } = useApi();
  const aiGameApi = new DefaultApi(apiConfig);

  async function createAiGame(
    createAiGameRequest: CreateAiGameRequest,
  ): Promise<RealtimeAiGame> {
    return aiGameApi.createAiGame({ createAiGameRequest });
  }

  return {
    createAiGame,
  };
};

export default useAiGameQuery;
