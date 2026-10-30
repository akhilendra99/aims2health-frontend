# VAPT Point #17: Server Version Disclosure — Frontend Audit

## Conclusion

The Angular repository builds a static SPA and includes a deployment manifest that copies artifacts to `/home/ubuntu/frontend`. It does not contain the HTTP server, reverse-proxy, CDN, or hosting configuration that controls the response headers on `/helper-login`. No frontend code change is applicable: Angular code cannot remove a `Server` header already emitted with the document response. The live response was not inspected, so this report does not establish whether the deployed header currently discloses a product or version. Keep the finding open pending hosting-layer remediation, staging verification, and external VAPT retesting.

## Hosting configuration inventory

| File / area inspected | Finding |
|---|---|
| `appspec.yml` | Copies deployment artifacts to `/home/ubuntu/frontend`. It references `deploy_scripts/run.sh` and `deploy_scripts/validate.sh`, but that directory is absent from this checkout. AppSpec does not configure HTTP response headers. |
| `buildspec.yml` | Contains build lifecycle placeholders and artifact collection. It does not configure or identify an HTTP server or response-header policy. |
| Angular build and entry (`angular.json`, `package.json`, `src/index.html`, `src/main.ts`) | Build and SPA entry configuration only; no web-server header configuration. |
| Routes (`src/app/app-routing.module.ts`) | `/helper-login` is an Angular client-side route. The host must serve the SPA document for direct navigation; the route itself cannot set the document response headers. |
| Environments and HTTP interceptor (`src/environments/environment.ts`, `src/environments/environment.prod.ts`, `src/app/auth/auth-interceptor.ts`) | Configure the API origin and outgoing request credentials/CSRF behavior. They do not control response headers on the SPA document or static assets. |
| Repository configuration search | No Nginx, Apache/httpd, container, static-host, CDN, reverse-proxy configuration, or active code that sets/removes a `Server` or `X-Powered-By` response header was found. |

The repository has many pre-existing working-tree changes from earlier VAPT tasks. They were preserved. The build/deployment manifests do not establish which server currently answers `https://aims2health.co.in/helper-login`.

## Frontend applicability and files changed

Angular cannot authoritatively set or strip the initial HTML response's `Server` header. `HttpClient` interceptors operate on application requests and cannot rewrite headers already sent by the hosting server. Adding an interceptor or changing UI code would not remediate this finding and risks unrelated authentication behavior.

Only this report was added:

- `VAPT-POINT-17-SERVER-VERSION-DISCLOSURE-FRONTEND-REPORT.md` — repository findings and hosting/staging handoff.

No application component, interceptor, API, CSP, cookie, routing, build, or deployment configuration was changed.

## Required hosting/proxy owner action

The owner of the production frontend-serving layer must identify which layer emits the affected response header (CDN/load balancer/reverse proxy/web server/origin), then configure that layer to suppress software/version disclosure according to the deployed server's supported settings. Check both server-generated and upstream-forwarded headers, including `Server` and any `X-Powered-By` equivalent. Some server settings hide only version strings while continuing to disclose the product name; confirm the chosen configuration meets the VAPT requirement to hide the reported software/version details. Avoid adding a second, conflicting header rule at another layer.

Apply and verify the policy for the SPA document at `/helper-login`, root, direct-navigation fallback responses, redirects, and relevant error responses. Preserve existing security headers, CSP, cookie behavior, and routing. The deployment scripts and server configuration need to be located in the hosting/deployment repository or supplied by its owner; they are not present here.

## Tests and build

No Angular tests or production build were run because this audit made no application-source or build-configuration change. An Angular test/build cannot prove the deployed document's response headers.

No request was made to the production URL from this audit. Therefore the current live header value, duplicate headers, redirects, and staging state remain unverified.

## Staging verification steps

After the hosting owner applies the change, run these GET requests from a network environment that can reach the staging frontend. GET is used so the document response is checked rather than relying on possibly different HEAD handling:

```powershell
curl.exe -sS -D - -o NUL https://<staging-frontend-host>/helper-login
curl.exe -sS -L -D - -o NUL https://<staging-frontend-host>/helper-login
curl.exe -sS -D - -o NUL https://<staging-frontend-host>/
```

Inspect every response block, including redirects, and verify:

1. `Server` does not reveal the web-server product/version as required by the approved VAPT remediation; check `X-Powered-By` and equivalent identifying headers too.
2. No duplicate or conflicting server-identification/header values are added by the CDN, proxy, and origin layers.
3. Existing CSP, HSTS, framing, MIME-sniffing, cache, and other approved security headers remain present and non-conflicting.
4. A direct request and refresh of `/helper-login` return the expected Angular SPA document and the helper login flow still loads. Confirm redirects and error pages receive the intended header policy.
5. Capture raw staging response headers and browser evidence, then complete external VAPT retesting against the affected URL.

## Security boundary and status

This report verifies only repository configuration and frontend source. It does not verify production or staging HTTP responses. The frontend hosting/proxy owner must implement and validate header suppression; staging evidence and external VAPT retesting remain outstanding. Finding #17 is not claimed closed.
