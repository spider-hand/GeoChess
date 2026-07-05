import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const API_URL = "https://api.restcountries.com/countries/v5";
const OUTPUT_PATH = path.resolve("scripts", "output", "countries.raw.json");
const PAGE_SIZE = 100;

function getApiKey() {
  const apiKey = process.env.RESTCOUNTRIES_API_KEY;

  if (!apiKey) {
    throw new Error("RESTCOUNTRIES_API_KEY is required.");
  }

  return apiKey;
}

async function fetchPage(apiKey, offset) {
  const url = new URL(API_URL);
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("pretty", "1");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch countries at offset ${offset}: ${response.status} ${response.statusText}`,
    );
  }

  const page = await response.json();
  const countries = page?.data?.objects;

  return {
    countries,
    hasMore: page?.data?.meta?.more !== false && countries.length === PAGE_SIZE,
  };
}

async function fetchAllCountries(apiKey) {
  const countries = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await fetchPage(apiKey, offset);
    console.log(`Fetched offset=${offset} count=${page.countries.length}`);
    countries.push(...page.countries);

    if (!page.hasMore) {
      return countries;
    }
  }
}

async function writeCountries(countries) {
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(
    OUTPUT_PATH,
    `${JSON.stringify(countries, null, 2)}\n`,
    "utf8",
  );
}

async function main() {
  const countries = await fetchAllCountries(getApiKey());
  await writeCountries(countries);
  console.log(`Saved ${countries.length} countries to ${OUTPUT_PATH}`);
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
