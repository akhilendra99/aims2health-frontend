import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard  {

    constructor(private authService: AuthService, private router: Router){

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        const allowedRoles = route.data['roles'] as string[] | undefined;
        const role = this.authService.getUserRole();
        const isKnownRole = role === 'p' || role === 'd' || role === 'a' || role === 'h';
        const isAuthorized = this.authService.getIsAuth() &&
            isKnownRole &&
            Array.isArray(allowedRoles) &&
            allowedRoles.length > 0 &&
            allowedRoles.includes(role);
        if (!isAuthorized) {
            return this.router.parseUrl('/');
        }
        return true;
    }

}
