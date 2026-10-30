export type OtpOperation = 'send' | 'verify';

/** Converts OTP HTTP failures into safe, account-neutral UI feedback. */
export function getOtpErrorMessage(
  error: any,
  operation: OtpOperation,
  fallback: string
): string {
  if (error?.status === 429) {
    const retryAfter = getRetryAfterSeconds(error?.headers?.get?.('Retry-After'));
    if (retryAfter !== null) {
      return `Too many attempts. Please wait ${formatDuration(retryAfter)} before trying again.`;
    }
    return 'Too many attempts. Please wait before trying again.';
  }

  if (operation === 'verify' && (error?.status === 400 || error?.status === 401)) {
    return 'The code is invalid or expired. Request a new code and try again.';
  }

  return fallback;
}

function getRetryAfterSeconds(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) return null;
  const seconds = Number(value);
  return Number.isSafeInteger(seconds) && seconds > 0 && seconds <= 86400
    ? seconds
    : null;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}
