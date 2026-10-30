import { FormControl, FormGroup, Validators } from '@angular/forms';
import { getPasswordPolicyStatus, isPasswordPolicyValid, passwordPolicyValidator, passwordsMatchValidator } from './password-policy';

describe('shared password policy (backend mirror)', () => {
  it('accepts inclusive 8- and 12-code-point boundaries', () => {
    expect(isPasswordPolicyValid('Abcdef1!')).toBeTrue();
    expect(isPasswordPolicyValid('Abcdefgh12!@')).toBeTrue();
  });

  it('rejects values shorter than 8 or longer than 12 code points', () => {
    expect(getPasswordPolicyStatus('Abcde1!').minLength).toBeFalse();
    expect(getPasswordPolicyStatus('Abcdefghijk1!').maxLength).toBeFalse();
  });

  it('requires uppercase, lowercase, a Unicode number, and an allowlisted special', () => {
    expect(getPasswordPolicyStatus('abcdefg1!').uppercase).toBeFalse();
    expect(getPasswordPolicyStatus('ABCDEFG1!').lowercase).toBeFalse();
    expect(getPasswordPolicyStatus('Abcdefgh!').number).toBeFalse();
    expect(getPasswordPolicyStatus('Abcdefg1').special).toBeFalse();
    for (const special of '!@#$%^&*') expect(isPasswordPolicyValid('Abcdef1' + special)).toBeTrue();
    expect(isPasswordPolicyValid('Abcdef1?')).toBeFalse();
    expect(isPasswordPolicyValid('Abcdef' + String.fromCharCode(0x0661) + '!')).toBeTrue();
  });

  it('accepts Unicode letters but rejects whitespace, unsupported characters, marks, and emoji', () => {
    const accented = String.fromCharCode(0x00c4) + 'bcdef1!';
    expect(isPasswordPolicyValid(accented)).toBeTrue();
    expect(isPasswordPolicyValid('Abc def1!')).toBeFalse();
    expect(isPasswordPolicyValid('Abcdef1\n!')).toBeFalse();
    expect(isPasswordPolicyValid('Abcdef1!??')).toBeFalse();
    expect(isPasswordPolicyValid('Abcde' + String.fromCharCode(0x0301) + 'f1!')).toBeFalse();
    expect(isPasswordPolicyValid('Abcdef1!' + String.fromCodePoint(0x1f600))).toBeFalse();
    expect(getPasswordPolicyStatus(accented).supportedCharacters).toBeTrue();
    expect(new FormControl(123, passwordPolicyValidator).errors?.['passwordPolicy']?.malformed).toBeTrue();
  });

  it('rejects common passwords case-insensitively and predictable families', () => {
    for (const value of ['Password1!', 'PASSWORD1!', 'Welcome2!', 'Aa1!aaaa', 'VirtualSathi2!']) {
      expect(isPasswordPolicyValid(value)).toBeFalse();
    }
    expect(getPasswordPolicyStatus('Password1!').commonPassword).toBeTrue();
    expect(isPasswordPolicyValid('Zebra2!x')).toBeTrue();
  });

  it('leaves required validation to the form and compares confirmation exactly', () => {
    const required = new FormControl('', [Validators.required, passwordPolicyValidator]);
    expect(required.errors?.['required']).toBeTrue();
    const form = new FormGroup({ password: new FormControl('Abcdef1!'), confirm: new FormControl('Abcdef1!') },
      { validators: passwordsMatchValidator('password', 'confirm') });
    expect(form.valid).toBeTrue();
    form.get('confirm')?.setValue('Abcdef2!');
    expect(form.errors?.['passwordMismatch']).toBeTrue();
  });
});
