# VAPT Finding #9: No Rate Limit on OTP — Frontend Report

## Scope and status

This work improves OTP request usability by blocking duplicate in-flight sends and verifications and by presenting safe feedback for backend throttling. Browser-side controls are usability measures only; a caller can bypass them. Backend rate limiting remains the security control. Staging verification and external VAPT retesting have not been performed, so Finding #9 is **not closed**.

## OTP flows audited

| Flow | Component / endpoint | Findings and treatment |
|---|---|---|
| Helper registration email/phone OTP | `NewHelperRegisterComponent`; `/helper/sendEmailVerifyOTP`, `/helper/sendPhoneVerifyOTP`, `/helper/verifyEmailOTP`, `/helper/verifyPhoneOTP` | Existing resend countdown was 15 seconds. Send/verify methods now reject duplicate in-flight calls; resend is guarded by the timer and pending flags. Responses are handled with generic throttling/failure feedback. |
| Helper dashboard add-patient contact verification | `DashboardComponent`; helper send and verify email/phone endpoints | Phone/email/WhatsApp send and verify actions now guard pending requests and restore the pending state on success/error. Existing contact resend countdown remains 15 seconds and WhatsApp countdown 30 seconds. |
| Patient contact verification | `PaccountverifyComponent`; `PaccountService` phone/email send and verification endpoints | Duplicate sends/verifications are guarded. Existing flow had no resend countdown; none was introduced. Responses/errors now settle pending state and use generic feedback. |
| Patient OTP login | `PatientAuthService` methods | No active component caller was found. No screen or workflow was invented. |
| Doctor/admin and legacy helper OTP UI | Existing login/signup templates | OTP markup is static and has no active request handlers; no API flow was enabled. |
| Other helper dashboard selected-patient OTP methods | `DashboardComponent` methods for `selectedPatient` | No template caller was found. They were left unchanged as inactive code. |

The active flows preserve the existing send and verification endpoints and expected success shapes (`vstatus: "OTP sent successfully"`; verification success as `vstatus: "approved"` for phone and the existing email success message where applicable). No local expiry was added because the frontend has no trusted expiry value.

## Changes made

- `src/app/otp/otp-error-feedback.ts` — shared safe OTP error helper. HTTP 429 produces generic wait-and-retry wording. A numeric `Retry-After` value is shown only when the browser exposes a valid value; raw server/provider error text is not displayed. Invalid/missing values use a generic message. Invalid/expired verification failures remain generic.
- `src/app/otp/otp-error-feedback.spec.ts` — tests generic throttle handling, valid and invalid retry durations, generic verification errors and transport fallback.
- `src/app/new-helper/register/new-helper-regiester.component.ts` and `src/app/new-helper/register/new-helper-register.component.html` — pending guards, guarded resend, disabled controls, and safe OTP error handling.
- `src/app/new-helper/dashboard/dashboard.component.ts` and `src/app/new-helper/dashboard/dashboard.component.html` — pending guards and UI states for active add-patient email, phone and WhatsApp OTP actions; safe OTP-specific error feedback.
- `src/app/patient/paccountverify/paccountverify.component.ts` and `.html` — pending guards, disabled controls, success/error state cleanup and safe error feedback for active patient contact verification.
- `src/app/new-helper/register/new-helper-regiester.component.spec.ts` — duplicate pending send/verification and throttling coverage for helper registration.
- `src/app/new-helper/dashboard/otp-rate-limit.spec.ts` — duplicate submission, throttling feedback and successful verification coverage for dashboard contact verification.
- `src/app/patient/paccountverify/paccountverify.otp-rate-limit.spec.ts` — duplicate submission, throttling feedback and successful verification coverage for patient contact verification.
- `tsconfig.otp-rate-limit.spec.json` — focused compilation scope for these OTP specifications.
- `VAPT-FINDING-9-OTP-RATE-LIMIT-FRONTEND-REPORT.md` — this report.

No backend code, shared HTTP interceptor, endpoint, or payload contract was changed.

## Pending state and resend behavior

Each active send/verify handler now has a method-level pending guard, so repeated clicks cannot create multiple requests while the original request is unresolved. Corresponding controls are disabled and display pending text where the existing template supports it. Success and error callbacks clear the pending flags, allowing another legitimate attempt. The existing 15-second helper registration and dashboard contact cooldowns, plus the 30-second WhatsApp dashboard cooldown, remain in place. Patient contact verification did not have a cooldown and still does not; backend throttling applies independently.

## HTTP 429 and response-contract dependencies

The backend Finding #9 report describes HTTP 429 responses with a generic message and a calculated `Retry-After` header. The frontend uses the header only if it is readable and a valid positive numeric duration; otherwise it says to wait before trying again and does not invent a duration. The backend CORS configuration currently does not expose `Retry-After`, so cross-origin browser JavaScript may not be able to read it. If the product requires an exact visible countdown, the backend must expose that response header through CORS and staging must verify it; this frontend change does not alter backend CORS.

The separate helper registration API contract also needs integration verification: the backend report describes a `purpose: "helper-registration"` requirement and verification proof tokens for registration, while the current frontend flow's payload/registration contract may not match those requirements. This predates and is outside the rate-limit UI change; confirm the deployed contract and legitimate registration workflow before release. No API change was inferred or introduced here.

## Verification results

- Focused tests:

  ```text
  npm.cmd test -- --watch=false --browsers=ChromeHeadlessCI --include=src/app/otp/otp-error-feedback.spec.ts --include=src/app/new-helper/register/new-helper-regiester.component.spec.ts --include=src/app/new-helper/dashboard/otp-rate-limit.spec.ts --include=src/app/patient/paccountverify/paccountverify.otp-rate-limit.spec.ts --ts-config=tsconfig.otp-rate-limit.spec.json
  ```

  **16 passed, 0 failed, 0 skipped** in Chrome Headless 156 on Windows 10.

- Production build:

  ```text
  npm.cmd run build -- --configuration production
  ```

  **Succeeded**, exit code 0. Browser bundles, asset copying and index generation completed in **77.089 seconds**; initial chunk total was **4.72 MB**. Non-blocking warnings remain for an invalid Angular workspace target value, the deprecated Webpack browser builder, and CommonJS/AMD dependencies used by `canvg`, `rgbcolor`, `jspdf`, `dompurify`, `html2canvas` and related `core-js` modules.

## Remaining gaps and staging checklist

1. Verify the backend's configured per-IP/per-contact throttles and response status/body/header against the deployed build; frontend tests do not exercise a live rate limiter.
2. Confirm whether `Retry-After` is exposed to the deployed frontend origin by CORS. If it is not, generic wait messaging is the expected behavior.
3. Exercise repeated send and verify attempts for helper registration, helper add-patient email/phone/WhatsApp verification and patient contact verification. Confirm 429 feedback, recovery of controls, legitimate retries after backend allowance, and no automatic OTP resend.
4. Confirm the helper registration OTP purpose/proof-token contract and perform a complete fresh registration in staging.
5. Test invalid and expired codes with controlled accounts. Verify the UI remains unverified unless the expected backend verification response succeeds.
6. Verify backend throttling cannot be bypassed by direct API requests and retest the original VAPT scenario. Use controlled test accounts; do not use production customer accounts.

## Security boundary

Disabled controls, method guards and resend countdowns do not enforce security. Users can alter JavaScript or call endpoints directly. The backend must independently rate-limit OTP issuance and verification, bind challenges to the intended identity and purpose, enforce expiry/replay policy, and authorize protected actions. Do not claim remediation closure until deployed backend behavior, staging workflows and external VAPT retesting are verified.
