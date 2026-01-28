import { XUIRow, XUIColumn } from '@xero/xui/react/structural';
import XUIDateInput from '@xero/xui/react/dateinput';
import { TimePicker } from './TimePicker';

interface DateTimeInputProps {
  value: string; // Format: "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
  label: string;
  id?: string;
}

function parseDateTime(value: string): { date: string; time: string } {
  if (!value) {
    return { date: '', time: '00:00' };
  }
  const [datePart, timePart] = value.split('T');
  return { date: datePart || '', time: timePart || '00:00' };
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

export function DateTimeInput({ value, onChange, label, id }: DateTimeInputProps) {
  const { date, time } = parseDateTime(value);
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
      <XUIRow variant="flex">
        <XUIColumn gridColumns="half">
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
            size='medium'
          />
        </XUIColumn>
        <XUIColumn gridColumns="half">
          <TimePicker value={time} onChange={handleTimeChange} label="Time" />
        </XUIColumn>
      </XUIRow>
    </div>
  );
}
