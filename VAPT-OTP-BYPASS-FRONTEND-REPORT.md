# VAPT Finding #4: OTP Bypass — Frontend Audit

## Scope and conclusion

This review is limited to OTP flows and defects directly associated with the response-replacement scenario. The active OTP entry flow found is helper registration. Its local OTP verification flag gates the signup form only; it does not authenticate a user or navigate to the helper dashboard. The patient OTP login service methods have no caller in the frontend. The helper dashboard OTP calls verify contact details during authenticated workflows, not login.

The browser cannot determine that a successful HTTP response was replayed or substituted by the client. Backend verification and authorization are required to resist the VAPT response-replacement scenario. No VAPT closure is claimed.

## Audit findings

- `src/app/new-helper/register/new-helper-regiester.component.ts` calls `/helper/sendEmailVerifyOTP` or `/helper/sendPhoneVerifyOTP`, then `/helper/verifyEmailOTP` or `/helper/verifyPhoneOTP`. The existing successful response shapes are evidenced elsewhere in the frontend: email returns `message: 'Email verified successfully'`; phone returns `vstatus: 'approved'`.
- Before this change, helper signup accepted any response message containing `verified successfully`. That was broader than the observed response contract. A malformed `null` body could also throw while the subscriber processed it.
- A verification response could arrive after the identifier had been edited and set the component flag for the new identifier.
- `src/app/patient/pauth/patient-auth.service.ts` exposes `/patient/send-otp-login` and `/patient/verify-otp-login`, but no component calls these methods. The verify method only returns an observable; it does not mark the shared AuthService authenticated or navigate.
- `src/app/auth/auth-interceptor.ts` preserves the existing HttpOnly cookie and CSRF behavior. The helper registration OTP path does not establish authenticated state. `helper-dashboard` remains behind the existing shared AuthGuard and helper role metadata.
- The separate auth/route changes documented in `VAPT-CWE-639-FRONTEND-REPORT.md` were not changed as part of this OTP-scoped work.

## Changes made

### `src/app/new-helper/register/new-helper-regiester.component.ts`

- OTP send and verify responses are applied only if the identifier and its type still match the values submitted with that request.
- Email OTP success now requires the exact observed message `Email verified successfully`.
- Phone OTP success now requires the exact observed status `approved`.
- Unexpected and null response bodies do not set `isVerified`; verification begins with the flag false.
- Editing the identifier clears the verification-pending UI state so an earlier response cannot verify the changed identifier.

The `isVerified` flag is only a browser-side signup UI gate. It must not be accepted by the backend as proof of OTP verification.

### `src/app/new-helper/register/new-helper-regiester.component.spec.ts`

Added focused unit coverage for successful email/phone response shapes, invalid/unexpected/malformed responses, and a response arriving after the user changes the identifier.

### Test runner setup

- Added the missing root `karma.conf.js`, using the project's installed Karma, Jasmine, Angular Karma plugin, and Chrome launcher packages.
- Added `tsconfig.otp.spec.json` to compile only the requested OTP spec. The project-wide spec configuration currently reports unrelated TypeScript errors in other specs/application files, so this focused configuration avoids changing those files.

## Test and build results

- Focused OTP test: `npm.cmd test -- --watch=false --browsers=ChromeHeadlessCI --include=src/app/new-helper/register/new-helper-regiester.component.spec.ts --ts-config=tsconfig.otp.spec.json` — **4 passed, 0 failed, 0 skipped** in Chrome Headless 156 on Windows 10.
- Running the same focused command against the project-wide `tsconfig.spec.json` reaches TypeScript diagnostics in unrelated existing files (including `src/app/auth/auth.guard.spec.ts` and Node globals in application files). The isolated OTP tsconfig was added to keep this task scoped.
- The earlier `npm.cmd run build` check generated browser bundles and copied assets, then failed during index generation because it could not retrieve the Google Fonts Material Icons stylesheet from `https://fonts.googleapis.com/icon?family=Material+Icons` in the restricted network environment. A production build was not rerun for the test-runner setup task.

## Not tested / backend verification required

1. The response-replacement PoC itself cannot be meaningfully prevented or validated by Angular. Retest by intercepting an invalid OTP response and replacing it with a captured success response, then verify the backend refuses subsequent signup or protected API actions unless its own OTP challenge state is valid, fresh, and bound to the submitted identifier.
2. Test protected APIs directly without a valid server-issued credential; they must reject access regardless of the frontend route guard or local `isVerified` value.
3. Run fresh legitimate helper signup/login and helper-dashboard navigation end-to-end in staging. Those flows were not exercised in this environment.
4. Confirm backend response schemas and OTP challenge semantics, including replay handling, expiry, and identifier binding. This frontend review does not assess or alter OTP rate limiting, user enumeration, authentication design, or session management.

## Security boundary

Frontend response-shape checks improve UI behavior for unexpected responses but cannot distinguish a genuine success response from one replayed or substituted in the browser. The backend must independently validate OTP challenges and enforce authentication/authorization for every protected API request. Do not claim VAPT closure without the backend review and staging PoC retest.
