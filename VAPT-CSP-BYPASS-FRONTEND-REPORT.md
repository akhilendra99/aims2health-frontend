# VAPT Finding #7: Frontend Content Security Policy Review

## Scope and conclusion

The backend's Helmet policy does not prove that the Angular homepage receives an enforced policy. This repository builds a static Angular application, and its deployment manifest copies files to `/home/ubuntu/frontend`; no Nginx, CDN, Express static server, or other frontend response-header configuration is present here. The deployment manifest refers to `deploy_scripts/run.sh` and `deploy_scripts/validate.sh`, but that directory is absent from this checkout. Therefore the production frontend server and its header configuration cannot be established from this repository.

I could not verify the affected homepage's response headers from this environment. A direct PowerShell HEAD request to `https://aims2health.co.in/` failed with “Unable to connect to the remote server”. A public page fetch exposed HTML content but not response headers. No finding about an enforced or duplicate homepage CSP is claimed.

The supplied strict policy is not compatible with the currently inspected Angular frontend. In particular, external API/payment/analytics/media dependencies conflict with `*-src 'self'` / `frame-src 'none'`; many templates use inline style attributes; and Angular's runtime component styling needs an approved nonce strategy if emitted as inline `<style>` elements. The frontend hosting owner must configure and test a frontend-specific policy. No VAPT closure is claimed.

## Root causes found

- `src/index.html` contained inline Google Analytics and Google Tag Manager bootstrapping scripts, plus a `style` attribute on the GTM noscript iframe.
- Helper registration, helper login, and helper dashboard templates contained active native `onmouseover`/`onmouseout` attributes. Those are blocked by `script-src-attr 'none'`.
- The app uses inline `style` attributes broadly. A source scan found over 1,300 matching template lines/usages (including commented markup); the current UI has not been migrated to a `style-src-attr 'none'`-compatible design.
- The Angular app uses external resources and APIs. The backend's `connect-src 'self'` and `frame-src 'none'` directives cannot be copied unchanged to the frontend host without breaking identified flows.
- The production configuration set `optimization: true`. In this installed Angular builder, that enables `optimization.fonts.inline`; its schema documents that external font inlining requires internet access. During index HTML generation the builder fetched the Material Icons stylesheet from Google Fonts and failed when that request was unavailable.
- No untrusted `innerHTML`, `outerHTML`, `insertAdjacentHTML`, or `bypassSecurityTrustHtml` usage was found in the source scan. The only `bypassSecurityTrust*` match is the doctor PDF resource URL allowlist from the earlier input-validation fix; it validates a same-origin backend `/images/<filename>.pdf` URL before trusting it.

## Source changes made

- `src/index.html`: replaced the two executable inline analytics/GTM blocks with a same-origin script reference and removed the noscript iframe's inline style attribute.
- `src/assets/scripts/analytics-init.js`: added the extracted Google Analytics/GTM initialization. This preserves the existing IDs and behavior, but still requires a reviewed `www.googletagmanager.com` allowance in the frontend CSP while enabled.
- `src/styles.css`: added the local `.gtm-noscript-frame` rule.
- `src/app/new-helper/register/new-helper-register.component.html` and `.css`: replaced native hover event handlers with CSS hover/focus rules.
- `src/app/new-helper/login/new-helper-login.component.html` and `.css`: replaced native hover event handlers with CSS hover/focus rules.
- `src/app/new-helper/dashboard/dashboard.component.html` and `.css`: replaced native hover event handlers on the ABHA link with CSS hover/focus rules.
- `angular.json`: made the production optimization settings explicit and disabled only font inlining, preserving script/style optimizations and critical CSS inlining.
- `VAPT-CSP-BYPASS-FRONTEND-REPORT.md`: this audit and deployment handoff.

No CSP response header configuration, application authentication flow, API contract, or payment logic was changed. Angular's own `(click)` and other template event bindings use registered listeners, not HTML event-handler attributes. Old specialist and landing-page script/handler examples found by search are inside HTML comments; the pricing/specialist `text/x-jsrender` script elements are inert template data rather than executable JavaScript.

### Material Icons build failure and fix

The installed `@angular-devkit/build-angular` browser builder schema says `optimization: true` enables font optimization/inlining and that this option requires internet access. The index HTML generator attempts to retrieve the remote Google Fonts stylesheet so it can inline font CSS. The production configuration now retains `scripts: true` and `styles: true`, with `fonts.inline: false`. Angular's build therefore leaves the existing Google Material Icons stylesheet link in `src/index.html` instead of fetching it during index generation. The Material Icons references and UI have not been removed or changed. This preserves icon rendering when the browser can reach Google Fonts and the deployed frontend CSP allows it; local visual rendering was not available to verify in this environment. Self-hosting is not selected because no Material Icons font assets are present in the project, and the build configuration switch solves the build-time dependency without introducing downloaded/unreviewed binary assets.

## External origins observed and CSP implications

These are exact origins observed in active frontend references; they are not blanket recommendations to allow every host in every directive. Some scripts/styles are duplicated with local Angular dependencies and should be reviewed for removal in a separate compatibility change.

| Directive / use | Observed origins | Notes |
|---|---|---|
| `script-src` | `'self'`, `https://www.googletagmanager.com`, `https://checkout.razorpay.com`, `https://code.jquery.com`, `https://cdnjs.cloudflare.com`, `https://maxcdn.bootstrapcdn.com` | Local Angular and local assets use self. Google Analytics/GTM and Razorpay have live references. jQuery/Popper/Bootstrap/Owl external script references are legacy duplicates of local bundled/assets dependencies; do not allow them until their removal or runtime need is verified. |
| `style-src` | `'self'`, `https://cdn.jsdelivr.net`, `https://cdnjs.cloudflare.com`, `https://fonts.googleapis.com` | Bootstrap/Owl/Font Awesome CDN styles appear in `src/index.html`; Bootstrap and Owl assets/dependencies also exist locally. Material Icons use Google Fonts CSS. |
| `font-src` | `'self'`, `data:`, `https://fonts.gstatic.com`, `https://cdnjs.cloudflare.com` | Local Nunito/Lato/Roboto Slab fonts are under app assets. Google Material Icons and CDN Font Awesome can request remote font files. Self-hosting those assets would reduce origins if verified visually. |
| `connect-src` | `'self'`, `https://backend.aims2health.co.in`, `https://api.ipify.org`; likely `https://www.google-analytics.com` while analytics is enabled | Production API uses the separate backend origin. Patient consent fetches the public IP from ipify. Analytics collection and Razorpay may use additional provider-specific network destinations; capture them from staging browser traces before finalizing. |
| `img-src` | `'self'`, `data:`, `https://backend.aims2health.co.in` | Patient/report imagery may be supplied from backend URLs; verify actual response data and browser requests. Most static assets are same-origin. |
| `frame-src` | `'self'`, `https://www.googletagmanager.com`, `https://www.youtube.com`, `https://www.facebook.com`, `https://backend.aims2health.co.in`, plus Razorpay checkout frame origins confirmed by staging | GTM noscript, YouTube videos, Facebook press embeds, backend-hosted PDF embeds, and Razorpay checkout frames are present. The provided `frame-src 'none'` blocks these flows. Do not add provider subdomains until observed in staging. |

Ordinary outbound links (social sites, ABHA, EHR, educational references) do not by themselves need to be added to fetch directives. This list is based on source references; CSP reports and live Network traces are needed to confirm which paths are exercised and identify any provider subdomains.

## Compatibility and deployment change request

The backend policy provided for this finding (`script-src 'self'`, `style-src 'self'`, `connect-src 'self'`, `frame-src 'none'`, etc.) cannot be applied unchanged to the frontend origin while preserving current integrations. Specifically:

1. Before enforcing a restrictive frontend CSP, migrate active inline `style="..."` attributes into component/global CSS. The source scan found over 1,300 matches, many across forms and dashboard layouts. Do not solve this by adding `unsafe-inline` or a wildcard.
2. Inspect the production Angular output/runtime. Angular inserts `<style>` elements for component styles; configure a fresh per-response nonce in CSP `style-src` and Angular's `ngCspNonce` attribute or `CSP_NONCE` token. A nonce does not authorize inline style attributes; those still require refactoring or carefully justified hashes. See [Angular CSP guidance](https://angular.dev/best-practices/security) and [Angular `CSP_NONCE` API](https://angular.dev/api/core/CSP_NONCE).
3. Have the frontend-serving owner configure one enforced `Content-Security-Policy` response header on `https://aims2health.co.in/` (including SPA fallback/error responses). Start with `'self'` and add only the exact provider/API origins confirmed by deployment Network traces. Preserve `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` where compatible. Do not copy backend `connect-src 'self'` or `frame-src 'none'` without accounting for the frontend dependencies above.
4. Identify and remove redundant external jQuery/Bootstrap/Owl/Font Awesome includes after UI smoke checks; local equivalents are already present. Reassess whether Google Analytics/GTM is required; if retained, it needs explicit script/network allowances and must remain loaded from a trusted source.
5. Confirm Razorpay's current documented checkout script, frame and network origins with the payment owner and staging browser trace. The source shows the checkout SDK but not every origin it uses.
6. Confirm which layer serves the static build. The app manifest targets an EC2 filesystem, but its referenced startup scripts are not present in this repo. Add CSP configuration to the actual Nginx/Apache/load-balancer/CDN/static server deployment repo after that owner is identified, not to the Express API policy by assumption.

## Verification

- Focused Angular tests (existing dashboard, helper login/registration, and PDF URL suites): **15 passed, 0 failed, 0 skipped** in Chrome Headless 156 on Windows 10. Command:

  ```text
  npm.cmd test -- --watch=false --browsers=ChromeHeadlessCI --include=src/app/new-helper/login/registration-validation.spec.ts --include=src/app/new-helper/dashboard/input-validation.spec.ts --include=src/app/doctor/dappointment/list-patients-medreport/list-patients-medreport.component.spec.ts --ts-config=tsconfig.input-validation.spec.json
  ```

- Production build: `npm.cmd run build -- --configuration production` — **succeeded** after the font-inlining setting change. Browser bundle generation, asset copying, and index HTML generation completed. Build time was **123.790 seconds**; initial bundle total was **4.71 MB**. The build still reports existing warnings for the invalid Angular workspace target value, deprecated browser builder, and CommonJS dependencies used by `canvg`/`rgbcolor`; these did not fail the build.
- Homepage header check: not completed. `Invoke-WebRequest -Method Head https://aims2health.co.in/` failed to connect from this environment; the public HTML fetch did not expose response headers. Whether the homepage currently has an enforced CSP or duplicate/conflicting headers is unknown.
- Browser CSP console/network validation and end-to-end patient login/signup/OTP, helper registration/login, doctor/admin dashboard, API, payment, fonts/icons, and report/PDF flows were not run.

## Staging verification checklist

1. Fetch `https://aims2health.co.in/` headers using the production-like browser and `curl -sSI`; confirm exactly one enforced `Content-Security-Policy` header, no unintended duplicate policy, and no reliance on `Content-Security-Policy-Report-Only` as enforcement.
2. Begin with report-only mode if required by release process, collect browser CSP reports, and compare against actual browser Network requests. Do not weaken the policy with wildcards, `unsafe-inline`, or `unsafe-eval` to quiet violations.
3. Verify styles and Angular components with style attributes removed and the runtime nonce correctly injected.
4. Confirm Material Icons still load and render after build-time font inlining has been disabled. The HTML still references Google Fonts, so the deployed CSP/browser network must allow the required stylesheet and font asset origins, or the reviewed assets must be self-hosted later.
5. Exercise patient login/signup/OTP, helper registration/login/dashboard, doctor and admin dashboards, API calls, CSRF flows, payment checkout, icons/fonts, YouTube/social media embeds, and report/PDF viewing.
6. Review browser console and CSP reports for blocked scripts, styles, fonts, images, API calls and frames; fix individual dependency/configuration issues, then retest.
7. Confirm the final enforced homepage header and staging VAPT PoC. Do not claim closure until both are verified.

## Security boundary

Removing inline code and documenting dependencies improves compatibility with a restrictive policy, but only the frontend-serving layer can enforce CSP on the homepage response. CSP is defense in depth and does not replace backend authorization, request validation, CSRF controls, or safe output encoding. Staging header verification and full compatibility/VAPT retesting remain pending.
