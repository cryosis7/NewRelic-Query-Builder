import XUITextInput, {
  XUITextInputSideElement,
} from "@xero/xui/react/textinput";
import XUIControlGroup from "@xero/xui/react/controlgroup";
import {
  XUISingleSelect,
  XUISingleSelectOption,
  XUISingleSelectOptions,
  XUISingleSelectTrigger,
} from "@xero/xui/react/singleselect";
import XUIToggle, { XUIToggleOption } from "@xero/xui/react/toggle";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  setTimePeriodModeAtom,
  setTimePeriodRelativeAtom,
  timePeriodAtom,
  sinceDateAtom,
  sinceTimeAtom,
  untilDateAtom,
  untilTimeAtom,
  initializeTimePeriodAtom,
} from "../atoms";
import { DateTimeInput } from "./DateTimeInput.tsx";
import { useEffect } from "react";

const RELATIVE_OPTIONS = [
  "15m ago",
  "30m ago",
  "1h ago",
  "3h ago",
  "6h ago",
  "12h ago",
  "24h ago",
  "7d ago",
];

export function TimePeriodSelector() {
  const { mode, relative } = useAtomValue(timePeriodAtom);

  const setMode = useSetAtom(setTimePeriodModeAtom);
  const setRelative = useSetAtom(setTimePeriodRelativeAtom);
  const initializeTimePeriod = useSetAtom(initializeTimePeriodAtom);

  const [sinceDate, setSinceDate] = useAtom(sinceDateAtom);
  const [sinceTime, setSinceTime] = useAtom(sinceTimeAtom);
  const [untilDate, setUntilDate] = useAtom(untilDateAtom);
  const [untilTime, setUntilTime] = useAtom(untilTimeAtom);

  useEffect(() => {
    initializeTimePeriod();
  }, [initializeTimePeriod]);

  const isPresetValue = RELATIVE_OPTIONS.includes(relative);

  return (
    <XUIControlGroup label="Time Period" isLockedVertical>
      <XUIToggle
        label="Mode"
        layout="fullwidth"
        className="xui-margin-bottom-small"
      >
        <XUIToggleOption
          name="timePeriodMode"
          type="radio"
          isChecked={mode === "relative"}
          onChange={() => setMode("relative")}
        >
          Relative
        </XUIToggleOption>
        <XUIToggleOption
          name="timePeriodMode"
          type="radio"
          isChecked={mode === "absolute"}
          onChange={() => setMode("absolute")}
        >
          Exact
        </XUIToggleOption>
      </XUIToggle>

      {mode === "absolute" ? (
        <>
          <DateTimeInput
            label="Since"
            date={sinceDate}
            time={sinceTime}
            onDateChange={setSinceDate}
            onTimeChange={setSinceTime}
          />
          <DateTimeInput
            label="Until"
            date={untilDate}
            time={untilTime}
            onDateChange={setUntilDate}
            onTimeChange={setUntilTime}
            minDate={sinceDate}
          />
        </>
      ) : (
        <XUITextInput
          label="Relative"
          type="text"
          placeholder="e.g. 3h"
          value={relative}
          onChange={(e) => setRelative(e.target.value)}
          rightElement={
            <XUITextInputSideElement type="button">
              <XUISingleSelect
                key={`relative-select-${relative}`}
                defaultSelectedOptionId={isPresetValue ? relative : undefined}
                onSelect={(value) => {
                  setRelative(value.toString());
                }}
              >
                <XUISingleSelectTrigger />
                <XUISingleSelectOptions>
                  {RELATIVE_OPTIONS.map((option) => (
                    <XUISingleSelectOption key={option} id={option}>
                      {option}
                    </XUISingleSelectOption>
                  ))}
                </XUISingleSelectOptions>
              </XUISingleSelect>
            </XUITextInputSideElement>
          }
        />
      )}
    </XUIControlGroup>
  );
}
