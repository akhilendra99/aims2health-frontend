# VAPT Finding #8: User Enumeration — Frontend Report

## Scope and conclusion

This work addresses account-existence disclosure in public Angular login, registration, OTP-send, password-recovery, and reset flows. The frontend now avoids account-specific preflight messaging and raw authentication/recovery errors on the inspected paths. It does not hide the inherent success-versus-failure distinction of open registration endpoints, and it cannot replace backend response parity or rate limiting. Staging integration checks remain pending; no VAPT closure is claimed.

## Backend contract used

The source of truth was `aims2health_backend/VAPT-FINDING-8-USER-ENUMERATION-BACKEND-REPORT.md` and the corresponding route handlers:

- Password login failures for unknown users, wrong passwords, and unapproved doctors use HTTP 401 with `Invalid Authentication Credentials!`.
- Helper, patient, and doctor recovery requests return HTTP 200 with `If the account is eligible, password reset instructions will be sent.` Delivery is conditional.
- Public patient/doctor account-existence endpoints return generic non-boolean responses; frontend preflight checks should not infer account state.
- Helper OTP send responses retain the `vstatus: "OTP sent successfully"` compatibility shape while actual delivery is conditional. The user-facing response therefore must not assert that delivery occurred.
- Duplicate signup still fails, but account-specific duplicate wording is removed. The backend report notes that success versus failure remains observable on open signup flows.

The frontend uses those contracts for message handling and leaves API payloads/endpoints intact except where the doctor existence preflight was removed. CAPTCHA was not found in the inspected frontend; OTP and recovery rate limiting remain backend dependencies and separate findings.

## Audit and changes

| Flow | Finding / treatment |
|---|---|
| Doctor signup | Removed the `doctorExists` preflight and “registered/not registered” UI. Signup submits directly to `/doctor/signup`; its success path remains intact, and failures show generic guidance. |
| Helper registration OTP | Kept the existing helper send/verify endpoints and response contract. The generic send response now produces conditional-delivery wording and a sign-in link rather than claiming an OTP was sent. Verification/signup failures do not display raw server text. |
| Login | Doctor, admin, helper, and the patient-facing legacy login surfaces use the same generic failure text. The helper modal recovery path no longer reflects raw server messages. |
| Password recovery | Patient and doctor screens now submit to their existing `/patient/forgetpwd` and `/doctor/forgetpwd` endpoints and display one account-neutral response. Failure details are hidden. Helper recovery uses the same generic wording. |
| Reset | Doctor reset now submits to the existing `/doctor/forgetpwdresetpwd` contract and uses generic failure feedback. Patient reset errors are generic. |
| Legacy patient signup screen | Kept its existing `/helper/register` request, but removed raw backend response/error display and response/error logging. |
| Account lookup | Removed the unused `PatientAuthService.checkEmail()` wrapper. The doctor service preflight wrapper was removed with its only caller. |

### Files changed

- `src/app/doctor/dauth/dsignup/dsignup.component.ts` and `.html`
- `src/app/doctor/dauth/doctor-auth.service.ts`
- `src/app/auth/auth.service.ts`
- `src/app/new-helper/register/new-helper-regiester.component.ts`
- `src/app/new-helper/register/new-helper-register.component.html`
- `src/app/new-helper/login/new-helper-login.component.ts`
- `src/app/patient/pauth/plogin/plogin.component.ts`
- `src/app/patient/pauth/psignup/psignup.component.ts`
- `src/app/patient/pauth/patient-auth.service.ts`
- `src/app/patient/forgotpwd/forgotpwd.component.ts` and `.html`
- `src/app/patient/forgotpwd/pwdreset/pwdreset.component.ts`
- `src/app/doctor/dforgotpwd/dforgotpwd.component.ts` and `.html`
- `src/app/doctor/dforgotpwd/dpwdreset/dpwdreset.component.ts`
- `src/app/auth/user-enumeration.spec.ts`
- `src/app/new-helper/login/registration-validation.spec.ts`
- `src/app/new-helper/register/new-helper-regiester.component.spec.ts`
- `tsconfig.input-validation.spec.json`
- `VAPT-FINDING-8-USER-ENUMERATION-FRONTEND-REPORT.md`

## Response-contract and integration gaps

1. **Patient reset mismatch confirmed in backend source:** `/patient/forgetpwd` creates a link using a patient ID and patient credentials, while `/patient/forgetpwdresetpwd` currently queries `helper_details` using that ID. The frontend preserves the existing route and payload; the backend owner must correct/confirm this contract and verify a real patient reset before deployment.
2. The legacy `/psignup` page is labelled as patient signup but calls `/helper/register`; the patient-facing `/plogin` also calls `/helper/login`. These pre-existing role/API mismatches were left unchanged to avoid inventing an API change. Product/backend owners should confirm intended flows.
3. `PatientAuthService` exposes OTP-login methods, but no active component caller was found. The active helper registration OTP flow was updated; no unused patient OTP login workflow was invented.
4. Admin password recovery and doctor OTP login are not implemented as active public flows in the inspected Angular routes; corresponding legacy UI is absent or placeholder-only.
5. Generic duplicate-signup messages reduce detail but cannot eliminate observable signup success/failure when contact ownership is not verified first. The backend report identifies this residual API/product risk.

## Tests and build

- Focused Angular tests:

  ```text
  npm.cmd test -- --watch=false --browsers=ChromeHeadlessCI --include=src/app/auth/user-enumeration.spec.ts --include=src/app/new-helper/login/registration-validation.spec.ts --include=src/app/new-helper/register/new-helper-regiester.component.spec.ts --ts-config=tsconfig.input-validation.spec.json
  ```

  **16 passed, 0 failed, 0 skipped** (Chrome Headless 156, Windows 10). Coverage includes doctor signup without account preflight, generic failures for role logins, patient-facing unknown/wrong-password parity, generic patient/doctor/helper recovery notices, reset payload/error behavior, helper OTP conditional-delivery wording, and existing successful registration/login/verification paths.

- Production build: `npm.cmd run build -- --configuration production` — **succeeded**. Browser bundle generation, asset copying, and index HTML generation completed in **72.462 seconds**; initial bundle total **4.71 MB**. Non-blocking existing warnings remain for an invalid Angular workspace target, deprecated Angular Webpack browser builder, and CommonJS dependencies (`canvg`/`rgbcolor` and related `core-js` modules).

- An initial test invocation also named `src/app/patient/pauth/psignup/psignup.component.spec.ts`, which does not exist and is not included in the focused test tsconfig. Karma reported a TypeScript compilation load error before executing specs. The corrected command above ran the configured suite successfully.

## Staging checks required

Use controlled test accounts and verify matching status/body/message/cookie behavior for unknown and known users, wrong passwords, unapproved doctors, recovery eligibility, conditional helper OTP delivery, duplicate signup, and invalid/expired reset tokens. Confirm legitimate helper registration and login still work. Verify the patient password-reset contract before testing the complete patient recovery journey. Check backend recovery and OTP rate limits independently. Do not use production customer accounts.

## Security boundary

These changes remove misleading and account-specific frontend messages; they cannot prevent a caller from observing or modifying HTTP responses. Backend routes must preserve generic response behavior and independently enforce identity, verification, rate limits, and reset-token validity. Staging integration verification remains pending, and this report does not claim VAPT closure.
