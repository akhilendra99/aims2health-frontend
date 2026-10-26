# VAPT Frontend Review: Privilege Escalation (CWE-639)

## Scope

This report covers the Angular frontend review and targeted changes for the AIMS2Health Second Opinion Platform. The Node.js backend remains the authoritative security boundary. Angular route guards only control client-side navigation and do not authorize API requests.

## Investigation findings

- `src/app/app-routing.module.ts` applies the shared `AuthGuard` and role metadata to patient, doctor, helper, and admin workflow routes. Login, signup, and public content routes remain public. The legacy patient and doctor guards are not attached to these routes.
- `src/app/auth/auth.service.ts` restored the authenticated state, user ID, and role from `localStorage`. These values are user-editable, so changing the stored role could satisfy the client-side route check after reload.
- `src/app/auth/auth-interceptor.ts` sends the backend-issued HttpOnly cookie with requests and adds the CSRF cookie value on state-changing requests. The JWT itself is not read from or attached from local storage.
- No cookie-backed session identity endpoint was found in the frontend. Therefore the frontend has no trusted way to restore the current role after a page reload.
- Patient, case, appointment, calendar, and doctor identifiers are passed through route parameters and API calls. A frontend guard cannot establish resource ownership; the backend must independently authorize those identifiers on every request.
- The error interceptor's registration is commented out in `src/app/app.module.ts`. The auth interceptor handles authenticated `401` responses by clearing client authentication state; non-401 authorization errors remain the responsibility of API responses and UI error handling.

## Changes made

### `src/app/auth/auth.service.ts`

- Stopped restoring authenticated state from `expiration`, `userId`, `role`, email, name, or login type in browser storage.
- On startup, clears legacy authentication metadata keys so previously stored role and identity hints are not left behind or reused.
- Login continues to establish the in-memory role from the successful login flow, while API authentication continues to use the existing HttpOnly cookie design.

Effect: a page reload now requires a fresh login because no backend session identity endpoint is available to safely re-establish the role.

### `src/app/auth/auth.guard.ts`

- Requires an active in-memory authenticated state.
- Rejects unknown roles.
- Requires each protected route to declare a non-empty allowed-role list and checks that the current role appears in that list.
- Rejected navigation returns the existing root-route redirect.

### `src/app/auth/auth.guard.spec.ts`

- Preserved tests for matching roles, mismatched roles during direct navigation, and unauthenticated navigation.
- Added coverage for a protected route without role metadata and an unknown client role.

## Verification

- `npm.cmd test -- --watch=false --browsers=ChromeHeadless`: did not produce results; the process remained silent and was interrupted. No passing test result is confirmed.
- `npm.cmd run build`: printed `Skipping invalid target value; expected an object.` and did not finish before interruption. No passing build result is confirmed.
- The automated checks need to be rerun in an environment where the Angular test runner and build complete successfully.

## Remaining work and backend requirements

1. **Server-side authorization:** Validate authentication, role, and ownership/relationship for every protected endpoint and operation. Changing a patient ID, case ID, appointment ID, or other identifier in a URL or payload must not expose or modify another user's resources.
2. **Trusted session restoration:** Add or identify a backend endpoint that validates the HttpOnly cookie and returns the authenticated principal and authorized role. The Angular app can then restore its navigation state from that server response rather than browser-controlled role values.
3. **Review legacy auth services:** `src/app/patient/pauth/patient-auth.service.ts`, `src/app/doctor/dauth/doctor-auth.service.ts`, and `src/app/admin/admin-auth/admin-auth.service.ts` contain separate local-storage restoration logic. Their guards are not currently used by the protected route table, but these services should be retired or aligned with a trusted session bootstrap before they are reused.
4. **Regression checks:** Run the complete unit suite and production build; add integration tests against backend endpoints for role enforcement and IDOR/resource-ownership checks.

## Security boundary

The Angular guard provides defense-in-depth for navigation and prevents accidental access to role-specific screens. It is not a substitute for server-side authorization. A user can bypass frontend code and call the API directly; only backend checks can prevent privilege escalation and access to another user's data.
