import { HealthApi } from "../services";
import useApi from "./useApi";

const useHealthApi = () => {
  const { apiConfig } = useApi();
  const healthApi = new HealthApi(apiConfig);

  return { healthApi };
};

export default useHealthApi;
