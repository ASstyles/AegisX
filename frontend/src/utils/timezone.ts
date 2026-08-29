/**
 * AEGISX Timezone & Timestamp Formatting Engine
 *
 * Centralizes all datetime conversions for the payment defense lab.
 * - Backend generates and sends timestamps in ISO-8601 UTC (e.g. 2026-08-29T15:48:52.123Z)
 * - Frontend displays timestamps strictly converted to Indian Standard Time (Asia/Kolkata / UTC+5:30)
 * - Uses native ECMAScript Intl.DateTimeFormat (no manual string arithmetic)
 */

export const DISPLAY_TIMEZONE = 'Asia/Kolkata';

/**
 * Formats a UTC ISO timestamp or Date string to HH:mm:ss in Asia/Kolkata (IST).
 * Example: '2026-08-29T15:48:52Z' -> '21:18:52'
 */
export function formatISTTime(utcTimestamp?: string | null): string {
  if (!utcTimestamp) return '--:--:--';
  try {
    const d = new Date(utcTimestamp);
    if (isNaN(d.getTime())) return String(utcTimestamp);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: DISPLAY_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(d);
  } catch {
    return String(utcTimestamp);
  }
}

/**
 * Formats a UTC ISO timestamp or Date string to YYYY-MM-DD HH:mm:ss IST in Asia/Kolkata.
 * Example: '2026-08-29T15:48:52Z' -> '2026-08-29 21:18:52 IST'
 */
export function formatISTDateTime(utcTimestamp?: string | null): string {
  if (!utcTimestamp) return '--';
  try {
    const d = new Date(utcTimestamp);
    if (isNaN(d.getTime())) return String(utcTimestamp);
    
    // Format parts to ensure YYYY-MM-DD HH:mm:ss format
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: DISPLAY_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    // en-CA produces "YYYY-MM-DD, HH:mm:ss" or "YYYY-MM-DD HH:mm:ss"
    const formatted = formatter.format(d).replace(',', '');
    return `${formatted} IST`;
  } catch {
    return String(utcTimestamp);
  }
}

/**
 * Returns current real-time UTC timestamp in ISO-8601 string format.
 */
export function getNowUTCString(): string {
  return new Date().toISOString();
}

/**
 * Formats duration in seconds to MM:SS string.
 */
export function formatDurationSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
