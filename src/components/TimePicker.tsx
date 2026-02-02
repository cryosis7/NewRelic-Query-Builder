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
        onChange(/^([01]\d|2[0-3]):[0-5]\d$/.test(newValue) ? newValue : '00:00');
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