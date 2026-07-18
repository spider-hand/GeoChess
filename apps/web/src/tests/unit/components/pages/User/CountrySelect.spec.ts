import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";

import CountrySelect from "@/components/pages/User/CountrySelect.vue";
import { createAppI18n } from "@/i18n";

it("should render the default state properly", async () => {
  const { getByPlaceholder, getByText } = render(CountrySelect, {
    global: { plugins: [createAppI18n()] },
  });

  await expect.element(getByText(/^Country$/)).toBeVisible();
  await expect.element(getByPlaceholder("Search countries")).toBeVisible();
  await expect.element(getByText("No country")).toBeVisible();
});

it("should filter and emit the selected country", async () => {
  const onSelect = vi.fn();
  const { getByPlaceholder, getByText } = render(CountrySelect, {
    props: { onSelect },
    global: { plugins: [createAppI18n()] },
  });

  await getByPlaceholder("Search countries").fill("Japan");
  await getByText("Japan").click();

  expect(onSelect).toHaveBeenCalledWith("JP");
});
