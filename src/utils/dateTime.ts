const pad = (part: number) => String(part).padStart(2, '0');

/** Today's date as `YYYY-MM-DD` for `<input type="date" />`. */
export function todayDateValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Current local time as `HH:mm` for `<input type="time" />`. */
export function nowTimeValue(): string {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/** Format an ISO / API datetime for `<input type="datetime-local" />` (local time). */
export function toDatetimeLocalValue(value: string | undefined | null): string {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

/** Split an API datetime into separate date and time field values. */
export function splitDatetimeValue(value: string | undefined | null): {
  date: string;
  time: string;
} {
  const local = toDatetimeLocalValue(value);
  if (!local) {
    return { date: '', time: '' };
  }

  const [date, time = '00:00'] = local.split('T');
  return { date, time: time.slice(0, 5) };
}

/** Combine `<input type="date" />` and `<input type="time" />` values into an ISO string. */
export function combineDateAndTime(date: string, time: string): string {
  if (!date) {
    return '';
  }

  const normalizedTime = time || '00:00';
  return fromDatetimeLocalValue(`${date}T${normalizedTime}`);
}

/** Convert a `datetime-local` value to an ISO string for the API. */
export function fromDatetimeLocalValue(value: string): string {
  if (!value) {
    return value;
  }

  const [datePart, timePart = '00:00'] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const timeSegments = timePart.split(':').map(Number);
  const [hours = 0, minutes = 0, seconds = 0] = timeSegments;

  const parsed = new Date(year, month - 1, day, hours, minutes, seconds);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString();
}
