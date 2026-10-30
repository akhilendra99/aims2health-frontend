# VAPT Point #15: Missing Security Headers — Frontend Verification Report

## Conclusion

No Angular source change can set authoritative response headers on the document response for `https://aims2health.co.in/dlogin`. This repository contains the Angular build and deployment manifests but no Nginx, Apache, CDN, load-balancer, or other static-host response-header configuration. I made no application-code or header-policy changes. The live header check could not connect, so header presence, duplication, and deployed SPA fallback remain unverified. No VAPT closure is claimed; remediation must be completed and verified by the frontend hosting/proxy owner.

## Scope inspected

- Angular version: `@angular/core` 22.1.3 (package declaration `^22.1.3`); production build uses the configured Angular browser builder.
- Entry and build: `src/index.html`, `src/main.ts`, `angular.json`, `buildspec.yml`, and `appspec.yml`.
- Route/login: `src/app/app-routing.module.ts` and the `DloginComponent` template/component. `/dlogin` is an Angular client-side route; the host must return the Angular app shell for direct navigation to that path.
- Environments and network: `src/environments/environment.ts`, `src/environments/environment.prod.ts`, `src/app/auth/auth-interceptor.ts`, and auth service/guard code.
- Existing tests: `src/app/auth/login-lockout.spec.ts`, `src/app/auth/user-enumeration.spec.ts`, and the configured focused test tsconfig.
- Embed/render scan: app templates and `src/index.html` for iframe use, dynamic HTML, DOM trust bypasses, and external resources.
- Repository status: the working tree contained many pre-existing changes and untracked files from earlier VAPT tasks. They were preserved. This task added only this report.

## Deployment ownership and response headers

`appspec.yml` copies build artifacts to `/home/ubuntu/frontend` and references `deploy_scripts/run.sh` and `deploy_scripts/validate.sh`; those scripts and any Nginx/Apache/CDN configuration are absent from this checkout. `buildspec.yml` does not configure a web server or response headers. The actual production document-serving layer and its ownership therefore cannot be established here. The backend API's headers do not establish headers for the frontend origin.

Angular `HttpClient` and interceptors can set outgoing request headers. They cannot add or correct response headers on the initial document, static assets, SPA fallback, or web-server error pages. No client-side workaround was added.

The requested policy must be configured at the actual frontend response-serving layer, after confirming policy with the security/operations owner:

- `Cache-Control: no-store, no-cache, must-revalidate` on the HTML document and relevant sensitive responses. Avoid applying no-store indiscriminately to hashed static assets without considering the existing build/cache strategy.
- `X-Content-Type-Options: nosniff`.
- One approved framing policy: `X-Frame-Options: DENY` or `SAMEORIGIN`. Confirm whether any supported deployment embeds the AIMS2Health app before selecting it. The same policy must cover `/dlogin`, root, and SPA fallback/error documents.
- `Strict-Transport-Security` on HTTPS responses, with `max-age` and optional `includeSubDomains`/`preload` approved for the domain. HSTS must only be delivered over HTTPS and its subdomain scope must be confirmed by the domain owner.

Configure each header once at the canonical frontend edge/server and remove conflicting duplicate values from upstream layers. A report-only policy does not substitute for these enforced headers.

## Iframe, external content, and caching findings

The document includes a Google Tag Manager `noscript` iframe. Public page templates include YouTube and Facebook embeds; the public/about content includes a Google Maps iframe. The Razorpay SDK is loaded for payment checkout, which may open its own checkout frame. These are child frames loaded by the AIMS2Health document. `X-Frame-Options` on the AIMS2Health response controls who may frame AIMS2Health; it does not by itself block these child embeds. CSP `frame-src` governs those child frames and is a separate policy decision. No change to CSP or embeds was made.

No active `innerHTML`/`outerHTML` assignment or HTML bypass was found in the scoped application scan. One existing `bypassSecurityTrustResourceUrl` use in the doctor PDF component is an allowlisted PDF resource URL path; it is unrelated to response headers and was not changed.

`/dlogin` is a client-rendered route; this repo contains no `Cache-Control` header policy and no evidence that its component relies on server-cached document content. Existing non-sensitive UI metadata and cookie/session behavior were not changed. Browser back/forward cache behavior is not controllable by Angular response code and should be considered during the staging browser test if the VAPT scenario involves returning to a logged-in screen.

## Files changed

- `VAPT-POINT-15-SECURITY-HEADERS-FRONTEND-REPORT.md` — this investigation, test record, and hosting-layer handoff.

No Angular application, auth, interceptor, CSP, CORS, environment, or deployment configuration files were modified. No HTTP-header-specific Angular test was added because an Angular unit test cannot establish the headers on the deployed document response.

## Verification results

- Focused existing login behavior tests:

  ```text
  npm.cmd test -- --watch=false --browsers=ChromeHeadlessCI --include=src/app/auth/login-lockout.spec.ts --include=src/app/auth/user-enumeration.spec.ts --ts-config=tsconfig.input-validation.spec.json
  ```

  **16 passed, 0 failed, 0 skipped** in Chrome Headless 156 on Windows 10. These exercise existing login error/route behavior; they do not test server response headers.

- Production build: `npm.cmd run build -- --configuration production` — **succeeded**. Browser bundles, assets, and index HTML completed in 19.054 seconds; initial bundle total 4.73 MB. Existing non-blocking warnings remain for the invalid Angular workspace target value, deprecated Webpack browser builder, and CommonJS dependencies including `canvg`, `rgbcolor`, `dompurify`, and `html2canvas`.

- Live header check: `Invoke-WebRequest -Method Head -Uri 'https://aims2health.co.in/dlogin' -TimeoutSec 12` — **not completed**; the environment reported `Unable to connect to the remote server`. No conclusion about actual deployed headers, redirects, or duplicate values can be drawn.

## Staging/deployment verification procedure

Run from a network location that can reach the deployed frontend, after the web/proxy owner applies the policy. Capture the full response, including redirects, for both the exact finding URL and root:

```powershell
curl.exe -sS -D - -o NUL https://aims2health.co.in/dlogin
curl.exe -sS -D - -o NUL https://aims2health.co.in/
```

For each response and any redirect/fallback response, verify:

1. `Cache-Control` contains the approved no-store/no-cache/must-revalidate policy for the document. Confirm the SPA fallback serves the app shell with that policy; check sensitive API response caching separately with the backend owner.
2. `X-Content-Type-Options` is exactly `nosniff`.
3. Exactly one effective `X-Frame-Options` policy is present and matches the approved `DENY` or `SAMEORIGIN` choice. Confirm the corresponding `frame-ancestors` policy does not conflict, if CSP is also configured.
4. HTTPS responses include one valid `Strict-Transport-Security` value with the approved duration and scope. Verify HTTP redirects to HTTPS; do not expect HSTS on plain HTTP.
5. Check for duplicate or conflicting instances of each header across CDN, load balancer, reverse proxy, and origin. Inspect raw headers, not Angular DevTools/HttpClient results.
6. Open `/dlogin` directly and refresh it. Confirm the host serves the SPA fallback, login assets load, and browser console/network show no regression. Verify legitimate YouTube/Facebook/Maps content and Razorpay checkout still work; the framing response policy should not inadvertently be confused with child-frame policy.
7. Review authenticated navigation/back-button behavior and confirm no sensitive API response is served from cache after logout. Confirm backend logout/session revocation independently.
8. Save the raw header capture and browser evidence, then perform external VAPT retesting.

## Outstanding dependency and security boundary

The frontend hosting owner must identify the production serving layer and apply the agreed headers to HTML, SPA fallback, static/error responses as appropriate, without conflicting duplicate policies. The backend/API owner must review cache headers on sensitive API responses and coordinate CSP `frame-ancestors` with the host framing decision. Staging reachability, actual headers, embed/payment compatibility, and external VAPT retesting remain pending. A passing Angular test or build does not prove any response header is deployed.
