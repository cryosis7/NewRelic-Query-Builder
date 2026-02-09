import { useCallback, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import XUIButton from "@xero/xui/react/button";
import { Flex, FlexItem } from "./layout";
import copy from "@xero/xui-icon/icons-es6/copy";
import bookmark from "@xero/xui-icon/icons-es6/bookmark";
import { nrqlQueryAtom, saveQueryAtom } from "../atoms";
import { SaveQueryModal } from "./SaveQueryModal";

export function QueryPreview() {
  const query = useAtomValue(nrqlQueryAtom);
  const saveQuery = useSetAtom(saveQueryAtom);
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(query);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [query]);

  const isValidQuery = !query.startsWith("--");

  const handleSave = (name: string) => {
    saveQuery({ name });
  };

  return (
    <div role="group" aria-label="Generated Query">
      <Flex direction="column">
        <pre
          className="xui-text-panelcontent xui-padding"
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            backgroundColor: isValidQuery ? "#f5f5f5" : "#fff3cd",
            borderRadius: "4px",
            minHeight: "100px",
            marginBottom: "12px",
            fontFamily:
              'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: "1rem",
          }}
        >
          {query}
        </pre>
        <Flex gap="8px">
          <FlexItem flex={1}>
            <XUIButton
              variant={!copied ? "create" : "standard"}
              onClick={handleCopy}
              isDisabled={!isValidQuery}
              aria-label={copied ? "Copied!" : "Copy query to clipboard"}
              fullWidth="always"
              leftIcon={copy}
            >
              {copied ? "Copied!" : "Copy Query"}
            </XUIButton>
          </FlexItem>
          <FlexItem>
            <XUIButton
              variant="standard"
              onClick={() => setIsModalOpen(true)}
              isDisabled={!isValidQuery}
              aria-label="Save Query"
              fullWidth="always"
              leftIcon={bookmark}
            >
              Save Query
            </XUIButton>
          </FlexItem>
        </Flex>
      </Flex>
      <SaveQueryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
