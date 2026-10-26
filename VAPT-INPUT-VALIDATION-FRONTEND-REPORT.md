# VAPT Finding #6: Improper Input Validation — Frontend Report

## Scope and result

Frontend validation and rendering changes were limited to helper dashboard and helper registration/login flows covered by the backend validation contract. Angular validation improves feedback and blocks ordinary invalid submissions; it does not replace backend validation or authorization. Staging VAPT retesting has not been performed, and no VAPT closure is claimed.

## Initial inventory

| Component / flow | UI inputs | API endpoint(s) | Frontend handling |
|---|---|---|---|
| Helper registration | email/phone, password, OTP | `/helper/register`, `/helper/sendEmailVerifyOTP`, `/helper/sendPhoneVerifyOTP`, `/helper/verifyEmailOTP`, `/helper/verifyPhoneOTP` | Registration identifier and password constraints aligned with backend email/UTF-8 password limits; OTP behavior preserved. |
| Helper login / forgot password | email or phone, password, reset email | `/helper/login`, `/helper/forgetpwd` | Added client-side contact and password bounds and reset-email validation. |
| Helper dashboard add patient | names, DOB or age, contact details, PIN, gender, IDs, history | `/helper/add-patient` | Added field bounds and format checks. Removed `age`, `preferred_call`, and `preferred_sms` from request body because strict backend schema does not accept them; date/age is represented by the existing `dob` field. |
| Helper change password | old/new/confirm password | `/helper/change-password` | Added backend-aligned allowed-character, length, byte-size and matching checks. |
| Helper consent | patient identifier | `/helper/consent` | Sends only the backend-supported `patient_id` field after positive safe-integer validation. |
| Helper report create/update | patient/report IDs, title, content, media type, date, file | report create/update endpoints | Added bounds, identifier/date and upload checks. Removed unsupported `imagePath` and `mediaSize` form fields; existing-file updates omit a replacement upload. |
| Helper appointment search | date, doctor type | `/helper/search` | Added calendar-date and required/max-length checks. |
| Patient/doctor appointment search | date/type forms | patient/doctor search endpoints | Existing search implementations were inspected; this change set is scoped to helper dashboard appointment search. |

Backend contract reviewed from `VAPT-INPUT-VALIDATION-BACKEND-REPORT.md`: names up to 50 chars; PIN six digits; date or legacy age 0–120; email up to 100; phone formats and country-code bounds; medical history up to 65,535 UTF-8 bytes; IDs as valid positive identifiers where applicable; report title up to 100, content up to 65,535 bytes, media type up to 30, valid date; one PNG/JPEG/PDF upload up to 25 MiB with filename up to 255 chars; helper search page values bounded by backend. Password change uses the documented allowed ASCII set and 8–16 character new password. Frontend checks preserve the existing age/date and phone entry flows.

## Rendering review

Medical history, report titles/content, and patient report values found in the inspected templates are rendered with Angular interpolation, which displays text rather than interpreting it as HTML. No `innerHTML`, `bypassSecurityTrustHtml`, or user-controlled dynamic HTML insertion was found in these reviewed flows. The doctor report PDF component had a `bypassSecurityTrustResourceUrl` path for report files; it now only trusts a same-origin configured-backend `/images/<single filename>.pdf` resource without credentials, query, or fragment. This is a resource URL allowlist, not rich HTML sanitization. `how-it-works` dynamically appends static local scripts; it does not interpolate user data into HTML.

## Changed files

- `src/app/new-helper/dashboard/dashboard.component.ts` — input validation and API payload alignment for add patient, password change, consent, report create/update, pagination and appointment search.
- `src/app/new-helper/dashboard/dashboard.component.html` — field constraints, validation feedback and form submission wiring.
- `src/app/new-helper/register/new-helper-regiester.component.ts` — registration email/password bounds while retaining the existing OTP flow.
- `src/app/new-helper/register/new-helper-register.component.html` — registration input bounds and password validation feedback.
- `src/app/new-helper/login/new-helper-login.component.ts` and `.html` — login contact/password and forgot-password email validation.
- `src/app/doctor/dappointment/list-patients-medreport/list-patients-medreport.component.ts` — restrict trusted PDF resource URLs to backend-hosted image paths.
- `src/app/new-helper/dashboard/input-validation.spec.ts` — tests for valid/invalid patient, consent, report, upload, password and appointment inputs.
- `src/app/new-helper/login/registration-validation.spec.ts` — helper registration/login/reset validation tests.
- `src/app/doctor/dappointment/list-patients-medreport/list-patients-medreport.component.spec.ts` — PDF resource allowlist tests.
- `tsconfig.input-validation.spec.json` — focused test compilation scope.
- `VAPT-INPUT-VALIDATION-FRONTEND-REPORT.md` — this audit record.

The previously added root `karma.conf.js` for the existing Karma/Jasmine test runner was already part of the working tree and was not changed for this finding. No package dependencies or backend files were modified.

## Verification

- Focused tests: `npm.cmd test -- --watch=false --browsers=ChromeHeadlessCI --include=src/app/new-helper/dashboard/input-validation.spec.ts --include=src/app/new-helper/login/registration-validation.spec.ts --include=src/app/doctor/dappointment/list-patients-medreport/list-patients-medreport.component.spec.ts --ts-config=tsconfig.input-validation.spec.json` — **15 passed, 0 failed, 0 skipped** (Chrome Headless 156, Windows 10).
- Production build: `npm.cmd run build` — **succeeded** on the latest rerun. Browser bundle generation, asset copying, and index HTML generation all completed. Build time was **21.425 seconds** and the initial bundle total was **4.71 MB**.

### Build warnings / technical debt

The successful build still reports non-blocking warnings for an invalid Angular workspace target value, the deprecated `@angular-devkit/build-angular:browser` builder, and CommonJS dependencies used by `canvg`/`rgbcolor`. These are recorded as technical debt and did not prevent this build from completing. An earlier build attempt failed while retrieving the Google Fonts Material Icons stylesheet; no font-related source change was made, and the latest rerun succeeded.

The focused specs cover ordinary valid submission and selected invalid/malformed/oversized inputs, backend payload shape, upload constraints, and safe PDF resource URL handling. They do not cover every production template interaction or perform live API calls.

## Remaining contract issues and dependencies

1. Backend schema and handler behavior must stay the source of truth. Direct HTTP clients can bypass every Angular validator.
2. The helper forgot-password response links to `/presetpwd/:helperid/:token`, while the existing Angular route loads a generic password reset component that posts to `/patient/forgetpwdresetpwd`. The backend report describes a helper forgot-password handler but no matching helper reset endpoint. This apparent route/endpoint mismatch needs backend/product contract clarification; this frontend work does not invent a new endpoint or change that workflow.
3. The backend report notes legacy fields such as role/helper IDs and proof tokens in add-patient payloads, with role ignored and helper ID overwritten. The frontend keeps legacy workflow fields where needed; the backend must continue to ignore client-supplied authority and independently bind the patient to the authenticated helper.
4. Verify medical report authorization, upload access, date/identifier validation, and rejected out-of-contract fields by direct API tests and the staging VAPT retest.
5. Run fresh legitimate helper registration, login, patient creation, report upload/update, consent and appointment-search journeys end-to-end after deployment.

## Security boundary

Client-side validation and interpolation reduce accidental malformed submissions and unsafe HTML interpretation in the UI. They do not establish trust in a value, prevent a caller from crafting requests, or enforce ownership of a patient/report. The Node.js backend must validate every request and authorize every resource operation against the authenticated server-side identity. Staging VAPT retesting remains pending.
