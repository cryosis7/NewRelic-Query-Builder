import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SaveQueryModal } from "./SaveQueryModal";

describe("SaveQueryModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders modal when isOpen is true", () => {
    render(<SaveQueryModal {...defaultProps} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Save Query")).toBeInTheDocument();
    expect(screen.getByLabelText(/Query Name/i)).toBeInTheDocument();
  });

  it("does not render modal when isOpen is false", () => {
    render(<SaveQueryModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Save button is disabled when name input is empty", () => {
    render(<SaveQueryModal {...defaultProps} />);

    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(saveButton).toBeDisabled();
  });

  it("Save button is enabled when name has content", async () => {
    const user = userEvent.setup();
    render(<SaveQueryModal {...defaultProps} />);

    await user.type(screen.getByLabelText(/Query Name/i), "My Query");

    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(saveButton).toBeEnabled();
  });

  it("calls onSave with trimmed name when Save is clicked", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<SaveQueryModal {...defaultProps} onSave={onSave} />);

    await user.type(screen.getByLabelText(/Query Name/i), "  Test Query  ");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).toHaveBeenCalledWith("Test Query");
  });

  it("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SaveQueryModal {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose after successful save", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SaveQueryModal {...defaultProps} onClose={onClose} />);

    await user.type(screen.getByLabelText(/Query Name/i), "Saved");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onClose).toHaveBeenCalled();
  });

  it("clears name input when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SaveQueryModal {...defaultProps} />);

    await user.type(screen.getByLabelText(/Query Name/i), "Some text");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    // Re-render as open to check the input was cleared
    rerender(<SaveQueryModal {...defaultProps} isOpen={true} />);

    const input = screen.getByLabelText(/Query Name/i) as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("Save button is disabled for whitespace-only name", async () => {
    const user = userEvent.setup();
    render(<SaveQueryModal {...defaultProps} />);

    await user.type(screen.getByLabelText(/Query Name/i), "   ");

    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(saveButton).toBeDisabled();
  });

  it("saves query when Enter key is pressed with valid name", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(
      <SaveQueryModal {...defaultProps} onSave={onSave} onClose={onClose} />,
    );

    const input = screen.getByLabelText(/Query Name/i);
    await user.type(input, "My Query{Enter}");

    expect(onSave).toHaveBeenCalledWith("My Query");
    expect(onClose).toHaveBeenCalled();
  });

  it("does not save when Enter is pressed with empty name", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<SaveQueryModal {...defaultProps} onSave={onSave} />);

    const input = screen.getByLabelText(/Query Name/i);
    await user.type(input, "{Enter}");

    expect(onSave).not.toHaveBeenCalled();
  });

  it("does not save when Enter is pressed with whitespace-only name", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<SaveQueryModal {...defaultProps} onSave={onSave} />);

    const input = screen.getByLabelText(/Query Name/i);
    await user.type(input, "   {Enter}");

    expect(onSave).not.toHaveBeenCalled();
  });

  it("does not trigger save when other keys are pressed", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<SaveQueryModal {...defaultProps} onSave={onSave} />);

    const input = screen.getByLabelText(/Query Name/i);
    await user.type(input, "Test");
    await user.keyboard("{Escape}");
    await user.keyboard("{Tab}");

    expect(onSave).not.toHaveBeenCalled();
  });
});
