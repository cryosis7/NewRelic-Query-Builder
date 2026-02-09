import { useState, useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import XUIButton from "@xero/xui/react/button";
import { XUIPanelSection, XUIPanelSectionHeading } from "@xero/xui/react/panel";
import crossSmall from "@xero/xui-icon/icons-es6/cross-small";
import warning from "@xero/xui-icon/icons-es6/warning";
import { QUERY_PRESETS } from "../data/presets";
import { validateSavedQuery } from "../lib/validateSavedQuery";
import { Flex, FlexItem } from "./layout";
import {
  applyPresetAtom,
  resetAtom,
  savedQueriesAtom,
  deleteSavedQueryAtom,
} from "../atoms";

export function CommonQueriesPanelSection() {
  const applyPreset = useSetAtom(applyPresetAtom);
  const reset = useSetAtom(resetAtom);
  const savedQueries = useAtomValue(savedQueriesAtom);
  const deleteSavedQuery = useSetAtom(deleteSavedQueryAtom);
  const [isEditing, setIsEditing] = useState(false);
  const effectiveIsEditing = isEditing && savedQueries.length > 0;

  const validationResults = useMemo(
    () =>
      new Map(
        savedQueries.map((saved) => [
          saved.id,
          validateSavedQuery(saved.state, saved.nrqlQuery),
        ]),
      ),
    [savedQueries],
  );

  return (
    <XUIPanelSection className="xui-padding-large">
      <XUIPanelSectionHeading headingLevel={2} className="xui-margin-bottom">
        Common Queries
      </XUIPanelSectionHeading>
      <Flex gap="8px" wrap>
        {QUERY_PRESETS.map((preset) => (
          <XUIButton
            key={preset.id}
            variant="standard"
            size="small"
            onClick={() => applyPreset(preset.state)}
            title={preset.description}
          >
            {preset.name}
          </XUIButton>
        ))}
        {savedQueries.map((saved) => {
          const validation = validationResults.get(saved.id);
          const isStale = validation && !validation.valid;

          return effectiveIsEditing ? (
            <XUIButton
              key={saved.id}
              variant="negative"
              size="small"
              onClick={() => deleteSavedQuery(saved.id)}
              aria-label={`Remove saved query: ${saved.name}`}
              rightIcon={crossSmall}
            >
              {saved.name}
            </XUIButton>
          ) : (
            <XUIButton
              key={saved.id}
              variant="standard"
              size="small"
              onClick={() => applyPreset(saved.state)}
              title={isStale ? validation.warnings.join("\n") : saved.nrqlQuery}
              leftIcon={isStale ? warning : undefined}
            >
              {saved.name}
            </XUIButton>
          );
        })}
        <FlexItem style={{ marginLeft: "auto" }}>
          <Flex gap="8px">
            {savedQueries.length > 0 && (
              <XUIButton
                variant="standard"
                size="small"
                onClick={() => setIsEditing(!isEditing)}
              >
                {effectiveIsEditing ? "Done" : "Edit"}
              </XUIButton>
            )}
            <XUIButton
              variant="standard"
              size="small"
              onClick={() => reset()}
              title="Reset to default query"
            >
              Reset
            </XUIButton>
          </Flex>
        </FlexItem>
      </Flex>
    </XUIPanelSection>
  );
}
