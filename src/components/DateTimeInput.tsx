import XUIDateInput from "@xero/xui/react/dateinput";
import {XUIColumn, XUIRow} from "@xero/xui/react/structural";

import {TimePicker} from "./TimePicker.tsx";

interface DateTimeInputProps {
    label: string;
    time: string;
    onDateChange: (date: Date | null | undefined) => void;
    onTimeChange: (time: string) => void;
    date?: Date;
    minDate?: Date;
}

export function DateTimeInput({
    label,
    date,
    time,
    onDateChange,
    onTimeChange,
    minDate,
}: DateTimeInputProps) {
    return (
        <>
            <div className="xui-text-label xui-fieldlabel-layout">{label}</div>
            <XUIRow variant="flex">
                <XUIColumn gridColumns="half" className="xui-margin-bottom-small">
                    <XUIDateInput
                        inputLabel="Date"
                        datePickerAriaLabel="Choose date"
                        locale="en-NZ"
                        nextButtonAriaLabel="Next month"
                        prevButtonAriaLabel="Previous month"
                        monthDropdownAriaLabel="Select month"
                        yearDropdownAriaLabel="Select year"
                        onSelectDate={onDateChange}
                        selectedDateValue={date ?? new Date()}
                        maxDate={new Date()}
                        minDate={minDate}
                    />
                </XUIColumn>
                <XUIColumn gridColumns="half">
                    <TimePicker value={time} onChange={onTimeChange}/>
                </XUIColumn>
            </XUIRow>
        </>
    );
}