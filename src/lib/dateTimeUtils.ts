/**
 * Pure utility functions for date-time parsing and formatting.
 * These functions have no side effects and produce deterministic output.
 */

/**
 * Parses a datetime string (YYYY-MM-DDTHH:mm) into separate date and time parts.
 */
export function parseDateTime(value: string): { date: string; time: string } {
    if (!value) {
        return { date: '', time: '00:00' };
    }
    const [datePart, timePart] = value.split('T');
    return { date: datePart || '', time: timePart || '00:00' };
}

/**
 * Formats separate date and time strings into a combined datetime string.
 */
export function formatDateTime(date: string, time: string): string {
    if (!date) return '';
    return `${date}T${time || '00:00'}`;
}

/**
 * Parses a date string (YYYY-MM-DD) into a Date object.
 */
export function parseDateStringToDate(date: string): Date | undefined {
    if (!date) return undefined;
    const [year, month, day] = date.split('-').map(Number);
    if (!year || !month || !day) return undefined;
    return new Date(year, month - 1, day);
}

/**
 * Formats a Date object into a date string (YYYY-MM-DD).
 */
export function formatDateToString(date: Date | null | undefined): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
