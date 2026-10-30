import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 12;
export const PASSWORD_MAX_UTF8_BYTES = 72;
export const PASSWORD_ALLOWED_SPECIAL_CHARACTERS = '!@#$%^&*';
export const PASSWORD_POLICY_MESSAGE = 'Password must be 8-12 Unicode code points and include uppercase, lowercase, a number, and one of !@#$%^&*. Use only Unicode letters/numbers and these symbols; spaces, other characters, and common passwords are not allowed.';
export const BLOCKED_PASSWORDS = [
  'password1!', 'password12!', 'password123!', 'p@ssw0rd!', 'passw0rd!', 'qwerty123!', 'qwerty12!', 'welcome1!', 'welcome12!', 'admin123!', 'admin12!', 'letmein1!', 'letmein12!', 'changeme1!', 'iloveyou1!', 'abc123!!', 'aa1!aaaa', 'aa123456!', 'test1234!', 'aims2health1!', 'virtualsathi1!',
] as const;
const BLOCKED = new Set<string>(BLOCKED_PASSWORDS);
const FAMILIES = /^(?:password|qwerty|welcome|admin|letmein|changeme|iloveyou|test|aims2health|virtualsathi)[0-9]{0,3}[!@#$%^&*]{1,2}$/i;
const ALLOWED = /^[\p{L}\p{N}!@#$%^&*]*$/u;
const UPPER = /\p{Lu}/u;
const LOWER = /\p{Ll}/u;
const NUMBER = /\p{N}/u;
export interface PasswordPolicyStatus { minLength: boolean; maxLength: boolean; uppercase: boolean; lowercase: boolean; number: boolean; special: boolean; byteLength: boolean; noWhitespace: boolean; supportedCharacters: boolean; commonPassword: boolean; valid: boolean; }
export function getPasswordPolicyStatus(value: unknown): PasswordPolicyStatus {
  const password = typeof value === 'string' ? value : '';
  const count = Array.from(password).length;
  const commonPassword = BLOCKED.has(password.toLowerCase()) || FAMILIES.test(password);
  const status: PasswordPolicyStatus = {
    minLength: count >= PASSWORD_MIN_LENGTH, maxLength: count <= PASSWORD_MAX_LENGTH,
    uppercase: UPPER.test(password), lowercase: LOWER.test(password), number: NUMBER.test(password),
    special: /[!@#$%^&*]/.test(password), byteLength: new TextEncoder().encode(password).length <= PASSWORD_MAX_UTF8_BYTES,
    noWhitespace: !/\s/.test(password), supportedCharacters: ALLOWED.test(password), commonPassword, valid: false,
  };
  status.valid = !!password && status.minLength && status.maxLength && status.uppercase && status.lowercase && status.number && status.special && status.byteLength && status.noWhitespace && status.supportedCharacters && !commonPassword;
  return status;
}
export function isPasswordPolicyValid(value: unknown): value is string { return getPasswordPolicyStatus(value).valid; }
export const passwordPolicyValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') return { passwordPolicy: { malformed: true } };
  const status = getPasswordPolicyStatus(value);
  if (status.valid) return null;
  return { passwordPolicy: { minLength: !status.minLength, maxLength: !status.maxLength, uppercase: !status.uppercase, lowercase: !status.lowercase, number: !status.number, special: !status.special, byteLength: !status.byteLength, noWhitespace: !status.noWhitespace, supportedCharacters: !status.supportedCharacters, commonPassword: status.commonPassword } };
};
export function passwordsMatchValidator(passwordField: string, confirmationField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordField)?.value; const confirmation = control.get(confirmationField)?.value;
    if (!password || !confirmation) return null;
    return password === confirmation ? null : { passwordMismatch: true };
  };
}
