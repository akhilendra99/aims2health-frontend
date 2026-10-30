# VAPT Point #16: Sensitive Information in Browser Storage — Frontend Report

## Summary of refresh fix

The dashboard refresh redirect is addressed in the frontend by validating the existing HttpOnly-cookie session during app startup. Once `GET /api/auth/session` confirms the session, Angular restores the minimum role and identity data in memory, and protected-route guards wait for that check before deciding whether to allow navigation. This keeps refresh working without persisting credentials or identity in browser storage.

The code changes are in `AppComponent`, `AuthService`, `AuthGuard`, and the auth interceptor, with regression coverage for all four roles, guard timing, failed sessions, logout/login races, and storage behavior. The legacy helper login was also aligned to the helper role and dashboard route. The focused suite passed **46/46**, and the production build succeeded; details and warnings are below.

**Migration:** No database migration was created or required for this frontend integration. It consumes the backend-provided `GET /api/auth/session` endpoint and its existing cookie/session implementation. No backend files or database schema were changed in this frontend task.

## Session bootstrap integration follow-up

The earlier report below documented refresh behavior before the backend session-validation endpoint was available. The frontend now calls `GET /api/auth/session` at the configured backend origin during application startup. That endpoint validates the HttpOnly cookie server-side; Angular restores only minimal identity and role state in memory. Protected-route guards wait for this initialization before checking authentication and role. No identity, role, profile, or token is written to Local Storage or Session Storage.

Role mapping is `patient → p`, `doctor → d`, `admin → a`, and `helper → h`. The helper profile is retained in memory only after its `helper_id` is a valid positive ID matching `userId`. The backend contract also requires a positive `expiresIn` and string `userEmail`/`userName` for each role. The in-memory expiry timer uses the server-provided remaining lifetime.

Missing/invalid sessions and all bootstrap errors, including network/5xx, fail closed to unauthenticated state. The bootstrap request is attempted once per application lifetime; after a transient failure, the user can retry by reloading the application. Guards do not loop or claim authentication. A pending bootstrap response cannot overwrite a newer successful login or logout. Session-endpoint 401 handling is owned by the bootstrap service and does not trigger the interceptor's generic 401 redirect; other authenticated API 401 handling remains unchanged.

### Follow-up files changed

- `src/app/app.component.ts` — starts session initialization on app startup.
- `src/app/auth/auth.service.ts` — typed session response, role/profile mapping, in-memory restoration, expiry, failure handling, and protection against late bootstrap responses overwriting a newer auth action. The legacy helper login now maps to helper role/dashboard.
- `src/app/auth/auth.guard.ts` — waits for initialization, then applies the existing authentication and role checks.
- `src/app/auth/auth-interceptor.ts` — excludes only the bootstrap endpoint's 401 from global redirect handling.
- `src/app/auth/auth-session-bootstrap.spec.ts` — role restoration, guard timing, fail-closed/error behavior, login/logout races, and storage assertions.
- `src/app/auth/auth.guard.spec.ts`, `src/app/auth/storage-remediation.spec.ts`, `src/app/auth/login-lockout.spec.ts`, `tsconfig.input-validation.spec.json` — regression coverage and focused test inclusion updates.

The focused bootstrap/auth regression run completed **46 passed, 0 failed, 0 skipped** in Chrome Headless 156 on Windows 10. Command:

```text
npm.cmd test -- --watch=false --browsers=ChromeHeadlessCI --include=src/app/auth/auth-session-bootstrap.spec.ts --include=src/app/auth/auth.guard.spec.ts --include=src/app/auth/storage-remediation.spec.ts --include=src/app/auth/login-lockout.spec.ts --include=src/app/auth/user-enumeration.spec.ts --include=src/app/new-helper/login/registration-validation.spec.ts --include=src/app/reusable-components/sidebar-navigation.spec.ts --ts-config=tsconfig.input-validation.spec.json
```

Production build `npm.cmd run build -- --configuration production` succeeded: browser bundles, assets, and index HTML generated in **44.700 seconds**; initial bundle total **4.73 MB**. Existing non-blocking warnings remain for an invalid Angular workspace target value, deprecated Angular Webpack browser/Karma builders, and CommonJS dependencies including `canvg`, `rgbcolor`, `dompurify`, `html2canvas`, and related `core-js` modules. `git diff --check` passed for the touched source files; Git reported line-ending conversion notices in existing Windows working copies.

Staging must still verify cookie delivery and CORS credentials, direct dashboard refresh for all roles, role isolation, expiry/revocation, logout, helper profile behavior, and API authorization. Network/5xx recovery currently requires a page reload to retry bootstrap; adding an automatic retry or session restoration mechanism beyond this endpoint is not included. This does not establish Point #16 closure; deployment review and external VAPT retesting remain pending.

## Conclusion

Active login identity and session metadata are held in the shared in-memory `AuthService`, not persisted in local or session storage. The frontend uses the existing backend-issued HttpOnly cookie for authentication and sends the existing CSRF token only to the configured backend API origin/path. Legacy role-specific services no longer restore authentication from editable storage. Short-lived appointment/payment handoff state was also moved from browser storage into component memory. The latest backend Point 16 report confirms that all four password-login contracts and patient OTP login omit JSON JWTs, and helper registration no longer creates a session. A stale patient OTP response type and helper-login test fixture were aligned with that contract. Local tests and the production build pass. Staging verification remains pending; this report does not claim VAPT closure.

## Audit and root cause

The affected `/mnbvcxzadmin` route uses `AdminAuthComponent`, which calls the shared `AuthService.loginAdmin()`. That active flow already kept admin identity in memory. The source still contained obsolete auth service paths that persisted `expiration`, `userId`, and `role`, plus an active patient login that persisted ID, email, name, role, and login type. The active helper login persisted the backend `user` object containing helper ID/contact details. Helper and patient workflows also persisted selected patient/doctor IDs and appointment/payment handoff data. Several UI components read identity back from localStorage for display or request construction.

No active frontend write of an admin department or username key was found. Current backend admin login returns `userId`, email, and `userName`; the legacy service could persist the ID and role, while other roles and the helper `user` object supplied additional identity values. Browser-stored values were not a safe source for authorization, and role values were read by legacy doctor/patient guards for redirect choices.

## Storage inventory and treatment

| Storage value | Previous use / classification | Current treatment |
|---|---|---|
| `userId`, `userEmail`, `userName`, `role`, `loginType`, `expiration` | Identity and client auth/session hints. Patient login wrote these; legacy role services wrote ID/role/expiry. | Login display and navigation data is held in `AuthService` memory. Obsolete values are removed at app initialization, login, logout, or auth failure; no longer written. Guards do not use stored roles. |
| `user` | Helper login JSON with helper ID/email/mobile; dashboard read it for identity and request fields. | Helper profile stays in memory through `AuthService.getUserProfile()`. No helper profile is written to storage. |
| `selectedPatientId`, `doctor_id` | Patient/helper selection identifiers needed across payment/dashboard interactions. | Kept as component state and derived from the selected patient/search result. Obsolete values are removed. Backend must still validate ownership for every API request. |
| `sessionStorage.temp` | Appointment/payment payload containing calendar/patient IDs and amount. | Payment handoff state stays in the component until the payment callback; old `temp` entries are removed. |
| `selfPatientAdded` | Account-specific helper UI flag. | No longer persisted; held in the dashboard component. |
| `username`, `department`, `departmentName`, `permissions`, `token`, `accessToken`, `access_token`, `refreshToken`, `refresh_token` | No active frontend writes found; included in one-time legacy cleanup for values left by earlier builds. | Not read or written as authorization or session proof. |
| `activeTab`, `foo` (`no reload`) | Non-credential dashboard preference/reload sentinel. | Retained as UI behavior; neither is used as identity or authorization. |

Passwords and OTP values are not written to browser storage. Angular does not read the HttpOnly `auth_token` cookie. The CSRF cookie remains JavaScript-readable by design for the existing double-submit CSRF mechanism and is sent only as the existing request header to the configured API.

## Backend contract and security boundary

Inspected current backend role login/logout handlers, `utils/auth-cookies.js`, and `app.js`. Login issues an `auth_token` cookie marked HttpOnly, Secure by default, SameSite Lax; a separate non-HttpOnly CSRF cookie is used by the existing double-submit mechanism. Cookie lifetime is one hour for patient/doctor/admin and seven days for helper. Logout handlers clear cookies and invalidate the presented session token. Backend CORS allows credentials. The interceptor now attaches credentials and CSRF only when the request is under the configured `environment.apiURL` origin and path; it does not attach them to other origins or unrelated paths.

## Current role/API integration trace

The current source contract was compared with `aims2health_backend/VAPT-POINT-16-LOCAL-STORAGE-BACKEND-REPORT.md`. The report and route consumer review state these backend responses were tested locally; deployed staging behavior is unverified.

| Role / flow | Frontend consumer | Verified current contract and client handling |
|---|---|---|
| Admin password login | `/mnbvcxzadmin` → shared `AuthService.loginAdmin()` → `POST /admin/login` | Consumes `expiresIn`, `userId`, and `userName`. It does not read a JSON JWT; identity stays in memory and auth uses the HttpOnly cookie. |
| Doctor password login | `/dlogin` → shared `AuthService.loginDoc()` → `POST /doctor/login` | Consumes `expiresIn`, `userId`, `userEmail`, and `userName`; no JSON JWT is needed. |
| Patient password login | `/plogin` → `PloginComponent` → `POST /patient/login` | Consumes `expiresIn`, `userId`, `userEmail`, and `userName`; no JSON JWT is read or persisted. |
| Helper password login | `/helper-login` → `NewHelperLoginComponent` → `POST /helper/login`; legacy `/hlogin` uses shared `AuthService.loginHelper()` | Current response is `message` plus `user: { helper_id, email_id, mobile }`. The active new-helper page validates `helper_id`, stores profile/role metadata in memory, then routes to `/helper-dashboard`. The legacy shared service accepts the nested profile shape and does not read a JSON token. |
| Patient OTP login | `PatientAuthService.verifyOtp()` → `POST /patient/verify-otp-login` | Backend response contains `expiresIn`, `userId`, `userEmail`, and `userName`; cookie + CSRF cookie carry the established session. No active component calls these OTP service methods. Removed the stale `token` member from the frontend response type. |
| Helper registration | `NewHelperRegisterComponent` → `POST /helper/register` | Success uses `helper_id` and then navigates to `/helper-login`. The component does not expect or persist a registration JWT and does not mark the user authenticated. |

The backend Point 16 report says helper registration no longer issues a session and requires normal login. No frontend API path or payload was changed. The legacy `/helper/signup` API wrapper remains a separate unsupported path per the backend report; the active newer registration flow uses `/helper/register`.

The preceding refresh limitation is superseded by the session-bootstrap integration follow-up at the top of this report. Normal logout sends the role-specific logout request and clears local in-memory state regardless of request failure; the backend must clear/revoke the cookie. An intercepted non-bootstrap 401 clears in-memory state and redirects to that role's login route. Expiry uses the in-memory timer to call logout, but the server remains authoritative for cookie expiry/revocation. Confirm these behaviors, cookie `COOKIE_DOMAIN`, Secure, SameSite, expiry, CORS credentials, CSRF and cross-subdomain behavior in staging.

The source scan found no Bearer header construction or `Authorization` header assignment in the frontend auth flows. The interceptor uses `withCredentials` for the configured API origin/path and adds the readable CSRF cookie as `x-csrf-token` only on state-changing requests. Browser storage writes found in the wider application are limited to the documented non-credential UI/reload values (`activeTab` and `foo`); commented-out old identity reads are inactive.

Client-side route guards and in-memory IDs remain navigation/display aids. The backend must independently authorize every patient/helper/doctor/admin resource and must not trust client-supplied role, department, permission, user, patient, or doctor IDs.

## Files changed

- `src/app/auth/auth-storage.ts` — remove only legacy identity/session keys and the obsolete payment handoff key, preserving unrelated preferences.
- `src/app/auth/auth.service.ts` — keep role identity/profile in memory; clear legacy values without clearing unrelated storage; prevent storage-based session restoration.
- `src/app/auth/auth-interceptor.ts` — restrict credential and CSRF attachment to the configured backend API origin and API path.
- `src/app/admin/admin-auth/admin-auth.service.ts`, `src/app/doctor/dauth/doctor-auth.service.ts`, `src/app/helper/hauth/helper-auth.service.ts`, `src/app/patient/pauth/patient-auth.service.ts` — stop persisting/restoring legacy ID/role/expiry authentication hints.
- `src/app/doctor/dauth/doctor-auth.guard.ts`, `src/app/patient/pauth/patient-auth.guard.ts` — stop reading local role values for navigation decisions.
- `src/app/patient/pauth/plogin/plogin.component.ts`, `src/app/new-helper/login/new-helper-login.component.ts` — stop writing identity/profile response data to storage; pass successful identity to in-memory auth state.
- `src/app/new-helper/dashboard/dashboard.component.ts` — read helper profile from memory, keep selected patient/doctor and payment state in component memory, and preserve self-patient creation without a full-page reload.
- `src/app/patient/patientlist/patientlist.component.ts`, `src/app/patient/pappointments/create-pappointment/create-pappointment.component.ts` — use in-memory patient identity and payment handoff data.
- `src/app/header/header.component.ts`, `src/app/welcome-box/welcome-box.component.ts`, `src/app/reusable-components/admin-navbar/admin-navbar.component.ts`, `src/app/reusable-components/doctor-navbar/doctor-navbar.component.ts`, `src/app/reusable-components/patient-navbar/patient-navbar.component.ts`, `src/app/reusable-components/internal-header/internal-header.component.ts`, `src/app/reusable-components/internal-footer/internal-footer.component.ts`, `src/app/reusable-components/footer-public/footer-public.component.ts` — display in-memory user email.
- `src/app/doctor/dappointment/upcoming-appointment/upcoming-appointment.component.ts`, `src/app/doctor/dappointment/past-appointment/past-appointment.component.ts`, `src/app/doctor/dappointment/list-dappointment/list-dappointment.component.ts`, `src/app/doctor/dappointment/list-patients-calendar/list-patients-calendar.component.ts` — read doctor email from in-memory auth state.
- `src/app/auth/storage-remediation.spec.ts`, `src/app/auth/user-enumeration.spec.ts`, `src/app/new-helper/dashboard/input-validation.spec.ts`, `tsconfig.input-validation.spec.json` — storage/auth/interceptor regression coverage and focused test inclusion.
- `VAPT-POINT-16-LOCAL-STORAGE-FRONTEND-REPORT.md` — this report.

For this integration follow-up, `src/app/patient/pauth/patient-auth.service.ts` no longer declares a JSON `token` in the patient OTP response type; `src/app/auth/auth.service.ts` no longer contains the obsolete comment claiming the current helper response includes a JSON token; `src/app/auth/storage-remediation.spec.ts` asserts the cookie-authenticated patient OTP response shape; and `src/app/auth/login-lockout.spec.ts` uses the current helper response fixture without a token. These are the only additional application/test changes in this follow-up.

Other pre-existing working-tree changes from earlier VAPT tasks were preserved. No backend code, API path, login payload, cookie design, OTP, password policy, CSP, or CORS configuration was changed.

## Verification

- Focused command:

  ```text
  npm.cmd test -- --watch=false --browsers=ChromeHeadlessCI --include=src/app/auth/storage-remediation.spec.ts --include=src/app/auth/user-enumeration.spec.ts --include=src/app/auth/login-lockout.spec.ts --include=src/app/new-helper/login/registration-validation.spec.ts --include=src/app/new-helper/register/new-helper-regiester.component.spec.ts --include=src/app/new-helper/dashboard/otp-rate-limit.spec.ts --include=src/app/patient/paccountverify/paccountverify.otp-rate-limit.spec.ts --ts-config=tsconfig.input-validation.spec.json
  ```

  **39 passed, 0 failed, 0 skipped** in Chrome Headless 156 on Windows 10. Coverage includes forged local role/ID rejection, admin identity not being persisted, helper profile memory state, logout cleanup while preserving unrelated preference state, cookie/CSRF attachment only to the configured API, patient OTP response contract without a JSON token, login/lockout/user-enumeration regressions, helper registration, and the selected OTP rate-limit suites. The current helper password-login success fixture also matches the backend's `message` + `user` contract and contains no JSON token.

- Production build: `npm.cmd run build -- --configuration production` — **succeeded** on the updated source. Browser bundles, asset copying, and index generation completed in **52.241 seconds**; initial bundle total **4.73 MB**.
- Non-blocking warnings observed: invalid Angular workspace target value, deprecated `@angular-devkit/build-angular:browser` builder, and CommonJS dependencies from `canvg`, `rgbcolor`, and `canvg`'s `core-js` modules.
- `git diff --check` on the edited files reported no whitespace errors; Git emitted only line-ending conversion notices for existing Windows working copies.

## Staging verification and remaining risks

1. On a clean browser profile, verify login for admin, doctor, patient, and helper. Confirm no `userId`, email/name, department, role, JWT, helper profile, selected patient/doctor IDs, or payment handoff payload is written to local/session storage. Confirm ordinary UI preferences remain functional.
2. Confirm the browser stores the server `auth_token` as HttpOnly and the CSRF cookie according to the backend's approved configuration; confirm tokens are not returned in doctor/helper JSON after backend remediation.
3. Inspect cross-origin requests: `auth_token` must go only to the configured API; CSRF header must only be attached to state-changing API calls; no credentials/header should be sent to unrelated origins or API-host paths.
4. Verify each role's login, dashboard navigation, data display, logout, invalid/expired session behavior, and every relevant protected API with controlled staging accounts. Alter local storage values and API identifiers and confirm backend ownership checks still reject unauthorized access.
   The focused Angular specs verify client route denial and credential-header scoping; they do not prove that the server rejects a forged or missing credential. Perform direct API checks against staging.
5. Test page refresh and session expiry. The frontend now restores UI session state only when the backend session endpoint validates the cookie; test valid, expired, revoked, missing-cookie and transient network/5xx cases in staging.
6. Verify helper patient creation, patient appointment checkout/payment callbacks, logout, and browser back navigation still work after the payment handoff moved to memory.
7. Run staging VAPT retesting. Local tests/build do not prove deployment cookie behavior or server-side authorization; no closure is claimed.
