import { useI18n } from "vue-i18n";

import {
  countryDisplayCode,
  countryDisplayName,
  countryDisplayLabel,
  countryFlagSrc,
} from "@/utils/game";

const useCountry = () => {
  const { locale } = useI18n();

  const countryName = (countryCode: string) => {
    return countryDisplayName(countryCode, locale.value);
  };

  const countryLabel = (countryCode: string) => {
    return countryDisplayLabel(countryCode, locale.value);
  };

  const countryFlagAlt = (countryCode: string) => {
    return `${countryDisplayCode(countryCode)} flag`;
  };

  return {
    countryCode: countryDisplayCode,
    countryFlagAlt,
    countryFlagSrc,
    countryLabel,
    countryName,
  };
};

export default useCountry;
