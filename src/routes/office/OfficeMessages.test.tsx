import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { client } from "../../api/client";
import { OfficeMessages } from "./OfficeMessages";
import { ToastProvider } from "./toast/ToastProvider";

vi.mock("../../api/client", () => ({
  client: {
    getMessages: vi.fn(),
    postMessage: vi.fn(),
    patchMessage: vi.fn(),
    deleteMessage: vi.fn(),
  },
}));

const api = vi.mocked(client);

function renderMessages() {
  render(
    <ToastProvider>
      <OfficeMessages />
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  api.getMessages.mockResolvedValue({
    messages: [
      { id: "m1", text: "Hello" },
      { id: "m2", text: "Goodbye" },
    ],
  });
  api.postMessage.mockResolvedValue({ id: "m3" });
  api.patchMessage.mockResolvedValue({ ok: true });
});

afterEach(() => {
  cleanup();
});

describe("OfficeMessages", () => {
  test("a failed add shows an error", async () => {
    api.postMessage.mockRejectedValue(new Error("HTTP 500"));
    renderMessages();
    await screen.findByDisplayValue("Hello");
    fireEvent.change(screen.getByPlaceholderText("new message"), { target: { value: "Gold is up" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await screen.findByText(/couldn't add the message/i);
  });

  test("saving one message keeps unsaved edits on another", async () => {
    renderMessages();
    fireEvent.change(await screen.findByDisplayValue("Goodbye"), { target: { value: "Farewell" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Save" })[0]!);

    await waitFor(() => expect(api.getMessages).toHaveBeenCalledTimes(2));
    expect(screen.getByDisplayValue("Farewell")).toBeTruthy();
  });
});
