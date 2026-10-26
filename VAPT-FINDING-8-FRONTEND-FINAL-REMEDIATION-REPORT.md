# VAPT Finding #8: User Enumeration â€” Frontend Integration Report

## Conclusion

The patient-facing `/psignup` and `/plogin` pages previously submitted to helper endpoints. They now use the patient signup and login contracts found in the backend routes. Patient recovery and reset use the patient ID/token payload; the current backend reset handler has patient-role token handling. Account-neutral messaging from the prior Finding #8 frontend remediation is retained.

Focused Angular tests and a production build succeeded locally. No staging integration was performed, so this finding is not claimed closed. Frontend messages cannot prevent enumeration from observable HTTP status/body differences; backend response parity and deployment behavior remain authoritative.

## Audit findings and contract decisions

| UI flow | Repository evidence and verified contract | Frontend decision |
|---|---|---|
| Patient signup `/psignup` | Public home links label this route patient registration. `PsignupComponent` template was headed â€œHelper Registerâ€ and sent only contact/password to `/helper/register`. `PatientAuthService.createUser()` and backend `POST /patient/signup` establish a distinct patient registration contract with name, email, password, DOB, both phone numbers, gender, address/PIN and optional patient profile fields. The backend inserts a self-registered patient with `helper_id = -1`. | Replaced the helper request with a patient registration form and `POST /patient/signup`. Payload uses patient fields and omits helper IDs. The page navigates to `/plogin` after success. |
| Patient login `/plogin` | The page is explicitly titled â€œPatient User Login,â€ while its previous component sent `{email_id|phone_no,password}` to `/helper/login`. Backend `POST /patient/login` queries `req.body.email`; it does not provide phone login. It sets the patient auth/CSRF cookies and returns user ID/email/name/expiry. The backend hardening pass removed the password-login JSON token. | The form now requests an email and password and sends `{email,password}` to `/patient/login`. On a valid response it sets patient-only UI role/session state and keeps existing patient dashboard navigation; authentication uses the server-issued HttpOnly cookie. |
| Patient Forgot Password/reset | Backend `POST /patient/forgetpwd` sends a patient ID and a signed token containing `role: "patient"`; `POST /patient/forgetpwdresetpwd` accepts `{patient_id, token, password}` and selects the account table from the verified token role. Angular route is `/presetpwd/:patientId/:token`. | Existing patient reset payload matches the current source contract. Reset success now returns to `/plogin`; invalid/expired failures stay generic. Password checks were aligned to the backend's accepted character set. |
| Helper registration OTP | Backend keeps `vstatus: "OTP sent successfully"` but delivery depends on eligibility. | Retained neutral conditional-delivery wording and sign-in path from prior Finding #8 work. |
| Doctor signup/account preflight | Backend `doctorExists` returns a generic non-boolean response. Doctor signup route remains authoritative. | Removed the account-existence preflight and its registered/not-registered messages in the preceding Finding #8 remediation. |
| Login/recovery surfaces | Backend password login failures and recovery responses have generic contracts. Helper, doctor, admin, and patient-facing Angular components were checked for raw error presentation. | Prior generic failure and recovery messaging remains. Public account-existence service wrappers are removed where unused. |

The patient API route prefix is `/patient` because the backend router is mounted as the patient API. Patient login is email-only according to the current handler; phone login would require an explicit backend contract change. No new endpoints were introduced.

## Files changed for this integration pass

- `src/app/patient/pauth/psignup/psignup.component.ts` and `.html` â€” patient-specific registration fields, validation, request, neutral feedback and success navigation.
- `src/app/patient/pauth/plogin/plogin.component.ts` and `.html` â€” patient endpoint/payload, email-only form, HttpOnly-cookie-compatible session and generic error handling.
- `src/app/auth/auth.service.ts` â€” patient role/session metadata, expiry timer and patient logout endpoint selection.
- `src/app/patient/forgotpwd/pwdreset/pwdreset.component.ts` â€” backend-aligned password validator and patient-login navigation after reset.
- `src/app/auth/user-enumeration.spec.ts` â€” tests for patient signup/login contracts and successful/failed patient reset.
- `VAPT-FINDING-8-FRONTEND-FINAL-REMEDIATION-REPORT.md` â€” this report.

Prior Finding #8 changes remain documented in `VAPT-FINDING-8-USER-ENUMERATION-FRONTEND-REPORT.md`; this pass preserves their doctor preflight removal, helper OTP wording, generic login/recovery errors and reset behavior.

## Security and backend dependencies

1. **Patient password login token:** the backend Finding #8 hardening removes the JWT from `/patient/login` JSON while retaining the established HttpOnly auth cookie and CSRF behavior. Confirm this cookie contract in staging. The separate `/patient/verify-otp-login` endpoint still returns its established JSON JWT for compatibility; no active component caller was found, but the typed patient auth service references that contract. Review external consumers and decide its handling under the separate OTP/API compatibility review.
2. **Patient address/PIN contract:** the current `/patient/signup` handler validates the six-digit PIN from `address.split(" ")[1]`. The form communicates this existing constraint and sends the address as entered; the backend/product owner should confirm this is the intended address format. No API/schema change was made.
3. The backend signup endpoint may interact with the EHR database after inserting a patient. A successful frontend response and legitimate signup must be checked against a controlled staging account.
4. Duplicate signup remains distinguishable by success/failure even though the body text is generic. The backend report identifies this as a residual enumeration path for open registration without prior proof of contact ownership.
5. CAPTCHA was not found. Login, OTP, and recovery rate limiting are separate backend dependencies/findings and were not changed here.
6. Patient reset correctness is established from the current backend source only. Confirm that the backend build deployed to staging contains the role-aware reset implementation before testing real reset links.

## Tests and build

- Focused Angular command:

  ```text
  npm.cmd test -- --watch=false --browsers=ChromeHeadlessCI --include=src/app/auth/user-enumeration.spec.ts --include=src/app/new-helper/login/registration-validation.spec.ts --include=src/app/new-helper/register/new-helper-regiester.component.spec.ts --ts-config=tsconfig.input-validation.spec.json
  ```

  **19 passed, 0 failed, 0 skipped** in Chrome Headless 156 on Windows 10. Tests cover doctor signup without the preflight, generic role login failures, patient signup/login endpoints and payloads, session role and navigation, patient/doctor recovery, patient and doctor reset success/error handling, and helper OTP conditional messaging and verification behavior.

- Production build: `npm.cmd run build -- --configuration production` â€” **succeeded**. Browser bundle generation, asset copying and index HTML generation completed in **53.706 seconds**. Initial bundle total: **4.71 MB**.
- Non-blocking pre-existing warnings: invalid Angular workspace target value, deprecated `@angular-devkit/build-angular:browser` builder, and CommonJS dependencies from `canvg`, `rgbcolor` and related `core-js` modules.

## Staging journey checklist â€” not executed

Run with controlled test accounts only; do not use production customer accounts.

1. Patient registration: submit a valid patient profile, verify only `/patient/signup` is called, confirm creation as a patient, verify neutral duplicate/error feedback, and confirm successful navigation to patient login.
2. Patient login: compare unknown email and wrong password UI feedback; verify the request body is `{email,password}`, the server sets the HttpOnly/CSRF cookies, no token is persisted by Angular, the patient session is selected, and the route goes to `/pdashboard`.
3. Patient recovery/reset: request recovery for controlled eligible and unknown addresses and compare responses; use a valid patient reset link; then verify an invalid/expired token gets generic UI feedback and success returns to `/plogin`.
4. Helper registration: test eligible and ineligible contacts; verify UI wording does not claim confirmed delivery, then verify an eligible code and complete fresh registration/login.
5. Helper recovery: confirm generic confirmation and test a controlled reset link end to end.
6. Doctor signup/login: confirm there is no public existence preflight, duplicate errors are generic in the UI, and valid signup/login still work.
7. Compare unknown-user and wrong-password response status/body and UI messaging for patient, helper, doctor and admin. Confirm unapproved doctor behavior matches other failures.
8. Verify invalid/expired reset links, duplicate signup handling, server-side recovery/OTP limits, cookie/CSRF behavior, and that each role lands in its own dashboard.

## Security boundary

Angular now routes patient UI actions to patient APIs and presents generic account/authentication feedback on the reviewed flows. Client-side role state and browser storage are navigation/display hints only. Backend authorization, password checks, OTP eligibility, reset-token validation, rate limiting and response parity must be independently enforced. Local tests/build are not a staging VAPT retest; deployment compatibility and all staging cases above remain pending.

