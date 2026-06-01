import { writeFile } from "node:fs/promises";
import path from "node:path";

const OUTPUT_PATH = path.resolve("server", "src", "data", "countries.json");

/**
 * Fetch country data with specific fields from REST Countries API
 */
const fetchCountries = async () => {
  const response = await fetch(
    "https://restcountries.com/v3.1/all?fields=borders,name,translations,cca2",
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch country data: ${response.status} ${response.statusText}`,
    );
  }

  const countries = await response.json();

  return countries;
};

/**
 * Transform the fetched country data into a mapping of cca2 codes to other details
 */
const transformCountries = (countries) => {
  const result = {};

  for (const country of countries) {
    if (!country || typeof country !== "object") {
      throw new TypeError("Encountered an invalid country entry");
    }

    const { cca2, ...countryData } = country;

    if (typeof cca2 !== "string" || cca2.length === 0) {
      throw new TypeError(
        "Encountered a country entry without a valid cca2 code",
      );
    }

    result[cca2] = countryData;
  }

  const sortedResult = Object.fromEntries(
    Object.entries(result).sort(([codeA], [codeB]) =>
      codeA.localeCompare(codeB),
    ),
  );

  return sortedResult;
};

const main = async () => {
  const countries = await fetchCountries();
  const transformedCountries = transformCountries(countries);
  const output = `${JSON.stringify(transformedCountries, null, 2)}\n`;

  await writeFile(OUTPUT_PATH, output, "utf8");

  console.log(
    `Saved ${Object.keys(transformedCountries).length} countries to ${OUTPUT_PATH}`,
  );
};

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
