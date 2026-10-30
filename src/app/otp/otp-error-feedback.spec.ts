import { getOtpErrorMessage } from './otp-error-feedback';

describe('OTP error feedback', () => {
  it('shows a generic wait message for 429 when Retry-After is not browser-readable', () => {
    expect(getOtpErrorMessage({ status: 429 }, 'send', 'Could not send code.'))
      .toBe('Too many attempts. Please wait before trying again.');
  });

  it('uses a valid Retry-After duration when the response exposes it', () => {
    const error = { status: 429, headers: { get: () => '90' } };
    expect(getOtpErrorMessage(error, 'verify', 'Could not verify code.'))
      .toBe('Too many attempts. Please wait 2 minutes before trying again.');
  });

  it('does not trust malformed or unreasonable retry values', () => {
    const error = { status: 429, headers: { get: () => '86401' } };
    expect(getOtpErrorMessage(error, 'send', 'Could not send code.'))
      .toBe('Too many attempts. Please wait before trying again.');
  });

  it('keeps invalid and expired verification errors generic', () => {
    expect(getOtpErrorMessage({ status: 400, error: { message: 'internal account detail' } }, 'verify', 'Fallback'))
      .toBe('The code is invalid or expired. Request a new code and try again.');
  });

  it('uses the caller generic message for unrelated transport failures', () => {
    expect(getOtpErrorMessage({ status: 500, error: { message: 'provider stack trace' } }, 'send', 'Could not send code.'))
      .toBe('Could not send code.');
  });
});
