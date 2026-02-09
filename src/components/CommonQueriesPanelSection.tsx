import { useAtomValue, useSetAtom } from "jotai";
import XUIButton, { XUIIconButton } from "@xero/xui/react/button";
import { XUIPanelSection, XUIPanelSectionHeading } from "@xero/xui/react/panel";
import crossSmall from "@xero/xui-icon/icons-es6/cross-small";
import { QUERY_PRESETS } from "../data/presets";
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
        {savedQueries.map((saved) => (
          <Flex key={saved.id} gap="2px" align="center">
            <XUIButton
              variant="standard"
              size="small"
              onClick={() => applyPreset(saved.state)}
              title={saved.nrqlQuery}
            >
              {saved.name}
            </XUIButton>
            <XUIIconButton
              ariaLabel={`Remove saved query: ${saved.name}`}
              icon={crossSmall}
              iconSize="small"
              iconColor="red"
              size="xsmall"
              onClick={() => deleteSavedQuery(saved.id)}
            />
          </Flex>
        ))}
        <FlexItem style={{ marginLeft: "auto" }}>
          <XUIButton
            variant="standard"
            size="small"
            onClick={() => reset()}
            title="Reset to default query"
          >
            Reset
          </XUIButton>
        </FlexItem>
      </Flex>
    </XUIPanelSection>
  );
}
