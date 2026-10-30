const GENERIC_LOGIN_FAILURE = 'Unable to sign in with those details. Please try again.';
const LOGIN_RATE_LIMITED = 'Too many login attempts. Please try again later.';

/** Maps login errors to generic UI feedback. The API response body is never shown. */
export function getLoginErrorMessage(error: any): string {
  if (error?.status !== 429) return GENERIC_LOGIN_FAILURE;

  const retryAfter = error?.headers?.get?.('Retry-After');
  const seconds = typeof retryAfter === 'string' && /^\d+$/.test(retryAfter)
    ? Number(retryAfter)
    : 0;
  if (!Number.isSafeInteger(seconds) || seconds <= 0) return LOGIN_RATE_LIMITED;

  const wait = seconds < 60
    ? `${seconds} second${seconds === 1 ? '' : 's'}`
    : `${Math.ceil(seconds / 60)} minute${Math.ceil(seconds / 60) === 1 ? '' : 's'}`;
  return `Too many login attempts. Please try again in about ${wait}.`;
}
