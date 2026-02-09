import { useState } from "react";
import XUIModal, {
  XUIModalBody,
  XUIModalFooter,
  XUIModalHeader,
  XUIModalHeading,
} from "@xero/xui/react/modal";
import XUIButton from "@xero/xui/react/button";
import XUITextInput from "@xero/xui/react/textinput";
import { Flex, FlexItem } from "./layout";

interface SaveQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export function SaveQueryModal({
  isOpen,
  onClose,
  onSave,
}: SaveQueryModalProps) {
  const [name, setName] = useState("");

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName("");
      onClose();
    }
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      handleSave();
    }
  };

  return (
    <XUIModal
      isOpen={isOpen}
      onClose={handleClose}
      closeButtonLabel="Close"
      size="small"
      hideOnEsc
      hideOnOverlayClick
    >
      <XUIModalHeader>
        <XUIModalHeading>Save Query</XUIModalHeading>
      </XUIModalHeader>
      <XUIModalBody>
        <XUITextInput
          label="Query Name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="e.g. API Latency Check"
          isRequired
          isFieldLayout
        />
      </XUIModalBody>
      <XUIModalFooter>
        <Flex gap="8px" justify="end">
          <FlexItem>
            <XUIButton variant="standard" onClick={handleClose}>
              Cancel
            </XUIButton>
          </FlexItem>
          <FlexItem>
            <XUIButton
              variant="main"
              onClick={handleSave}
              isDisabled={!name.trim()}
            >
              Save
            </XUIButton>
          </FlexItem>
        </Flex>
      </XUIModalFooter>
    </XUIModal>
  );
}
