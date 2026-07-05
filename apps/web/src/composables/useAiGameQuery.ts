import useApi from "@/composables/useApi";
import {
  DefaultApi,
  type CreateAiGame201Response,
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

  return {
    createAiGame,
  };
};

export default useAiGameQuery;
