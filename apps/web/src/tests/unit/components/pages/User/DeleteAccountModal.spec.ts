import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";

import DeleteAccountModal from "@/components/pages/User/DeleteAccountModal.vue";
import { createAppI18n } from "@/i18n";

const renderModal = (props: Record<string, unknown> = {}) =>
  render(DeleteAccountModal, {
    props: { errorMessage: null, isDeleting: false, isOpen: true, ...props },
    global: { plugins: [createAppI18n()] },
  });

it("should render the default state properly", async () => {
  const { getByRole } = renderModal();

  await expect
    .element(getByRole("button", { name: "Delete", exact: true }))
    .toBeDisabled();
});

it("should enable and emit delete after typing Delete", async () => {
  const onDelete = vi.fn();
  const { getByRole } = renderModal({ onDelete });
  const input = getByRole("textbox");

  await input.fill("Delete");
  await getByRole("button", { name: "Delete", exact: true }).click();

  expect(onDelete).toHaveBeenCalledTimes(1);
});
