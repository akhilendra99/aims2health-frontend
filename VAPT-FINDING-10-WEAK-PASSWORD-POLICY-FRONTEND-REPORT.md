# VAPT Finding #10: Weak Password Policy — Frontend Alignment Report

## Status

The frontend password checks and user-facing copy now mirror the checked-in backend policy. Angular validation provides form feedback only; the Node backend remains authoritative. The original approved VAPT artifact's full rule, deployed API compatibility, staging verification, and external VAPT retesting remain pending. This finding is not claimed closed.

## Requirement provenance and aligned rule

The supplied original Finding #10 implementation brief confirms an inclusive 8–12 character baseline and requires uppercase, lowercase, numeric, and special-character categories. It does not specify Unicode scope, exact symbols, whitespace, a common-password list, or password history. The backend report describes the accepted special set as retained from the existing implementation. No separate readable approved Finding #10 artifact was present in the checked-out repositories, so the additional details below cannot be independently attributed to original approval.

For frontend/backend consistency, the exact rule mirrored from backend `utils/password-policy.js` is:

- 8–12 Unicode code points, inclusive, and at most 72 UTF-8 bytes.
- At least one Unicode uppercase letter (`Lu`), lowercase letter (`Ll`), number (`N`), and one special from `!@#$%^&*`.
- Only Unicode letters/numbers and those symbols are allowed. Whitespace, combining marks, emoji, and all other characters are rejected.
- No trim or Unicode normalization: submit the exact entered value.
- Reject the backend's local case-insensitive common-password list and family patterns. Passwords are not sent to an external checker.
- Required fields are enforced by each form; confirmation values must match exactly.

The 8–12/category baseline is confirmed by the supplied brief. The approved policy owner should confirm Unicode handling, the symbol allowlist, and common-password rules before release. If that approved policy differs, update both layers together. Backend enforcement remains mandatory.

## Audited flows and contracts

| Flow | Frontend route/component | Existing endpoint behavior |
|---|---|---|
| Patient signup | `/psignup`, `PsignupComponent` | `POST /patient/signup`; existing patient profile payload retained. |
| Current helper registration | `/helper-register`, `NewHelperRegisterComponent` | `POST /helper/register`; existing email/phone and OTP flow retained. |
| Legacy helper signup | `/hsignup`, `HsignupComponent` | Still calls `/helper/signup` with the legacy profile payload. Checked-in backend exposes `/helper/register` with a different OTP-proof contract and no `/signup` route. No API contract was changed. Deployed compatibility is unverified. |
| Doctor signup | `/dsignup`, `DsignupComponent` | Existing `POST /doctor/signup` payload retained. |
| Password changes | Helper dashboard, `/ppwd`, `/dpwd` | Existing `/helper/change-password`, `/patient/chpwd`, and `/doctor/chpwd` payloads retained. |
| Password resets | Patient/helper `/presetpwd/:patientId/:token`; doctor `/dresetpwd/:docId/:token` | Existing patient/helper and doctor reset endpoints and token payloads retained. |
| Admin password creation/reset | No active Angular form found | No active frontend flow identified. |

Password fields no longer use ASCII-only native pattern/minimum-length constraints that would conflict with backend Unicode code-point behavior. Shared validation runs before ordinary form submission, and messages describe the common policy. No password is trimmed, normalized, truncated, stored in browser storage, or placed in a URL or logs by these changes.

## Helper-created patient onboarding

The helper dashboard allows patient email to be omitted and does not collect a patient password. Backend source generates a random password and stores its hash without returning or delivering the plaintext value. The inspected patient recovery flow locates an account by email and sends a reset link there. I found no activation/reset path for patients without email. Product/backend owners must approve and verify an alternate onboarding path for those patients; no endpoint was invented here.

## Password history and sessions

The backend report states password history is not implemented. It also states successful password changes do not revoke already-issued JWTs. Password reuse prevention and password-change session revocation are separate product/security decisions; this frontend work does not claim either is implemented.

## Files changed

- `src/app/shared/password-policy.ts` — code-point and UTF-8 checks, Unicode categories, allowed alphabet, and mirrored local common-password checks.
- `src/app/shared/password-policy.spec.ts` — boundary, category, special-character, Unicode, whitespace, malformed-input, and common-password regression tests.
- `src/app/new-helper/register/new-helper-regiester.component.ts` — live common-password status for helper registration.
- `src/app/new-helper/register/new-helper-register.component.html` — helper registration policy wording and feedback.
- `src/app/new-helper/dashboard/dashboard.component.html` — helper password-change policy wording and feedback.
- `src/app/helper/hauth/hsignup/hsignup.component.html` — legacy helper signup wording.
- `src/app/doctor/dauth/dsignup/dsignup.component.html` — doctor signup wording.
- `src/app/doctor/dchangpwd/dchangpwd.component.html` — doctor password-change wording.
- `src/app/doctor/dforgotpwd/dpwdreset/dpwdreset.component.html` — doctor reset wording.
- `src/app/patient/pauth/psignup/psignup.component.html` — patient signup wording and removal of native minimum-length constraint.
- `src/app/patient/pchangpwd/pchangpwd.component.html` — patient password-change wording.
- `src/app/patient/forgotpwd/pwdreset/pwdreset.component.html` — patient/helper reset wording.
- `VAPT-FINDING-10-WEAK-PASSWORD-POLICY-FRONTEND-REPORT.md` — this audit and verification record.

Existing `password-policy-forms.spec.ts`, `auth/user-enumeration.spec.ts`, and helper registration specs were included in focused verification for signup, change, reset, and endpoint behavior; their pre-existing changes were preserved. No backend files or package dependencies were modified.
## Verification

Focused tests:

```text
npm.cmd test -- --watch=false --browsers=ChromeHeadlessCI --include=src/app/shared/password-policy.spec.ts --include=src/app/shared/password-policy-forms.spec.ts --include=src/app/auth/user-enumeration.spec.ts --include=src/app/new-helper/register/new-helper-regiester.component.spec.ts --ts-config=tsconfig.input-validation.spec.json
```

**27 passed, 0 failed, 0 skipped** in Chrome Headless 156. Coverage includes 8/12 boundaries, required categories and each allowed special, Unicode letters/numbers, unsupported Unicode/combining marks/emoji, whitespace, common-password entries/families, malformed and empty values, confirmation matching, and existing signup/change/reset submission and payload behavior.

Production build:

```text
npm.cmd run build -- --configuration production
```

**Succeeded**: browser bundle generation, asset copying, and index generation completed; initial chunk total was **4.73 MB**. Existing non-blocking warnings remain for an invalid Angular workspace target, the deprecated Webpack browser builder, and CommonJS dependencies including `canvg`, `rgbcolor`, and related packages.

## Remaining verification

1. Obtain the full approved VAPT policy and confirm Unicode categories, allowlist, whitespace, and common-password requirements with its owner.
2. Confirm whether the deployed API supports the legacy `/helper/signup` endpoint and payload.
3. Define and test onboarding/reset for helper-created patients without email.
4. Verify the deployed backend applies the shared policy on every password creation/change/reset route.
5. Test legitimate signup, change, reset, and login flows with controlled staging accounts. Decide password history and session-revocation requirements separately.
6. Complete staging verification and external VAPT retesting before considering closure.

## Security boundary

Client-side checks can be bypassed. The backend must validate each password before storing a hash and enforce account authorization, current-password checks, and reset-token validity independently. Local tests and a production build do not establish security closure.