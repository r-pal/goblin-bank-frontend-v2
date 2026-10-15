import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { client } from "../../api/client";
import type { Account } from "../../api/types";
import { OfficeBank } from "./OfficeBank";
import { ToastProvider } from "./toast/ToastProvider";

vi.mock("../../api/client", () => ({
  client: {
    getAccounts: vi.fn(),
    postCoinChange: vi.fn(),
    patchInterestRate: vi.fn(),
    getHistoryAccounts: vi.fn(),
    getHistoryInterestRates: vi.fn(),
    postAdminReset: vi.fn(),
  },
}));

const api = vi.mocked(client);

const mossy: Account = { hovelSlug: "mossy-hollow", name: "Mossy Hollow", balanceCoins: 100, interestRatePercent: 5 };
const bog: Account = { hovelSlug: "bog-end", name: "Bog End", balanceCoins: 50, interestRatePercent: 3 };

function renderBank() {
  render(
    <ToastProvider>
      <OfficeBank />
    </ToastProvider>,
  );
}

const coinInputs = () => screen.getAllByPlaceholderText("+/- coins");

beforeEach(() => {
  vi.resetAllMocks();
  api.getAccounts.mockResolvedValue({ accounts: [mossy, bog] });
  api.postCoinChange.mockResolvedValue({ ok: true });
  api.patchInterestRate.mockResolvedValue({ hovelSlug: "mossy-hollow", interestRatePercent: 5 });
});

afterEach(() => {
  cleanup();
});

describe("OfficeBank", () => {
  test("a blank interest rate is not saved as 0%", async () => {
    renderBank();
    fireEvent.change(await screen.findByDisplayValue("5"), { target: { value: "" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Set %" })[0]!);

    await screen.findByText(/whole number/i);
    expect(api.patchInterestRate).not.toHaveBeenCalled();
  });

  test("a failed coin change shows an error", async () => {
    api.postCoinChange.mockRejectedValue(new Error("HTTP 500"));
    renderBank();
    await screen.findByText("Mossy Hollow");
    fireEvent.change(coinInputs()[0]!, { target: { value: "20" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Apply" })[0]!);

    await screen.findByText(/couldn't apply coins to mossy hollow/i);
  });

  test("applying coins to one hovel keeps an unsaved rate on another", async () => {
    renderBank();
    fireEvent.change(await screen.findByDisplayValue("3"), { target: { value: "7" } });
    fireEvent.change(coinInputs()[0]!, { target: { value: "20" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Apply" })[0]!);

    await waitFor(() => expect(api.getAccounts).toHaveBeenCalledTimes(2));
    expect(screen.getByDisplayValue("7")).toBeTruthy();
  });
});
