import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { client } from "../../api/client";
import type { Ware } from "../../api/types";
import { OfficeMarket } from "./OfficeMarket";
import { ToastProvider } from "./toast/ToastProvider";

vi.mock("../../api/client", () => ({
  client: {
    getWares: vi.fn(),
    patchWare: vi.fn(),
    postWare: vi.fn(),
    deleteWare: vi.fn(),
    getHistoryWares: vi.fn(),
  },
}));

const api = vi.mocked(client);

const toadstool: Ware = { id: "w1", name: "Toadstool", priceCoins: 10 };
const newt: Ware = { id: "w2", name: "Newt", priceCoins: 25 };

function renderMarket() {
  render(
    <ToastProvider>
      <OfficeMarket />
    </ToastProvider>,
  );
}

const saveButtons = () => screen.getAllByRole<HTMLButtonElement>("button", { name: "Save" });

beforeEach(() => {
  vi.resetAllMocks();
  api.getWares.mockResolvedValue({ wares: [toadstool, newt] });
  api.patchWare.mockResolvedValue({ ok: true });
  api.postWare.mockResolvedValue({ id: "w3" });
});

afterEach(() => {
  cleanup();
});

describe("OfficeMarket", () => {
  test("a blank price is not saved as 0", async () => {
    renderMarket();
    fireEvent.change(await screen.findByDisplayValue("10"), { target: { value: "" } });
    fireEvent.click(saveButtons()[0]!);

    await screen.findByText(/whole number/i);
    expect(api.patchWare).not.toHaveBeenCalled();
  });

  test("a new ware with a name but no price is not created", async () => {
    renderMarket();
    await screen.findByDisplayValue("Toadstool");
    fireEvent.change(screen.getByPlaceholderText("name"), { target: { value: "Bat wing" } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await screen.findByText(/whole number/i);
    expect(api.postWare).not.toHaveBeenCalled();
  });

  test("a failed save shows an error and re-enables the buttons", async () => {
    api.patchWare.mockRejectedValue(new Error("HTTP 500"));
    renderMarket();
    await screen.findByDisplayValue("Toadstool");
    fireEvent.click(saveButtons()[0]!);

    await screen.findByText(/couldn't save toadstool/i);
    await waitFor(() => expect(saveButtons()[0]!.disabled).toBe(false));
  });

  test("a bulk create that fails partway keeps only the rows not yet created", async () => {
    api.postWare.mockResolvedValueOnce({ id: "w3" }).mockRejectedValueOnce(new Error("HTTP 500"));
    renderMarket();
    await screen.findByDisplayValue("Toadstool");

    fireEvent.click(screen.getByRole("button", { name: "Add row" }));
    const names = screen.getAllByPlaceholderText("name");
    const prices = screen.getAllByPlaceholderText("price");
    fireEvent.change(names[0]!, { target: { value: "Bat wing" } });
    fireEvent.change(prices[0]!, { target: { value: "4" } });
    fireEvent.change(names[1]!, { target: { value: "Frogspawn" } });
    fireEvent.change(prices[1]!, { target: { value: "6" } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await screen.findByText(/couldn't create frogspawn/i);
    expect(api.postWare).toHaveBeenCalledTimes(2);
    expect(screen.queryByDisplayValue("Bat wing")).toBeNull();
    expect(screen.getByDisplayValue("Frogspawn")).toBeTruthy();
  });

  test("saving one ware keeps unsaved edits on another", async () => {
    renderMarket();
    fireEvent.change(await screen.findByDisplayValue("Newt"), { target: { value: "Eye of newt" } });
    fireEvent.click(saveButtons()[0]!);

    await waitFor(() => expect(api.getWares).toHaveBeenCalledTimes(2));
    expect(screen.getByDisplayValue("Eye of newt")).toBeTruthy();
  });

  test("rows without unsaved edits show the latest server values after a reload", async () => {
    api.getWares
      .mockResolvedValueOnce({ wares: [toadstool, newt] })
      .mockResolvedValueOnce({ wares: [{ ...toadstool, priceCoins: 12 }, newt] });
    renderMarket();
    await screen.findByDisplayValue("Newt");
    fireEvent.click(saveButtons()[1]!);

    await screen.findByDisplayValue("12");
  });
});
