import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

function readCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Auth is carried entirely by the HttpOnly auth_token cookie (see
    // withCredentials below) — the JWT is never stored in localStorage or
    // attached as an Authorization header from the client.
    const headers: { [name: string]: string } = {};
    if (STATE_CHANGING_METHODS.includes(req.method)) {
      const csrfToken = readCookie('csrf_token');
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }
    }

    // withCredentials is required for the browser to send/store the
    // HttpOnly auth_token cookie set by the backend on login — without it,
    // cross-origin requests (e.g. localhost:4200 -> localhost:9000) neither
    // carry nor persist cookies at all, regardless of CORS credentials:true
    // on the server side.
    const authRequest = req.clone({
      setHeaders: headers,
      withCredentials: true,
    });

    return next.handle(authRequest).pipe(
      catchError((error) => {
        if (error.status === 401 && this.authService.getIsAuth()) {
          this.authService.handleAuthenticationFailure();
        }
        return throwError(() => error);
      })
    );
  }
}
