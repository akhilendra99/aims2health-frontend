# VAPT Finding #11: Absence of Lockout Policy — Frontend Report

## Conclusion

Frontend login handling now gives generic credential feedback for all 401 responses, shows generic rate-limit feedback for HTTP 429, prevents duplicate submits in the inspected forms, resets loading state after success/failure, and only lets the active helper-login page establish its client navigation state for a structurally valid success response. Angular feedback is not enforcement: the backend lockout, request limiter, session credential, and authorization remain authoritative. Staging verification and external VAPT retesting are pending; this finding is not claimed closed.

## Active login inventory

| Route / flow | Component and API | Notes |
|---|---|---|
| Patient `/plogin` | `PloginComponent` → `POST /patient/login` | Email/password; patient dashboard navigation after a valid response. |
| Helper `/helper-login` | `NewHelperLoginComponent` → `POST /helper/login` | Email or phone/password; helper dashboard route. |
| Legacy helper `/hlogin` | `HloginComponent` → `AuthService.loginHelper()` → `POST /helper/login` | Retains its existing legacy payload and `/pdashboard` destination. |
| Doctor `/dlogin` | `DloginComponent` → `AuthService.loginDoc()` → `POST /doctor/login` | Existing doctor dashboard route. |
| Admin `/mnbvcxzadmin` | `AdminAuthComponent` → `AuthService.loginAdmin()` → `POST /admin/login` | Existing admin validation route. |

No other active password-login component was identified. Patient OTP login service methods exist but have no active component caller; OTP behavior was not modified in this finding.

## Backend response contract used

Reviewed `aims2health_backend/VAPT-FINDING-11-LOCKOUT-POLICY-BACKEND-REPORT.md`, backend `app.js`, and the four login route implementations. Wrong password, unknown account, unapproved doctor, and account-scoped lockout all use the same generic HTTP 401 response. The backend account policy is five failures in a 15-minute window followed by a 15-minute lock; successful authentication clears the failure state. The UI intentionally does not distinguish a locked account, show counters, or infer a countdown from 401.

The separate per-IP limiter allows ten login requests per 15 minutes and returns HTTP 429 with a generic message and `Retry-After`. The backend CORS `exposedHeaders` list currently omits `Retry-After`; therefore browser JavaScript on the cross-origin frontend cannot read the duration in production unless the backend CORS configuration exposes that header. The frontend falls back to a generic “try again later” notice when that header is absent or invalid. No backend files were changed.

## Frontend changes

- `src/app/auth/login-error-feedback.ts` — central generic mapping: 401 and other errors never display raw server detail; 429 uses generic rate-limit text and only formats a positive integer `Retry-After` header.
- `src/app/auth/auth.service.ts` — doctor, admin and legacy helper login errors use the shared mapping; malformed successful role-login responses fail safely. Legacy helper success accepts the current nested `user.helper_id` shape and its existing older `userId` response shape without reading the JSON token.
- `src/app/new-helper/login/new-helper-login.component.ts` — blocks duplicate submit, uses generic errors, resets loading on outcomes, and requires a positive nested `user.helper_id` before storing display metadata or navigating.
- `src/app/new-helper/login/new-helper-login.component.html` — the login submit control is disabled while pending.
- `src/app/patient/pauth/plogin/plogin.component.ts` — blocks duplicate submit and uses the shared generic/rate-limit feedback while restoring loading state after outcome.
- `src/app/patient/pauth/plogin/plogin.component.html` — the login submit control is disabled while pending.
- `src/app/doctor/dauth/dlogin/dlogin.component.ts`, `src/app/helper/hauth/hlogin/hlogin.component.ts`, `src/app/admin/admin-auth/admin-auth.component.ts` — guard duplicate submit while existing loading UI is active.
- `src/app/auth/login-lockout.spec.ts` — regression coverage for generic credential details, 429 handling, duplicate submits, loading recovery/retry, role login success, and valid/malformed helper response navigation.
- `src/app/new-helper/login/registration-validation.spec.ts` — updated its valid login/registration fixtures to match existing backend helper response/password contracts.
- `tsconfig.input-validation.spec.json` — includes the focused login regression suite.
- `VAPT-FINDING-11-LOCKOUT-POLICY-FRONTEND-REPORT.md` — this report.

The UI does not store passwords or OTPs. The active new-helper page stores only the existing non-sensitive user display object after success; the backend cookie is the credential. No retry counter or account-lockout state is kept in browser storage.

## CAPTCHA

No CAPTCHA provider, widget, package integration, or site-key configuration was found in the inspected frontend. No provider or secret key was invented. CAPTCHA remains a separate product/backend integration decision and must be verified server-side if adopted.

## Tests and build

- Focused command:

  ```text
  npm.cmd test -- --watch=false --browsers=ChromeHeadlessCI --include=src/app/auth/login-lockout.spec.ts --include=src/app/auth/user-enumeration.spec.ts --include=src/app/new-helper/login/registration-validation.spec.ts --include=src/app/new-helper/register/new-helper-regiester.component.spec.ts --ts-config=tsconfig.input-validation.spec.json
  ```

  Latest run: **29 passed, 0 failed, 0 skipped** (Chrome Headless 156, Windows 10). An intermediate run failed because the legacy fixture did not include the required nested `user.helper_id`; the fixture was corrected to match the inspected response contract, and the final run passed.

- Production build: `npm.cmd run build -- --configuration production` — **succeeded against final source**; browser bundles, assets, and index HTML generated in 44.711 seconds, initial bundle 4.73 MB.
- Non-blocking existing warnings include an invalid Angular workspace target value, deprecated Webpack browser/Karma builders, and CommonJS dependencies from `canvg`/`rgbcolor` and `core-js`.

## Remaining dependencies and staging checks

1. Backend owner should expose `Retry-After` in CORS only if the product requires a browser countdown; otherwise the generic 429 message is the intended behavior. Do not derive account-lockout time from 401.
2. In staging, verify the five-failure/15-minute account lockout and expiry, generic 401 parity for unknown/wrong/unapproved/locked cases, successful reset of failure state, and 429 behavior for the per-IP limiter across each role.
3. Verify backend migration/secret/store deployment prerequisites documented in the backend report, including shared stable lockout secret and shared MySQL state across application instances.
4. Exercise successful patient/helper/doctor/admin login, both helper login entry routes, cookie/CSRF behavior, and OTP flows. Confirm dashboard APIs reject requests without a valid server-issued credential.
5. If CAPTCHA is selected, document provider, public site key, server verification contract, expiry/retry handling, and operational costs before implementation.
6. Accessibility review of toast-based login/rate-limit feedback (including screen-reader announcement and keyboard behavior) remains pending; the focused unit tests do not validate assistive technology behavior.
7. Complete external VAPT retesting. Local tests do not establish closure.

## Security boundary

Angular can present generic feedback and avoid duplicate form submissions. A caller can bypass those controls. Backend per-account lockout and per-IP limiting must independently process requests, and each protected API must validate server-issued authentication and authorization. Staging and external VAPT verification remain outstanding.
