import React from "react";
import XUITextInput from "@xero/xui/react/textinput";

interface TimePickerProps {
    value: string; // Format: "HH:mm"
    onChange: (time: string) => void;
}

export function TimePicker({value, onChange}: TimePickerProps) {
    const normalizedValue = /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : '00:00';

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        // Only pass through valid complete time values (HH:mm format)
        // HTML time inputs provide values in HH:mm format when user completes selection
        if (/^([01]\d|2[0-3]):[0-5]\d$/.test(newValue)) {
            onChange(newValue);
        }
    };

    return (
        <XUITextInput
            label="Time"
            type="time"
            value={normalizedValue}
            onChange={handleChange}
            style={{ height: 38 }}
        />
    );
}