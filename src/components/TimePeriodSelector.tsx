import { useAtom } from 'jotai';
import XUITextInput, {XUITextInputSideElement} from '@xero/xui/react/textinput';
import XUIControlGroup from '@xero/xui/react/controlgroup';
import {
    XUISingleSelect,
    XUISingleSelectOption,
    XUISingleSelectOptions,
    XUISingleSelectTrigger,
} from '@xero/xui/react/singleselect';
import XUIRadio, {XUIRadioGroup} from '@xero/xui/react/radio';
import XUIDateInput from '@xero/xui/react/dateinput';
import type {TimePeriodMode} from '../types/query';
import React from "react";
import { Flex, FlexItem } from './layout';
import { timePeriodAtom } from '../atoms';

interface TimePickerProps {
    value: string; // Format: "HH:mm"
    onChange: (time: string) => void;
}

export function TimePicker({value, onChange}: TimePickerProps) {
    const normalizedValue = /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : '00:00';

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        onChange(/^([01]\d|2[0-3]):[0-5]\d$/.test(newValue) ? newValue : '00:00');
    };

    return (
        <XUITextInput
            label="Time"
            type="time"
            value={normalizedValue}
            onChange={handleChange}
        />
    );
}

interface DateTimeInputProps {
    value: string; // Format: "YYYY-MM-DDTHH:mm"
    onChange: (value: string) => void;
    label: string;
    id?: string;
}

function parseDateTime(value: string): { date: string; time: string } {
    if (!value) {
        return {date: '', time: '00:00'};
    }
    const [datePart, timePart] = value.split('T');
    return {date: datePart || '', time: timePart || '00:00'};
}

function formatDateTime(date: string, time: string): string {
    if (!date) return '';
    return `${date}T${time || '00:00'}`;
}

function parseDateStringToDate(date: string): Date | undefined {
    if (!date) return undefined;
    const [year, month, day] = date.split('-').map(Number);
    if (!year || !month || !day) return undefined;
    return new Date(year, month - 1, day);
}

function formatDateToString(date: Date | null | undefined): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function DateTimeInput({value, onChange, label, id}: DateTimeInputProps) {
    const {date, time} = parseDateTime(value);
    const selectedDate = parseDateStringToDate(date);

    const handleDateChange = (newDate: Date | null | undefined) => {
        onChange(formatDateTime(formatDateToString(newDate), time));
    };

    const handleTimeChange = (newTime: string) => {
        onChange(formatDateTime(date, newTime));
    };

    return (
        <div id={id}>
            <div className="xui-text-label xui-fieldlabel-layout">{label}</div>
            <Flex gap="0.5rem">
                <FlexItem flex={1}>
                    <XUIDateInput
                        inputLabel="Date"
                        datePickerAriaLabel="Choose date"
                        locale="en-NZ"
                        nextButtonAriaLabel="Next month"
                        prevButtonAriaLabel="Previous month"
                        monthDropdownAriaLabel="Select month"
                        yearDropdownAriaLabel="Select year"
                        onSelectDate={handleDateChange}
                        selectedDateValue={selectedDate}
                    />
                </FlexItem>
                <FlexItem flex={1}>
                    <TimePicker value={time} onChange={handleTimeChange}/>
                </FlexItem>
            </Flex>
        </div>
    );
}

const RELATIVE_OPTIONS = ['15m ago', '30m ago', '1h ago', '3h ago', '6h ago', '12h ago', '24h ago', '7d ago'];

export function TimePeriodSelector() {
    const [timePeriod, setTimePeriod] = useAtom(timePeriodAtom);
    
    const { mode, since, until, relative } = timePeriod;
    
    // Provide sensible defaults
    const sinceValue = since || new Date(Date.now() - 3600000).toISOString().slice(0, 16);
    const untilValue = until || new Date().toISOString().slice(0, 16);
    const selectedRelativeOption = relative || RELATIVE_OPTIONS[0];
    const relativeOptions = RELATIVE_OPTIONS.includes(selectedRelativeOption)
        ? RELATIVE_OPTIONS
        : [selectedRelativeOption, ...RELATIVE_OPTIONS];

    const handleModeChange = (newMode: TimePeriodMode) => {
        setTimePeriod(prev => ({ ...prev, mode: newMode }));
    };

    const handleSinceChange = (value: string) => {
        setTimePeriod(prev => ({ ...prev, since: value }));
    };

    const handleUntilChange = (value: string) => {
        setTimePeriod(prev => ({ ...prev, until: value }));
    };

    const handleRelativeChange = (value: string) => {
        setTimePeriod(prev => ({ ...prev, relative: value }));
    };

    return (
        <XUIControlGroup label="Time Period" isLockedVertical>
            <XUIRadioGroup label="Mode" isFieldLayout>
                <XUIRadio
                    name="timePeriodMode"
                    value="relative"
                    isChecked={mode === 'relative'}
                    onChange={() => handleModeChange('relative')}
                >
                    Relative
                </XUIRadio>
                <XUIRadio
                    name="timePeriodMode"
                    value="absolute"
                    isChecked={mode === 'absolute'}
                    onChange={() => handleModeChange('absolute')}
                >
                    Exact
                </XUIRadio>
            </XUIRadioGroup>

            {mode === 'absolute' ? (
                <>
                    <DateTimeInput
                        label="Since"
                        value={sinceValue}
                        onChange={handleSinceChange}
                        id="since-input"
                    />
                    <DateTimeInput
                        label="Until"
                        value={untilValue}
                        onChange={handleUntilChange}
                        id="until-input"
                    />
                </>
            ) : (
                <>
                    <XUITextInput
                        label="Relative"
                        type="text"
                        placeholder="e.g. 3h"
                        value={relative}
                        onChange={(e) => handleRelativeChange(e.target.value)}
                        rightElement={
                            <XUITextInputSideElement type="button">
                                <XUISingleSelect
                                    key={`relative-${selectedRelativeOption}`}
                                    defaultSelectedOptionId={RELATIVE_OPTIONS.includes(relative) ? relative : RELATIVE_OPTIONS[0]}
                                    onSelect={(value) => {
                                        handleRelativeChange(String(value));
                                        handleModeChange('relative');
                                    }}
                                >
                                    <XUISingleSelectTrigger/>
                                    <XUISingleSelectOptions>
                                        {relativeOptions.map((option) => (
                                            <XUISingleSelectOption key={option} id={option}>
                                                {option}
                                            </XUISingleSelectOption>
                                        ))}
                                    </XUISingleSelectOptions>
                                </XUISingleSelect>
                            </XUITextInputSideElement>
                        }
                    />
                </>
            )}
        </XUIControlGroup>
    );
}
